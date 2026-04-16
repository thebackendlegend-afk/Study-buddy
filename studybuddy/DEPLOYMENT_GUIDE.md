# Study Buddy - Deployment Guide

## ✅ What's Already Done
- ✅ Frontend deployed on Vercel
- ✅ Code pushed to GitHub: https://github.com/thebackendlegend-afk/Study-buddy
- ✅ AI service migrated to Open Router

## 🚀 Backend Deployment (Next Step)

### Option 1: Railway (Recommended - Easiest)

#### Step 1: Go to Railway.app
- Visit https://railway.app
- Sign up with GitHub (use same account: thebackendlegend-afk)
- Click "Start New Project"

#### Step 2: Deploy from GitHub
- Select "Deploy from GitHub repo"
- Choose: `Study-buddy`
- Select branch: `main`
- Railway will auto-detect Node.js

#### Step 3: Add Environment Variables
Railway dashboard → Your Project → Variables
Copy all from `.env.example` and add your actual credentials:
```
PORT=5000
JWT_SECRET=<your_secret>
OPENROUTER_API_KEY=<your_key>
SENDGRID_API_KEY=<your_key>
TWILIO_ACCOUNT_SID=<your_sid>
TWILIO_AUTH_TOKEN=<your_token>
TWILIO_PHONE_NUMBER=<your_number>
TWILIO_VERIFY_SERVICE_ID=<your_sid>
FIREBASE_* = <all_firebase_vars>
... and email variables
```

#### Step 4: Trigger Deployment
- Railway auto-deploys from GitHub
- Wait ~2-5 minutes
- Copy the generated URL (like: https://studybuddy-api.railway.app)

#### Step 5: Update Vercel Frontend
Update VITE_API_URL on Vercel to point to your Railway backend:
```bash
cd c:\Users\mohit\Study Buddy\studybuddy\frontend
npx vercel env add VITE_API_URL <railway-url>/api production --yes
```

---

### Option 2: Render.com
- https://render.com
- Sign up with GitHub
- New → Web Service → GitHub repo
- Select `Study-buddy` → Choose `studybuddy/backend` directory
- Add environment variables
- Deploy

---

### Option 3: Heroku (Free tier ended, needs paid plan)
Not recommended anymore.

---

## 📋 Required Credentials (Get These First)

1. **Open Router API Key**
   - Go to https://openrouter.ai
   - Sign up
   - Get your API key from settings

2. **Twilio** (for SMS/phone verification)
   - https://www.twilio.com/console
   - Get Account SID and Auth Token
   - Create Verify Service

3. **SendGrid** (for emails)
   - https://sendgrid.com
   - Create API key

4. **Firebase** (for authentication)
   - https://firebase.google.com
   - Create project
   - Download service account JSON

---

## ✅ Checklist Before Deploy

- [ ] Backend code on GitHub ✅ (Already done)
- [ ] `.env.example` has all required vars ✅ (Already done)
- [ ] No secrets in code ✅ (Already done)
- [ ] `npm start` works locally
- [ ] All credentials ready (OpenRouter, Twilio, SendGrid, Firebase)

---

## 🔗 Frontend → Backend Connection

Frontend is already configured to call backend API via `VITE_API_URL` env variable.

Current setup on Vercel:
- `VITE_API_URL=https://your-backend-url.example.com/api` (placeholder)

After backend deployment:
- Update to actual URL: `https://railway-url.railway.app/api` or similar

---

## Testing After Deployment

```bash
# Test backend health
curl https://your-deployed-backend.com/api/health

# Test AI chat
curl -X POST https://your-deployed-backend.com/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello"}'
```

---

## Troubleshooting

### Backend won't start
```bash
# Check if PORT is set
# Check if all env vars are present
# Check logs on Railway/Render dashboard
```

### Frontend can't reach backend
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend (src/app.js)
- Check browser console for errors

### AI Chat not working
- Verify `OPENROUTER_API_KEY` is correct
- Test locally: `node -e "require('./src/services/aiService').askAI('test')"`

---

## 📞 Support
Check backend logs on Railway/Render dashboard for detailed error messages.
