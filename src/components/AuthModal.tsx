import React, { useState } from 'react';
import { UserAccount } from '../types';
import { authStore } from '../utils/authStore';
import { 
  LogIn, 
  UserPlus, 
  X, 
  Lock, 
  Mail, 
  User, 
  BadgeCheck, 
  Building, 
  AlertCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [department, setDepartment] = useState('Municipal Crime Analytics Division');
  const [role, setRole] = useState<'Senior Crime Analyst' | 'Field Patrol Officer'>('Senior Crime Analyst');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!emailOrUsername.trim()) {
      setError('Please provide your registered username or email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    const res = await authStore.login(emailOrUsername, password);
    setLoading(false);

    if (res.success && res.user) {
      onSuccess(res.user);
      onClose();
    } else {
      setError(res.error || 'Authentication failed.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !regEmail.trim() || !regUsername.trim()) {
      setError('Please fill in all mandatory identification fields.');
      return;
    }

    if (!regEmail.includes('@') || !regEmail.includes('.')) {
      setError('Please provide a valid departmental email address.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (regPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    const res = await authStore.register({
      fullName,
      email: regEmail,
      username: regUsername,
      badgeNumber,
      department,
      role,
      password: regPassword,
    });
    setLoading(false);

    if (res.success && res.user) {
      onSuccess(res.user);
      onClose();
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  const handleQuickDemoLogin = async (email: string) => {
    setError('');
    setLoading(true);
    const res = await authStore.login(email, 'password123');
    setLoading(false);
    if (res.success && res.user) {
      onSuccess(res.user);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {mode === 'login' ? 'Officer & Analyst Sign In' : 'Register New Personnel'}
              </h2>
              <span className="text-[11px] text-slate-400">Departmental Intelligence Access</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Demo Login Bar for College Review */}
        <div className="bg-slate-950/60 p-3.5 border-b border-slate-800 space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
            College Review Quick-Login (1-Click Test Accounts):
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('analyst@metroanalytics.gov')}
              className="py-1 px-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-medium text-blue-300 truncate"
              title="Sign in as Senior Analyst Sarah Chen"
            >
              Analyst Sarah
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('officer@metropolice.gov')}
              className="py-1 px-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-medium text-emerald-300 truncate"
              title="Sign in as Patrol Officer Marcus"
            >
              Officer Marcus
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin@metroanalytics.gov')}
              className="py-1 px-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-medium text-purple-300 truncate"
              title="Sign in as Admin CTO Henderson"
            >
              Admin CTO
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/70 border border-red-800/80 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Username or Email</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={emailOrUsername}
                    onChange={e => setEmailOrUsername(e.target.value)}
                    placeholder="analyst@metroanalytics.gov or username"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter security password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide transition-colors"
              >
                {loading ? 'Authenticating...' : 'Sign In to Analytics Command'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); }}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Need new personnel credentials? Register here
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-0.5">Full Name & Rank</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Officer Jane Doe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-0.5">Username</label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value)}
                    placeholder="jdoe_officer"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-0.5">Badge ID</label>
                  <input
                    type="text"
                    required
                    value={badgeNumber}
                    onChange={e => setBadgeNumber(e.target.value)}
                    placeholder="PO-5510"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-0.5">Official Email</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="jdoe@metropolice.gov"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-0.5">Assigned Operational Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Senior Crime Analyst">Senior Crime Analyst</option>
                  <option value="Field Patrol Officer">Field Patrol Officer</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-0.5">Password</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-0.5">Confirm</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide transition-colors"
              >
                {loading ? 'Registering...' : 'Register Credentials'}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
