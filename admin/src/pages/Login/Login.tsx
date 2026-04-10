import { useState, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/core/ui';
import { Input } from '../../components/core/ui';
import { ToastNotification } from '../../components/core/ui';
import { ThemeSwitcher } from '../../components/core';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5046/api';

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailDirty, setEmailDirty] = useState(false);
  const [passwordDirty, setPasswordDirty] = useState(false);
  const [toast, setToast] = useState<{ text: string; variant: 'success' | 'error' } | null>(null);
  const resetButtonRef = useRef<(() => void) | null>(null);

  const handleReset = useCallback(() => {
    resetButtonRef.current?.();
  }, []);

  const emailError = useMemo(() => {
    if (!emailDirty) return '';
    if (!email) return 'Email is required';
    if (!isValidEmail(email)) return 'Please enter a valid email';
    return '';
  }, [email, emailDirty]);

  const passwordError = useMemo(() => {
    if (!passwordDirty) return '';
    if (!password) return 'Password is required';
    return '';
  }, [password, passwordDirty]);

  const isFormValid = useMemo(() => {
    return isValidEmail(email) && password.length > 0;
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log('Login response:', res.status, data);

      if (res.ok) {
        localStorage.setItem('accessToken', data.accessToken);
        handleReset();
        window.location.href = '/dashboard';
        return;
      } else {
        handleReset();
        setToast({ text: data.error || 'Login failed', variant: 'error' });
      }
    } catch (err) {
      console.error('Login error:', err);
      handleReset();
      setToast({ text: 'Network error. Please try again.', variant: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-dark flex items-center justify-center p-4">
      <div className="fixed top-4 right-4">
        <ThemeSwitcher />
      </div>

      {toast && (
        <ToastNotification
          text={toast.text}
          variant={toast.variant}
          location="bottom-center"
          onDismiss={() => setToast(null)}
        />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-neutral dark:text-white mb-6 text-center">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="email"
            label="Email"
            type="email"
            icon="Mail"
            value={email}
            onChange={setEmail}
            onBlur={() => setEmailDirty(true)}
            labelDisplay="normal"
            isError={!!emailError}
            errorMessage={emailError}
          />

          <Input
            name="password"
            label="Password"
            type="password"
            icon="Lock"
            value={password}
            onChange={setPassword}
            onBlur={() => setPasswordDirty(true)}
            labelDisplay="normal"
            isError={!!passwordError}
            errorMessage={passwordError}
          />

          <Button
            variant="regular"
            text="Login"
            className="w-full"
            isDisabled={!isFormValid}
            onLoadingReset={(fn: () => void) => { resetButtonRef.current = fn; }}
          />
        </form>

        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
