const db = require('../utils/db');

const Session = {
  async create(data) {
    const sessionRef = db.collection('sessions').doc();
    await sessionRef.set({
      id: sessionRef.id,
      userId: data.userId,
      topic: data.topic,
      durationMinutes: data.durationMinutes,
      focusMinutes: data.focusMinutes,
      status: data.status,
      createdAt: new Date(),
    });
    return { id: sessionRef.id, ...data };
  },

  async getRecentByUser(userId) {
    const snapshot = await db.collection('sessions')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
};

module.exports = Session;
