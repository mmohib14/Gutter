# ApexGutters local website

This site runs on Node.js with no third-party server dependencies. Quote and inspection requests and newsletter signups are saved to `data/site-data.json` on the same computer as the server.

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

## Tests

```sh
npm test
```
