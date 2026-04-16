import { useEffect, useState } from 'react';

const texts = [
  'Booting StudyBuddy core...',
  'Syncing AI matrix...',
  'Preparing your study zone...',
  'Activating dark mode...',
  'Ready to optimize learning'
];

function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(texts[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((current) => {
        const next = Math.min(current + Math.random() * 12 + 8, 100);
        const index = Math.min(Math.floor((next / 100) * texts.length), texts.length - 1);
        setMessage(texts[index]);
        if (next >= 100) {
          clearInterval(interval);
        }
        return next;
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505] text-white">
      <div className="relative w-full max-w-md rounded-[32px] border border-[#00ff9d]/20 bg-[#090b10]/95 p-8 shadow-[0_0_80px_rgba(0,255,157,0.18)] backdrop-blur-xl">
        <div className="mb-8 flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#062014] shadow-[0_0_32px_rgba(0,255,157,0.15)]">
            <div className="h-14 w-14 rounded-2xl border border-[#00ff9d]/30 bg-gradient-to-br from-[#00ff9d]/20 to-transparent"></div>
          </div>
        </div>
        <h1 className="text-center text-3xl font-semibold tracking-wide text-[#00ff9d]">StudyBuddy</h1>
        <p className="mt-4 text-center text-sm text-white/70">A better study experience is launching.</p>
        <div className="mt-8 space-y-4">
          <div className="rounded-full bg-white/5 p-3 text-center text-xs uppercase tracking-[0.3em] text-white/60">{message}</div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-[#00ff9d] via-[#6ee7b7] to-[#00bfa5] transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-right text-sm text-white/50">{Math.round(progress)}%</div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
