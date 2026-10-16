import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  Grid,
  List as ListIcon,
  Filter,
  Layers,
  Sparkles,
  Edit2,
  Trash2,
  Calendar,
  User,
  Award,
  Download,
  Search,
  Plus,
  Folder,
  FolderPlus,
  ChevronRight,
  ArrowLeft,
  Presentation,
  Image as ImageIcon,
  Box,
  FileCode,
  Table,
  Film,
  MoreVertical,
  FolderInput
} from 'lucide-react';
import { Project, VaultFile, DriveFolder, FileCategory } from '../types';
import { FileCard } from './FileCard';

interface FileExplorerTabProps {
  project: Project;
  folders: DriveFolder[];
  files: VaultFile[];
  onUploadClick: (folderId?: string) => void;
  onNewFolderClick: () => void;
  onEditFolderClick: (folder: DriveFolder) => void;
  onDeleteFolderClick: (folderId: string) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onPreviewFile: (file: VaultFile) => void;
  onDownloadFile: (file: VaultFile) => void;
  onEditFile: (file: VaultFile) => void;
  onMoveFile: (file: VaultFile) => void;
  onDeleteFile: (file: VaultFile) => void;
  searchQuery: string;
}

const CATEGORIES: FileCategory[] = [
  'All Files',
  'Research Papers & Reports',
  '3D Simulations & CAD',
  'Source Code & Firmware',
  'Hardware & Circuit Schematics',
  'Datasets & Test Results',
  'Presentations & Posters',
];

export const FileExplorerTab: React.FC<FileExplorerTabProps> = ({
  project,
  folders,
  files,
  onUploadClick,
  onNewFolderClick,
  onEditFolderClick,
  onDeleteFolderClick,
  onEditProject,
  onDeleteProject,
  onPreviewFile,
  onDownloadFile,
  onEditFile,
  onMoveFile,
  onDeleteFile,
  searchQuery,
}) => {
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FileCategory>('All Files');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [folderMenuId, setFolderMenuId] = useState<string | null>(null);

  // Active folder details if inside a folder
  const currentFolder = activeFolderId
    ? folders.find((f) => f.id === activeFolderId) || null
    : null;

  // Filter files by project, active folder (if any), category, and search query
  const filteredFiles = files.filter((f) => {
    const matchesProject = f.projectId === project.id;
    const matchesFolder = activeFolderId ? f.folderId === activeFolderId : true;
    const matchesCat = selectedCategory === 'All Files' || f.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.tags && f.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesProject && matchesFolder && matchesCat && matchesSearch;
  });

  // Sort files
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'size') return b.size - a.size;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const projectFolders = folders.filter((f) => f.projectId === project.id);
  const totalBytes = files.filter((f) => f.projectId === project.id).reduce((acc, f) => acc + (f.size || 0), 0);

  // Helper to get folder icon component
  const getFolderIcon = (iconType: string, color: string) => {
    switch (iconType) {
      case 'ppt':
        return <Presentation className="w-5 h-5" style={{ color }} />;
      case 'image':
        return <ImageIcon className="w-5 h-5" style={{ color }} />;
      case '3d':
        return <Box className="w-5 h-5" style={{ color }} />;
      case 'code':
        return <FileCode className="w-5 h-5" style={{ color }} />;
      case 'doc':
        return <FileText className="w-5 h-5" style={{ color }} />;
      case 'data':
        return <Table className="w-5 h-5" style={{ color }} />;
      case 'media':
        return <Film className="w-5 h-5" style={{ color }} />;
      default:
        return <Folder className="w-5 h-5" style={{ color }} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Banner Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                {project.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                <Award className="w-3 h-3" />
                {project.status}
              </span>
              <span className="text-xs text-slate-400 font-sans">
                {project.category}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {project.name}
            </h1>
            <p className="text-xs text-cyan-400/90 font-medium mt-0.5">
              {project.tagline}
            </p>
            <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">
              {project.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                Lead: <strong className="text-slate-200">{project.leadResearcher}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                Teacher: <strong className="text-slate-200">{project.guideTeacher}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Exhibition Date: <strong className="text-slate-200">{project.targetExhibitionDate}</strong>
              </span>
            </div>
          </div>

          <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Drive Storage</div>
              <div className="text-xl font-black text-white font-mono">
                {files.filter((f) => f.projectId === project.id).length} Files
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {formatSize(totalBytes)} in {projectFolders.length} Folders
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEditProject(project)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Edit Project</span>
              </button>
              <button
                onClick={() => onDeleteProject(project.id)}
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-700/60 transition-colors"
                title="Delete project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drive Breadcrumb & Folders Section */}
      <div className="space-y-4">
        {/* Drive Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveFolderId(null)}
              className={`flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                !activeFolderId
                  ? 'bg-slate-800 text-cyan-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Folder className="w-4 h-4 text-cyan-400" />
              <span>Drive Folders</span>
            </button>

            {currentFolder && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 font-bold"
                  style={{ color: currentFolder.color }}
                >
                  {getFolderIcon(currentFolder.icon, currentFolder.color)}
                  <span>{currentFolder.name}</span>
                </span>
                <button
                  onClick={() => setActiveFolderId(null)}
                  className="text-slate-400 hover:text-cyan-400 text-xs ml-2 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>All Folders</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNewFolderClick}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FolderPlus className="w-4 h-4 text-cyan-400" />
              <span>+ New Custom Folder</span>
            </button>

            <button
              onClick={() => onUploadClick(activeFolderId || undefined)}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload to {currentFolder ? currentFolder.name : 'Vault'}</span>
            </button>
          </div>
        </div>

        {/* Folder Cards Grid (when viewing all folders or as a top bar) */}
        {!activeFolderId && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {projectFolders.map((folder) => {
              const fileCount = files.filter(
                (f) => f.projectId === project.id && f.folderId === folder.id
              ).length;
              const folderSize = files
                .filter((f) => f.projectId === project.id && f.folderId === folder.id)
                .reduce((acc, f) => acc + (f.size || 0), 0);

              return (
                <div
                  key={folder.id}
                  onClick={() => setActiveFolderId(folder.id)}
                  className="group p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 transition-all cursor-pointer shadow-md flex flex-col justify-between relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: folder.color }}
                  />

                  <div className="flex items-start justify-between gap-1 mb-2">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
                      style={{ backgroundColor: `${folder.color}20` }}
                    >
                      {getFolderIcon(folder.icon, folder.color)}
                    </div>

                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFolderMenuId(folderMenuId === folder.id ? null : folder.id);
                        }}
                        className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {folderMenuId === folder.id && (
                        <>
                          <div
                            className="fixed inset-0 z-20"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFolderMenuId(null);
                            }}
                          />
                          <div className="absolute right-0 top-6 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-30 text-xs">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFolderMenuId(null);
                                onEditFolderClick(folder);
                              }}
                              className="w-full px-3 py-1.5 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                              Edit Folder
                            </button>
                            {!folder.isDefault && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFolderMenuId(null);
                                  onDeleteFolderClick(folder.id);
                                }}
                                className="w-full px-3 py-1.5 text-left text-red-400 hover:bg-red-950/40 flex items-center gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete Folder
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {folder.name}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                      <span>{fileCount} files</span>
                      <span>{formatSize(folderSize)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Current Folder Active Banner */}
        {currentFolder && (
          <div
            className="p-4 rounded-2xl bg-slate-900/80 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg"
            style={{ borderColor: `${currentFolder.color}40` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
                style={{ backgroundColor: `${currentFolder.color}25` }}
              >
                {getFolderIcon(currentFolder.icon, currentFolder.color)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{currentFolder.name}</span>
                  {currentFolder.isDefault && (
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                      Default Folder
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentFolder.description || 'Files organized inside this drive folder'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onEditFolderClick(currentFolder)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Rename / Color</span>
              </button>
              {!currentFolder.isDefault && (
                <button
                  onClick={() => onDeleteFolderClick(currentFolder.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-red-400 transition-colors cursor-pointer"
                  title="Delete Folder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Categories Bar & Filters */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const count =
              cat === 'All Files'
                ? files.filter((f) => f.projectId === project.id && (activeFolderId ? f.folderId === activeFolderId : true)).length
                : files.filter(
                    (f) =>
                      f.projectId === project.id &&
                      f.category === cat &&
                      (activeFolderId ? f.folderId === activeFolderId : true)
                  ).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    selectedCategory === cat ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View mode & Sort */}
        <div className="flex items-center justify-between w-full lg:w-auto gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none"
            >
              <option value="date">Latest Revision</option>
              <option value="name">File Name</option>
              <option value="size">File Size</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Files Display: Grid or List */}
      {sortedFiles.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">
            {currentFolder
              ? `No files currently stored in "${currentFolder.name}"`
              : 'No scientific files found in this category'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Upload presentations, 3D simulations, firmware, datasets, or images directly to this drive folder.
          </p>
          <button
            onClick={() => onUploadClick(activeFolderId || undefined)}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document Here</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedFiles.map((file) => {
            const folder = folders.find((f) => f.id === file.folderId);
            return (
              <FileCard
                key={file.id}
                file={file}
                folderName={folder?.name}
                folderColor={folder?.color}
                onPreview={onPreviewFile}
                onDownload={onDownloadFile}
                onEdit={onEditFile}
                onMove={onMoveFile}
                onDelete={onDeleteFile}
              />
            );
          })}
        </div>
      ) : (
        /* List Mode */
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead className="bg-slate-950 border-b border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3 pl-4">File Name</th>
                  <th className="p-3">Folder</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Version</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Updated</th>
                  <th className="p-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                {sortedFiles.map((file) => {
                  const folder = folders.find((f) => f.id === file.folderId);
                  return (
                    <tr key={file.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 pl-4">
                        <div
                          className="font-sans font-bold text-white hover:text-cyan-400 cursor-pointer"
                          onClick={() => onPreviewFile(file)}
                        >
                          {file.name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-sm font-sans">
                          {file.description}
                        </div>
                      </td>
                      <td className="p-3">
                        {folder ? (
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold flex items-center gap-1 w-fit"
                            style={{ backgroundColor: `${folder.color}20`, color: folder.color }}
                          >
                            <Folder className="w-3 h-3" />
                            <span>{folder.name}</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Root</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-sans">
                          {file.category}
                        </span>
                      </td>
                      <td className="p-3 text-cyan-300 font-bold">{file.version}</td>
                      <td className="p-3 text-slate-400">{formatSize(file.size)}</td>
                      <td className="p-3 text-slate-500">
                        {new Date(file.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1 font-sans">
                          <button
                            onClick={() => onPreviewFile(file)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold cursor-pointer"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => onDownloadFile(file)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onMoveFile(file)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 cursor-pointer"
                            title="Move to Folder"
                          >
                            <FolderInput className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditFile(file)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteFile(file)}
                            className="p-1 rounded bg-slate-800 hover:bg-red-950 text-red-400 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
