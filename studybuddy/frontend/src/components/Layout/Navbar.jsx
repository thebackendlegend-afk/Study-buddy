import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#00ff9d]/15 bg-[#080a0d]/95 backdrop-blur-xl">
      <div className="mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6 max-w-7xl">
        <div>
          <p className="text-lg font-semibold tracking-wide text-[#00ff9d]">StudyBuddy</p>
          <p className="text-xs uppercase text-white/60">AI study partner</p>
        </div>

        <nav className="flex flex-wrap items-center gap-2 text-sm text-white/80">
          <NavLink className={({ isActive }) => isActive ? 'rounded-2xl border border-[#00ff9d]/40 bg-[#062014] px-3 py-2 text-[#00ff9d]' : 'rounded-2xl border border-white/5 px-3 py-2 text-white transition hover:border-[#00ff9d]/40 hover:bg-white/5'} to="/dashboard">Dashboard</NavLink>
          <NavLink className={({ isActive }) => isActive ? 'rounded-2xl border border-[#00ff9d]/40 bg-[#062014] px-3 py-2 text-[#00ff9d]' : 'rounded-2xl border border-white/5 px-3 py-2 text-white transition hover:border-[#00ff9d]/40 hover:bg-white/5'} to="/session">Session</NavLink>
          <NavLink className={({ isActive }) => isActive ? 'rounded-2xl border border-[#00ff9d]/40 bg-[#062014] px-3 py-2 text-[#00ff9d]' : 'rounded-2xl border border-white/5 px-3 py-2 text-white transition hover:border-[#00ff9d]/40 hover:bg-white/5'} to="/ai">AI Chat</NavLink>
          <NavLink className={({ isActive }) => isActive ? 'rounded-2xl border border-[#00ff9d]/40 bg-[#062014] px-3 py-2 text-[#00ff9d]' : 'rounded-2xl border border-white/5 px-3 py-2 text-white transition hover:border-[#00ff9d]/40 hover:bg-white/5'} to="/quiz">Quiz</NavLink>
          <button onClick={handleLogout} className="rounded-2xl border border-white/10 bg-[#0a1115] px-3 py-2 text-sm text-white transition hover:border-[#00ff9d]/40 hover:bg-white/5">Sign out</button>
        </nav>

        <div className="text-right text-xs text-white/60">
          <div className="font-semibold text-white">{user?.name || 'Guest'}</div>
          <div className="truncate max-w-[160px]">{user?.email || 'no-email@example.com'}</div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

