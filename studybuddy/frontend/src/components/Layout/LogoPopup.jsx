import { useEffect, useState } from 'react';

function LogoPopup({ isOpen, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer;
    if (isOpen) {
      setVisible(true);
      timer = setTimeout(() => onClose(), 2800);
    } else if (visible) {
      timer = setTimeout(() => setVisible(false), 300);
    }
    return () => clearTimeout(timer);
  }, [isOpen, onClose, visible]);

  if (!visible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`relative w-full max-w-lg rounded-[32px] border border-[#00ff9d]/20 bg-[#0a0f13]/95 p-8 text-center shadow-[0_0_50px_rgba(0,255,157,0.25)] transition-transform duration-300 ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-6 scale-95'}`}>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10">✕</button>
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#00ff9d]/25 to-[#ffffff]/5 shadow-[0_0_40px_rgba(0,255,157,0.2)]">
          <span className="text-4xl font-bold text-[#00ff9d]">SB</span>
        </div>
        <h2 className="mt-6 text-3xl font-semibold text-white">StudyBuddy</h2>
        <p className="mt-2 text-sm text-white/70">Dark mode study AI with notification blocker and responsive support.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-[#081013] p-4 text-left text-sm text-white/70">
            <div className="mb-2 text-xs uppercase tracking-[0.35em] text-[#00ff9d]">AI Chat</div>
            Instant help, fast replies, no distractions.
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#081013] p-4 text-left text-sm text-white/70">
            <div className="mb-2 text-xs uppercase tracking-[0.35em] text-[#00ff9d]">Focus Timer</div>
            Pomodoro mode with activity tracking and alerts.
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#081013] p-4 text-left text-sm text-white/70">
            <div className="mb-2 text-xs uppercase tracking-[0.35em] text-[#00ff9d]">Quizzes</div>
            Generate practice questions for quick review.
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#081013] p-4 text-left text-sm text-white/70">
            <div className="mb-2 text-xs uppercase tracking-[0.35em] text-[#00ff9d]">Notifications</div>
            Block or allow alerts with one tap.
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogoPopup;
