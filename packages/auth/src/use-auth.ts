'use client';

import { useState } from 'react';
import {
  login as loginRequest,
  loginWithGoogle as loginWithGoogleRequest,
  loginWithGoogleCredential,
  type User,
} from './auth';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const user = await loginRequest(email, password);
      localStorage.setItem('tickest_user', JSON.stringify(user));
      window.dispatchEvent(new Event('auth-change'));
      return user;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function loginWithGoogle(email: string) {
    setLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogleRequest(email);
      localStorage.setItem('tickest_user', JSON.stringify(user));
      window.dispatchEvent(new Event('auth-change'));
      return user;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
      return null;
    } finally {
      setLoading(false);
    }
  }

  function loginWithGoogleIdToken(idToken: string) {
    setError(null);
    try {
      const user = loginWithGoogleCredential(idToken);
      localStorage.setItem('tickest_user', JSON.stringify(user));
      window.dispatchEvent(new Event('auth-change'));
      return user;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
      return null;
    }
  }

  return { login, loginWithGoogle, loginWithGoogleIdToken, loading, error };
}