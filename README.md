# ApexGutters local website

The website frontend is a React single-page app built with Vite. Page content is bundled in `src/page-content/` and rendered by the React app; the root `index.html` is only the Vite/React entry shell. React Router uses clean URLs:

- `/`, `/about`, `/services`, `/why-us`, `/projects`, `/team`, `/blog`, `/contact`
- `/services/gutter-installation`, `/services/gutter-repair`, `/services/gutter-cleaning`, `/services/gutter-guards`, `/services/downspouts`, `/services/fascia-soffit`, `/services/commercial-drainage`
- `/blog/gutter-warning-signs`, `/blog/choosing-gutter-system`, `/blog/commercial-drainage-planning`, `/blog/gutter-guards-guide`, `/blog/seamless-vs-sectional-gutters`, `/blog/seasonal-gutter-checklist`, `/blog/when-to-replace-gutters`

Previous `.html` page URLs permanently redirect to these routes. The Node.js server continues to provide the quote, inspection, and newsletter APIs. Locally, submissions are saved to `data/site-data.json` on the same computer as the server.

## Develop and run the site

Install Node.js 20 or newer, then run from this folder:

```sh
npm install
npm run dev
```

Open <http://127.0.0.1:5173>. The Vite dev server proxies API requests to the local Node server only if configured; for the full local app, build first and then run:

```sh
# Terminal 1
npm start

# Terminal 2
npm run dev
```

`npm start` serves the most recent production build from `dist/` on port 3000, where the API is also available. Use a separate terminal for the Vite dev server so frontend hot reload works; the configured `/api` proxy sends form requests to the local server. To build and run without hot reload:

```sh
npm run build
npm start
```

Open <http://127.0.0.1:3000>. `npm start` serves the production React build from `dist/` and runs the existing API. Set `PORT` to use a different port and `DATA_FILE` to choose a different JSON database path. `HOST` defaults to `127.0.0.1` so the site and submitted contact details stay on the local computer.

## API

- `GET /api/health` — server and storage status.
- `POST /api/leads` — saves a quote or inspection request.
- `POST /api/newsletter` — subscribes an email; duplicate subscriptions are not added again.
- `GET /api/admin/records` — returns locally stored requests and subscribers.
- `PATCH /api/admin/leads/:id` — changes a lead status to `new`, `contacted`, `completed`, or `archived`.

Admin routes require `Authorization: Bearer <ADMIN_TOKEN>`. Set `ADMIN_TOKEN` before starting the server to enable access. The backend deliberately does not provide a default admin token. Example PowerShell session:

```powershell
$env:ADMIN_TOKEN = "use-a-long-private-token"
npm start
```

For privacy, keep the server on localhost and do not expose it publicly without adding proper user authentication, HTTPS, backups, and a production database. The JSON file contains personal contact information; do not commit or share it.

## Deploy to Vercel from GitHub

The repository includes Vercel serverless handlers for the API and builds the React app into `dist/`. Its form submissions are stored in Postgres rather than the local JSON file.

1. Create a Postgres database with Neon, then copy its connection string.
2. Import this GitHub repository into Vercel. Keep the project root as the repository root; `vercel.json` configures Vite to build the React app and sets `dist/` as the output directory. The `/api` functions remain serverless endpoints.
3. In Vercel, open **Project Settings → Environment Variables** and add `DATABASE_URL` with the Neon connection string. Add `ADMIN_TOKEN` with a long private value if you use the admin API.
4. Apply those variables to the environments you deploy (Production, and Preview if needed), then redeploy.
5. Check `https://your-domain/api/health`; it should return `{"status":"ok","storage":"postgres"}`. The home page should load at `https://your-domain/`.

The database tables are created automatically the first time an API endpoint connects. Keep `DATABASE_URL` and `ADMIN_TOKEN` in Vercel environment variables only—never commit them to GitHub. Form submissions made before deployment remain in the local `data/site-data.json` and are not copied to Postgres automatically.

## Tests

```sh
npm test
```
