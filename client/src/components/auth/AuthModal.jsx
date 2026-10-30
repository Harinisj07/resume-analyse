import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    login,
    register,
  } = useAuth();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authModalTab === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, role);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Demo Login with automated fallback register if account not found
  const handleQuickDemo = async (demoName, demoEmail, demoPass, demoRole) => {
    setError(null);
    setLoading(true);
    try {
      // First try to login
      try {
        await login(demoEmail, demoPass);
        return;
      } catch {
        // If login failed (e.g. user not in DB yet), register the demo account
        await register(demoName, demoEmail, demoPass, demoRole);
      }
    } catch (err) {
      setError(err.message || 'Failed to initialize demo session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-md rounded-2xl bg-slate-900/95 border border-slate-800 p-6 sm:p-8 shadow-2xl shadow-brand-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-500/20 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {authModalTab === 'login' ? 'Sign in to ResumeAI' : 'Create an Account'}
            </h3>
            <p className="text-xs text-slate-400">
              Save resume analyses and generate custom career tracks
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/70 rounded-xl border border-slate-800/80 mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthModalTab('login');
              setError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              authModalTab === 'login'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalTab('register');
              setError(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              authModalTab === 'register'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalTab === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
              />
            </div>
          </div>

          {authModalTab === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Account Role
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                >
                  <option value="candidate">Job Candidate</option>
                  <option value="recruiter">Recruiter / Hiring Manager</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center mt-2"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : authModalTab === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        {/* 1-Click Quick Demo Logins */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
            Instant 1-Click Evaluation
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                handleQuickDemo('Candidate Demo', 'candidate@demo.io', 'DemoPass123!', 'candidate')
              }
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-brand-500/50 text-left transition-all text-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 group-hover:text-brand-400">
                  Candidate
                </span>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Resume & Career Test</p>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                handleQuickDemo('Admin Lead', 'admin@demo.io', 'AdminPass123!', 'admin')
              }
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-brand-500/50 text-left transition-all text-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 group-hover:text-brand-400">
                  Dev Admin
                </span>
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Full System Access</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
