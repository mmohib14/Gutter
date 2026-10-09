# ApexGutters local website

This site runs on Node.js. Locally, quote and inspection requests and newsletter signups are saved to `data/site-data.json` on the same computer as the server.

## Start the site

Install Node.js 20 or newer, then run from this folder:

```sh
npm start
```

Open <http://127.0.0.1:3000>. Set `PORT` to use a different port and `DATA_FILE` to choose a different JSON database path. `HOST` defaults to `127.0.0.1` so the site and submitted contact details stay on the local computer.

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

The repository includes Vercel serverless handlers for the API and serves the site files as static pages. The home page is available at `/`; its form submissions are stored in Postgres rather than the local JSON file.

1. Create a Postgres database with Neon, then copy its connection string.
2. Import this GitHub repository into Vercel. Keep the project root as the repository root; no build command or output directory is required.
3. In Vercel, open **Project Settings → Environment Variables** and add `DATABASE_URL` with the Neon connection string. Add `ADMIN_TOKEN` with a long private value if you use the admin API.
4. Apply those variables to the environments you deploy (Production, and Preview if needed), then redeploy.
5. Check `https://your-domain/api/health`; it should return `{"status":"ok","storage":"postgres"}`.

The database tables are created automatically the first time an API endpoint connects. Keep `DATABASE_URL` and `ADMIN_TOKEN` in Vercel environment variables only—never commit them to GitHub. Form submissions made before deployment remain in the local `data/site-data.json` and are not copied to Postgres automatically.

## Tests

```sh
npm test
```
