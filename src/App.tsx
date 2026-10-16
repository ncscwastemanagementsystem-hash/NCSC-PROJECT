import React, { useState, useEffect } from 'react';
import { api } from './api';
import {
  AdminUser,
  Project,
  VaultFile,
  DriveFolder,
  ExperimentTrial,
  BOMItem,
  AuditLog,
  VaultStats
} from './types';
import { AuthGate } from './components/AuthGate';
import { Navbar } from './components/Navbar';
import { FileExplorerTab } from './components/FileExplorerTab';
import { SimulationViewerTab } from './components/SimulationViewerTab';
import { ExperimentLogsTab } from './components/ExperimentLogsTab';
import { HardwareBOMTab } from './components/HardwareBOMTab';
import { AuditTrailTab } from './components/AuditTrailTab';
import { FilePreviewModal } from './components/FilePreviewModal';
import { FileUploadModal } from './components/FileUploadModal';
import { ProjectModal } from './components/ProjectModal';
import { AdminProfileModal } from './components/AdminProfileModal';
import { EditFileModal } from './components/EditFileModal';
import { FolderModal } from './components/FolderModal';
import { MoveFileModal } from './components/MoveFileModal';
import { ExhibitionKioskMode } from './components/ExhibitionKioskMode';
import {
  FolderKanban,
  Sparkles,
  FlaskConical,
  Wrench,
  ShieldCheck,
  HardDrive,
  TrendingUp,
  Download,
  Folder,
  AlertTriangle,
  X
} from 'lucide-react';

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  isDestructive?: boolean;
  onConfirm: () => void | Promise<void>;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Core Data
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [experiments, setExperiments] = useState<ExperimentTrial[]>([]);
  const [bom, setBOM] = useState<BOMItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<VaultStats | null>(null);

  // Navigation & Search
  const [activeTab, setActiveTab] = useState<string>('files');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [previewFile, setPreviewFile] = useState<VaultFile | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTargetFolderId, setUploadTargetFolderId] = useState<string | undefined>(undefined);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [fileToEdit, setFileToEdit] = useState<VaultFile | null>(null);
  const [fileToMove, setFileToMove] = useState<VaultFile | null>(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<DriveFolder | null>(null);
  const [showKioskMode, setShowKioskMode] = useState(false);

  // In-app Confirmation Modal (no window.confirm in iframe)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Initialize and check session
  useEffect(() => {
    const savedToken = localStorage.getItem('ncsc_vault_token');
    if (savedToken) {
      api.getCurrentUser()
        .then((data) => {
          setCurrentUser(data.user);
          setAuthToken(savedToken);
          loadAllVaultData();
        })
        .catch(() => {
          localStorage.removeItem('ncsc_vault_token');
          setLoadingInitial(false);
        });
    } else {
      setLoadingInitial(false);
    }
  }, []);

  const loadAllVaultData = async () => {
    try {
      const [pList, fldList, fList, eList, bList, aList, sData] = await Promise.all([
        api.getProjects(),
        api.getFolders(),
        api.getFiles(),
        api.getExperiments(),
        api.getBOM(),
        api.getAuditLogs(),
        api.getStats(),
      ]);

      setProjects(pList);
      if (pList.length > 0) {
        const flagship = pList.find((p) => p.id === 'proj-smart-waste-ncsc') || pList[0];
        setActiveProject(flagship);
      }
      setFolders(fldList);
      setFiles(fList);
      setExperiments(eList);
      setBOM(bList);
      setAuditLogs(aList);
      setStats(sData);
    } catch (err) {
      console.error('Error loading vault data:', err);
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleLoginSuccess = (user: AdminUser, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem('ncsc_vault_token', token);
    loadAllVaultData();
  };

  const handleLockVault = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('ncsc_vault_token');
  };

  const refreshFilesAndFolders = async () => {
    try {
      const [updatedFiles, updatedFolders, updatedStats] = await Promise.all([
        api.getFiles(),
        api.getFolders(),
        api.getStats(),
      ]);
      setFiles(updatedFiles);
      setFolders(updatedFolders);
      setStats(updatedStats);
    } catch (err) {
      console.error(err);
    }
  };

  // Safe delete project handler
  const requestDeleteProject = (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    const projName = proj ? proj.name : 'this project';

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Science Project?',
      message: `Are you sure you want to remove "${projName}"? All its stored drive files, custom folders, and simulation links will be permanently deleted from the vault.`,
      confirmText: 'Yes, Delete Project',
      isDestructive: true,
      onConfirm: async () => {
        await api.deleteProject(projectId);
        const updated = await api.getProjects();
        setProjects(updated);
        if (activeProject?.id === projectId) {
          if (updated.length > 0) {
            setActiveProject(updated[0]);
          } else {
            setActiveProject(null);
          }
        }
        await refreshFilesAndFolders();
      },
    });
  };

  // Safe delete folder handler
  const requestDeleteFolder = (folderId: string) => {
    const fld = folders.find((f) => f.id === folderId);
    const fldName = fld ? fld.name : 'this folder';

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Folder?',
      message: `Delete folder "${fldName}"? Stored files will not be lost — they will be moved safely to Research Papers & Reports.`,
      confirmText: 'Delete Folder',
      isDestructive: true,
      onConfirm: async () => {
        await api.deleteFolder(folderId);
        await refreshFilesAndFolders();
      },
    });
  };

  // Safe delete file handler
  const requestDeleteFile = (file: VaultFile) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Vault File?',
      message: `Are you sure you want to permanently delete "${file.name}" from NCSC storage?`,
      confirmText: 'Delete File',
      isDestructive: true,
      onConfirm: async () => {
        await api.deleteFile(file.id);
        await refreshFilesAndFolders();
      },
    });
  };

  const executeConfirmAction = async () => {
    if (!confirmDialog) return;
    setConfirming(true);
    try {
      await confirmDialog.onConfirm();
      setConfirmDialog(null);
    } catch (err: any) {
      console.error('Confirmation action error:', err);
    } finally {
      setConfirming(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-cyan-400">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono tracking-widest uppercase">
          Initializing NCSC Science Vault...
        </span>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthGate onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Navigation Header */}
      <Navbar
        user={currentUser}
        projects={projects}
        activeProject={activeProject}
        onSelectProject={(proj) => {
          setActiveProject(proj);
          refreshFilesAndFolders();
        }}
        onNewProject={() => {
          setProjectToEdit(null);
          setShowProjectModal(true);
        }}
        onEditProject={(proj) => {
          setProjectToEdit(proj);
          setShowProjectModal(true);
        }}
        onDeleteProject={requestDeleteProject}
        onOpenUpload={() => {
          setUploadTargetFolderId(undefined);
          setShowUploadModal(true);
        }}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenKiosk={() => setShowKioskMode(true)}
        onExportBackup={() => api.exportVaultBackup()}
        onLockVault={handleLockVault}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Quick System Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60">
          <div className="flex items-center gap-2.5 px-3 py-1.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Files</div>
              <div className="text-sm font-black text-white font-mono">{files.length} Saved</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Vault Storage</div>
              <div className="text-sm font-black text-emerald-400 font-mono">
                {formatSize(stats?.totalStorageBytes || 0)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Drive Folders</div>
              <div className="text-sm font-black text-amber-400 font-mono">
                {folders.filter((f) => f.projectId === activeProject?.id).length} Active
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Logged In</div>
              <div className="text-sm font-black text-purple-300 truncate max-w-[120px]">
                @{currentUser.username}
              </div>
            </div>
          </div>
        </div>

        {/* Tab View Router */}
        {activeTab === 'files' && activeProject && (
          <FileExplorerTab
            project={activeProject}
            folders={folders}
            files={files}
            onUploadClick={(folderId) => {
              setUploadTargetFolderId(folderId);
              setShowUploadModal(true);
            }}
            onNewFolderClick={() => {
              setFolderToEdit(null);
              setShowFolderModal(true);
            }}
            onEditFolderClick={(f) => {
              setFolderToEdit(f);
              setShowFolderModal(true);
            }}
            onDeleteFolderClick={requestDeleteFolder}
            onEditProject={(p) => {
              setProjectToEdit(p);
              setShowProjectModal(true);
            }}
            onDeleteProject={requestDeleteProject}
            onPreviewFile={(f) => setPreviewFile(f)}
            onDownloadFile={(f) => api.downloadFile(f.id, f.name)}
            onEditFile={(f) => setFileToEdit(f)}
            onMoveFile={(f) => setFileToMove(f)}
            onDeleteFile={requestDeleteFile}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'files' && !activeProject && (
          <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
            <FolderKanban className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Science Project Selected</h3>
            <p className="text-xs text-slate-400">
              Create a new science project or select one from the dropdown above.
            </p>
            <button
              onClick={() => {
                setProjectToEdit(null);
                setShowProjectModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
            >
              + Register New Science Project
            </button>
          </div>
        )}

        {activeTab === 'simulation' && <SimulationViewerTab />}

        {activeTab === 'experiments' && (
          <ExperimentLogsTab
            trials={experiments}
            onTrialAdded={(newTrial) => setExperiments((prev) => [newTrial, ...prev])}
          />
        )}

        {activeTab === 'bom' && (
          <HardwareBOMTab
            bom={bom}
            onBOMAdded={(newItem) => setBOM((prev) => [...prev, newItem])}
          />
        )}

        {activeTab === 'audit' && <AuditTrailTab logs={auditLogs} />}
      </main>

      {/* Modals */}
      <FilePreviewModal
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        onDownload={(f) => api.downloadFile(f.id, f.name)}
      />

      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        projects={projects}
        folders={folders}
        activeProjectId={activeProject?.id || (projects[0]?.id || '')}
        initialFolderId={uploadTargetFolderId}
        onUploaded={refreshFilesAndFolders}
      />

      <FolderModal
        isOpen={showFolderModal}
        onClose={() => {
          setShowFolderModal(false);
          setFolderToEdit(null);
        }}
        folderToEdit={folderToEdit}
        projectId={activeProject?.id || (projects[0]?.id || '')}
        onSaved={() => refreshFilesAndFolders()}
      />

      <MoveFileModal
        file={fileToMove}
        folders={folders.filter((f) => f.projectId === activeProject?.id)}
        isOpen={!!fileToMove}
        onClose={() => setFileToMove(null)}
        onMoved={() => refreshFilesAndFolders()}
      />

      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false);
          setProjectToEdit(null);
        }}
        projectToEdit={projectToEdit}
        onSaved={async (savedProj) => {
          const updated = await api.getProjects();
          setProjects(updated);
          setActiveProject(savedProj);
          refreshFilesAndFolders();
        }}
        onDelete={async (deletedId) => {
          const updated = await api.getProjects();
          setProjects(updated);
          if (activeProject?.id === deletedId) {
            if (updated.length > 0) setActiveProject(updated[0]);
            else setActiveProject(null);
          }
          refreshFilesAndFolders();
        }}
      />

      <AdminProfileModal
        user={currentUser}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onProfileUpdated={(updated) => setCurrentUser(updated)}
      />

      <EditFileModal
        file={fileToEdit}
        isOpen={!!fileToEdit}
        onClose={() => setFileToEdit(null)}
        onUpdated={() => refreshFilesAndFolders()}
      />

      {showKioskMode && activeProject && (
        <ExhibitionKioskMode
          project={activeProject}
          onClose={() => setShowKioskMode(false)}
          onLaunchSimulation={() => {
            setShowKioskMode(false);
            setActiveTab('simulation');
          }}
        />
      )}

      {/* In-App Confirmation Modal */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  confirmDialog.isDestructive
                    ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white">{confirmDialog.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>
              <button
                onClick={() => setConfirmDialog(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeConfirmAction}
                disabled={confirming}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                  confirmDialog.isDestructive
                    ? 'bg-red-600 hover:bg-red-500'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                }`}
              >
                {confirming ? 'Processing...' : confirmDialog.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
