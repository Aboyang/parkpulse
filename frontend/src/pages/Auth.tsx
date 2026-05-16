import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navigation, Mail, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { APP_NAME, APP_TAGLINE } from '@/lib/config';
import { useAuth, useSignup } from '@/hooks/useAuth';
import { IconInput } from '@/components/ui/icon-input';
import { StatusAlert } from '@/components/ui/status-alert';

export default function Auth() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const signupMutation = useSignup();

  const [isSignup, setIsSignup] = useState(false);

  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    if (isSignup) {
      if (!name) {
        setError('Name is required');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignup) {
        await signupMutation.mutateAsync({ email, password, name });
        setIsSignup(false);
        setSuccess('Account created successfully. Please log in.');
      } else {
        await login(email, password);
        navigate('/Home');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white flex items-center justify-center">
      <div className="px-5 w-full max-w-md mx-auto py-8">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Navigation className="w-8 h-8 text-teal-400" />
          </div>
          <h1 className="text-2xl font-bold">{APP_NAME}</h1>
          <p className="text-sm text-slate-400 mt-1">{APP_TAGLINE}</p>
        </motion.div>

        {/* CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">

            <h2 className="text-lg font-semibold mb-1">
              {isSignup ? 'Create your account' : 'Welcome back'}
            </h2>

            <p className="text-sm text-slate-400 mb-6">
              {isSignup
                ? 'Start finding carparks near you'
                : 'Sign in to your account'}
            </p>

            {success && <StatusAlert type="success" message={success} />}
            {error   && <StatusAlert type="error"   message={error}   />}

            <form onSubmit={handleSubmit} className="space-y-4">

              {isSignup && (
                <IconInput
                  label="Name"
                  icon={User}
                  value={name}
                  onChange={(e) => { setName(e.target.value); setSuccess(''); }}
                />
              )}

              <IconInput
                label="Email"
                icon={Mail}
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setSuccess(''); }}
              />

              <IconInput
                label="Password"
                icon={Lock}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setSuccess(''); }}
                showToggle
                toggled={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
              />

              {isSignup && (
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setSuccess('');
                    }}
                    className="h-12 bg-slate-900/50 border-slate-700"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-teal-500"
              >
                {loading ? 'Loading...' : isSignup ? 'Create Account' : 'Sign In'}
              </Button>
            </form>

            {/* TOGGLE */}
            <p className="text-center text-sm text-slate-400 mt-6">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError('');
                  setSuccess('');
                }}
                className="text-teal-400"
              >
                {isSignup ? 'Sign in' : 'Create one'}
              </button>
            </p>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
