import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Tag,
  Layers,
  FileCode,
  Trash2,
  Folder
} from 'lucide-react';
import { FileCategory, Project, DriveFolder } from '../types';
import { api } from '../api';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  folders: DriveFolder[];
  activeProjectId: string;
  initialFolderId?: string;
  onUploaded: () => void;
}

const CATEGORIES: FileCategory[] = [
  'Research Papers & Reports',
  '3D Simulations & CAD',
  'Source Code & Firmware',
  'Hardware & Circuit Schematics',
  'Datasets & Test Results',
  'Presentations & Posters',
  'Certificates & Approvals',
  'Photos & Media',
];

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  projects,
  folders,
  activeProjectId,
  initialFolderId,
  onUploaded,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState(activeProjectId);
  const [selectedFolderId, setSelectedFolderId] = useState<string>(initialFolderId || 'auto');
  const [selectedCategory, setSelectedCategory] = useState<FileCategory>('Research Papers & Reports');
  const [version, setVersion] = useState('v1.0');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedProjectId(activeProjectId);
    setSelectedFolderId(initialFolderId || 'auto');
  }, [activeProjectId, initialFolderId, isOpen]);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setError('');

    if (newFiles.length > 0) {
      const ext = newFiles[0].name.split('.').pop()?.toLowerCase() || '';
      if (['html', 'obj', 'stl', 'glb', 'gltf'].includes(ext)) {
        setSelectedCategory('3D Simulations & CAD');
      } else if (['ino', 'cpp', 'py', 'js', 'json'].includes(ext)) {
        setSelectedCategory('Source Code & Firmware');
      } else if (['svg', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'sch', 'brd'].includes(ext)) {
        setSelectedCategory('Hardware & Circuit Schematics');
      } else if (['csv', 'xlsx', 'dat'].includes(ext)) {
        setSelectedCategory('Datasets & Test Results');
      } else if (['pdf', 'ppt', 'pptx'].includes(ext)) {
        setSelectedCategory('Presentations & Posters');
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setError('Please select at least one file to upload.');
      return;
    }

    setUploading(true);
    setUploadProgress(20);
    setError('');

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('projectId', selectedProjectId);
      if (selectedFolderId && selectedFolderId !== 'auto') {
        formData.append('folderId', selectedFolderId);
      }
      formData.append('category', selectedCategory);
      formData.append('version', version);
      formData.append('description', description);
      formData.append('tags', tagsInput);

      setUploadProgress(60);
      const res = await api.uploadFiles(formData);
      setUploadProgress(100);

      setSuccess(`Successfully uploaded ${res.files.length} file(s) into vault!`);
      setTimeout(() => {
        onUploaded();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'File upload failed');
      setUploading(false);
    }
  };

  // Filter folders for the active project
  const projectFolders = folders.filter((f) => f.projectId === selectedProjectId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Upload Science Project Assets</h2>
              <p className="text-xs text-slate-400">
                Persistent storage for presentations, images, 3D simulations, firmware & datasets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleUpload} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Project Target & Destination Drive Folder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Target Project
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                Destination Drive Folder
              </label>
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              >
                <option value="auto">⚡ Auto Detect by File Type (Recommended)</option>
                {projectFolders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
              isDragging
                ? 'border-cyan-400 bg-cyan-950/20 shadow-inner'
                : 'border-slate-700 hover:border-slate-500 bg-slate-950/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 mb-2 shadow-inner">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white mb-1">
              Click to browse or drag and drop files here
            </p>
            <p className="text-slate-400 text-xs max-w-sm">
              Supports PPT / PPTX decks, JPEG / PNG / SVG images, 3D simulation HTML, Arduino .ino, Python, CSV, PDF, and CAD models.
            </p>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>Files Selected ({selectedFiles.length}):</span>
                <span>Total: {formatFileSize(selectedFiles.reduce((acc, f) => acc + f.size, 0))}</span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="font-mono text-white truncate max-w-md">{file.name}</span>
                      <span className="text-slate-500 text-[10px] shrink-0 font-mono">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(idx);
                      }}
                      className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category & Version */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                Asset Classification / Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as FileCategory)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Version Tag
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v1.0"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-cyan-400" />
              Tags (Comma Separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="NCSC, Presentation, Photo, 3D Model, Dataset, Firmware"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              File Description & Research Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this asset, purpose, testing criteria, or changes from prior revision..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-cyan-400 font-mono">
                <span>Saving to Persistent Storage...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || selectedFiles.length === 0}
              className="px-5 py-2 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Storing Files...
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  Upload & Secure ({selectedFiles.length})
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
