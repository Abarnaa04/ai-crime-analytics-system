import React from 'react';
import { UserAccount } from '../types';
import { 
  LayoutDashboard, 
  Sparkles, 
  MapPin, 
  TrendingUp, 
  Database, 
  History, 
  CheckCircle2, 
  SlidersHorizontal, 
  FileDown, 
  UserCheck, 
  ShieldCheck, 
  HelpCircle, 
  Home,
  X,
  Presentation
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  currentUser: UserAccount | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeView,
  setActiveView,
  currentUser,
}) => {
  const navItems = [
    { id: 'landing', label: 'Public Portal', icon: Home, category: 'General' },
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard, category: 'Core Operations' },
    { id: 'prediction', label: 'AI Crime Prediction', icon: Sparkles, category: 'Core Operations' },
    { id: 'hotspots', label: 'Crime Hotspots & GIS', icon: MapPin, category: 'Core Operations' },
    { id: 'analytics', label: 'Trends & Analytics', icon: TrendingUp, category: 'Intelligence' },
    { id: 'incidents', label: 'Incident Explorer', icon: Database, category: 'Intelligence' },
    { id: 'history', label: 'Prediction Logs', icon: History, category: 'Intelligence' },
    { id: 'evaluation', label: 'Model Evaluation & CM', icon: CheckCircle2, category: 'AI Architecture' },
    { id: 'dataquality', label: 'Data Quality Summary', icon: SlidersHorizontal, category: 'AI Architecture' },
    { id: 'reports', label: 'Dossier & CSV Reports', icon: FileDown, category: 'Reporting' },
    { id: 'profile', label: 'User Profile & Role', icon: UserCheck, category: 'Account' },
    ...(currentUser?.role === 'System Administrator' ? [
      { id: 'admin', label: 'Admin Console', icon: ShieldCheck, category: 'Account' }
    ] : []),
    { id: 'about', label: 'Project Review & Help', icon: HelpCircle, category: 'College Review' },
  ];

  const handleSelect = (id: string) => {
    setActiveView(id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="no-print fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className="relative w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col h-full shadow-2xl z-10">
        {/* Header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              AI
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">System Navigation</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {['Core Operations', 'Intelligence', 'AI Architecture', 'Reporting', 'Account', 'College Review'].map(cat => {
            const items = navItems.filter(i => i.category === cat);
            if (items.length === 0) return null;

            return (
              <div key={cat} className="space-y-1">
                <span className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase block mb-1">
                  {cat}
                </span>
                {items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Quick Review Helper Button */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50">
          <button
            onClick={() => handleSelect('about')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-blue-300 bg-blue-950/60 border border-blue-800/60 rounded-lg hover:bg-blue-900/60 transition-colors"
          >
            <Presentation className="w-3.5 h-3.5" />
            Review Demo Walkthrough
          </button>
        </div>
      </aside>
    </div>
  );
};
