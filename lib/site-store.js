const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const EMPTY_DATA = { leads: [], subscribers: [] };

class SiteStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.writeQueue = Promise.resolve();
  }

  async read() {
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      const data = JSON.parse(raw);
      if (!Array.isArray(data.leads) || !Array.isArray(data.subscribers)) {
        throw new Error('The local data file has an invalid format.');
      }
      return data;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      return structuredClone(EMPTY_DATA);
    }
  }

  async update(mutator) {
    const operation = this.writeQueue.then(async () => {
      const data = await this.read();
      const result = await mutator(data);
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      const temporaryPath = `${this.filePath}.${randomUUID()}.tmp`;
      try {
        await fs.writeFile(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, {
          encoding: 'utf8',
          flag: 'wx'
        });
        await fs.rename(temporaryPath, this.filePath);
      } catch (error) {
        await fs.rm(temporaryPath, { force: true }).catch(() => {});
        throw error;
      }
      return result;
    });
    this.writeQueue = operation.catch(() => {});
    return operation;
  }

  async addLead(lead) {
    const record = {
      id: randomUUID(),
      status: 'new',
      createdAt: new Date().toISOString(),
      ...lead
    };
    await this.update(data => data.leads.unshift(record));
    return record;
  }

  async subscribe(email) {
    const normalizedEmail = email.toLowerCase();
    return this.update(data => {
      const existing = data.subscribers.find(item => item.email === normalizedEmail);
      if (existing) {
        return { subscriber: existing, created: false };
      }
      const subscriber = {
        id: randomUUID(),
        email: normalizedEmail,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      data.subscribers.unshift(subscriber);
      return { subscriber, created: true };
    });
  }

  async listRecords() {
    await this.writeQueue;
    return this.read();
  }

  async updateLeadStatus(id, status) {
    return this.update(data => {
      const lead = data.leads.find(item => item.id === id);
      if (!lead) {
        return null;
      }
      lead.status = status;
      lead.updatedAt = new Date().toISOString();
      return lead;
    });
  }
}

module.exports = { SiteStore };
