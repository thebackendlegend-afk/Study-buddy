const db = require('../utils/db');

const Progress = {
  async log(data) {
    const progressRef = db.collection('progress').doc();
    await progressRef.set({
      id: progressRef.id,
      userId: data.userId,
      summary: data.summary,
      date: data.date,
      createdAt: new Date(),
    });
    return { id: progressRef.id, ...data };
  },

  async getRecentByUser(userId) {
    const snapshot = await db.collection('progress')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
};

module.exports = Progress;
