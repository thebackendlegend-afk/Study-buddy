import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', form);
      signIn(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[90vh] max-w-xl flex-col justify-center rounded-[32px] border border-white/10 bg-[#090b10]/95 p-8 shadow-[0_0_50px_rgba(0,255,157,0.12)] backdrop-blur-xl">
      <div className="mb-8 rounded-[28px] bg-[#081114]/95 p-6">
        <h1 className="text-3xl font-semibold text-white">Welcome back</h1>
        <p className="mt-3 text-sm text-white/70">Login to continue your hacker-style study flow.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-white/70">Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full rounded-3xl border border-white/10 bg-[#061011] px-4 py-3 text-white outline-none transition focus:border-[#00ff9d]" />

        <label className="block text-sm font-medium text-white/70">Password</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} required className="w-full rounded-3xl border border-white/10 bg-[#061011] px-4 py-3 text-white outline-none transition focus:border-[#00ff9d]" />

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <button type="submit" disabled={loading} className="w-full rounded-3xl bg-[#00ff9d] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#8cffb8] disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-white/70">
        New here?{' '}
        <Link to="/signup" className="text-[#00ff9d] hover:text-[#8cffb8]">Create an account</Link>
      </p>
    </div>
  );
}

export default Login;
