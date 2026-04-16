import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function Signup() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phoneNumber: '', parentEmail: '' });
  const [verification, setVerification] = useState({ emailCode: '', phoneCode: '' });
  const [step, setStep] = useState('signup');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleVerificationChange = (e) => {
    setVerification({ ...verification, [e.target.name]: e.target.value });
  };

  const startSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/signup', form);
      if (response.data.requiresVerification) {
        setStep('verify');
        setMessage('Verification codes have been sent to your email and phone (if provided).');
      } else {
        signIn(response.data.user, response.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCodes = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/verify-email', { email: form.email, code: verification.emailCode });
      if (form.phoneNumber) {
        await api.post('/auth/verify-phone', { phoneNumber: form.phoneNumber, code: verification.phoneCode });
      }
      const completeResponse = await api.post('/auth/complete-signup', { email: form.email });
      signIn(completeResponse.data.user, completeResponse.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. Please check your codes and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[90vh] max-w-xl flex-col justify-center rounded-[32px] border border-white/10 bg-[#090b10]/95 p-8 shadow-[0_0_50px_rgba(0,255,157,0.12)] backdrop-blur-xl">
      <div className="mb-8 rounded-[28px] bg-[#081114]/95 p-6">
        <h1 className="text-3xl font-semibold text-white">{step === 'signup' ? 'Create your account' : 'Verify your account'}</h1>
        <p className="mt-3 text-sm text-white/70">{step === 'signup' ? 'Start using StudyBuddy with a secure account.' : 'Enter the verification codes sent to your email and phone.'}</p>
      </div>

      {step === 'signup' ? (
        <form onSubmit={startSignup} className="space-y-4">
          <label className="block text-sm font-medium text-white/70">Name</label>
          <input name="name" type="text" value={form.name} onChange={handleChange} required className="w-full rounded-3xl border border-white/10 bg-[#061011] px-4 py-3 text-white outline-none transition focus:border-[#00ff9d]" />

          <label className="block text-sm font-medium text-white/70">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full rounded-3xl border border-white/10 bg-[#061011] px-4 py-3 text-white outline-none transition focus:border-[#00ff9d]" />

          <label className="block text-sm font-medium text-white/70">Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required className="w-full rounded-3xl border border-white/10 bg-[#061011] px-4 py-3 text-white outline-none transition focus:border-[#00ff9d]" />

          <label className="block text-sm font-medium text-white/70">Phone number</label>
          <input name="phoneNumber" type="tel" value={form.phoneNumber} onChange={handleChange} className="w-full rounded-3xl border border-white/10 bg-[#061011] px-4 py-3 text-white outline-none transition focus:border-[#00ff9d]" placeholder="+1234567890" />

          <label className="block text-sm font-medium text-white/70">Parent / Guardian Email</label>
          <input name="parentEmail" type="email" value={form.parentEmail} onChange={handleChange} className="w-full rounded-3xl border border-white/10 bg-[#061011] px-4 py-3 text-white outline-none transition focus:border-[#00ff9d]" placeholder="parent@example.com" />

          {message && <p className="text-sm text-emerald-300">{message}</p>}
          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button type="submit" disabled={loading} className="w-full rounded-3xl bg-[#00ff9d] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#8cffb8] disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? 'Starting verification...' : 'Sign up'}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCodes} className="space-y-4">
          <label className="block text-sm font-medium text-white/70">Email verification code</label>
          <input name="emailCode" type="text" value={verification.emailCode} onChange={handleVerificationChange} required className="w-full rounded-3xl border border-white/10 bg-[#061011] px-4 py-3 text-white outline-none transition focus:border-[#00ff9d]" />

          {form.phoneNumber && (
            <>
              <label className="block text-sm font-medium text-white/70">Phone verification code</label>
              <input name="phoneCode" type="text" value={verification.phoneCode} onChange={handleVerificationChange} required className="w-full rounded-3xl border border-white/10 bg-[#061011] px-4 py-3 text-white outline-none transition focus:border-[#00ff9d]" />
            </>
          )}

          {message && <p className="text-sm text-emerald-300">{message}</p>}
          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button type="submit" disabled={loading} className="w-full rounded-3xl bg-[#00ff9d] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#8cffb8] disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? 'Verifying...' : 'Verify and complete signup'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-white/70">
        Already have an account?{' '}
        <Link to="/login" className="text-[#00ff9d] hover:text-[#8cffb8]">Sign in</Link>
      </p>
    </div>
  );
}

export default Signup;
