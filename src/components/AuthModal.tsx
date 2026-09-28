import React, { useState } from 'react';
import { X, Check, Mail, Lock, User as UserIcon, LogOut } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('praveenprs00@gmail.com');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('Praveen');

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    onLogin({
      name: 'Praveen',
      email: 'praveenprs00@gmail.com',
      avatar: '',
      isLoggedIn: true,
      provider: 'google',
    });
    onClose();
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    onLogin({
      name: name.trim() || email.split('@')[0],
      email: email.trim(),
      avatar: '',
      isLoggedIn: true,
      provider: 'email',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header: Orange Flow with Pristine White Typography */}
        <div className="p-6 bg-orange-flow text-white border-b border-white/20 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center shadow-xs">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-medium text-white tracking-tight drop-shadow-xs">
                {currentUser.isLoggedIn ? 'Account Profile' : 'Personal Planning Account'}
              </h2>
              <p className="text-xs text-white/80">
                {currentUser.isLoggedIn
                  ? 'Your progress and slots are saved in app'
                  : 'Sign in with Gmail or email to track your routine'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentUser.isLoggedIn ? (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-orange-50/40 border border-orange-200">
              <div className="w-14 h-14 rounded-full bg-orange-600 text-white flex items-center justify-center text-xl font-bold shadow-xs">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs text-orange-800 font-medium">
                  <Check className="w-3.5 h-3.5 text-orange-600" />
                  <span>Google Account Linked</span>
                </div>
                <h3 className="text-base font-semibold text-stone-900 truncate">
                  {currentUser.name}
                </h3>
                <p className="text-xs text-stone-500 truncate">{currentUser.email}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onLogout}
                className="flex-1 py-2 px-4 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Google / Gmail Sign In */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-2xl border border-stone-300 hover:border-orange-300 bg-white hover:bg-orange-50/50 text-stone-800 text-xs font-medium transition-all shadow-2xs group"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Gmail (Google)</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-stone-200"></div>
              <span className="shrink mx-3 text-[11px] text-stone-400">or with email</span>
              <div className="grow border-t border-stone-200"></div>
            </div>

            <div className="flex border-b border-stone-200">
              <button
                type="button"
                onClick={() => setTab('login')}
                className={`flex-1 pb-2 text-xs font-medium border-b-2 text-center transition-colors ${
                  tab === 'login'
                    ? 'border-orange-600 text-orange-700 font-semibold'
                    : 'border-transparent text-stone-400 hover:text-stone-700'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setTab('signup')}
                className={`flex-1 pb-2 text-xs font-medium border-b-2 text-center transition-colors ${
                  tab === 'signup'
                    ? 'border-orange-600 text-orange-700 font-semibold'
                    : 'border-transparent text-stone-400 hover:text-stone-700'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleCustomLogin} className="space-y-3.5">
              {tab === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Praveen"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium transition-colors shadow-xs"
              >
                {tab === 'signup' ? 'Create Account' : 'Sign In'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
