# StockFlow MVP

Minimal multi-tenant inventory app for demo/internal use.

## What you can do

- Sign up with email, password, and organization name
- Log in and land on a dashboard
- Create, edit, search, adjust, and delete products
- See low-stock items using a product threshold or the org default

All products are scoped to the organization created at signup.

## Deploy a demo on Render

The included `render.yaml` creates a free web service with SQLite and a generated JWT secret. Connect this repository to Render and deploy the Blueprint to get a public `onrender.com` URL.

**Demo data is temporary on Render's free plan.** Free web services have an ephemeral filesystem, so the SQLite database is cleared when the service restarts, spins down, or redeploys. Do not use this deployment for real inventory. For durable data, switch to PostgreSQL or attach a persistent disk on a paid service.

## Local setup

```bash
npm install
npx prisma db push
npm run dev
```

Copy `.env.example` to `.env` if needed. The default local database is SQLite (`file:./dev.db`). Set `JWT_SECRET` to a long random value outside local development.

Open http://localhost:3000
