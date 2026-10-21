import React, { useState } from 'react';
import { UserAccount } from '../types';
import { authStore } from '../utils/authStore';
import { 
  ShieldCheck, 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  BadgeCheck, 
  Building, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  KeyRound, 
  HelpCircle,
  Check,
  Send
} from 'lucide-react';

interface AuthViewProps {
  initialMode?: 'login' | 'register' | 'forgot';
  onSuccess: (user: UserAccount) => void;
  onBackToLanding: () => void;
  onBackToDashboard: () => void;
  currentUser: UserAccount | null;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'login',
  onSuccess,
  onBackToLanding,
  onBackToDashboard,
  currentUser,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  // Form states
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration states
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [department, setDepartment] = useState('Municipal Crime Analytics Division');
  const [role, setRole] = useState<'Senior Crime Analyst' | 'Field Patrol Officer'>('Senior Crime Analyst');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Status & validation states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Password requirements calculation
  const hasMinLength = regPassword.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(regPassword);
  const hasNumber = /[0-9]/.test(regPassword);
  const passwordsMatch = regPassword.length > 0 && regPassword === confirmPassword;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!emailOrUsername.trim()) {
      setError('Please provide your registered username or official email.');
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
      setSuccessMessage('Authentication verified. Access granted.');
      setTimeout(() => {
        onSuccess(res.user!);
      }, 500);
    } else {
      setError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!fullName.trim() || !regEmail.trim() || !regUsername.trim()) {
      setError('Please complete all identification fields.');
      return;
    }

    if (!regEmail.includes('@') || !regEmail.includes('.')) {
      setError('Please provide a valid department email address.');
      return;
    }

    if (!hasMinLength) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (regPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify confirmation.');
      return;
    }

    setLoading(true);
    const res = await authStore.register({
      fullName,
      email: regEmail,
      username: regUsername,
      badgeNumber: badgeNumber.trim() || 'AN-PENDING',
      department: department.trim() || 'Municipal Crime Analysis Division',
      role,
      password: regPassword,
    });
    setLoading(false);

    if (res.success && res.user) {
      setSuccessMessage('Account registered and security credentials verified.');
      setTimeout(() => {
        onSuccess(res.user!);
      }, 600);
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setError('Please enter a valid registered email address.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setForgotSent(true);
    }, 600);
  };

  const handleQuickDemoLogin = async (email: string) => {
    setError('');
    setLoading(true);
    const res = await authStore.login(email, 'password123');
    setLoading(false);
    if (res.success && res.user) {
      onSuccess(res.user);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Side: Illustration, Branding & Security Credentials */}
        <div className="lg:col-span-5 relative overflow-hidden bg-slate-950 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 text-white">
          <div className="absolute inset-0 -z-10 opacity-30">
            <img
              src="/src/assets/images/crime_analytics_hero_1792560919439.jpg"
              alt="Crime Analytics Command Interface"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
          </div>

          {/* Top Branding */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Public Portal</span>
            </button>

            <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-white leading-tight">
                  AI Crime Analytics System
                </h1>
                <span className="text-[11px] text-blue-400 font-medium">
                  Public Safety Intelligence Platform
                </span>
              </div>
            </div>
          </div>

          {/* Middle Value Props */}
          <div className="py-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-100 leading-snug">
              Secure Law Enforcement Analytics & Hotspot Prediction
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Access verified municipal crime incident records, run Bayesian probability models, and evaluate spatial GIS hotspots.
            </p>

            <div className="space-y-2.5 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Encrypted PBKDF2 / SHA-256 password security</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Strict role-based access control (Analyst, Officer, Admin)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Zero third-party location tracking or data selling</span>
              </div>
            </div>
          </div>

          {/* Bottom Fast Demo Login Bar */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              College Review Quick Login (1-Click Evaluation):
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('analyst@metroanalytics.gov')}
                className="py-1.5 px-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-blue-300 transition-colors truncate"
                title="Sign in as Senior Analyst Sarah Chen"
              >
                Analyst
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('officer@metropolice.gov')}
                className="py-1.5 px-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-emerald-300 transition-colors truncate"
                title="Sign in as Patrol Officer Marcus"
              >
                Officer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin@metroanalytics.gov')}
                className="py-1.5 px-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-purple-300 transition-colors truncate"
                title="Sign in as Administrator CTO Henderson"
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Form Interfaces */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          {/* Top Form Navigation Switcher */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  mode === 'login'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); setSuccessMessage(''); }}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  mode === 'register'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {currentUser && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                <span>To Dashboard</span>
                <span>→</span>
              </button>
            )}
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-800/80 text-xs text-red-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800/80 text-xs text-emerald-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">Welcome Back</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your assigned credentials to access departmental crime intelligence.
                </p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Username or Official Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={emailOrUsername}
                      onChange={e => setEmailOrUsername(e.target.value)}
                      placeholder="e.g., analyst@metroanalytics.gov"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">
                      Security Password
                    </label>
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError(''); }}
                      className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-white transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide transition-colors shadow-lg shadow-blue-950 disabled:opacity-50"
                >
                  {loading ? 'Authenticating Personnel...' : 'Sign In to Command Portal'}
                </button>
              </div>

              <div className="text-center pt-2 text-xs text-slate-400">
                New personnel without credentials?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); }}
                  className="text-blue-400 font-semibold hover:text-blue-300"
                >
                  Create Account
                </button>
              </div>
            </form>
          )}

          {/* 2. REGISTRATION FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <h3 className="text-xl font-bold text-white">Personnel Registration</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Register new operational credentials for academic and departmental analysis.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Full Name & Title
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Officer Alex Vance"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Badge / Serial Number
                  </label>
                  <input
                    type="text"
                    required
                    value={badgeNumber}
                    onChange={e => setBadgeNumber(e.target.value)}
                    placeholder="e.g. PO-5520"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value)}
                    placeholder="alex_vance"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Departmental Email
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="avance@metropolice.gov"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Operational Role Assignment
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Senior Crime Analyst">Senior Crime Analyst</option>
                  <option value="Field Patrol Officer">Field Patrol Officer</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(p => !p)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Requirement Checklist */}
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 grid grid-cols-3 gap-2 text-[10px]">
                <div className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <span>{hasMinLength ? '✓' : '○'}</span>
                  <span>6+ characters</span>
                </div>
                <div className={`flex items-center gap-1 ${hasLetter && hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <span>{hasLetter && hasNumber ? '✓' : '○'}</span>
                  <span>Letters & numbers</span>
                </div>
                <div className={`flex items-center gap-1 ${passwordsMatch ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <span>{passwordsMatch ? '✓' : '○'}</span>
                  <span>Passwords match</span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide transition-colors shadow-lg shadow-blue-950 disabled:opacity-50"
                >
                  {loading ? 'Registering Account...' : 'Create Verified Account'}
                </button>
              </div>

              <div className="text-center text-xs text-slate-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className="text-blue-400 font-semibold hover:text-blue-300"
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">Reset Security Access</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your registered departmental email to receive secure recovery instructions.
                </p>
              </div>

              {forgotSent ? (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Recovery Request Dispatched</h4>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                    Verification instructions have been generated for <strong className="text-blue-300 font-mono">{forgotEmail}</strong>. 
                    During local evaluation, you can also log in immediately using the 1-click test accounts.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setForgotSent(false); }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        placeholder="analyst@metroanalytics.gov"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide transition-colors shadow-lg shadow-blue-950 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Password Recovery Link</span>
                  </button>

                  <div className="text-center text-xs text-slate-400 pt-2">
                    Remembered password?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setError(''); }}
                      className="text-blue-400 font-semibold hover:text-blue-300"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Footer Notice */}
          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>AI Crime Analytics System v2.6 · College Project Edition</span>
            <button
              type="button"
              onClick={onBackToLanding}
              className="hover:text-slate-300 transition-colors"
            >
              Public Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
