import React, { useState } from 'react';
import { X, FolderInput, Folder, Check, ArrowRight } from 'lucide-react';
import { VaultFile, DriveFolder } from '../types';
import { api } from '../api';

interface MoveFileModalProps {
  file: VaultFile | null;
  folders: DriveFolder[];
  isOpen: boolean;
  onClose: () => void;
  onMoved: (file: VaultFile) => void;
}

export const MoveFileModal: React.FC<MoveFileModalProps> = ({
  file,
  folders,
  isOpen,
  onClose,
  onMoved,
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string>(file?.folderId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !file) return null;

  const handleMove = async () => {
    if (!selectedFolderId) {
      setError('Please select a target folder.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.moveFile(file.id, selectedFolderId);
      onMoved(res.file);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to move file');
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
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FolderInput className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Move File to Folder</h2>
              <p className="text-xs text-slate-400 truncate max-w-xs">{file.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Folder Picker List */}
        <div className="p-6 space-y-3 text-xs max-h-80 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300">
              {error}
            </div>
          )}

          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Select Destination Drive Folder
          </div>

          <div className="space-y-1.5">
            {folders.map((f) => {
              const isSelected = selectedFolderId === f.id;
              const isCurrent = file.folderId === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFolderId(f.id)}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-400/40'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${f.color}25`, color: f.color }}
                    >
                      <Folder className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold truncate flex items-center gap-2">
                        <span>{f.name}</span>
                        {isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 font-normal">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {f.fileCount || 0} file(s)
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleMove}
            disabled={loading || selectedFolderId === file.folderId}
            className="px-5 py-2 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50 text-xs"
          >
            {loading ? (
              <span>Moving File...</span>
            ) : (
              <>
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Move to Selected Folder</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
