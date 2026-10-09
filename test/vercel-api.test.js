const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createApiHandler } = require('../lib/vercel-api');

function invoke(handler, { method = 'POST', body, headers = {}, query = {} } = {}) {
  const response = {
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    writeHead(status, headers = {}) {
      this.statusCode = status;
      Object.assign(this.headers, headers);
    },
    end(payload) {
      this.payload = payload;
    }
  };
  return Promise.resolve(handler({
    method,
    body,
    headers: { 'content-type': 'application/json', ...headers },
    query
  }, response)).then(() => ({
    status: response.statusCode,
    headers: response.headers,
    body: JSON.parse(response.payload)
  }));
}

test('Vercel lead handler validates and saves a quote', async () => {
  let savedLead;
  const handler = createApiHandler('lead', {
    store: {
      async addLead(lead) {
        savedLead = lead;
        return { id: 'lead-123' };
      }
    }
  });

  const invalid = await invoke(handler, { body: { name: 'A', phone: '1', service: '' } });
  assert.equal(invalid.status, 422);
  assert.ok(invalid.body.fields.name);

  const valid = await invoke(handler, {
    body: {
      name: 'Alex Customer',
      email: 'ALEX@example.com',
      emailRequired: true,
      phone: '555-555-1234',
      service: 'Seamless gutters'
    }
  });
  assert.equal(valid.status, 201);
  assert.equal(valid.body.id, 'lead-123');
  assert.equal(savedLead.email, 'alex@example.com');
});

test('Vercel newsletter handler normalizes duplicate subscriptions', async () => {
  let savedEmail;
  const handler = createApiHandler('newsletter', {
    store: {
      async subscribe(email) {
        savedEmail = email;
        return { created: false };
      }
    }
  });

  const response = await invoke(handler, { body: { email: 'Reader@Example.com' } });
  assert.equal(response.status, 200);
  assert.equal(response.body.alreadySubscribed, true);
  assert.equal(savedEmail, 'reader@example.com');
});

test('Vercel admin handlers require auth and validate status updates', async () => {
  let updatedStatus;
  const id = 'b2e5d896-0f7a-4a29-8d19-d9c66ec6db83';
  const handler = createApiHandler('lead-status', {
    adminToken: 'test-admin-token',
    store: {
      async updateLeadStatus(leadId, status) {
        updatedStatus = { leadId, status };
        return { id: leadId, status };
      }
    }
  });

  const denied = await invoke(handler, { method: 'PATCH', body: { status: 'contacted' }, query: { id } });
  assert.equal(denied.status, 401);

  const accepted = await invoke(handler, {
    method: 'PATCH',
    body: { status: 'contacted' },
    query: { id },
    headers: { authorization: 'Bearer test-admin-token' }
  });
  assert.equal(accepted.status, 200);
  assert.deepEqual(updatedStatus, { leadId: id, status: 'contacted' });
});

test('Vercel health endpoint verifies database schema availability', async () => {
  let checkedSchema = false;
  const handler = createApiHandler('health', {
    store: {
      async ensureSchema() {
        checkedSchema = true;
      }
    }
  });

  const response = await invoke(handler, { method: 'GET' });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'ok', storage: 'postgres' });
  assert.equal(checkedSchema, true);
});
