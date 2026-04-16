import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({ totalStudyMinutes: 0, streak: 0, quizAccuracy: 0, recentActivity: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/session/dashboard');
      setMetrics({
        totalStudyMinutes: response.data.totalStudyMinutes || 0,
        streak: response.data.streak || 0,
        quizAccuracy: response.data.quizAccuracy || 0,
        recentActivity: response.data.recentActivity || []
      });
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 8000);
    return () => clearInterval(interval);
  }, []);

  const weekData = useMemo(() => {
    const activity = metrics.recentActivity || [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day) => {
      const match = activity.find((item) => item.day === day || item.day.startsWith(day));
      return { label: day, count: match?.count || 0 };
    });
  }, [metrics.recentActivity]);

  const maxCount = Math.max(...weekData.map((item) => item.count), 1);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-[32px] border border-[#00ff9d]/10 bg-[#081014]/95 p-8 shadow-[0_0_40px_rgba(0,255,157,0.14)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[#00ff9d]">Welcome back</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">{user?.name || 'StudyBuddy User'}</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/70">StudyBuddy is tracking your study pulse in real time. Your dashboard refreshes every few seconds so progress stays visible.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-[#061014]/80 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">Live streak</p>
              <p className="mt-3 text-3xl font-semibold text-[#00ff9d]">{metrics.streak}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#061014]/80 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">Study time</p>
              <p className="mt-3 text-3xl font-semibold text-white">{Math.floor(metrics.totalStudyMinutes / 60)}h {metrics.totalStudyMinutes % 60}m</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#061014]/80 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">Quiz accuracy</p>
              <p className="mt-3 text-3xl font-semibold text-white">{metrics.quizAccuracy}%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-[28px] border border-white/10 bg-[#061017]/95 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Weekly focus pulse</h2>
              <p className="mt-2 text-sm text-white/70">Live activity bars update as you study and log sessions.</p>
            </div>
            <button onClick={fetchDashboard} className="rounded-full border border-white/10 bg-[#090d11] px-4 py-2 text-sm text-white transition hover:border-[#00ff9d]/40 hover:bg-white/5">Refresh</button>
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#0b1413]/80 p-4">
            <div className="grid gap-3 text-sm text-white/70">
              {weekData.map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <span className="w-12 text-white/70">{item.label}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#00ff9d] via-[#6ee7b7] to-[#0cc9a6]" style={{ width: `${(item.count / maxCount) * 100}%` }} />
                  </div>
                  <span className="w-10 text-right text-white">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#061017]/95 p-6">
          <h2 className="text-xl font-semibold text-white">Real-time trend</h2>
          <p className="mt-2 text-sm text-white/70">Your study flow is displayed as a clean neon trend line.</p>
          <div className="mt-6 rounded-3xl border border-white/10 bg-[#091014] p-4">
            <svg viewBox="0 0 110 110" className="h-48 w-full overflow-visible">
              <polyline
                points={weekData.map((item, index) => `${index * 14 + 6},${100 - (item.count / maxCount) * 80}`).join(' ')}
                fill="none"
                stroke="#00ff9d"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {weekData.map((item, index) => {
                const x = index * 14 + 6;
                const y = 100 - (item.count / maxCount) * 80;
                return <circle key={item.label} cx={x} cy={y} r="3" fill="#8cffb8" />;
              })}
            </svg>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-[#00ff9d]/10 bg-[#081115]/95 p-6 shadow-[0_0_30px_rgba(0,255,157,0.08)]">
          <h3 className="text-xl font-semibold text-white">Study mode</h3>
          <p className="mt-3 text-sm text-white/70">Stay on track with intelligent reminders in the session tab and see your progress reflected instantly.</p>
          <ul className="mt-6 space-y-3 text-sm text-white/70">
            <li>• Start focus sessions and log progress in real time.</li>
            <li>• Ask the AI for explanations and improve understanding.</li>
            <li>• Check your streak and study pulse every few seconds.</li>
          </ul>
        </div>
        <div className="rounded-[28px] border border-[#00ff9d]/10 bg-[#081115]/95 p-6 shadow-[0_0_30px_rgba(0,255,157,0.08)]">
          <h3 className="text-xl font-semibold text-white">AI study status</h3>
          <p className="mt-3 text-sm text-white/70">AI assistance and real-time session data work together to keep learning momentum visible.</p>
          <div className="mt-6 grid gap-3 text-sm text-white/70">
            <div className="rounded-3xl border border-white/10 bg-[#061014]/80 p-4">
              <p className="font-semibold text-white">Active study minutes</p>
              <p>{metrics.totalStudyMinutes}m</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#061014]/80 p-4">
              <p className="font-semibold text-white">Quiz accuracy</p>
              <p>{metrics.quizAccuracy}%</p>
            </div>
          </div>
        </div>
      </section>

      {error && <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>}
      {loading && <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">Refreshing dashboard…</div>}
    </div>
  );
}

export default Dashboard;

