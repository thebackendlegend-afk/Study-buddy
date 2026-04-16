import { useEffect, useState } from 'react';
import api from '../../services/api';

const MODES = [
  { value: 'standard', label: 'Standard' },
  { value: 'eli5', label: 'Explain like I’m 5' },
  { value: 'doubt', label: 'Solve a doubt' },
  { value: 'followup', label: 'Follow-up question' }
];

function ChatAssistant() {
  const [question, setQuestion] = useState('');
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('deepseek');
  const [mode, setMode] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    async function loadModels() {
      try {
        const response = await api.get('/ai/models');
        setModels(response.data.models || []);
      } catch {
        setModels(['deepseek', 'huggingface_distil']);
      }
    }
    loadModels();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!question.trim()) return;

    const userMessage = question.trim();
    setLoading(true);
    setError('');
    setResponse('');

    try {
      const response = await api.post('/ai/chat', {
        message: userMessage,
        model: selectedModel,
        mode
      });
      const replyText = response.data.reply || response.data.answer || 'No response available. Please try again.';
      setResponse(replyText);
      setQuestion('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to get an AI response. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="rounded-[32px] border border-[#00ff9d]/10 bg-[#081014]/95 p-8 shadow-[0_0_40px_rgba(0,255,157,0.14)]">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[#00ff9d]">AI study assistant</p>
            <h2 className="text-3xl font-semibold text-white">Ask a tutor built for deep focus.</h2>
            <p className="mt-3 max-w-2xl text-sm text-white/70">Switch modes, select an AI model, and get instant answers to study questions.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-white/70">
              Model
              <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="w-full rounded-3xl border border-white/10 bg-[#061011] px-4 py-3 text-white outline-none focus:border-[#00ff9d]">
                {models.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-white/70">
              Mode
              <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full rounded-3xl border border-white/10 bg-[#061011] px-4 py-3 text-white outline-none focus:border-[#00ff9d]">
                {MODES.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <textarea
            rows="5"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Type your study question, ask for a summary, or request an explanation..."
            className="w-full rounded-3xl border border-white/10 bg-[#061011] px-4 py-4 text-white outline-none transition focus:border-[#00ff9d]"
          />
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button type="submit" disabled={loading} className="rounded-3xl bg-[#00ff9d] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#8cffb8] disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? 'Thinking...' : 'Send to AI'}
          </button>
        </form>
      </div>

      <section className="rounded-[32px] border border-[#00ff9d]/10 bg-[#081014]/90 p-6 shadow-[0_0_40px_rgba(0,255,157,0.14)]">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-white">AI Response</h3>
          <span className="rounded-full border border-white/10 bg-[#061011] px-3 py-1 text-xs uppercase tracking-[0.35em] text-[#00ff9d]">Model: {selectedModel}</span>
        </div>
        <div className="mt-4">
          {loading ? (
            <p className="text-sm text-white/70">Thinking...</p>
          ) : response ? (
            <div className="rounded-3xl bg-[#061f18] p-4 text-white">
              <p className="text-xs uppercase tracking-[0.35em] text-white/40">Assistant</p>
              <p className="mt-2 text-sm leading-7">{response}</p>
            </div>
          ) : (
            <p className="text-sm text-white/70">The AI assistant will respond here after you submit a question.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default ChatAssistant;
