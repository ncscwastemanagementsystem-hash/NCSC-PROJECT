import React from 'react';
import { ShieldCheck, History, User, Clock, FileText, Lock, Key, AlertCircle } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditTrailTabProps {
  logs: AuditLog[];
}

export const AuditTrailTab: React.FC<AuditTrailTabProps> = ({ logs }) => {
  const getActionBadge = (action: string) => {
    if (action.includes('LOGIN')) {
      return (
        <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60 text-[10px] font-mono">
          {action}
        </span>
      );
    }
    if (action.includes('UPLOAD') || action.includes('CREATED')) {
      return (
        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 text-[10px] font-mono">
          {action}
        </span>
      );
    }
    if (action.includes('DELETE')) {
      return (
        <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/60 text-[10px] font-mono">
          {action}
        </span>
      );
    }
    if (action.includes('PASSWORD') || action.includes('SECURITY')) {
      return (
        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60 text-[10px] font-mono">
          {action}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono">
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Security & Activity Audit Trail</h3>
            <p className="text-xs text-slate-400">
              Immutable local log recording administrative authentications, file uploads, and configuration updates
            </p>
          </div>
        </div>
        <div className="text-right text-xs font-mono text-cyan-400 font-bold">
          {logs.length} Logged Events
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="divide-y divide-slate-800/80">
          {logs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-800/30 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getActionBadge(log.action)}</div>
                <div>
                  <p className="text-slate-200 font-medium">{log.details}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono">
                    <User className="w-3 h-3 text-slate-500" />
                    <span>Actor: {log.actor}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 shrink-0 self-end sm:self-center">
                <Clock className="w-3 h-3 text-slate-600" />
                <span>{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
