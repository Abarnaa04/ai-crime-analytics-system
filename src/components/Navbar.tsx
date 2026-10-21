import React from 'react';
import { UserAccount } from '../types';
import { BitmojiAvatar } from './BitmojiAvatar';
import { 
  ShieldAlert, 
  User, 
  LogOut, 
  LogIn, 
  Menu, 
  FileText,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentUser: UserAccount | null;
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  toggleSidebar: () => void;
  onPrintReport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeView,
  setActiveView,
  onOpenAuth,
  onLogout,
  toggleSidebar,
  onPrintReport,
}) => {
  return (
    <header className="no-print sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark & Sidebar Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setActiveView('landing')}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-100 whitespace-nowrap block">
                AI Crime Analytics System
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Primary Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeView === 'dashboard' ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveView('prediction')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white flex items-center gap-1.5 ${
              activeView === 'prediction' ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Crime Prediction
          </button>
          <button
            onClick={() => setActiveView('hotspots')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeView === 'hotspots' ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            Hotspots & Map
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeView === 'analytics' ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            Analytics & Trends
          </button>
          <button
            onClick={() => setActiveView('reports')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeView === 'reports' ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            Executive Reports
          </button>
          <button
            onClick={() => setActiveView('about')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeView === 'about' ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            Help & Docs
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action / User Account */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onPrintReport}
            title="Generate Instant Dossier Print / PDF"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Quick PDF
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView('profile')}
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition-colors whitespace-nowrap shrink-0"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-950 border border-blue-500/50 flex items-center justify-center shrink-0">
                  <BitmojiAvatar config={currentUser.avatar} size={22} />
                </div>
                <span className="hidden md:inline font-mono text-[11px] text-slate-400">{currentUser.badgeNumber}</span>
                <span className="truncate max-w-[120px]">{currentUser.fullName.split(' ')[0]}</span>
              </button>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-900 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
