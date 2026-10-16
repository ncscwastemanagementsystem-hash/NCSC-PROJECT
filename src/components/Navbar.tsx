import React, { useState } from 'react';
import {
  ShieldCheck,
  FolderKanban,
  UploadCloud,
  Sparkles,
  Award,
  Download,
  Lock,
  ChevronDown,
  User,
  Plus,
  Search,
  Check,
  Settings,
  HardDrive,
  Users,
  Edit2,
  Trash2,
  FolderPlus
} from 'lucide-react';
import { AdminUser, Project } from '../types';

interface NavbarProps {
  user: AdminUser;
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (project: Project) => void;
  onNewProject: () => void;
  onEditProject?: (project: Project) => void;
  onDeleteProject?: (projectId: string) => void;
  onOpenUpload: () => void;
  onOpenProfile: () => void;
  onOpenKiosk: () => void;
  onExportBackup: () => void;
  onLockVault: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  projects,
  activeProject,
  onSelectProject,
  onNewProject,
  onEditProject,
  onDeleteProject,
  onOpenUpload,
  onOpenProfile,
  onOpenKiosk,
  onExportBackup,
  onLockVault,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
}) => {
  const [projectDropdown, setProjectDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Tier: Brand, Project Switcher, Quick Actions, Admin */}
        <div className="h-16 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-emerald-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10 ring-2 ring-cyan-500/10 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm sm:text-base tracking-tight">
                  NCSC Project Vault
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 border border-cyan-800/80 text-cyan-300 font-mono">
                  v2.4 SECURE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                National Children's Science Congress Repository
              </p>
            </div>
          </div>

          {/* Project Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProjectDropdown(!projectDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer"
            >
              <FolderKanban className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="hidden md:block max-w-[210px] truncate">
                <div className="text-xs font-bold text-white truncate">
                  {activeProject ? activeProject.shortTitle || activeProject.name : 'Select Project'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  {activeProject?.code || 'NCSC Science Project'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {projectDropdown && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setProjectDropdown(false)}
                />
                <div className="absolute left-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-30 text-xs">
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Science Projects ({projects.length})</span>
                    <button
                      onClick={() => {
                        setProjectDropdown(false);
                        onNewProject();
                      }}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold lowercase cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>add new</span>
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-0.5">
                    {projects.map((proj) => {
                      const isSelected = activeProject?.id === proj.id;
                      return (
                        <div
                          key={proj.id}
                          className={`w-full px-3 py-2 flex items-center justify-between gap-2 transition-colors ${
                            isSelected ? 'bg-cyan-950/40 border-l-2 border-cyan-400' : 'hover:bg-slate-800/80'
                          }`}
                        >
                          <button
                            onClick={() => {
                              onSelectProject(proj);
                              setProjectDropdown(false);
                            }}
                            className="flex-1 text-left overflow-hidden cursor-pointer"
                          >
                            <div className="font-bold text-white truncate">{proj.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                              <span>{proj.code}</span>
                              <span>•</span>
                              <span className="text-cyan-400">{proj.status}</span>
                            </div>
                          </button>

                          <div className="flex items-center gap-1 shrink-0">
                            {onEditProject && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProjectDropdown(false);
                                  onEditProject(proj);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800 cursor-pointer"
                                title="Edit project details"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            )}
                            {projects.length > 1 && onDeleteProject && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProjectDropdown(false);
                                  onDeleteProject(proj.id);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-950/40 cursor-pointer"
                                title="Delete project"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-800 my-1.5" />
                  <button
                    onClick={() => {
                      setProjectDropdown(false);
                      onNewProject();
                    }}
                    className="w-full px-3 py-2 text-left text-cyan-400 hover:bg-slate-800 flex items-center gap-2 font-semibold cursor-pointer"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>+ Register New Science Project</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Search Input */}
          <div className="hidden lg:flex items-center relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3" />
            <input
              type="text"
              placeholder="Search files, code, datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>

          {/* Action Buttons & Admin Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Direct Admin Settings Button */}
            <button
              onClick={onOpenProfile}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Admin Credentials & Multi-Admin Settings"
            >
              <Settings className="w-3.5 h-3.5 text-cyan-400" />
              <span>Settings</span>
            </button>

            <button
              onClick={onOpenUpload}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/15 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span className="hidden sm:inline">Upload Files</span>
            </button>

            <button
              onClick={onOpenKiosk}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Exhibition Defense Presentation"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Kiosk Mode</span>
            </button>

            {/* Admin Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                  {user.displayName.charAt(0)}
                </div>
                <div className="hidden xl:block text-left text-xs leading-none mr-1">
                  <div className="font-bold text-white truncate max-w-[100px]">
                    {user.displayName}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono mt-0.5">@{user.username}</div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setUserDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-30 text-xs">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <div className="font-bold text-white truncate">{user.displayName}</div>
                      <div className="text-[10px] text-cyan-400 font-mono truncate">
                        Username: @{user.username}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                        {user.email}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdown(false);
                        onOpenProfile();
                      }}
                      className="w-full px-3 py-2 text-left text-slate-300 hover:bg-slate-800 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Settings className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Change Username & Password</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdown(false);
                        onOpenProfile();
                      }}
                      className="w-full px-3 py-2 text-left text-slate-300 hover:bg-slate-800 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Manage 2+ Admin Accounts</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdown(false);
                        onExportBackup();
                      }}
                      className="w-full px-3 py-2 text-left text-slate-300 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Export Vault Backup (JSON)</span>
                    </button>

                    <div className="border-t border-slate-800 my-1" />
                    <button
                      onClick={() => {
                        setUserDropdown(false);
                        onLockVault();
                      }}
                      className="w-full px-3 py-2 text-left text-red-400 hover:bg-red-950/40 flex items-center gap-2 font-semibold cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Lock Project Vault</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Tier: Nav Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 border-t border-slate-850 no-scrollbar">
          <button
            onClick={() => setActiveTab('files')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'files'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Vault Files & Drive</span>
          </button>

          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'simulation'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive 3D Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('experiments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'experiments'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Research & Experiment Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('bom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'bom'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Hardware BOM & Schematics</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit & Access Trail</span>
          </button>
        </div>
      </div>
    </header>
  );
};
