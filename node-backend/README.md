# Node Backend

Small Node.js backend for the Stripe integration.

## Prerequisites

- Node.js 18+ (or a recent LTS) and npm installed.

## Install

From the project root (`node-backend`):

```bash
npm install
```

This will create `node_modules` and write a `package-lock.json`.

## Environment

The project uses the Stripe SDK. Set these environment variables before running:

- `STRIPE_SECRET_KEY` - your Stripe secret key (required)

You can create a `.env` file and load it with a tool like `dotenv` (not included by default) or set env vars inline when running.

## Run

Start the server with the npm script defined in `package.json`:

```bash
npm start
```

This runs `node server.js` (the main server file). The server will print its listening port to stdout (or use `process.env.PORT`).

## Development

- To hide `node_modules` from Git, add `node_modules/` to `.gitignore`.
- If `node_modules` was accidentally committed, run:

```bash
git rm -r --cached node-backend/node_modules
git add .gitignore
git commit -m "Ignore node_modules"
```

## Troubleshooting

- "Address already in use": another process is using the port. Either stop it or set `PORT` to a different value.
- Missing Stripe key errors: ensure `STRIPE_SECRET_KEY` is set in your environment.
- If `npm start` exits with code 130, it may have been interrupted (Ctrl+C). Re-run and watch logs.