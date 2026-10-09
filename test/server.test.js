const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { after, before, test } = require('node:test');
const { createServer } = require('../local-server');

const temporaryDirectory = path.join(os.tmpdir(), `apexgutters-test-${process.pid}`);
const adminToken = 'test-only-admin-token';
let server;
let baseUrl;

before(async () => {
  await fs.mkdir(temporaryDirectory, { recursive: true });
  server = createServer({
    dataFile: path.join(temporaryDirectory, 'site-data.json'),
    adminToken
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise(resolve => server.close(resolve));
  await fs.rm(temporaryDirectory, { recursive: true, force: true });
});

async function postJson(endpoint, body) {
  return fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

test('serves the home page and local health status', async () => {
  const home = await fetch(baseUrl);
  assert.equal(home.status, 200);
  assert.match(home.headers.get('content-type'), /text\/html/);
  assert.match(await home.text(), /ApexGutters/);

  const health = await fetch(`${baseUrl}/api/health`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: 'ok', storage: 'local-json' });
});

test('serves the contact page and links the shared quote buttons to it', async () => {
  const contact = await fetch(`${baseUrl}/contact.html`);
  assert.equal(contact.status, 200);
  assert.match(contact.headers.get('content-type'), /text\/html/);
  assert.match(await contact.text(), /data-api-form="quote"/);

  const header = await fetch(`${baseUrl}/partials/header.html`);
  assert.equal(header.status, 200);
  const headerMarkup = await header.text();
  assert.doesNotMatch(headerMarkup, /data-page-link="(?:blog|contact)"/);
  assert.equal((headerMarkup.match(/href="\/contact\.html#contact-form"/g) || []).length, 2);

  const footer = await fetch(`${baseUrl}/partials/footer.html`);
  assert.equal(footer.status, 200);
  const footerMarkup = await footer.text();
  assert.match(footerMarkup, /href="\/blog\.html">Blog<\/a>/);
  assert.match(footerMarkup, /href="\/contact\.html">Contact<\/a>/);
});

test('validates leads and persists submitted quote requests', async () => {
  const invalid = await postJson('/api/leads', { name: 'A', phone: '1', service: '' });
  assert.equal(invalid.status, 422);
  assert.ok((await invalid.json()).fields.name);

  const response = await postJson('/api/leads', {
    type: 'quote',
    name: 'Alex Customer',
    email: 'alex@example.com',
    emailRequired: true,
    phone: '(555) 555-1234',
    service: 'Seamless gutters',
    message: 'Please call after 3pm.'
  });
  assert.equal(response.status, 201);
  const created = await response.json();
  assert.ok(created.id);

  const stored = JSON.parse(await fs.readFile(path.join(temporaryDirectory, 'site-data.json'), 'utf8'));
  assert.equal(stored.leads.length, 1);
  assert.equal(stored.leads[0].email, 'alex@example.com');
  assert.equal(stored.leads[0].status, 'new');
});

test('accepts inspection requests without email and persists newsletter subscriptions once', async () => {
  const inspection = await postJson('/api/leads', {
    type: 'inspection',
    name: 'Jordan Inspector',
    phone: '5555551234',
    service: 'Gutter inspection'
  });
  assert.equal(inspection.status, 201);

  const first = await postJson('/api/newsletter', { email: 'Reader@Example.com' });
  const duplicate = await postJson('/api/newsletter', { email: 'reader@example.com' });
  assert.equal(first.status, 201);
  assert.equal(duplicate.status, 200);
  assert.equal((await duplicate.json()).alreadySubscribed, true);
});

test('keeps record access private and allows an authenticated status update', async () => {
  const denied = await fetch(`${baseUrl}/api/admin/records`);
  assert.equal(denied.status, 401);

  const headers = { Authorization: `Bearer ${adminToken}` };
  const list = await fetch(`${baseUrl}/api/admin/records`, { headers });
  assert.equal(list.status, 200);
  const records = await list.json();
  assert.equal(records.leads.length, 2);
  assert.equal(records.subscribers.length, 1);

  const update = await fetch(`${baseUrl}/api/admin/leads/${records.leads[0].id}`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'contacted' })
  });
  assert.equal(update.status, 200);
  assert.equal((await update.json()).lead.status, 'contacted');
});

test('does not expose private data files through static routes', async () => {
  const response = await fetch(`${baseUrl}/data/site-data.json`);
  assert.equal(response.status, 404);
});
