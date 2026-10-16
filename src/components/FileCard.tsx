import React, { useState } from 'react';
import {
  FileText,
  FileCode,
  Table,
  Sparkles,
  Download,
  Eye,
  MoreVertical,
  Edit2,
  Trash2,
  Tag,
  Check,
  Calendar,
  Layers,
  Presentation,
  Image as ImageIcon,
  FolderInput,
  Folder
} from 'lucide-react';
import { VaultFile } from '../types';

interface FileCardProps {
  file: VaultFile;
  folderName?: string;
  folderColor?: string;
  onPreview: (file: VaultFile) => void;
  onDownload: (file: VaultFile) => void;
  onEdit: (file: VaultFile) => void;
  onMove: (file: VaultFile) => void;
  onDelete: (file: VaultFile) => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  folderName,
  folderColor,
  onPreview,
  onDownload,
  onEdit,
  onMove,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [imgError, setImgError] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  const isHTMLor3D =
    ext === 'html' ||
    ext === 'htm' ||
    ext === 'stl' ||
    ext === 'obj' ||
    ext === 'glb' ||
    file.category === '3D Simulations & CAD' ||
    file.isStaticPublic;

  const isPresentation =
    ['ppt', 'pptx', 'key', 'odp'].includes(ext) || file.category === 'Presentations & Posters';

  const isImage =
    ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(ext) || file.category === 'Photos & Media';

  const isCode =
    ['ino', 'py', 'cpp', 'c', 'h', 'js', 'ts', 'json', 'css', 'sh'].includes(ext) ||
    file.category === 'Source Code & Firmware';

  const isCSV = ['csv', 'tsv', 'xlsx', 'xls'].includes(ext) || file.mimeType.includes('csv');

  const isSVG = ext === 'svg' || file.mimeType.includes('svg');

  return (
    <div className="group bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-950/20 flex flex-col justify-between relative overflow-hidden">
      {/* Category accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          isPresentation
            ? 'bg-gradient-to-r from-amber-400 to-orange-500'
            : isImage
            ? 'bg-gradient-to-r from-pink-400 to-rose-500'
            : isHTMLor3D
            ? 'bg-gradient-to-r from-cyan-400 to-blue-500'
            : isCode
            ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
            : isCSV
            ? 'bg-gradient-to-r from-purple-400 to-violet-500'
            : 'bg-gradient-to-r from-blue-400 to-indigo-500'
        }`}
      />

      <div>
        {/* Top bar with icon/thumbnail and actions */}
        <div className="flex items-start justify-between gap-2 mb-3 pt-1">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {isImage && !imgError && !file.isInlineText ? (
              <div
                onClick={() => onPreview(file)}
                className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 cursor-pointer shadow-inner relative group-hover:border-cyan-500/50 transition-colors"
              >
                <img
                  src={`/api/files/${file.id}/raw`}
                  alt={file.name}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                onClick={() => onPreview(file)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner cursor-pointer ${
                  isPresentation
                    ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                    : isImage
                    ? 'bg-pink-500/15 border border-pink-500/30 text-pink-400'
                    : isHTMLor3D
                    ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400'
                    : isCode
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                    : isCSV
                    ? 'bg-purple-500/15 border border-purple-500/30 text-purple-400'
                    : 'bg-blue-500/15 border border-blue-500/30 text-blue-400'
                }`}
              >
                {isPresentation ? (
                  <Presentation className="w-5 h-5" />
                ) : isImage ? (
                  <ImageIcon className="w-5 h-5" />
                ) : isHTMLor3D ? (
                  <Sparkles className="w-5 h-5" />
                ) : isCode ? (
                  <FileCode className="w-5 h-5" />
                ) : isCSV ? (
                  <Table className="w-5 h-5" />
                ) : isSVG ? (
                  <Layers className="w-5 h-5" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
              </div>
            )}

            <div className="overflow-hidden">
              {folderName && (
                <div className="flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase mb-0.5 truncate">
                  <Folder className="w-3 h-3 shrink-0" style={{ color: folderColor || '#06b6d4' }} />
                  <span className="truncate" style={{ color: folderColor || '#06b6d4' }}>
                    {folderName}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-cyan-300 border border-slate-700">
                  {file.version || 'v1.0'}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {formatSize(file.size)}
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-7 w-40 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-1.5 z-30 text-xs">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onPreview(file);
                    }}
                    className="w-full px-3 py-1.5 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    Preview File
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDownload(file);
                    }}
                    className="w-full px-3 py-1.5 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    Download File
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onMove(file);
                    }}
                    className="w-full px-3 py-1.5 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <FolderInput className="w-3.5 h-3.5 text-emerald-400" />
                    Move to Folder...
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(file);
                    }}
                    className="w-full px-3 py-1.5 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                    Edit Details
                  </button>
                  <div className="border-t border-slate-800 my-1" />
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(file);
                    }}
                    className="w-full px-3 py-1.5 text-left text-red-400 hover:bg-red-950/40 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete File
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* File Name */}
        <h3
          onClick={() => onPreview(file)}
          className="text-sm font-bold text-white hover:text-cyan-400 transition-colors line-clamp-2 cursor-pointer mb-1.5 leading-snug"
          title={file.name}
        >
          {file.name}
        </h3>

        {/* Description */}
        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {file.description || 'No detailed scientific notes provided.'}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {file.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-400"
            >
              #{tag}
            </span>
          ))}
          {file.tags.length > 3 && (
            <span className="px-1.5 py-0.5 text-[10px] text-slate-500">
              +{file.tags.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Card Footer with Buttons */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs mt-1">
        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
          <Calendar className="w-3 h-3 text-slate-600" />
          {new Date(file.updatedAt).toLocaleDateString()}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPreview(file)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </button>
          <button
            onClick={() => onDownload(file)}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
