import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { API_BASE_URL } from '@/lib/config';
import axiosInstance from '@/utils/axios';

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [userId, setUserId] = useState(() => localStorage.getItem('userId'));
  const [name, setName] = useState(() => {
    const stored = localStorage.getItem('name');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('name', JSON.stringify(data.name));
    setToken(data.accessToken);
    setUserId(data.userId);
    setName(data.name);
    return data;
  }, []);

  const logout = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: storedToken }),
        });
      } catch (err) {
        console.error('Logout request failed:', err);
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    setToken(null);
    setUserId(null);
    setName(null);
  }, []);

  return {
    token,
    userId,
    name,
    isAuthenticated: !!userId,
    login,
    logout,
  };
}

export function useSignup() {
  return useMutation({
    mutationFn: async ({ email, password, name }) => {
      const { data } = await axiosInstance.post('/api/auth/signup', { email, password, name })
      return data
    },
  })
}
