import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'ezone_token';
const STUDENT_KEY = 'ezone_student';

export function AuthProvider({ children }) {
  const [student, setStudent] = useState(() => {
    // Hydrate from localStorage on first load
    try {
      const stored = localStorage.getItem(STUDENT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Keep localStorage in sync whenever student/token changes
  useEffect(() => {
    if (token && student) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(STUDENT_KEY, JSON.stringify(student));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(STUDENT_KEY);
    }
  }, [token, student]);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async ({ name, email, password, grade }) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/register', { name, email, password, grade });
      setToken(data.token);
      setStudent(data.student);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setToken(data.token);
      setStudent(data.student);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setToken(null);
    setStudent(null);
    setError(null);
  }, []);

  const value = { student, token, loading, error, login, logout, register, setError };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Convenience hook
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export default AuthContext;
