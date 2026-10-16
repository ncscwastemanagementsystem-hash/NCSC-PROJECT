import React, { useState } from 'react';
import { Cpu, DollarSign, Plus, CheckCircle2, Layers, AlertCircle, Wrench, ShieldCheck } from 'lucide-react';
import { BOMItem } from '../types';
import { api } from '../api';

interface HardwareBOMTabProps {
  bom: BOMItem[];
  onBOMAdded: (item: BOMItem) => void;
}

export const HardwareBOMTab: React.FC<HardwareBOMTabProps> = ({ bom, onBOMAdded }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [component, setComponent] = useState('');
  const [role, setRole] = useState('');
  const [specs, setSpecs] = useState('');
  const [cost, setCost] = useState('5.00');
  const [quantity, setQuantity] = useState('1');
  const [status, setStatus] = useState<BOMItem['status']>('Installed');
  const [saving, setSaving] = useState(false);

  const totalCost = bom.reduce((acc, item) => acc + (item.cost * (item.quantity || 1)), 0);
  const totalComponents = bom.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!component.trim()) return;

    setSaving(true);
    try {
      const created = await api.addBOM({
        component: component.trim(),
        role: role.trim(),
        specs: specs.trim(),
        cost: parseFloat(cost) || 0,
        quantity: parseInt(quantity, 10) || 1,
        status,
      });
      onBOMAdded(created);
      setShowAddModal(false);
      setComponent('');
      setRole('');
      setSpecs('');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Hardware Investment</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            ${totalCost.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">
            Low-cost frugal science congress engineering
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Hardware Components</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono">
            {totalComponents} Units ({bom.length} Lines)
          </div>
          <span className="text-[11px] text-cyan-300/80 mt-1 inline-block">
            All active & calibrated on chassis
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>System Status</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">100% Assembled</div>
          <span className="text-[11px] text-emerald-400 mt-1 inline-block">
            Bench tested & exhibition verified
          </span>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex justify-between items-center bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-cyan-400" />
            Hardware Bill of Materials (BOM) & Component Specifications
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Microcontrollers, sensors, actuators, chassis materials, and power distribution
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Component</span>
        </button>
      </div>

      {/* BOM Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-slate-950 border-b border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3 pl-4">Component Name</th>
                <th className="p-3">Functional Role in Vault Project</th>
                <th className="p-3">Technical Specifications</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Unit Cost</th>
                <th className="p-3 pr-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
              {bom.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 pl-4 font-sans font-bold text-white">{item.component}</td>
                  <td className="p-3 font-sans text-slate-300">{item.role}</td>
                  <td className="p-3 text-slate-400">{item.specs}</td>
                  <td className="p-3 text-center text-cyan-300 font-bold">{item.quantity}</td>
                  <td className="p-3 text-right text-emerald-400">${item.cost.toFixed(2)}</td>
                  <td className="p-3 pr-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-sans">
                      <CheckCircle2 className="w-3 h-3" />
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                Add Hardware Component
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Component Name *</label>
                <input
                  type="text"
                  value={component}
                  onChange={(e) => setComponent(e.target.value)}
                  required
                  placeholder="e.g. ESP32-WROOM-32"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Functional Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Central Sensor & Servo Processing"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Technical Specs</label>
                <input
                  type="text"
                  value={specs}
                  onChange={(e) => setSpecs(e.target.value)}
                  placeholder="e.g. 240MHz, 4MB Flash, 5V input"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="Installed">Installed</option>
                    <option value="Procured">Procured</option>
                    <option value="Testing">Testing</option>
                    <option value="On Order">On Order</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer"
                >
                  {saving ? 'Adding...' : 'Save Component'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
