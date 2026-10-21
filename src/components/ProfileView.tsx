import React, { useState } from 'react';
import { UserAccount, AvatarConfig } from '../types';
import { authStore } from '../utils/authStore';
import { BitmojiAvatar, DEFAULT_AVATAR } from './BitmojiAvatar';
import { AvatarCustomizerModal } from './AvatarCustomizerModal';
import { 
  UserCheck, 
  Shield, 
  BadgeCheck, 
  Mail, 
  Building, 
  Calendar, 
  Clock, 
  Check, 
  Save,
  Sparkles,
  MapPin
} from 'lucide-react';

import { PageHeader } from './PageHeader';

interface ProfileViewProps {
  currentUser: UserAccount;
  onUserUpdated: (user: UserAccount) => void;
  onNavigateToMap?: () => void;
  onBack?: () => void;
  onNavigate?: (view: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  currentUser, 
  onUserUpdated,
  onNavigateToMap,
  onBack = () => {},
  onNavigate,
}) => {
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [department, setDepartment] = useState(currentUser.department);
  const [badgeNumber, setBadgeNumber] = useState(currentUser.badgeNumber);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [message, setMessage] = useState('');

  const currentAvatar = currentUser.avatar || DEFAULT_AVATAR;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const res = authStore.updateProfile(currentUser.id, {
      fullName: fullName.trim(),
      department: department.trim(),
      badgeNumber: badgeNumber.trim(),
    });

    if (res.success && res.user) {
      onUserUpdated(res.user);
      setMessage('Profile updated successfully.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleAvatarSaved = (newAvatar: AvatarConfig) => {
    const updatedUser = authStore.updateAvatar(currentUser.id, newAvatar);
    if (updatedUser) {
      onUserUpdated(updatedUser);
      setMessage('Avatar customized and applied to map!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleRoleQuickSwitch = (newRole: UserAccount['role']) => {
    const res = authStore.changeUserRole(currentUser.id, newRole);
    if (res.success) {
      const updated = { ...currentUser, role: newRole };
      onUserUpdated(updated);
      setMessage(`Role changed to ${newRole} for evaluation testing.`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Universal Page Header with Visible Back Button */}
      <PageHeader
        title="Law Enforcement Personnel Profile & Map Identity"
        subtitle="Authorized credentials, divisional assignment, and custom Bitmoji map presence."
        onBack={onBack}
        breadcrumbs={[
          { label: 'Dashboard', view: 'dashboard' },
          { label: 'User Profile' }
        ]}
        onNavigate={onNavigate}
        badge={
          <span className="text-[11px] font-semibold text-blue-300 bg-blue-950/80 border border-blue-800/80 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>{currentUser.role}</span>
          </span>
        }
      />

      {message && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Profile Overview Card with Avatar Stage */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          {/* Avatar & User Details */}
          <div className="flex items-center gap-5">
            <div className="relative group cursor-pointer" onClick={() => setAvatarModalOpen(true)}>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-blue-950/80 to-slate-950 border-2 border-blue-500/60 flex items-center justify-center overflow-hidden shadow-xl shadow-blue-950">
                <BitmojiAvatar config={currentAvatar} size={70} />
              </div>
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-blue-600 text-white shadow-md border border-slate-900">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">{currentUser.fullName}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-mono text-blue-400 font-bold">{currentUser.badgeNumber}</span>
                <span>·</span>
                <span>{currentUser.department}</span>
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                <span>Snap Map Avatar Active: {currentAvatar.hairStyle} hair, {currentAvatar.outfit}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded bg-blue-950 border border-blue-800 text-blue-300 self-start sm:self-auto">
              {currentUser.role}
            </span>
            <button
              type="button"
              onClick={() => setAvatarModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/50 hover:bg-blue-600/30 text-xs font-semibold text-blue-300 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Customize My Avatar
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <h3 className="text-sm font-semibold text-white">Personnel Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Full Name & Title</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Badge / Serial Identification</label>
              <input
                type="text"
                value={badgeNumber}
                onChange={e => setBadgeNumber(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Official Email (Locked)</label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="w-full bg-slate-950/50 border border-slate-800/60 rounded-lg px-3 py-2 text-xs text-slate-500 cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Department / Division Assignment</label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-blue-950"
            >
              <Save className="w-3.5 h-3.5" />
              Save Profile Changes
            </button>
          </div>
        </form>

        {/* Quick Role Switcher for College Review */}
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Role Testing Switcher (For College Evaluation)
          </span>
          <p className="text-xs text-slate-400">
            Quickly switch between authorization roles to verify access control and permissions:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleRoleQuickSwitch('Senior Crime Analyst')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                currentUser.role === 'Senior Crime Analyst'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Senior Crime Analyst
            </button>
            <button
              type="button"
              onClick={() => handleRoleQuickSwitch('Field Patrol Officer')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                currentUser.role === 'Field Patrol Officer'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Field Patrol Officer
            </button>
            <button
              type="button"
              onClick={() => handleRoleQuickSwitch('System Administrator')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                currentUser.role === 'System Administrator'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              System Administrator (Unlocks Admin Console)
            </button>
          </div>
        </div>
      </div>

      {/* Avatar Customizer Modal */}
      <AvatarCustomizerModal
        isOpen={avatarModalOpen}
        initialConfig={currentAvatar}
        onClose={() => setAvatarModalOpen(false)}
        onSave={handleAvatarSaved}
      />
    </div>
  );
};
