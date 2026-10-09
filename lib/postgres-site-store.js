const { neon } = require('@neondatabase/serverless');

function toLead(row) {
  return {
    id: row.id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at || undefined,
    type: row.type,
    name: row.name,
    email: row.email,
    phone: row.phone,
    service: row.service,
    message: row.message
  };
}

function toSubscriber(row) {
  return {
    id: row.id,
    email: row.email,
    createdAt: row.created_at,
    status: row.status
  };
}

class PostgresSiteStore {
  constructor(connectionString = process.env.DATABASE_URL) {
    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured for persistent website storage.');
    }
    this.sql = neon(connectionString);
    this.schemaReady = null;
  }

  async ensureSchema() {
    if (!this.schemaReady) {
      this.schemaReady = (async () => {
        await this.sql`
          CREATE TABLE IF NOT EXISTS site_leads (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            status text NOT NULL DEFAULT 'new',
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz,
            type text NOT NULL,
            name text NOT NULL,
            email text NOT NULL DEFAULT '',
            phone text NOT NULL,
            service text NOT NULL,
            message text NOT NULL DEFAULT ''
          )
        `;
        await this.sql`
          CREATE TABLE IF NOT EXISTS site_subscribers (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            email text NOT NULL UNIQUE,
            created_at timestamptz NOT NULL DEFAULT now(),
            status text NOT NULL DEFAULT 'active'
          )
        `;
      })().catch(error => {
        this.schemaReady = null;
        throw error;
      });
    }
    await this.schemaReady;
  }

  async addLead(lead) {
    await this.ensureSchema();
    const [row] = await this.sql`
      INSERT INTO site_leads (type, name, email, phone, service, message)
      VALUES (${lead.type}, ${lead.name}, ${lead.email}, ${lead.phone}, ${lead.service}, ${lead.message})
      RETURNING *
    `;
    return toLead(row);
  }

  async subscribe(email) {
    await this.ensureSchema();
    const [created] = await this.sql`
      INSERT INTO site_subscribers (email)
      VALUES (${email.toLowerCase()})
      ON CONFLICT (email) DO NOTHING
      RETURNING *
    `;
    if (created) return { subscriber: toSubscriber(created), created: true };

    const [existing] = await this.sql`
      SELECT * FROM site_subscribers WHERE email = ${email.toLowerCase()} LIMIT 1
    `;
    if (!existing) {
      throw new Error('Subscriber was not available after the insert conflict.');
    }
    return { subscriber: toSubscriber(existing), created: false };
  }

  async listRecords() {
    await this.ensureSchema();
    const [leads, subscribers] = await Promise.all([
      this.sql`SELECT * FROM site_leads ORDER BY created_at DESC`,
      this.sql`SELECT * FROM site_subscribers ORDER BY created_at DESC`
    ]);
    return {
      leads: leads.map(toLead),
      subscribers: subscribers.map(toSubscriber)
    };
  }

  async updateLeadStatus(id, status) {
    await this.ensureSchema();
    const [row] = await this.sql`
      UPDATE site_leads
      SET status = ${status}, updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `;
    return row ? toLead(row) : null;
  }
}

module.exports = { PostgresSiteStore };
