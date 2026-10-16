import React, { useState } from 'react';
import {
  Sparkles,
  Maximize2,
  RotateCcw,
  CheckCircle,
  Cpu,
  Layers,
  Flame,
  Recycle,
  HelpCircle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export const SimulationViewerTab: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-emerald-950/30 border border-cyan-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-700/60 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Real-Time Three.js Physics & Sensor Simulation
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Smart Waste-to-Resource System — 3D Exhibition Simulator
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Interactive science exhibition model. Demonstrates multi-sensor detection (Optical Image + Moisture + Inductive Metal + Mass Load Cell), AI inference, autonomous servo-diverter routing, and downstream closed-loop biological & thermochemical recovery.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleReload}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset 3D Canvas"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Scene</span>
            </button>
            <a
              href="/simulations/smart-waste-3d.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in New Tab</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3D Simulation Frame Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl relative">
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Interactive 3D Virtual Prototype</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50 text-[10px]">
              60 FPS WebGL Engine Active
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-3">
            <span>Click model components to inspect internal sensors</span>
            <span>•</span>
            <span>Drag to Orbit / Wheel to Zoom</span>
          </div>
        </div>

        <div className="w-full h-[640px] relative bg-slate-950">
          <iframe
            key={iframeKey}
            src="/simulations/smart-waste-3d.html"
            className="w-full h-full border-0"
            title="Smart Waste-to-Resource 3D Simulation"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>

      {/* Quick Scientific Reference Grid for Judges / Visitors */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase mb-1.5">
              <Recycle className="w-4 h-4" />
              Wet / Organic Stream
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Detected by high conductivity on moisture probes + organic visual classifier. Routed via flap to 135° into Composting Chamber & Anaerobic Digestion Drum for Biogas (CH4) generation.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-emerald-400/90 font-mono">
            Output: Compost Soil Fertilizer + Biogas
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase mb-1.5">
              <Layers className="w-4 h-4" />
              Synthetic Plastic Stream
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Detected by low moisture, optical polymer recognition. Routed via flap to 105° into size-reduction shredder, conceptually feeding a controlled, closed pyrolysis unit and condenser tower.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-blue-400/90 font-mono">
            Output: Hydrocarbon Liquid/Wax + Syngas + Char
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase mb-1.5">
              <Cpu className="w-4 h-4" />
              Metals & Recyclables
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Inductive proximity sensor detects electromagnetic eddy current variations in metallic cans, foils, and fasteners. Routed via flap to 70° for secondary recycling.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-amber-400/90 font-mono">
            Output: High-Purity Metal & Glass Smelting
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase mb-1.5">
              <ShieldAlert className="w-4 h-4" />
              Reject & Safety Quarantine
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Any composite object or item with confidence under 65% is safely diverted to the 45° reject chute, safeguarding the downstream biological and thermal recovery systems from contamination.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-red-400/90 font-mono">
            Output: 0% Cross-Contamination Integrity
          </div>
        </div>
      </div>
    </div>
  );
};
