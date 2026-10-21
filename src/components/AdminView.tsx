import React, { useState } from 'react';
import { UserAccount } from '../types';
import { authStore } from '../utils/authStore';
import { 
  ShieldCheck, 
  Users, 
  Server, 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  Lock,
  UserX,
  UserCheck2
} from 'lucide-react';

import { PageHeader } from './PageHeader';

interface AdminViewProps {
  currentUser: UserAccount;
  onBack?: () => void;
  onNavigate?: (view: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ 
  currentUser,
  onBack = () => {},
  onNavigate,
}) => {
  const [users, setUsers] = useState<UserAccount[]>(() => authStore.getAllUsers());
  const [message, setMessage] = useState('');

  const refreshUsers = () => {
    setUsers(authStore.getAllUsers());
  };

  const handleToggleStatus = (userId: string) => {
    if (userId === currentUser.id) {
      alert('You cannot suspend your own active administrator account.');
      return;
    }
    authStore.toggleUserStatus(userId);
    refreshUsers();
    setMessage('User access state updated.');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleChangeRole = (userId: string, newRole: UserAccount['role']) => {
    authStore.changeUserRole(userId, newRole);
    refreshUsers();
    setMessage('User authorization level updated.');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Universal Page Header with Visible Back Button */}
      <PageHeader
        title="System Administration & User Management Console"
        subtitle="Access control, security auditing, and municipal model execution monitoring."
        onBack={onBack}
        breadcrumbs={[
          { label: 'Dashboard', view: 'dashboard' },
          { label: 'Admin Console' }
        ]}
        onNavigate={onNavigate}
        badge={
          <span className="text-[11px] font-semibold text-purple-300 bg-purple-950/80 border border-purple-800/80 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Root Admin Access</span>
          </span>
        }
      />

      {message && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* System Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Registered Personnel</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">{users.length}</div>
          <span className="text-[11px] text-emerald-400 block pt-1">All accounts cryptographically salted</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Model Inference Status</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">Active (v2.4)</div>
          <span className="text-[11px] text-slate-400 block pt-1">Empirical Bayesian / Decision Forest</span>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Primary Storage</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">SQLite crime.db</div>
          <span className="text-[11px] text-emerald-400 block pt-1">Zero corrupted records</span>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <h2 className="text-sm font-semibold text-white">Authorized Law Enforcement Personnel</h2>
            <p className="text-[11px] text-slate-400">Manage operational roles, credentials, and access privilege states</p>
          </div>
          <span className="text-xs font-mono text-slate-400">{users.length} Accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-2.5 font-medium">Officer / Analyst</th>
                <th className="pb-2.5 font-medium">Badge ID</th>
                <th className="pb-2.5 font-medium">Assigned Role</th>
                <th className="pb-2.5 font-medium">Department</th>
                <th className="pb-2.5 font-medium text-center">Status</th>
                <th className="pb-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-sans font-medium text-slate-200">
                    <div>{u.fullName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                  </td>
                  <td className="py-3 text-blue-400 font-bold">{u.badgeNumber}</td>
                  <td className="py-3 font-sans">
                    <select
                      value={u.role}
                      onChange={e => handleChangeRole(u.id, e.target.value as any)}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Senior Crime Analyst">Senior Crime Analyst</option>
                      <option value="Field Patrol Officer">Field Patrol Officer</option>
                      <option value="System Administrator">System Administrator</option>
                    </select>
                  </td>
                  <td className="py-3 font-sans text-slate-400 text-[11px]">{u.department}</td>
                  <td className="py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-sans font-semibold ${
                      u.status === 'Active' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50' : 'bg-red-950 text-red-300 border border-red-800/50'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 text-right font-sans">
                    {u.id !== currentUser.id ? (
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`text-xs px-2.5 py-1 rounded transition-colors ${
                          u.status === 'Active'
                            ? 'text-red-400 hover:bg-red-950/40 border border-red-900/40'
                            : 'text-emerald-400 hover:bg-emerald-950/40 border border-emerald-900/40'
                        }`}
                      >
                        {u.status === 'Active' ? 'Suspend' : 'Reactivate'}
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">Current Session</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
