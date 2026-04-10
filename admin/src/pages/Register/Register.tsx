import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/core/ui';
import { Input } from '../../components/core/ui';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function RegisterPage() {
  const [step, setStep] = useState<'form' | 'otp' | 'password'>('form');
  const [registerToken, setRegisterToken] = useState('');
  const [confirmToken, setConfirmToken] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register-new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email }),
      });

      const data = await res.json();

      if (res.ok) {
        setRegisterToken(data.registerToken);
        setStep('otp');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register-confirm-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registerToken, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.confirmToken) {
          setConfirmToken(data.confirmToken);
          setStep('password');
        } else {
          localStorage.setItem('accessToken', data.accessToken);
          window.location.href = '/dashboard';
        }
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register-complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ confirmToken, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('accessToken', data.accessToken);
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-dark flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-neutral dark:text-white mb-6 text-center">
          Register
        </h1>

        {error && (
          <div className="bg-error-light/10 text-error-light dark:text-error-dark p-3 rounded mb-4">
            {error}
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              name="firstName"
              label="First Name"
              icon="User"
              value={firstName}
              onChange={setFirstName}
              labelDisplay="normal"
            />

            <Input
              name="lastName"
              label="Last Name"
              icon="User"
              value={lastName}
              onChange={setLastName}
              labelDisplay="normal"
            />

            <Input
              name="email"
              label="Email"
              type="email"
              icon="Mail"
              value={email}
              onChange={setEmail}
              labelDisplay="normal"
            />

            <Button
              variant="regular"
              text={loading ? 'Sending OTP...' : 'Continue'}
              className="w-full"
              isDisabled={loading}
            />
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300 text-sm text-center">
              Enter the OTP code sent to your email
            </p>

            <Input
              name="otp"
              label="OTP Code"
              icon="Key"
              value={otp}
              onChange={setOtp}
              labelDisplay="normal"
            />

            <Button
              variant="regular"
              text={loading ? 'Verifying...' : 'Verify OTP'}
              className="w-full"
              isDisabled={loading}
            />

            <Button
              variant="info"
              text="Change Email"
              icon="ArrowLeft"
              iconPosition="start"
              className="w-full"
              onClick={() => setStep('form')}
            />
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handleSetPassword} className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300 text-sm text-center">
              Set your password to complete registration
            </p>

            <Input
              name="password"
              label="Password"
              type="password"
              icon="Lock"
              value={password}
              onChange={setPassword}
              labelDisplay="normal"
            />

            <Input
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              icon="Lock"
              value={confirmPassword}
              onChange={setConfirmPassword}
              labelDisplay="normal"
            />

            <Button
              variant="regular"
              text={loading ? 'Completing...' : 'Complete Registration'}
              className="w-full"
              isDisabled={loading}
            />
          </form>
        )}

        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
