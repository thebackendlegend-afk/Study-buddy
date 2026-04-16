# 🚀 Deploy Study Buddy Backend NOW - 5 Minutes

## Prerequisites (Get These First - 2 minutes)

1. **Open Router API Key** - Free tier available
   - Go: https://openrouter.ai
   - Sign up → Get API key

2. **Twilio Credentials** (for SMS)
   - Go: https://www.twilio.com/console
   - Copy: Account SID, Auth Token
   - Create Verify Service (copy Service ID)

3. **SendGrid API Key** (for emails)
   - Go: https://sendgrid.com
   - Sign up → Create API key

4. **Firebase** (for auth)
   - Go: https://firebase.google.com
   - Create project → Download service account JSON
   - Copy all FIREBASE_* vars

---

## Deploy Backend to Railway - 3 Minutes

### 1. Go to Railway.app
```
https://railway.app
```

### 2. Sign Up (Use GitHub)
- Click "Start New Project"
- Choose "Deploy from GitHub repo"
- Select: `Study-buddy` repo
- Click Deploy

### 3. Add Environment Variables (Copy-Paste)
In Railway Dashboard → Variables → add these:

```
PORT=5000
JWT_SECRET=study_buddy_secret_key_2024
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxx
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxx
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.xxxxxxxxxxxxxx
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_VERIFY_SERVICE_ID=VAxxxxxxxx
MAILTRAP_TOKEN=xxxxxxxxxx
FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY_ID=keyid
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@xxx.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=xxxx
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk@xxx.iam.gserviceaccount.com
```

### 4. Wait for Deploy (~3-5 minutes)
Railway auto-deploys from GitHub. Watch the logs.

### 5. Copy Your Backend URL
Once deployed, you'll see:
```
https://studybuddy-production-xxx.railway.app
```

---

## Update Frontend (1 Minute)

Get the Railway URL from Step 5, then:

```bash
cd c:\Users\mohit\Study Buddy\studybuddy\frontend

# Add backend URL to Vercel
npx vercel env add VITE_API_URL https://your-railway-url/api production --yes

# Redeploy frontend
npx vercel --prod --yes
```

---

## ✅ Done!

Your app is LIVE:
- **Frontend**: https://frontend-beige-zeta-47.vercel.app
- **Backend**: https://your-railway-url
- **AI Chat**: Using Open Router (free tier)

---

## Troubleshooting

**Backend won't deploy?**
- Check Railway logs for errors
- Verify all env vars are set
- Check if PORT=5000 is set

**Frontend can't reach backend?**
- Verify VITE_API_URL is correct
- Check browser console for CORS errors
- Check backend logs

**AI Chat not working?**
- Verify OPENROUTER_API_KEY is valid
- Test: `curl https://your-backend-url/api/health`

---

## Local Testing Before Deploy

```bash
cd studybuddy/backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env
# Edit .env with your actual credentials

# Run locally
npm run dev

# Test AI chat
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello"}'
```

---

## Need Help?

1. Railway Docs: https://docs.railway.app
2. Check backend logs on Railway dashboard
3. GitHub repo: https://github.com/thebackendlegend-afk/Study-buddy

**Let's go!** 🚀
