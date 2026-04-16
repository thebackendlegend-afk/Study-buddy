const express = require('express');
const authenticateToken = require('../middleware/auth');
const { askAI, AI_MODELS } = require('../services/aiService');

const router = express.Router();
router.use(authenticateToken);

router.post('/chat', async (req, res, next) => {
  try {
    const { message, prompt, mode, model = 'deepseek' } = req.body;
    const rawText = message || prompt;
    if (!rawText) {
      return res.status(400).json({ error: 'Message or prompt is required.' });
    }

    if (!AI_MODELS.includes(model)) {
      return res.status(400).json({ error: `Invalid model. Available models: ${AI_MODELS.join(', ')}` });
    }

    let aiPrompt = rawText;
    if (mode === 'eli5') {
      aiPrompt = `Explain this in very simple terms, as if talking to a beginner: ${rawText}`;
    } else if (mode === 'doubt') {
      aiPrompt = `Solve this question simply: ${rawText}`;
    } else if (mode === 'followup') {
      aiPrompt = `Provide a helpful follow-up question about: ${rawText}`;
    }

    const reply = await askAI(aiPrompt, model);
    res.json({ reply, model });
  } catch (error) {
    next(error);
  }
});

router.get('/models', async (req, res) => {
  res.json({ models: AI_MODELS });
});

module.exports = router;
