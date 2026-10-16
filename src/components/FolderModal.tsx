import React, { useState, useEffect } from 'react';
import {
  X,
  FolderPlus,
  Folder,
  Layers,
  Palette,
  Sparkles,
  Presentation,
  Image as ImageIcon,
  Box,
  FileCode,
  FileText,
  Table,
  Film,
  Save
} from 'lucide-react';
import { DriveFolder, FolderIconType } from '../types';
import { api } from '../api';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderToEdit?: DriveFolder | null;
  projectId: string;
  onSaved: (folder: DriveFolder) => void;
}

const COLOR_OPTIONS = [
  { name: 'Cyan', hex: '#06b6d4', bg: 'bg-cyan-500' },
  { name: 'Amber', hex: '#f59e0b', bg: 'bg-amber-500' },
  { name: 'Emerald', hex: '#10b981', bg: 'bg-emerald-500' },
  { name: 'Pink', hex: '#ec4899', bg: 'bg-pink-500' },
  { name: 'Violet', hex: '#8b5cf6', bg: 'bg-violet-500' },
  { name: 'Blue', hex: '#3b82f6', bg: 'bg-blue-500' },
  { name: 'Rose', hex: '#f43f5e', bg: 'bg-rose-500' },
  { name: 'Orange', hex: '#ea580c', bg: 'bg-orange-500' },
];

const ICON_OPTIONS: { type: FolderIconType; label: string; icon: any }[] = [
  { type: 'folder', label: 'General', icon: Folder },
  { type: 'ppt', label: 'PPT / Slides', icon: Presentation },
  { type: 'image', label: 'Photos / Images', icon: ImageIcon },
  { type: '3d', label: '3D / CAD', icon: Box },
  { type: 'code', label: 'Code / Firmware', icon: FileCode },
  { type: 'doc', label: 'Documents / Reports', icon: FileText },
  { type: 'data', label: 'Datasets / CSV', icon: Table },
  { type: 'media', label: 'Video / Media', icon: Film },
];

export const FolderModal: React.FC<FolderModalProps> = ({
  isOpen,
  onClose,
  folderToEdit,
  projectId,
  onSaved,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#06b6d4');
  const [icon, setIcon] = useState<FolderIconType>('folder');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (folderToEdit) {
      setName(folderToEdit.name);
      setColor(folderToEdit.color || '#06b6d4');
      setIcon(folderToEdit.icon || 'folder');
      setDescription(folderToEdit.description || '');
    } else {
      setName('');
      setColor('#06b6d4');
      setIcon('folder');
      setDescription('');
    }
    setError('');
  }, [folderToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Folder name is required.');
      return;
    }

    setLoading(true);
    try {
      let saved: DriveFolder;
      if (folderToEdit) {
        saved = await api.updateFolder(folderToEdit.id, {
          name: name.trim(),
          color,
          icon,
          description: description.trim(),
        });
      } else {
        saved = await api.createFolder({
          projectId,
          name: name.trim(),
          color,
          icon,
          description: description.trim(),
        });
      }
      onSaved(saved);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save folder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"
              style={{ backgroundColor: `${color}20`, borderColor: `${color}50`, borderWidth: 1 }}
            >
              <FolderPlus className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {folderToEdit ? 'Edit Drive Folder' : 'Create Custom Drive Folder'}
              </h2>
              <p className="text-xs text-slate-400">
                Organize presentations, images, 3D simulations & project files
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Folder Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Science Exhibition Photos, CAD Enclosure 3D"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              Folder Theme Color
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    c.bg
                  } ${
                    color === c.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Folder Category Icon
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ICON_OPTIONS.map((item) => {
                const IconComp = item.icon;
                const isSelected = icon === item.type;
                return (
                  <button
                    type="button"
                    key={item.type}
                    onClick={() => setIcon(item.type)}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-400 text-cyan-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                    <span className="text-[10px] font-medium truncate w-full text-center">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Description / Notes (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. High-resolution photos from national science fair stage"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Saving Folder...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  {folderToEdit ? 'Update Folder' : 'Create Folder'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
