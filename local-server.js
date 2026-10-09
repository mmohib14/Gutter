const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { timingSafeEqual } = require('node:crypto');
const { SiteStore } = require('./lib/site-store');

const ROOT = __dirname;
const MAX_BODY_BYTES = 16 * 1024;
const ALLOWED_EXTENSIONS = new Set([
  '.html', '.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.ico', '.woff2'
]);
const LEAD_STATUSES = new Set(['new', 'contacted', 'completed', 'archived']);
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

function cleanText(value, maxLength) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, maxLength);
}

function jsonResponse(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let tooLarge = false;
    request.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        tooLarge = true;
        return;
      }
      if (!tooLarge) chunks.push(chunk);
    });
    request.on('end', () => {
      if (tooLarge) {
        reject(Object.assign(new Error('Request body is too large.'), { statusCode: 413 }));
        return;
      }
      if (!request.headers['content-type']?.toLowerCase().startsWith('application/json')) {
        reject(Object.assign(new Error('Content-Type must be application/json.'), { statusCode: 415 }));
        return;
      }
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          throw new Error('Request body must be a JSON object.');
        }
        resolve(body);
      } catch (error) {
        reject(Object.assign(new Error('Request body must contain valid JSON.'), { statusCode: 400 }));
      }
    });
    request.on('error', reject);
  });
}

function isAuthorized(request, adminToken) {
  if (!adminToken) {
    return false;
  }
  const authorization = request.headers.authorization || '';
  const suppliedToken = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : '';
  const expected = Buffer.from(adminToken);
  const actual = Buffer.from(suppliedToken);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
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

function createServer(options = {}) {
  const store = options.store || new SiteStore(
    options.dataFile || process.env.DATA_FILE || path.join(ROOT, 'data', 'site-data.json')
  );
  const adminToken = options.adminToken ?? process.env.ADMIN_TOKEN ?? '';
  const requestCounts = new Map();

  return http.createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('X-Frame-Options', 'SAMEORIGIN');

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    } catch {
      jsonResponse(response, 400, { error: 'Invalid request URL.' });
      return;
    }

    if (pathname.startsWith('/api/')) {
      if (request.method === 'GET' && pathname === '/api/health') {
        jsonResponse(response, 200, { status: 'ok', storage: 'local-json' });
        return;
      }

      if (request.method === 'POST' &&
          (pathname === '/api/leads' || pathname === '/api/newsletter')) {
        const key = request.socket.remoteAddress || 'unknown';
        const now = Date.now();
        const current = requestCounts.get(key);
        if (!current || now - current.startedAt >= RATE_WINDOW_MS) {
          requestCounts.set(key, { startedAt: now, count: 1 });
        } else if (++current.count > RATE_LIMIT) {
          jsonResponse(response, 429, { error: 'Too many requests. Please try again shortly.' });
          return;
        }

        try {
          const body = await readJsonBody(request);
          if (pathname === '/api/leads') {
            const { lead, errors } = validateLead(body);
            if (Object.keys(errors).length) {
              jsonResponse(response, 422, { error: 'Please check the form fields.', fields: errors });
              return;
            }
            const savedLead = await store.addLead(lead);
            jsonResponse(response, 201, {
              message: 'Thanks! Your request has been saved. Our team will be in touch.',
              id: savedLead.id
            });
            return;
          }

          const email = cleanText(body.email, 254).toLowerCase();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            jsonResponse(response, 422, {
              error: 'Enter a valid email address.',
              fields: { email: 'Enter a valid email address.' }
            });
            return;
          }
          const result = await store.subscribe(email);
          jsonResponse(response, result.created ? 201 : 200, {
            message: result.created ? 'You are subscribed to ApexGutters updates.' : 'This email is already subscribed.',
            alreadySubscribed: !result.created
          });
          return;
        } catch (error) {
          if (response.destroyed) return;
          if (error.statusCode) {
            jsonResponse(response, error.statusCode, { error: error.message });
          } else {
            console.error('Failed to save website submission:', error);
            jsonResponse(response, 500, { error: 'We could not save your request. Please try again.' });
          }
          return;
        }
      }

      if (request.method === 'GET' && pathname === '/api/admin/records') {
        if (!isAuthorized(request, adminToken)) {
          jsonResponse(response, 401, { error: 'A valid admin bearer token is required.' });
          return;
        }
        try {
          const records = await store.listRecords();
          jsonResponse(response, 200, records);
        } catch (error) {
          console.error('Failed to read local website records:', error);
          jsonResponse(response, 500, { error: 'Could not read local records.' });
        }
        return;
      }

      const statusMatch = pathname.match(/^\/api\/admin\/leads\/([0-9a-f-]+)$/i);
      if (request.method === 'PATCH' && statusMatch) {
        if (!isAuthorized(request, adminToken)) {
          jsonResponse(response, 401, { error: 'A valid admin bearer token is required.' });
          return;
        }
        try {
          const body = await readJsonBody(request);
          const status = cleanText(body.status, 20);
          if (!LEAD_STATUSES.has(status)) {
            jsonResponse(response, 422, {
              error: 'Status must be new, contacted, completed, or archived.'
            });
            return;
          }
          const lead = await store.updateLeadStatus(statusMatch[1], status);
          if (!lead) {
            jsonResponse(response, 404, { error: 'Lead not found.' });
            return;
          }
          jsonResponse(response, 200, { lead });
        } catch (error) {
          if (error.statusCode) {
            jsonResponse(response, error.statusCode, { error: error.message });
          } else {
            console.error('Failed to update local lead:', error);
            jsonResponse(response, 500, { error: 'Could not update the lead.' });
          }
        }
        return;
      }

      jsonResponse(response, 404, { error: 'API route not found.' });
      return;
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      jsonResponse(response, 405, { error: 'Method not allowed.' });
      return;
    }

    const relativePath = pathname === '/' ? 'apexgutters_landing_page.html' : pathname.slice(1);
    const filePath = path.resolve(ROOT, relativePath);
    if (!filePath.startsWith(`${ROOT}${path.sep}`) ||
        relativePath.split(/[\\/]/).some(part => part.startsWith('.')) ||
        relativePath.split(/[\\/]/).includes('data')) {
      jsonResponse(response, 404, { error: 'Page not found.' });
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      jsonResponse(response, 404, { error: 'Page not found.' });
      return;
    }
    try {
      const content = await fs.readFile(filePath);
      const contentTypes = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.ico': 'image/x-icon',
        '.woff2': 'font/woff2'
      };
      response.writeHead(200, {
        'Content-Type': contentTypes[extension],
        'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=3600'
      });
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch (error) {
      if (error.code === 'ENOENT' || error.code === 'EISDIR') {
        jsonResponse(response, 404, { error: 'Page not found.' });
        return;
      }
      console.error('Failed to serve website file:', error);
      jsonResponse(response, 500, { error: 'Could not serve the requested page.' });
    }
  });
}

if (require.main === module) {
  const host = process.env.HOST || '127.0.0.1';
  const port = Number.parseInt(process.env.PORT || '3000', 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error('PORT must be a valid TCP port between 1 and 65535.');
    process.exitCode = 1;
  } else {
    const server = createServer();
    server.listen(port, host, () => {
      console.log(`ApexGutters is available at http://${host}:${port}`);
      console.log('Local submissions are stored in data/site-data.json.');
    });
    server.on('error', error => {
      console.error('Could not start the local web server:', error);
      process.exitCode = 1;
    });
  }
}

module.exports = { createServer };
