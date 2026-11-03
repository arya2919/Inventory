# StockFlow MVP

Minimal multi-tenant inventory app for demo/internal use.

## What you can do

- Sign up with email, password, and organization name
- Log in and land on a dashboard
- Create, edit, search, adjust, and delete products
- See low-stock items using a product threshold or the org default

All products are scoped to the organization created at signup.

## Local setup

```bash
npm install
npx prisma db push
npm run dev
```

Copy `.env.example` to `.env` if needed. Default local database is SQLite (`file:./dev.db`).

Open http://localhost:3000
