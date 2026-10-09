const { timingSafeEqual } = require('node:crypto');
const { PostgresSiteStore } = require('./postgres-site-store');

const LEAD_STATUSES = new Set(['new', 'contacted', 'completed', 'archived']);

function cleanText(value, maxLength) {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, maxLength)
    : '';
}

function validateLead(body) {
  const lead = {
    type: cleanText(body.type || 'quote', 30),
    name: cleanText(body.name, 100),
    email: cleanText(body.email, 254).toLowerCase(),
    phone: cleanText(body.phone, 40),
    service: cleanText(body.service, 120),
    message: cleanText(body.message, 3000)
  };
  const errors = {};
  if (lead.name.length < 2) errors.name = 'Enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email) && lead.email) {
    errors.email = 'Enter a valid email address.';
  }
  if (body.emailRequired && !lead.email) errors.email = 'Enter your email address.';
  if (lead.phone.replace(/\D/g, '').length < 7) errors.phone = 'Enter a valid phone number.';
  if (!lead.service) errors.service = 'Select the service you need.';
  if (!['quote', 'inspection'].includes(lead.type)) errors.type = 'Choose a valid request type.';
  return { lead, errors };
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  if (!request.headers['content-type']?.toLowerCase().startsWith('application/json')) {
    return { error: { status: 415, message: 'Content-Type must be application/json.' } };
  }
  let body = request.body;
  if (typeof body === 'string' || Buffer.isBuffer(body)) {
    if (Buffer.byteLength(body) > 16 * 1024) {
      return { error: { status: 413, message: 'Request body is too large.' } };
    }
    try {
      body = JSON.parse(body.toString());
    } catch {
      return { error: { status: 400, message: 'Request body must contain valid JSON.' } };
    }
  } else if (body !== undefined && Buffer.byteLength(JSON.stringify(body)) > 16 * 1024) {
    return { error: { status: 413, message: 'Request body is too large.' } };
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: { status: 400, message: 'Request body must be a JSON object.' } };
  }
  return { body };
}

function isAuthorized(request, adminToken) {
  if (!adminToken) return false;
  const authorization = request.headers.authorization || '';
  const supplied = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : '';
  const expectedBuffer = Buffer.from(adminToken);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length &&
    timingSafeEqual(expectedBuffer, suppliedBuffer);
}

function createApiHandler(action, options = {}) {
  const adminToken = options.adminToken ?? process.env.ADMIN_TOKEN ?? '';
  let store = options.store;

  return async (request, response) => {
    const expectedMethod = action === 'records' ? 'GET'
      : action === 'lead-status' ? 'PATCH'
      : action === 'health' ? 'GET'
      : 'POST';
    if (request.method !== expectedMethod) {
      response.setHeader('Allow', expectedMethod);
      sendJson(response, 405, { error: 'Method not allowed.' });
      return;
    }

    if (action === 'records' || action === 'lead-status') {
      if (!isAuthorized(request, adminToken)) {
        sendJson(response, 401, { error: 'A valid admin bearer token is required.' });
        return;
      }
    }

    let body;
    if (action === 'lead' || action === 'newsletter' || action === 'lead-status') {
      const parsed = readBody(request);
      if (parsed.error) {
        sendJson(response, parsed.error.status, { error: parsed.error.message });
        return;
      }
      body = parsed.body;
    }

    try {
      store ||= new PostgresSiteStore();
      if (action === 'health') {
        await store.ensureSchema();
        sendJson(response, 200, { status: 'ok', storage: 'postgres' });
        return;
      }
      if (action === 'lead') {
        const { lead, errors } = validateLead(body);
        if (Object.keys(errors).length) {
          sendJson(response, 422, { error: 'Please check the form fields.', fields: errors });
          return;
        }
        const savedLead = await store.addLead(lead);
        sendJson(response, 201, {
          message: 'Thanks! Your request has been saved. Our team will be in touch.',
          id: savedLead.id
        });
        return;
      }

      if (action === 'newsletter') {
        const email = cleanText(body.email, 254).toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          sendJson(response, 422, {
            error: 'Enter a valid email address.',
            fields: { email: 'Enter a valid email address.' }
          });
          return;
        }
        const result = await store.subscribe(email);
        sendJson(response, result.created ? 201 : 200, {
          message: result.created
            ? 'You are subscribed to ApexGutters updates.'
            : 'This email is already subscribed.',
          alreadySubscribed: !result.created
        });
        return;
      }

      if (action === 'records') {
        sendJson(response, 200, await store.listRecords());
        return;
      }

      if (action === 'lead-status') {
        const status = cleanText(body.status, 20);
        if (!LEAD_STATUSES.has(status)) {
          sendJson(response, 422, {
            error: 'Status must be new, contacted, completed, or archived.'
          });
          return;
        }
        const id = request.query?.id || '';
        if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id)) {
          sendJson(response, 404, { error: 'Lead not found.' });
          return;
        }
        const lead = await store.updateLeadStatus(id, status);
        if (!lead) {
          sendJson(response, 404, { error: 'Lead not found.' });
          return;
        }
        sendJson(response, 200, { lead });
        return;
      }

      sendJson(response, 404, { error: 'API route not found.' });
    } catch (error) {
      console.error(`Vercel API request failed (${action}):`, error);
      sendJson(response, 500, { error: 'We could not complete your request. Please try again.' });
    }
  };
}

module.exports = { createApiHandler };
