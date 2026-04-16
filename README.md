# StudyBuddy – AI Study Partner

A complete production-ready Progressive Web App (PWA) for focused studying with AI assistance, Pomodoro timers, quizzes, and more.

## Features

### Core Features
- **Authentication**: Secure signup/login with JWT and password hashing
- **Pomodoro Timer**: 25-minute study sessions with customizable topics
- **AI Assistant (Bret)**: ChatGPT-style interface using Hugging Face API for doubt solving, ELI5 explanations, and follow-up questions
- **Quiz System**: Generate MCQ quizzes from topics and track scores
- **Dashboard**: View total study time, daily streaks, quiz accuracy, and recent activity
- **Lofi Music**: Background music player with ON/OFF toggle (only UI toggle in the app)
- **Streak System**: Daily study tracking with streak indicators

### Advanced Features
- **Screen Share + OCR**: Capture screen and extract text using Tesseract.js
- **Distraction Detection**: Auto-pause on tab switching or idle time
- **Activity Logging**: JSON logs every 5 minutes during sessions
- **Email Reports**: Send study reports to student and parent emails
- **Voice Features**: Voice commands ("Start session", "Stop session", "Ask question") and text-to-speech responses
- **PWA**: Installable on desktop/mobile with offline caching

## Tech Stack

- **Frontend**: React.js + Tailwind CSS + Vite
- **Backend**: Node.js + Express.js
- **Database**: Firebase Firestore
- **AI**: Hugging Face API
- **OCR**: Tesseract.js
- **Voice**: Web Speech API
- **Email**: Nodemailer

## Project Structure

```
studybuddy/
├── backend/                 # Node.js Express server
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth and error handling
│   │   ├── models/          # Database models
│   │   ├── services/        # AI service integration
│   │   ├── utils/           # Database connection
│   │   └── app.js           # Express app setup
│   ├── .env.example         # Environment variables template
│   ├── package.json
│   └── server.js            # Server entry point
├── frontend/                # React PWA
│   ├── public/              # Static assets and PWA files
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # Auth context
│   │   ├── services/        # API client
│   │   ├── App.jsx          # Main app component
│   │   ├── index.css        # Tailwind styles
│   │   └── main.jsx         # React entry point
│   ├── .env.example         # Frontend env template
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── database/
    └── schema.sql           # MySQL database schema
```

## Prerequisites

- Node.js (v16+)
- MySQL (v8+)
- npm or yarn

## Installation & Setup

### 1. Clone and Navigate
```bash
cd "c:\Users\mohit\Study Buddy\studybuddy"
```

### 2. Start the App
From the project root, run:
```bash
npm install
npm run dev
```

This starts both backend and frontend together using `concurrently`.

### 3. Database Setup
- Create a Firebase project at https://console.firebase.google.com/
- Enable Firestore Database in test mode
- Go to Project Settings > Service Accounts
- Generate a new private key and download the JSON file
- Copy the values from the JSON to your `.env` file

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your values:
```
PORT=5000
JWT_SECRET=your_jwt_secret_key
HF_API_KEY=your_huggingface_api_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
```

Start backend:
```bash
npm run dev
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

### 5. Access the App
- Open http://localhost:5173 (frontend)
- Backend runs on http://localhost:5000

## PWA Installation

The app is installable as a PWA:
1. Open in a modern browser (Chrome/Edge/Firefox)
2. Click the install prompt or browser menu → "Install StudyBuddy"
3. Works offline with basic caching

## Usage

### Getting Started
1. **Signup/Login**: Create account with optional parent email
2. **Dashboard**: View your study stats and streaks
3. **Study Session**: Start a Pomodoro timer with topic
4. **AI Chat**: Ask Bret questions in different modes
5. **Quiz**: Generate and take quizzes on topics
6. **Music**: Toggle lofi background music (only toggle in app)

### Voice Commands
- "Start session" - Initiates a study prompt
- "Stop session" - Ends current task
- "Ask question" - Generates follow-up questions

### Advanced Features
- **Screen Capture**: Share screen and extract text for study material
- **Distraction Detection**: Auto-pause on tab switches or 2-minute idle
- **Activity Reports**: Sent via email with JSON attachments

## API Endpoints

### Auth
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Session
- `POST /api/session/log` - Log activity
- `POST /api/session/save` - Save study session
- `GET /api/session/dashboard` - Get dashboard stats
- `POST /api/session/report` - Send email report

### Quiz
- `POST /api/quiz/generate` - Generate quiz
- `POST /api/quiz/submit` - Submit quiz answers
- `GET /api/quiz/history` - Get quiz history

### AI
- `POST /api/ai/chat` - Chat with AI assistant

## Environment Variables

### Backend (.env)
- `PORT`: Server port (default 5000)
- `JWT_SECRET`: JWT signing key
- `HF_API_KEY`: Hugging Face API token
- `MAILTRAP_TOKEN`: Mailtrap API token for email testing
- `MAILTRAP_SENDER_EMAIL`: Sender email for Mailtrap
- `MAILTRAP_SENDER_NAME`: Sender name for Mailtrap
- `SENDGRID_API_KEY`: SendGrid API key for production email
- `EMAIL_*`: SMTP email configuration (Gmail fallback)
- `TWILIO_*`: Twilio SMS configuration
- `FIREBASE_*`: Firebase service account credentials

### Frontend (.env)
- `VITE_API_URL`: Backend API URL

## Development

### Backend Scripts
```bash
npm start      # Production
npm run dev    # Development with nodemon
```

### Frontend Scripts
```bash
npm run dev    # Development server
npm run build  # Production build
npm run preview # Preview build
```

## Deployment

### Backend
- Deploy to services like Heroku, Railway, or VPS
- Set production environment variables
- Use process manager like PM2

### Frontend
- Build for production: `npm run build`
- Deploy `dist/` folder to Netlify, Vercel, or static hosting
- Ensure backend CORS allows frontend domain

### Database
- Firebase Firestore is cloud-hosted, no additional deployment needed
- Ensure Firestore security rules allow your app's access

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

This project is for educational purposes. Feel free to use and modify.

## Support

For issues or questions, check the code comments or create an issue in the repository.

---

**StudyBuddy** – Making studying smarter with AI! 🚀

<!-- Hugging Face token removed for security -->
