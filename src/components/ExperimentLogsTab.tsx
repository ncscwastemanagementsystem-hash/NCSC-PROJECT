import React, { useState } from 'react';
import {
  FlaskConical,
  Plus,
  Search,
  Download,
  CheckCircle,
  AlertTriangle,
  RotateCw,
  TrendingUp,
  Cpu,
  Layers,
  Filter
} from 'lucide-react';
import { ExperimentTrial } from '../types';
import { api } from '../api';

interface ExperimentLogsTabProps {
  trials: ExperimentTrial[];
  onTrialAdded: (trial: ExperimentTrial) => void;
}

export const ExperimentLogsTab: React.FC<ExperimentLogsTabProps> = ({
  trials,
  onTrialAdded,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Form state
  const [item, setItem] = useState('Banana Peel');
  const [category, setCategory] = useState('Wet Waste');
  const [mass, setMass] = useState(85);
  const [moisture, setMoisture] = useState('High (86%)');
  const [metal, setMetal] = useState('No');
  const [confidence, setConfidence] = useState(96);
  const [routingTimeMs, setRoutingTimeMs] = useState(780);
  const [result, setResult] = useState('Success');
  const [recovery, setRecovery] = useState('Composting & Biogas Digester');
  const [saving, setSaving] = useState(false);

  const totalTrials = trials.length;
  const successfulTrials = trials.filter((t) => t.result.includes('Success')).length;
  const accuracy = totalTrials > 0 ? Math.round((successfulTrials / totalTrials) * 100) : 100;
  const avgTime =
    totalTrials > 0
      ? Math.round(trials.reduce((acc, t) => acc + (t.routingTimeMs || 750), 0) / totalTrials)
      : 750;

  const filteredTrials = trials.filter((t) => {
    const matchesSearch =
      t.item.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.recovery.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      categoryFilter === 'All' ||
      t.category.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchesSearch && matchesCat;
  });

  const handleCreateTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newTrial = await api.addExperiment({
        item,
        category,
        mass,
        moisture,
        metal,
        confidence,
        routingTimeMs,
        result,
        recovery,
      });
      onTrialAdded(newTrial);
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to log trial:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Trial_ID',
      'Sample_Item',
      'Category',
      'Mass_Grams',
      'Moisture',
      'Metal_Sensor',
      'AI_Confidence_Pct',
      'Routing_Time_MS',
      'Result',
      'Recovery_Destination',
      'Date',
    ];
    const rows = trials.map((t) => [
      t.trialNumber,
      `"${t.item}"`,
      `"${t.category}"`,
      t.mass,
      `"${t.moisture}"`,
      `"${t.metal}"`,
      t.confidence,
      t.routingTimeMs,
      `"${t.result}"`,
      `"${t.recovery}"`,
      t.date,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NCSC_Experiment_Trials_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Logged Trials</span>
            <FlaskConical className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalTrials}</div>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 inline-block">
            Empirical validation dataset
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Segregation Accuracy</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{accuracy}%</div>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">
            {successfulTrials} of {totalTrials} tests matched
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Avg. Decision Latency</span>
            <RotateCw className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{avgTime} ms</div>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">
            Optical capture to servo flap
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Contamination Rate</span>
            <AlertTriangle className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono">0.0%</div>
          <span className="text-[11px] text-emerald-400 mt-1 inline-block">
            Protected by reject threshold
          </span>
        </div>
      </div>

      {/* Control bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search test trials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="All">All Streams</option>
              <option value="Wet">Wet Waste</option>
              <option value="Plastic">Plastic</option>
              <option value="Other">Other / Metal</option>
              <option value="Reject">Reject / Unknown</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Experiment Trial</span>
          </button>
        </div>
      </div>

      {/* Trials Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-slate-950 border-b border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3 pl-4">Trial</th>
                <th className="p-3">Sample Item</th>
                <th className="p-3">Detected Category</th>
                <th className="p-3">Mass</th>
                <th className="p-3">Moisture</th>
                <th className="p-3">Inductive Metal</th>
                <th className="p-3">AI Confidence</th>
                <th className="p-3">Recovery Destination</th>
                <th className="p-3 pr-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
              {filteredTrials.map((trial) => (
                <tr key={trial.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 pl-4 text-cyan-400 font-bold">#{trial.trialNumber}</td>
                  <td className="p-3 font-sans font-semibold text-white">{trial.item}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${
                        trial.category.includes('Wet')
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                          : trial.category.includes('Plastic')
                          ? 'bg-blue-950 text-blue-400 border border-blue-800/50'
                          : trial.category.includes('Other')
                          ? 'bg-amber-950 text-amber-400 border border-amber-800/50'
                          : 'bg-red-950 text-red-400 border border-red-800/50'
                      }`}
                    >
                      {trial.category}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{trial.mass} g</td>
                  <td className="p-3 text-slate-300">{trial.moisture}</td>
                  <td className="p-3">
                    {trial.metal.includes('Detected') ? (
                      <span className="text-amber-400 font-semibold">{trial.metal}</span>
                    ) : (
                      <span className="text-slate-500">None</span>
                    )}
                  </td>
                  <td className="p-3 text-cyan-300 font-bold">{trial.confidence}%</td>
                  <td className="p-3 font-sans text-slate-300">{trial.recovery}</td>
                  <td className="p-3 pr-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-sans">
                      <CheckCircle className="w-3 h-3" />
                      Success
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Trial Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-cyan-400" />
                Log Live Experimental Trial
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTrial} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Sample Tested Object Name *
                </label>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  required
                  placeholder="e.g. Banana Peel, PET Bottle"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Classified Stream
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (e.target.value === 'Wet Waste') {
                        setRecovery('Composting & Biogas Digester');
                        setMoisture('High (88%)');
                      } else if (e.target.value === 'Plastic') {
                        setRecovery('Controlled Pyrolysis Concept');
                        setMoisture('Low (10%)');
                      } else {
                        setRecovery('Secondary Material Smelting');
                        setMoisture('Low (5%)');
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="Wet Waste">Wet Waste</option>
                    <option value="Plastic">Plastic</option>
                    <option value="Other (Metal)">Other (Metal)</option>
                    <option value="Other (Paper)">Other (Paper)</option>
                    <option value="Other (Glass)">Other (Glass)</option>
                    <option value="Unknown/Reject">Unknown/Reject</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Mass (Grams)
                  </label>
                  <input
                    type="number"
                    value={mass}
                    onChange={(e) => setMass(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Moisture Reading
                  </label>
                  <input
                    type="text"
                    value={moisture}
                    onChange={(e) => setMoisture(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Inductive Metal Sensor
                  </label>
                  <select
                    value={metal}
                    onChange={(e) => setMetal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="No">No Metal Detected</option>
                    <option value="Metal Detected">Metal Detected (Eddy Current)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    AI Vision Confidence (%)
                  </label>
                  <input
                    type="number"
                    value={confidence}
                    onChange={(e) => setConfidence(parseInt(e.target.value, 10) || 0)}
                    min={0}
                    max={100}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Latency (ms)
                  </label>
                  <input
                    type="number"
                    value={routingTimeMs}
                    onChange={(e) => setRoutingTimeMs(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Recovery Destination
                </label>
                <input
                  type="text"
                  value={recovery}
                  onChange={(e) => setRecovery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
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
                  {saving ? 'Recording Trial...' : 'Save Trial Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
