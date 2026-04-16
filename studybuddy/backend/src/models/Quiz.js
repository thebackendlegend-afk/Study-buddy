const db = require('../utils/db');

const Quiz = {
  async saveResult(data) {
    const quizRef = db.collection('quizzes').doc();
    await quizRef.set({
      id: quizRef.id,
      userId: data.userId,
      topic: data.topic,
      totalQuestions: data.totalQuestions,
      correctAnswers: data.correctAnswers,
      score: data.score,
      details: data.details,
      createdAt: new Date(),
    });
    return { id: quizRef.id, ...data };
  },

  async getRecentByUser(userId) {
    const snapshot = await db.collection('quizzes')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
};

module.exports = Quiz;
