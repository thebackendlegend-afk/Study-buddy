import { createContext, useContext, useEffect, useState } from 'react';
import { setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('studybuddy_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('studybuddy_token'));

  useEffect(() => {
    if (user) {
      localStorage.setItem('studybuddy_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('studybuddy_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('studybuddy_token', token);
      setAuthToken(token);
    } else {
      localStorage.removeItem('studybuddy_token');
      setAuthToken('');
    }
  }, [token]);

  const signIn = (userData, jwt) => {
    setUser(userData);
    setToken(jwt);
  };

  const signOut = () => {
    setUser(null);
    setToken('');
  };

  return (
    <AuthContext.Provider value={{ user, token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
