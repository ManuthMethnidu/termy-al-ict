import React, { useState, useEffect } from 'react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../../lib/auth';
import { sounds } from '../../lib/sound';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signin',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    setGoogleLoading(false);
    if (error) {
      setErrorMessage(error.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    if (mode === 'signup') {
      const { user, session, error, emailConfirmationRequired } = await signUpWithEmail(
        cleanEmail,
        password,
        fullName.trim()
      );
      setLoading(false);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (emailConfirmationRequired) {
        setSuccessMessage(
          `Account created for ${cleanEmail}! Please check your email inbox to confirm your registration, then sign in.`
        );
        sounds.playFanfare();
      } else if (session || user) {
        sounds.playFanfare();
        if (onSuccess) onSuccess();
        onClose();
      }
    } else {
      // Sign In mode
      const { session, error } = await signInWithEmail(cleanEmail, password);
      setLoading(false);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (session) {
        sounds.playFanfare();
        if (onSuccess) onSuccess();
        onClose();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-surface-container rounded-2xl border-2 border-card-border p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col gap-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-text-muted hover:text-on-surface p-1 rounded-xl hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-md">
            <span className="material-symbols-outlined text-2xl">
              {mode === 'signup' ? 'person_add' : 'account_circle'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-on-surface">
              {mode === 'signup' ? 'Create Termy Account' : 'Sign in to Termy'}
            </h2>
            <p className="text-xs text-text-muted mt-1 max-w-xs mx-auto">
              {mode === 'signup'
                ? 'Join thousands of Sri Lankan A/L ICT candidates practicing with active recall & spaced repetition.'
                : 'Sign in to sync your study streak, Diamond League XP, and spaced repetition queue.'}
            </p>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-surface-container-high border border-card-border/60">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-primary text-on-primary-fixed shadow-sm'
                : 'text-text-muted hover:text-on-surface'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-primary text-on-primary-fixed shadow-sm'
                : 'text-text-muted hover:text-on-surface'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Google OAuth Quick Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-surface-container-high hover:bg-surface-variant border border-card-border/80 text-xs font-extrabold uppercase tracking-wider text-on-surface transition-all shadow-sm active:translate-y-0.5 disabled:opacity-50"
        >
          {googleLoading ? (
            <span className="material-symbols-outlined text-lg animate-spin">sync</span>
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-card-border/80 w-full" />
          <span className="bg-surface-container px-3 text-[11px] font-bold text-text-muted uppercase tracking-wider">
            or with email
          </span>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-crimson-heart/15 border border-crimson-heart/30 text-crimson-heart text-xs flex items-start gap-2">
            <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
            <span className="leading-tight font-medium">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-primary/15 border border-primary/30 text-primary text-xs flex items-start gap-2">
            <span className="material-symbols-outlined text-base shrink-0 mt-0.5">check_circle</span>
            <span className="leading-tight font-medium">{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
          {mode === 'signup' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-muted font-bold">Candidate Name</label>
              <input
                type="text"
                placeholder="e.g. Kasun Perera"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-card-border text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-muted font-bold">Email Address</label>
            <input
              type="email"
              required
              placeholder="candidate@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-card-border text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-muted font-bold">Password</label>
            <input
              type="password"
              required
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-card-border text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-on-primary-fixed font-extrabold text-xs uppercase tracking-wider btn-pressable-primary flex items-center justify-center gap-2 transition-all shadow-md active:translate-y-0.5 disabled:opacity-50"
          >
            {loading ? (
              <span className="material-symbols-outlined text-lg animate-spin">sync</span>
            ) : (
              <span className="material-symbols-outlined text-lg">
                {mode === 'signup' ? 'person_add' : 'login'}
              </span>
            )}
            <span>
              {loading
                ? 'Processing...'
                : mode === 'signup'
                ? 'Create Free Account'
                : 'Sign In'}
            </span>
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center text-[11px] text-text-muted">
          {mode === 'signup' ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-primary font-bold hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              New to Termy?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-primary font-bold hover:underline"
              >
                Create Account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
