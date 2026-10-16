import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Shield,
  Building2,
  Key,
  Check,
  AlertCircle,
  Save,
  UserPlus,
  Users,
  Trash2,
  Edit2,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { AdminUser, AdminAccount } from '../types';
import { api } from '../api';

interface AdminProfileModalProps {
  user: AdminUser;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: (updatedUser: AdminUser) => void;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  // Current user settings
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [institution, setInstitution] = useState(user.institution || "National Children's Science Congress (NCSC)");
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState(user.securityQuestion || 'What is the primary scientific hypothesis of your project?');
  const [securityAnswer, setSecurityAnswer] = useState('');

  // Active tab
  const [activeTab, setActiveTab] = useState<'details' | 'security' | 'admins'>('details');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Multi-Admin accounts state
  const [adminList, setAdminList] = useState<AdminAccount[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [showAddAdminForm, setShowAddAdminForm] = useState(false);
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminDisplayName, setNewAdminDisplayName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('Co-Administrator');
  const [newAdminInstitution, setNewAdminInstitution] = useState(user.institution || "National Children's Science Congress (NCSC)");
  const [showNewAdminPwd, setShowNewAdminPwd] = useState(false);

  // Edit specific admin state
  const [editingAdmin, setEditingAdmin] = useState<AdminAccount | null>(null);
  const [editAdminUsername, setEditAdminUsername] = useState('');
  const [editAdminEmail, setEditAdminEmail] = useState('');
  const [editAdminDisplayName, setEditAdminDisplayName] = useState('');
  const [editAdminRole, setEditAdminRole] = useState('');
  const [editAdminNewPassword, setEditAdminNewPassword] = useState('');

  // Delete admin confirmation
  const [adminToDelete, setAdminToDelete] = useState<AdminAccount | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUsername(user.username);
      setEmail(user.email);
      setDisplayName(user.displayName);
      setInstitution(user.institution || "National Children's Science Congress (NCSC)");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSecurityAnswer('');
      setError('');
      setSuccess('');
      setShowAddAdminForm(false);
      setEditingAdmin(null);
      setAdminToDelete(null);
      loadAdmins();
    }
  }, [isOpen, user]);

  const loadAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const list = await api.getAdmins();
      setAdminList(list);
    } catch (err: any) {
      console.error('Failed to load admins:', err);
    } finally {
      setLoadingAdmins(false);
    }
  };

  if (!isOpen) return null;

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd)) score += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25;
    return score;
  };
  const strength = getPasswordStrength(newPassword);

  // Save current admin details or password change
  const handleSaveCurrentAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword) {
      if (!currentPassword) {
        setError('Please enter your current password to authorize this password change.');
        return;
      }
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New password and confirmation password do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      const payload: any = {
        username: username.trim(),
        email: email.trim(),
        displayName: displayName.trim(),
        institution: institution.trim(),
        securityQuestion,
      };

      if (currentPassword && newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      if (securityAnswer) {
        payload.securityAnswer = securityAnswer;
      }

      const res = await api.updateProfile(payload);
      setSuccess('Administrator credentials & profile updated successfully!');
      onProfileUpdated(res.user);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSecurityAnswer('');
      loadAdmins();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update administrator profile');
    } finally {
      setLoading(false);
    }
  };

  // Create new administrator account
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newAdminUsername.trim() || newAdminUsername.trim().length < 3) {
      setError('Admin username must be at least 3 characters.');
      return;
    }
    if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) {
      setError('Please provide a valid administrator email.');
      return;
    }
    if (!newAdminPassword || newAdminPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await api.createAdmin({
        username: newAdminUsername.trim(),
        email: newAdminEmail.trim(),
        password: newAdminPassword,
        displayName: newAdminDisplayName.trim() || newAdminUsername.trim(),
        role: newAdminRole,
        institution: newAdminInstitution.trim(),
      });

      setSuccess(`New administrator account "${newAdminUsername.trim()}" added successfully!`);
      setNewAdminUsername('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminDisplayName('');
      setShowAddAdminForm(false);
      await loadAdmins();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to create new administrator');
    } finally {
      setLoading(false);
    }
  };

  // Open edit for a specific admin
  const startEditAdmin = (adm: AdminAccount) => {
    setEditingAdmin(adm);
    setEditAdminUsername(adm.username);
    setEditAdminEmail(adm.email);
    setEditAdminDisplayName(adm.displayName);
    setEditAdminRole(adm.role);
    setEditAdminNewPassword('');
    setError('');
  };

  // Save changes to another admin account
  const handleSaveEditedAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setError('');
    setSuccess('');

    if (editAdminNewPassword && editAdminNewPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        username: editAdminUsername.trim(),
        email: editAdminEmail.trim(),
        displayName: editAdminDisplayName.trim(),
        role: editAdminRole,
      };
      if (editAdminNewPassword) {
        payload.newPassword = editAdminNewPassword;
      }

      await api.updateAdmin(editingAdmin.id, payload);
      setSuccess(`Administrator "${editAdminUsername.trim()}" updated successfully!`);
      setEditingAdmin(null);
      await loadAdmins();
      // If updating currently logged in user, refresh profile
      if (editingAdmin.username === user.username) {
        const refreshed = await api.getCurrentUser();
        onProfileUpdated(refreshed.user);
      }
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update administrator account');
    } finally {
      setLoading(false);
    }
  };

  // Delete admin
  const handleDeleteAdmin = async (id: string) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.deleteAdmin(id);
      setSuccess('Administrator account removed successfully.');
      setAdminToDelete(null);
      await loadAdmins();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete administrator account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Administrator Settings & Security
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-800/80 text-cyan-300 font-semibold">
                  {adminList.length} Admins Configured
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Change admin credentials, password, and add 2 or more administrator accounts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40">
          <button
            type="button"
            onClick={() => {
              setActiveTab('details');
              setError('');
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'details'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            Admin Username & Profile
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('security');
              setError('');
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'security'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            Change Password
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('admins');
              setError('');
              loadAdmins();
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'admins'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Manage Admins (2+ Accounts)
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 font-mono">
              {adminList.length}
            </span>
          </button>
        </div>

        {/* Status Messages */}
        {(error || success) && (
          <div className="px-6 pt-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{success}</span>
              </div>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: ADMIN PROFILE & USERNAME */}
          {activeTab === 'details' && (
            <form onSubmit={handleSaveCurrentAdmin} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Active Session</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Logged in as: <strong className="text-cyan-400">{user.username}</strong> ({user.role})
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/80 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Authenticated
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    Admin Username *
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 font-mono"
                    placeholder="admin username"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Used to log in to the NCSC Vault.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    Administrator Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 font-mono"
                    placeholder="ncscwastemanagementsystem@gmail.com"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">For alerts and password recovery.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  placeholder="e.g. Lead Science Researcher / Dr. S. K. Raman"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  Institution / School / Competition Level
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  placeholder="National Children's Science Congress (NCSC)"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Saving Username & Profile...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Save Username & Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CHANGE PASSWORD */}
          {activeTab === 'security' && (
            <form onSubmit={handleSaveCurrentAdmin} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs text-blue-200">
                To update your master administrator password, enter your existing password to verify ownership, followed by your new password.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Current Master Password *
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter current password (default: ncsc2026!vault)"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    New Master Password *
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Min. 6 characters"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Retype new password"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 font-mono"
                  />
                </div>
              </div>

              {newPassword && (
                <div>
                  <div className="flex justify-between items-center text-[11px] mb-1">
                    <span className="text-slate-400">Password Strength:</span>
                    <span className={`font-semibold ${strength >= 75 ? 'text-emerald-400' : strength >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {strength >= 75 ? 'Strong' : strength >= 50 ? 'Moderate' : 'Weak'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        strength >= 75 ? 'bg-emerald-500' : strength >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${strength}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Vault Security Question (For Offline Recovery)
                </label>
                <input
                  type="text"
                  value={securityQuestion}
                  onChange={(e) => setSecurityQuestion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 mb-2.5"
                />
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Security Answer (Optional)
                </label>
                <input
                  type="password"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  placeholder="Enter recovery passphrase"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 font-mono"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      Update Master Password
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: MANAGE 2+ ADMIN ACCOUNTS */}
          {activeTab === 'admins' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-cyan-400" />
                    Configured Administrators ({adminList.length})
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Add 2 or more admins with distinct usernames, passwords, and permissions.
                  </p>
                </div>
                {!showAddAdminForm && !editingAdmin && (
                  <button
                    onClick={() => {
                      setShowAddAdminForm(true);
                      setEditingAdmin(null);
                      setError('');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Add New Admin</span>
                  </button>
                )}
              </div>

              {/* INLINE ADD ADMIN FORM */}
              {showAddAdminForm && (
                <form
                  onSubmit={handleCreateAdmin}
                  className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-3 shadow-lg"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4" />
                      Create New Administrator Account
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowAddAdminForm(false)}
                      className="text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Username * (login handle)
                      </label>
                      <input
                        type="text"
                        value={newAdminUsername}
                        onChange={(e) => setNewAdminUsername(e.target.value)}
                        required
                        placeholder="e.g. mentor_raman"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Admin Email *
                      </label>
                      <input
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        required
                        placeholder="mentor@school.edu"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Password * (min. 6 chars)
                      </label>
                      <div className="relative">
                        <input
                          type={showNewAdminPwd ? 'text' : 'password'}
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                          required
                          placeholder="Secret password"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 font-mono pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewAdminPwd(!showNewAdminPwd)}
                          className="absolute right-2 top-2 text-slate-400 hover:text-white"
                        >
                          {showNewAdminPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={newAdminDisplayName}
                        onChange={(e) => setNewAdminDisplayName(e.target.value)}
                        placeholder="Dr. S. K. Raman (Mentor)"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Role
                      </label>
                      <select
                        value={newAdminRole}
                        onChange={(e) => setNewAdminRole(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                      >
                        <option value="Co-Administrator">Co-Administrator</option>
                        <option value="Science Mentor & Co-Admin">Science Mentor & Co-Admin</option>
                        <option value="Super Administrator">Super Administrator</option>
                        <option value="Lead Student Researcher">Lead Student Researcher</option>
                        <option value="Science Evaluator">Science Evaluator</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Institution
                      </label>
                      <input
                        type="text"
                        value={newAdminInstitution}
                        onChange={(e) => setNewAdminInstitution(e.target.value)}
                        placeholder="NCSC School Unit"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowAddAdminForm(false)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      {loading ? 'Creating...' : '+ Create Admin Account'}
                    </button>
                  </div>
                </form>
              )}

              {/* INLINE EDIT ADMIN FORM */}
              {editingAdmin && (
                <form
                  onSubmit={handleSaveEditedAdmin}
                  className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3 shadow-lg"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Edit2 className="w-4 h-4" />
                      Edit Admin Credentials: {editingAdmin.username}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setEditingAdmin(null)}
                      className="text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Username (Login Handle)
                      </label>
                      <input
                        type="text"
                        value={editAdminUsername}
                        onChange={(e) => setEditAdminUsername(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={editAdminEmail}
                        onChange={(e) => setEditAdminEmail(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={editAdminDisplayName}
                        onChange={(e) => setEditAdminDisplayName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Role
                      </label>
                      <input
                        type="text"
                        value={editAdminRole}
                        onChange={(e) => setEditAdminRole(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Reset Password (leave blank to keep unchanged)
                    </label>
                    <input
                      type="password"
                      value={editAdminNewPassword}
                      onChange={(e) => setEditAdminNewPassword(e.target.value)}
                      placeholder="Enter new password (min. 6 characters)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingAdmin(null)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      {loading ? 'Saving...' : 'Save Admin Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* DELETE CONFIRMATION BANNER */}
              {adminToDelete && (
                <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    Are you sure you want to delete administrator "{adminToDelete.username}"?
                  </div>
                  <p className="text-[11px] text-red-200/80">
                    This user will permanently lose administrative access to the NCSC Vault.
                  </p>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setAdminToDelete(null)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteAdmin(adminToDelete.id)}
                      disabled={loading}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white cursor-pointer"
                    >
                      {loading ? 'Deleting...' : 'Confirm Delete Admin'}
                    </button>
                  </div>
                </div>
              )}

              {/* LIST OF ADMINISTRATORS */}
              <div className="space-y-2">
                {loadingAdmins ? (
                  <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    Loading administrators...
                  </div>
                ) : adminList.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/50 rounded-xl border border-slate-800">
                    No administrators found.
                  </div>
                ) : (
                  adminList.map((adm) => {
                    const isSelf = adm.username.toLowerCase() === user.username.toLowerCase();
                    return (
                      <div
                        key={adm.id}
                        className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-white font-mono">
                                {adm.username}
                              </span>
                              <span className="text-xs text-slate-400">
                                ({adm.displayName})
                              </span>
                              {isSelf && (
                                <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                                  Current User
                                </span>
                              )}
                              <span className="px-2 py-0.2 rounded text-[10px] font-medium bg-slate-800 text-cyan-300">
                                {adm.role}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-3">
                              <span>Email: <strong className="text-slate-300 font-mono">{adm.email}</strong></span>
                              <span>•</span>
                              <span>
                                Last Login: {adm.lastLogin ? new Date(adm.lastLogin).toLocaleDateString() : 'Never'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          <button
                            onClick={() => startEditAdmin(adm)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                            title="Edit username, role, or reset password"
                          >
                            <Edit2 className="w-3 h-3 text-amber-400" />
                            <span>Edit / Reset Pwd</span>
                          </button>
                          {adminList.length > 1 && (
                            <button
                              onClick={() => setAdminToDelete(adm)}
                              disabled={isSelf}
                              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                isSelf
                                  ? 'opacity-30 cursor-not-allowed text-slate-600'
                                  : 'text-slate-400 hover:text-red-400 hover:bg-red-950/40 bg-slate-800/60'
                              }`}
                              title={isSelf ? 'Cannot delete your active account' : 'Delete administrator'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
