import React, { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../api';
import { AdminUser } from '../types';

interface AuthGateProps {
  onLoginSuccess: (user: AdminUser, token: string) => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('ncsc2026!vault');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(username, password);
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDefaultAdmin = () => {
    setUsername('admin');
    setPassword('ncsc2026!vault');
    setError('');
  };

  const fillEmailAdmin = () => {
    setUsername('ncscwastemanagementsystem@gmail.com');
    setPassword('ncsc2026!vault');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-emerald-600/15 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a15_1px,transparent_1px),linear-gradient(to_bottom,#0f172a15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative z-10">
        {/* Header Badge */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-emerald-500/20 border border-cyan-500/40 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/10 ring-4 ring-cyan-500/5">
            <ShieldCheck className="w-9 h-9 text-cyan-400" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-700/50 text-[11px] font-semibold tracking-wider text-cyan-300 uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            NCSC Project Vault
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Administrator Access
          </h1>
          <p className="text-slate-400 text-xs mt-1 max-w-xs">
            Private scientific repository for school science congress research & exhibition assets.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Admin Username or Registered Email
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="admin or user@gmail.com"
                className="w-full bg-slate-950/80 border border-slate-700/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Master Security Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
                className="w-full bg-slate-950/80 border border-slate-700/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition-all duration-200 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Authenticating Vault...
              </span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                Unlock Private Project Vault
              </>
            )}
          </button>
        </form>

        {/* Quick Credentials Pre-sets */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="text-[11px] font-medium text-slate-400 mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Quick Fill Default Credentials
            </span>
            <span className="text-[10px] text-slate-500">Local Safe Mode</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillDefaultAdmin}
              className="py-1.5 px-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-[11px] font-mono transition-all text-left flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>admin</span>
            </button>
            <button
              type="button"
              onClick={fillEmailAdmin}
              className="py-1.5 px-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-[11px] font-mono truncate transition-all text-left flex items-center gap-1.5"
              title="ncscwastemanagementsystem@gmail.com"
            >
              <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate">ncscwaste...</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 text-center">
            Default Password: <code className="text-cyan-300/80 bg-slate-950 px-1 py-0.5 rounded">ncsc2026!vault</code> (editable inside settings)
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-slate-500 z-10 flex items-center gap-2">
        <Lock className="w-3.5 h-3.5 text-cyan-500/70" />
        <span>End-to-End Local Storage & Multi-Layer Project Security Protocol</span>
      </div>
    </div>
  );
};
