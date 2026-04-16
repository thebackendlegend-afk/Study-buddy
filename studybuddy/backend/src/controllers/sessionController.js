const express = require('express');
const { createEmailTransport } = require('../services/emailTransport');
const authenticateToken = require('../middleware/auth');
const Session = require('../models/Session');
const User = require('../models/User');
const db = require('../utils/db');

const router = express.Router();
router.use(authenticateToken);

async function logActivity(userId, status, activity) {
  await db.collection('activity_logs').add({
    userId,
    sessionStatus: status,
    activityState: activity,
    timestamp: new Date(),
  });
}

router.post('/log', async (req, res, next) => {
  try {
    const { status, activityState } = req.body;
    await logActivity(req.user.id, status, activityState);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/save', async (req, res, next) => {
  try {
    const { topic, durationMinutes, focusMinutes, status } = req.body;
    
    // If user was on app for 25+ minutes, it counts as a study session
    if (!durationMinutes || durationMinutes < 25) {
      return res.status(400).json({ 
        error: 'Minimum study session is 25 minutes. Keep studying!' 
      });
    }

    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    const allActivitySnapshot = await db.collection('activity_logs')
      .where('userId', '==', req.user.id)
      .get();

    // Check if user already studied today
    const activityToday = allActivitySnapshot.docs.filter(doc => {
      const ts = doc.data().timestamp?.toDate?.();
      return ts && ts.toISOString().slice(0, 10) === today;
    });

    // Check if user studied yesterday
    const activityYesterday = allActivitySnapshot.docs.filter(doc => {
      const ts = doc.data().timestamp?.toDate?.();
      return ts && ts.toISOString().slice(0, 10) === yesterdayKey;
    });

    const didStudyToday = activityToday.length > 0;
    const didStudyYesterday = activityYesterday.length > 0;

    // Calculate streak: if studied yesterday, increment; otherwise start at 1 or keep current
    let streak = 1;
    const user = await User.findById(req.user.id);
    if (user) {
      if (didStudyYesterday) {
        streak = (user.streak || 0) + 1;
      } else if (didStudyToday) {
        // User already studied today, keep the same streak
        streak = user.streak || 1;
      } else {
        // First study of the day, check if streak should continue
        streak = (user.streak || 0) + 1;
      }
    }

    await Session.create({ userId: req.user.id, topic, durationMinutes, focusMinutes, status });
    await User.updateStudyMetrics(req.user.id, focusMinutes, streak);
    await logActivity(req.user.id, status, 'session saved');

    res.json({ 
      success: true, 
      streak,
      message: `Great job studying for ${durationMinutes} minutes! Streak: ${streak}`,
      sessionSaved: true
    });
  } catch (error) {
    next(error);
  }
});

router.post('/report', async (req, res, next) => {
  try {
    const { studentEmail, parentEmail, sessionSummary } = req.body;
    const transporter = createEmailTransport();

    const jsonData = JSON.stringify({ userId: req.user.id, sessionSummary, timestamp: new Date() }, null, 2);
    const mailOptions = {
      to: [studentEmail, parentEmail].filter(Boolean),
      subject: 'StudyBuddy Activity Report',
      text: 'Please find the attached study activity report from StudyBuddy.',
      attachments: [
        {
          filename: 'study-report.json',
          content: jsonData,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Report sent successfully.' });
  } catch (error) {
    next(error);
  }
});

// Auto-save session if user has been active for 25+ minutes
router.post('/auto-save', async (req, res, next) => {
  try {
    const { durationMinutes } = req.body;
    
    // Only auto-save if 25+ minutes
    if (!durationMinutes || durationMinutes < 25) {
      return res.status(400).json({ 
        error: 'Session must be at least 25 minutes to auto-save',
        durationMinutes,
        minimumRequired: 25
      });
    }

    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    const allActivitySnapshot = await db.collection('activity_logs')
      .where('userId', '==', req.user.id)
      .get();

    // Check if user already studied today
    const activityToday = allActivitySnapshot.docs.filter(doc => {
      const ts = doc.data().timestamp?.toDate?.();
      return ts && ts.toISOString().slice(0, 10) === today;
    });

    // Check if user studied yesterday
    const activityYesterday = allActivitySnapshot.docs.filter(doc => {
      const ts = doc.data().timestamp?.toDate?.();
      return ts && ts.toISOString().slice(0, 10) === yesterdayKey;
    });

    const didStudyToday = activityToday.length > 0;
    const didStudyYesterday = activityYesterday.length > 0;

    let streak = 1;
    const user = await User.findById(req.user.id);
    if (user) {
      if (didStudyYesterday) {
        streak = (user.streak || 0) + 1;
      } else if (didStudyToday) {
        streak = user.streak || 1;
      } else {
        streak = (user.streak || 0) + 1;
      }
    }

    // Create session with generic "Study Session" topic if not provided
    const topic = req.body.topic || 'Study Session';
    const focusMinutes = req.body.focusMinutes || durationMinutes;
    
    await Session.create({ 
      userId: req.user.id, 
      topic, 
      durationMinutes, 
      focusMinutes, 
      status: 'completed' 
    });
    
    await User.updateStudyMetrics(req.user.id, focusMinutes, streak);
    await logActivity(req.user.id, 'completed', 'auto-saved session');

    res.json({ 
      success: true, 
      streak,
      message: `✓ Session auto-saved! ${durationMinutes} min study. Streak: ${streak}`,
      sessionSaved: true,
      newStreak: streak
    });
  } catch (error) {
    next(error);
  }
});

router.get('/dashboard', async (req, res, next) => {
  try {
    const sessionsSnapshot = await db.collection('sessions').where('userId', '==', req.user.id).get();
    const totalStudyMinutes = sessionsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().durationMinutes || 0), 0);

    const quizzesSnapshot = await db.collection('quizzes').where('userId', '==', req.user.id).get();
    const scores = quizzesSnapshot.docs.map(doc => doc.data().score).filter(score => score != null);
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activitySnapshot = await db.collection('activity_logs')
      .where('userId', '==', req.user.id)
      .get();

    const activityMap = {};
    activitySnapshot.docs
      .map(doc => doc.data())
      .filter(data => {
        const ts = data.timestamp?.toDate?.();
        return ts && ts >= sevenDaysAgo;
      })
      .forEach(data => {
        const date = data.timestamp.toDate().toISOString().slice(0, 10);
        activityMap[date] = (activityMap[date] || 0) + 1;
      });
    const recentActivity = Object.entries(activityMap).map(([day, count]) => ({ day, count }));

    const user = await User.findById(req.user.id);
    res.json({
      totalStudyMinutes,
      streak: user?.streak || 0,
      quizAccuracy: Math.round(averageScore * 100) / 100,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
