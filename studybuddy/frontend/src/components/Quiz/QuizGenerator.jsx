import { useState } from 'react';
import api from '../../services/api';

function QuizGenerator() {
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (event) => {
    event.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError('');
    setShowAnswers(false);
    setSelectedAnswers({});

    try {
      const response = await api.post('/quiz/generate', { topic });
      const quiz = response.data.quiz || response.data.questions || [];
      setQuestions(Array.isArray(quiz) ? quiz : []);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to generate quiz questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (index, option) => {
    setSelectedAnswers((current) => ({ ...current, [index]: option }));
  };

  return (
    <div className="grid gap-6">
      <div className="rounded-[32px] border border-[#00ff9d]/10 bg-[#081014]/95 p-8 shadow-[0_0_40px_rgba(0,255,157,0.14)]">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.35em] text-[#00ff9d]">Quiz generator</p>
          <h2 className="text-3xl font-semibold text-white">Study with smart questions</h2>
          <p className="mt-3 text-sm text-white/70">Generate interactive practice questions for any topic in seconds.</p>
        </div>

        <form onSubmit={handleGenerate} className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <input
            className="flex-1 rounded-3xl border border-white/10 bg-[#061011] px-4 py-3 text-white outline-none transition focus:border-[#00ff9d]"
            placeholder="Enter topic or chapter"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
          />
          <button type="submit" disabled={loading} className="rounded-3xl bg-[#00ff9d] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#8cffb8] disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </form>
        {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
      </div>

      <section className="rounded-[32px] border border-[#00ff9d]/10 bg-[#081014]/90 p-6 shadow-[0_0_40px_rgba(0,255,157,0.14)]">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-white">Generated questions</h3>
          {questions.length > 0 && (
            <button onClick={() => setShowAnswers((current) => !current)} className="rounded-full border border-white/10 bg-[#061011] px-4 py-2 text-sm text-white transition hover:border-[#00ff9d]/40">
              {showAnswers ? 'Hide answers' : 'Reveal answers'}
            </button>
          )}
        </div>

        <div className="mt-4 space-y-4">
          {questions.length === 0 ? (
            <p className="text-sm text-white/70">Your quiz questions will appear here after generation.</p>
          ) : (
            questions.map((question, index) => (
              <div key={index} className="rounded-3xl border border-white/10 bg-[#061112] p-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm uppercase tracking-[0.35em] text-[#00ff9d]">Question {index + 1}</p>
                  {selectedAnswers[index] && <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-[#00ff9d]">Selected</span>}
                </div>
                <p className="mt-4 text-base text-white">{question.question}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {question.options?.map((option) => {
                    const isSelected = selectedAnswers[index] === option;
                    const isCorrect = showAnswers && option === question.answer;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelect(index, option)}
                        className={`rounded-3xl border px-4 py-3 text-left text-sm text-white transition ${isSelected ? 'border-[#00ff9d] bg-[#0c261d]' : 'border-white/10 bg-[#061011] hover:border-[#00ff9d]/40 hover:bg-white/5'} ${isCorrect ? 'border-[#8b5cf6] bg-[#1c2732]' : ''}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                {showAnswers && (
                  <p className="mt-4 text-sm text-white/70">Correct answer: <span className="font-semibold text-[#00ff9d]">{question.answer}</span></p>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default QuizGenerator;
