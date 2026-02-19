# LMS Billing Backend

Node.js + Express + MongoDB backend for the LMS Billing module.

## Tech Stack

- **Runtime:** Node.js (ES modules)
- **Framework:** Express
- **Database:** MongoDB (Mongoose)
- **Auth:** Bearer token (base64 of `username:password`) for super-admin

## Setup

1. **Install dependencies**
   ```bash
   cd backend && npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env`
   - Set `MONGODB_URI` (default: `mongodb://localhost:27017/lms_billing`)
   - Optional: `PORT` (default: 4000), `ADMIN_USERNAME`, `ADMIN_PASSWORD` (default: admin/admin123)

3. **Seed default modules** (Chatbot, Exam, Certificate, etc.)
   ```bash
   npm run seed
   ```

4. **Start server**
   ```bash
   npm run dev
   ```
   Server runs at `http://localhost:4000`.

## API Overview

- **Auth:** `POST /api/auth/login` — body: `{ username, password }` → returns `{ success, token }`
- **Subscriptions:** `GET/POST /api/subscriptions`, `GET/PATCH/DELETE /api/subscriptions/:id`
- **Assign modules:** `GET /api/subscriptions/:subscriptionId/modules`, `PUT /api/subscriptions/:subscriptionId/modules` (body: `{ moduleIds }`)
- **Subscription logs:** `GET /api/subscriptions/:subscriptionId/logs`
- **Modules:** `GET/POST /api/modules`, `GET/PATCH/DELETE /api/modules/:id`
- **Billing plans:** `GET/POST /api/billing-plans`, `GET/PATCH/DELETE /api/billing-plans/:id`
- **Assign subscriptions to plan:** `GET/PUT /api/billing-plans/:planId/subscriptions` (body: `{ subscriptionIds }`)
- **Billing subscription logs:** `GET /api/billing-plans/:planId/logs`

All routes except `/api/auth/login` require header: `Authorization: Bearer <token>`.

## Architecture

- `config/` — app config and DB connection
- `models/` — Mongoose schemas (Subscription, Module, SubscribedModule, SubscriptionLog, BillingPlan, BillingSubscription, BillingSubscriptionLog)
- `controllers/` — request handlers
- `routes/` — Express routers
- `middleware/auth.js` — super-admin auth via Bearer token
- `utils/serialize.js` — normalize API responses (id, dates)
