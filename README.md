## Flowmerce Frontend — React Seller Dashboard

This is the React frontend for Flowmerce. It connects to your Flask backend to display conversations and create orders.

---

## Quick Setup

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/flowmerce-frontend.git
cd flowmerce-frontend

npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
REACT_APP_API_URL=http://localhost:5000
```

(For production, this will be your Railway backend URL)

### 3. Run Locally

```bash
npm run dev
```

Opens at `http://localhost:3000`. Login with:
- Email: `seller@flowmerce.com`
- Password: `password123`

---

## Deploy to Vercel (2 minutes)

### Option 1: One-Click Deploy (Easiest)

1. Go to `vercel.com` → Sign in with GitHub
2. Click "New Project"
3. Select your `flowmerce-frontend` repo
4. In "Environment Variables", add:
   ```
   REACT_APP_API_URL=https://your-flowmerce-backend.railway.app
   ```
   (Replace with your actual Railway backend URL)
5. Click "Deploy"

That's it. Your dashboard is live in 30 seconds.

### Option 2: Deploy via CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts. When asked for environment variables:
```
REACT_APP_API_URL=https://your-flowmerce-backend.railway.app
```

---

## Project Structure

```
flowmerce-frontend/
├── index.html           # HTML entry point
├── src/
│   ├── main.jsx        # React entry point
│   └── App.jsx         # Main dashboard component
├── package.json        # Dependencies
├── vite.config.js      # Vite build config
└── .env.example        # Environment template
```

---

## Key Features

- **Login**: Email + password auth via your Flask backend
- **Conversations List**: Shows all WhatsApp messages
- **Create Orders**: Select a conversation, add product details, create order
- **Token Management**: JWT stored in localStorage
- **Configurable API**: Swap backend URL via environment variable

---

## How It Works

1. **User logs in** → Flask generates JWT token
2. **Token stored** → localStorage (persists across refreshes)
3. **Dashboard loaded** → Fetches conversations from `/conversations` endpoint
4. **Create order** → POST to `/orders` with order details
5. **Order created** → Refreshes conversation list

---

## Environment Variables

| Variable | Local | Production |
|----------|-------|-----------|
| `REACT_APP_API_URL` | `http://localhost:5000` | `https://your-railway-app.railway.app` |

---

## Troubleshooting

### "Failed to fetch" when creating order
Check that `REACT_APP_API_URL` points to your Flask backend (not localhost if deployed)

### Token expired
Log out and log in again to get a fresh token

### Dashboard shows no conversations
Make sure your Flask backend is running and `/conversations` endpoint works

---

## Next Steps

1. Deploy frontend to Vercel (see above)
2. Update backend `DATABASE_URL` if not already done
3. Test login and order creation
4. **You now have a complete social commerce SaaS platform** ✅

---

## Files to Modify

When you connect to production:
1. Get your Railway backend URL (e.g., `https://flowmerce-prod.railway.app`)
2. Update Vercel environment: `REACT_APP_API_URL=https://flowmerce-prod.railway.app`
3. Redeploy

Done.
