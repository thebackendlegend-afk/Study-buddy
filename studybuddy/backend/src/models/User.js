const admin = require('firebase-admin');
const db = require('../utils/db');
const bcrypt = require('bcryptjs');

const User = {
  async create(data) {
    const userRef = db.collection('users').doc();
    const hashedPassword = data.passwordHash || (await bcrypt.hash(data.password, 10));
    await userRef.set({
      id: userRef.id,
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber || '',
      passwordHash: hashedPassword,
      parentEmail: data.parentEmail || '',
      emailVerified: data.emailVerified || false,
      phoneVerified: data.phoneVerified || false,
      streak: 0,
      totalStudyMinutes: 0,
      createdAt: new Date(),
    });
    return { id: userRef.id, name: data.name, email: data.email, phoneNumber: data.phoneNumber || '', parentEmail: data.parentEmail || '' };
  },

  async findByEmail(email) {
    const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  },

  async findById(id) {
    const doc = await db.collection('users').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async updateStudyMetrics(userId, minutes, newStreak) {
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      totalStudyMinutes: admin.firestore.FieldValue.increment(minutes),
      streak: newStreak,
    });
  },
};

module.exports = User;
