import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import PomodoroTimer from './components/StudySession/PomodoroTimer';
import ChatAssistant from './components/AIChat/ChatAssistant';
import QuizGenerator from './components/Quiz/QuizGenerator';
import Navbar from './components/Layout/Navbar';
import LoadingScreen from './components/Layout/LoadingScreen';
import LogoPopup from './components/Layout/LogoPopup';
import NotificationBlocker from './components/Layout/NotificationBlocker';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoPopup, setShowLogoPopup] = useState(false);

  useEffect(() => {
    document.title = 'StudyBuddy – AI Study Partner';
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowLogoPopup(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogoPopupClose = () => {
    setShowLogoPopup(false);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-surface text-white overflow-x-hidden">
      <LogoPopup isOpen={showLogoPopup} onClose={handleLogoPopupClose} />
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,255,157,0.14),transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(124,58,237,0.12),transparent_24%)]" />
        {location.pathname !== '/login' && location.pathname !== '/signup' && <Navbar />}
        <main className="relative mx-auto max-w-7xl px-4 py-6 md:px-10 xl:px-20">
          {location.pathname !== '/login' && location.pathname !== '/signup' && <NotificationBlocker />}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/session" element={<ProtectedRoute><PomodoroTimer /></ProtectedRoute>} />
            <Route path="/ai" element={<ProtectedRoute><ChatAssistant /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute><QuizGenerator /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
