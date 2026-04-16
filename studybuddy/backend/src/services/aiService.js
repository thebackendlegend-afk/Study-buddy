const axios = require('axios');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const HF_API_KEY = process.env.HF_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Available AI models
const AI_MODELS = {
  huggingface_distil: {
    name: 'Hugging Face Flan-T5 Base (Primary)',
    endpoint: 'https://api-inference.huggingface.co/models/google/flan-t5-base',
    maxTokens: 500
  },
  gpt_neo: {
    name: 'EleutherAI GPT-Neo 125M',
    endpoint: 'https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-125m',
    maxTokens: 500
  },
  huggingface: {
    name: 'Hugging Face GPT-2',
    endpoint: 'https://api-inference.huggingface.co/models/gpt2',
    maxTokens: 250
  },
  microsoft_dialo: {
    name: 'Microsoft DialoGPT',
    endpoint: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
    maxTokens: 1000
  },
  deepseek: {
    name: 'DeepSeek AI (Fallback)',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    maxTokens: 2000
  },
  deepseek_large: {
    name: 'DeepSeek AI Large (Fallback)',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    maxTokens: 4000,
    model: 'deepseek-chat-large'
  }
};

async function askAI(prompt, model = 'huggingface_distil') {
  const selectedModel = AI_MODELS[model];

  if (!selectedModel) {
    throw new Error(`Model ${model} not found. Available models: ${Object.keys(AI_MODELS).join(', ')}`);
  }

  try {
    if (model.startsWith('huggingface') || model === 'microsoft_dialo' || model === 'gpt_neo') {
      console.log('Calling askHuggingFace for model:', model);
      return await askHuggingFace(prompt, selectedModel);
    } else if (model.startsWith('deepseek')) {
      console.log('Calling askDeepSeek for model:', model);
      return await askDeepSeek(prompt, selectedModel);
    }
  } catch (error) {
    console.error(`Error with ${model}:`, error.message);
    // Fallback to DistilGPT-2 if primary fails
    if (model !== 'huggingface_distil') {
      console.log('Falling back to DistilGPT-2...');
      return await askHuggingFace(prompt, AI_MODELS.huggingface_distil);
    }
    throw new Error('All AI services failed. Please try again later.');
  }
}

async function askHuggingFace(prompt, modelConfig) {
  try {
    console.log('Calling Hugging Face API:', modelConfig.endpoint);
    
    const response = await axios.post(
      modelConfig.endpoint,
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000
      }
    );

    console.log('✓ Hugging Face response received');
    
    if (response.data && response.data.error) {
      throw new Error(`Hugging Face API Error: ${response.data.error}`);
    }

    // Handle different response formats
    let generatedText = '';
    if (Array.isArray(response.data)) {
      generatedText = response.data[0]?.generated_text || '';
    } else if (response.data && typeof response.data === 'object') {
      generatedText = response.data.generated_text || '';
    } else if (typeof response.data === 'string') {
      generatedText = response.data;
    }

    // Clean up the response
    if (generatedText.startsWith(prompt)) {
      generatedText = generatedText.substring(prompt.length).trim();
    }

    return generatedText || 'I apologize, but I could not generate a proper response. Please try rephrasing your question.';

  } catch (error) {
    if (error.response?.status === 503) {
      throw new Error('Hugging Face model is loading. Please try again in a moment.');
    } else if (error.response?.status === 429) {
      throw new Error('Hugging Face API rate limited. Please try again later.');
    } else if (error.response?.status === 401) {
      throw new Error('Invalid Hugging Face token. Please verify your API key is correct.');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. Token may not have permission for this model.');
    } else if (error.response?.status === 404) {
      throw new Error('Model not found. Please ensure the model ID is correct.');
    } else {
      throw new Error(`Hugging Face API error: ${error.message}`);
    }
  }
}

async function askDeepSeek(prompt, modelConfig = AI_MODELS.deepseek) {
  const response = await axios.post(
    'https://api.deepseek.com/v1/chat/completions',
    {
      model: modelConfig.model || 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI study assistant. Provide clear, accurate, and educational responses. You are powered by DeepSeek AI.'
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
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000
    }
  );

  if (response.data && response.data.choices && response.data.choices[0]) {
    return response.data.choices[0].message.content;
  }

  throw new Error('Invalid response from DeepSeek API');
}

async function generateQuiz(topic, numQuestions = 10) {
  const prompt = `Generate ${numQuestions} multiple-choice questions about "${topic}". Each question should have 4 options (A, B, C, D) with one correct answer. Format as JSON array with structure: [{"question": "Question text", "options": ["A) Option1", "B) Option2", "C) Option3", "D) Option4"], "correctAnswer": "A"}]`;

  try {
    // Use ChatGPT for quiz generation as it's better at structured output
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
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
    });

    const quizText = completion.choices[0].message.content;
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
    console.error('ChatGPT quiz generation failed:', error);
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
