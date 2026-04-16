const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Available AI models
const AI_MODELS = {
  openrouter_primary: {
    name: 'Open Router - GPT-OSS-20B (Free)',
    model: 'openai/gpt-oss-20b:free',
    maxTokens: 2000
  },
  openrouter_fallback: {
    name: 'Open Router - Fallback Model',
    model: 'openai/gpt-oss-20b:free',
    maxTokens: 2000
  }
};

async function askAI(prompt, model = 'openrouter_primary') {
  const selectedModel = AI_MODELS[model];

  if (!selectedModel) {
    throw new Error(`Model ${model} not found. Available models: ${Object.keys(AI_MODELS).join(', ')}`);
  }

  try {
    console.log('Calling Open Router API with model:', selectedModel.model);
    return await askOpenRouter(prompt, selectedModel);
  } catch (error) {
    console.error(`Error with ${model}:`, error.message);
    // Fallback to alternative model if primary fails
    if (model !== 'openrouter_fallback') {
      console.log('Falling back to Open Router fallback model...');
      return await askOpenRouter(prompt, AI_MODELS.openrouter_fallback);
    }
    throw new Error('Open Router service failed. Please try again later.');
  }
}

async function askOpenRouter(prompt, modelConfig) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured. Please set your Open Router API key.');
  }

  try {
    console.log('Calling Open Router API:', OPENROUTER_API_URL);
    
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: modelConfig.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI study assistant. Provide clear, accurate, and educational responses to help students learn effectively.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: modelConfig.maxTokens,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://studybuddy.example.com',
          'X-Title': 'StudyBuddy'
        },
        timeout: 60000
      }
    );

    console.log('✓ Open Router response received');
    
    if (response.data && response.data.error) {
      throw new Error(`Open Router API Error: ${response.data.error}`);
    }

    if (response.data && response.data.choices && response.data.choices[0]) {
      return response.data.choices[0].message.content;
    }

    throw new Error('Invalid response format from Open Router');

  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Invalid Open Router API key. Please verify your OPENROUTER_API_KEY.');
    } else if (error.response?.status === 429) {
      throw new Error('Open Router API rate limited. Please try again later.');
    } else if (error.response?.status === 503) {
      throw new Error('Open Router service is temporarily unavailable. Please try again later.');
    } else {
      throw new Error(`Open Router API error: ${error.message}`);
    }
  }
}

async function generateQuiz(topic, numQuestions = 10) {
  const prompt = `Generate ${numQuestions} multiple-choice questions about "${topic}". Each question should have 4 options (A, B, C, D) with one correct answer. Format as JSON array with structure: [{"question": "Question text", "options": ["A) Option1", "B) Option2", "C) Option3", "D) Option4"], "correctAnswer": "A"}]`;

  try {
    // Use Open Router for quiz generation
    const completion = await axios.post(
      OPENROUTER_API_URL,
      {
        model: 'openai/gpt-oss-20b:free',
        messages: [
          {
            role: 'system',
            content: 'You are a quiz generator. Always respond with valid JSON only, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://studybuddy.example.com',
          'X-Title': 'StudyBuddy'
        }
      }
    );

    const quizText = completion.data.choices[0].message.content;
    const quizData = JSON.parse(quizText);

    // Validate the quiz structure
    if (!Array.isArray(quizData) || quizData.length === 0) {
      throw new Error('Invalid quiz format');
    }

    return quizData.map(q => ({
      question: q.question,
      options: q.options,
      answer: q.correctAnswer
    }));

  } catch (error) {
    console.error('Open Router quiz generation failed:', error);
    // Fallback to basic quiz generation
    return generateBasicQuiz(topic, numQuestions);
  }
}

function generateBasicQuiz(topic, numQuestions = 10) {
  const questions = [];

  for (let i = 0; i < numQuestions; i++) {
    questions.push({
      question: `Question ${i + 1} about ${topic}?`,
      options: [
        `A) Correct answer for ${topic}`,
        `B) Wrong answer 1`,
        `C) Wrong answer 2`,
        `D) Wrong answer 3`
      ],
      answer: 'A'
    });
  }

  return questions;
}

module.exports = {
  askAI,
  generateQuiz,
  AI_MODELS: Object.keys(AI_MODELS)
};
