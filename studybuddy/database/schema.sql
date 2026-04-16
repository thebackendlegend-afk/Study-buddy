-- Firebase Firestore Collections (No SQL schema needed)
-- Collections created automatically:
-- - users
-- - sessions
-- - quizzes
-- - progress
-- - activity_logs

-- To set up Firebase:
-- 1. Create a Firebase project at https://console.firebase.google.com/
-- 2. Enable Firestore Database
-- 3. Create a service account and download the key JSON
-- 4. Add the key values to backend/.env

-- Collections structure:
-- users: { id, name, email, passwordHash, parentEmail, streak, totalStudyMinutes, createdAt }
-- sessions: { id, userId, topic, durationMinutes, focusMinutes, status, createdAt }
-- quizzes: { id, userId, topic, totalQuestions, correctAnswers, score, details, createdAt }
-- progress: { id, userId, summary, date, createdAt }
-- activity_logs: { id, userId, sessionStatus, activityState, timestamp }
