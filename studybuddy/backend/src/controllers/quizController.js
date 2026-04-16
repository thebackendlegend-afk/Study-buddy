const express = require('express');
const authenticateToken = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const { generateQuiz } = require('../services/aiService');

const router = express.Router();
router.use(authenticateToken);

router.post('/generate', async (req, res, next) => {
  try {
    const { topic, numQuestions = 10 } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    const questionCount = Math.max(numQuestions, 10);
    const quiz = await generateQuiz(topic, questionCount);
    res.json({ topic, quiz, questions: quiz, totalQuestions: quiz.length });
  } catch (error) {
    console.error('Quiz generation error:', error);
    next(error);
  }
});

router.post('/submit', async (req, res, next) => {
  try {
    const { topic, answers } = req.body;
    if (!topic || !answers) {
      return res.status(400).json({ error: 'Topic and answers are required.' });
    }
    const quiz = buildQuiz(topic);
    let correct = 0;
    const details = quiz.map((question, index) => {
      const userAnswer = answers[index] || '';
      const isCorrect = userAnswer.trim().toLowerCase() === question.answer.toLowerCase();
      if (isCorrect) correct += 1;
      return { question: question.question, userAnswer, correctAnswer: question.answer, isCorrect };
    });
    const score = Math.round((correct / quiz.length) * 100);
    await Quiz.saveResult({ userId: req.user.id, topic, totalQuestions: quiz.length, correctAnswers: correct, score, details });
    res.json({ score, correct, total: quiz.length, details });
  } catch (error) {
    next(error);
  }
});

router.get('/history', async (req, res, next) => {
  try {
    const results = await Quiz.getRecentByUser(req.user.id);
    res.json({ results });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
