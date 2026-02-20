# Environment Variables & How to Run

## 1. Backend `.env`

Create a file **`backend/.env`** (copy from `backend/.env.example` and edit):

```env
# Server
PORT=4000

# MongoDB (must be running before starting the backend)
MONGODB_URI=mongodb://localhost:27017/lms_billing

# Admin login (used by the app for admin auth)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Encrypts SMTP app passwords stored in Configure Email. Use a long random string in production.
ENCRYPTION_KEY=your-secret-encryption-key-change-in-production

# Optional: allow only this frontend origin (e.g. http://localhost:5173). Omit or set to "true" to allow all origins.
# FRONTEND_ORIGIN=http://localhost:5173
```

| Variable           | Required | Description |
|--------------------|----------|-------------|
| `PORT`             | No       | Backend port (default: 4000). |
| `MONGODB_URI`      | No       | MongoDB connection string (default: `mongodb://localhost:27017/lms_billing`). |
| `ADMIN_USERNAME`   | No       | Admin username (default: `admin`). |
| `ADMIN_PASSWORD`   | No       | Admin password (default: `admin123`). |
| `ENCRYPTION_KEY`   | No*      | Secret used to encrypt SMTP app passwords. If omitted, falls back to `ADMIN_PASSWORD` then a default (change in production). *Set a strong value in production. |
| `FRONTEND_ORIGIN`  | No       | CORS allowed origin; omit or `true` for all origins. |

---

## 2. Frontend `.env`

Create **`frontend/.env`** (copy from `frontend/.env.example` if needed):

```env
# API base URL (no trailing slash). Must match backend PORT if running locally.
VITE_API_URL=http://localhost:4000
```

| Variable        | Required | Description |
|-----------------|----------|-------------|
| `VITE_API_URL`  | Yes      | Backend base URL (e.g. `http://localhost:4000`). No trailing slash. |

---

## 3. How to Run

### Prerequisites

- **Node.js** (v18+)
- **MongoDB** running locally or a reachable `MONGODB_URI`
- **pnpm** or **npm**

### Steps

1. **Start MongoDB** (if local)
   - Ensure MongoDB is running on the host/port in `MONGODB_URI` (e.g. `localhost:27017`).

2. **Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env (set ENCRYPTION_KEY and others as needed)
   npm run dev
   ```
   - API: `http://localhost:4000` (or your `PORT`).
   - Health: `http://localhost:4000/health`.

3. **Frontend** (new terminal)
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Ensure VITE_API_URL points to your backend (e.g. http://localhost:4000)
   npm run dev
   ```
   - App: usually `http://localhost:5173`.

4. **Optional: seed data**
   ```bash
   cd backend
   npm run seed
   ```

### Production

- Set a strong **`ENCRYPTION_KEY`** (e.g. 32+ random characters).
- Set **`FRONTEND_ORIGIN`** to your frontend URL.
- Use a secure **`MONGODB_URI`** and strong **`ADMIN_PASSWORD`**.
- Build frontend: `cd frontend && npm run build`, then serve the `dist` folder.

---

## 4. Configure Email (SMTP) – where credentials come from

**SMTP credentials are not read from `.env`.** They are entered and stored **per subscription** in the app:

1. Open **Subscriptions** → click **Configure Email** for a subscriber.
2. In the modal, enter **SMTP Host**, **Port**, **Email ID**, and **App Password**, then **Save configuration**.
3. Use **Test Mail** to send a test using those saved credentials.

### Gmail – "535 Username and Password not accepted"

Gmail does not accept your normal account password for SMTP. You must use an **App Password**:

1. Enable **2-Step Verification** on your Google account: [Google Account Security](https://myaccount.google.com/security).
2. Create an **App Password**: go to [App Passwords](https://myaccount.google.com/apppasswords) (or search “App passwords” in your Google Account).
3. Select “Mail” and your device, then generate the 16-character password.
4. In the **Configure Email** modal use:
   - **SMTP Host:** `smtp.gmail.com`
   - **Port:** `587`
   - **Email ID:** your full Gmail address (e.g. `you@gmail.com`)
   - **App Password:** the 16-character App Password (no spaces; paste as-is).

### Other providers (Outlook, Yahoo, custom SMTP)

- Use that provider’s SMTP host and port (e.g. Outlook: `smtp.office365.com`, port `587`).
- Use the **email** and the **app-specific password** or SMTP password they provide (not necessarily your normal login password).
- If you get login errors, check their docs for “SMTP” or “App password” and enable 2FA if required.
