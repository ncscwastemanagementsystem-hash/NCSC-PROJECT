import React from 'react';
import {
  X,
  Award,
  Sparkles,
  CheckCircle2,
  Cpu,
  Layers,
  Flame,
  Recycle,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { Project } from '../types';

interface ExhibitionKioskModeProps {
  project: Project;
  onClose: () => void;
  onLaunchSimulation: () => void;
}

export const ExhibitionKioskMode: React.FC<ExhibitionKioskModeProps> = ({
  project,
  onClose,
  onLaunchSimulation,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto text-slate-100 flex flex-col">
      {/* Kiosk Header */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-cyan-500/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-700/50">
                NATIONAL CHILDREN'S SCIENCE CONGRESS (NCSC)
              </span>
              <span className="text-xs text-slate-400 font-mono">• {project.code}</span>
            </div>
            <h1 className="text-lg font-black text-white tracking-tight">
              {project.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLaunchSimulation}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Interactive 3D Simulator</span>
          </button>

          <button
            onClick={onClose}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Exit Kiosk Mode</span>
          </button>
        </div>
      </header>

      {/* Main Exhibition Presentation Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-10 space-y-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            National Finalist Presentation & Defense Panel
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            AI-Driven Multi-Sensor Waste Segregation & Closed-Loop Resource Recovery
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Eliminating municipal landfill contamination at the point of ingestion through edge computer vision, capacitive moisture detection, inductive eddy current sensing, and autonomous mechanical servo routing.
          </p>
        </div>

        {/* 4 Key Scientific Findings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-3xl font-black text-emerald-400 font-mono mb-1">96.4%</div>
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-1">
              Segregation Accuracy
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Demonstrated across 50 consecutive empirical trials with wet, synthetic, and metallic objects.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-3xl font-black text-cyan-400 font-mono mb-1">0.0%</div>
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-1">
              Cross-Contamination
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Low-confidence items (&lt;65%) are diverted into quarantine, safeguarding biological digesters.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-3xl font-black text-amber-400 font-mono mb-1">820 ms</div>
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-1">
              Decision Latency
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Instant edge inference enables seamless public bin operation without human delay.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-3xl font-black text-purple-400 font-mono mb-1">&lt; $75</div>
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-1">
              Hardware BOM Cost
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Built using accessible components (ESP32, HX711, MG996R) scalable to municipal school kiosks.
            </p>
          </div>
        </div>

        {/* Methodology Flow Pipeline */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            End-to-End Cyber-Physical Processing Pipeline
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <span className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold text-xs flex items-center justify-center mx-auto font-mono">
                01
              </span>
              <h4 className="font-bold text-white text-xs">Waste Ingestion</h4>
              <p className="text-[11px] text-slate-400">
                Item placed on tare hopper; 24-bit HX711 records precise mass.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <span className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold text-xs flex items-center justify-center mx-auto font-mono">
                02
              </span>
              <h4 className="font-bold text-white text-xs">Multi-Modal Sensing</h4>
              <p className="text-[11px] text-slate-400">
                Resistive moisture probe + LJ12A3 inductive eddy current coil.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <span className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold text-xs flex items-center justify-center mx-auto font-mono">
                03
              </span>
              <h4 className="font-bold text-white text-xs">AI Vision Inference</h4>
              <p className="text-[11px] text-slate-400">
                MobileNetV3 Edge CNN analyzes texture, color, and geometry.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <span className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold text-xs flex items-center justify-center mx-auto font-mono">
                04
              </span>
              <h4 className="font-bold text-white text-xs">Servo Flap Routing</h4>
              <p className="text-[11px] text-slate-400">
                13kg-cm metal gear servo positions diverter chute to exact angle.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <span className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold text-xs flex items-center justify-center mx-auto font-mono">
                05
              </span>
              <h4 className="font-bold text-white text-xs">Dual Recovery</h4>
              <p className="text-[11px] text-slate-400">
                Wet &rarr; Biogas/Compost; Plastic &rarr; Pyrolysis liquid/wax.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Scientific Panels: Problem vs Innovation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-red-500/20 space-y-3">
            <h3 className="text-base font-bold text-red-300 flex items-center gap-2">
              The Real-World Crisis: Why Mixed Waste Fails
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc list-inside">
              <li>Manual post-collection segregation results in &gt;40% cross-contamination.</li>
              <li>Organic moisture seeps into paper and plastics, rendering them unrecyclable.</li>
              <li>Anaerobic digestion digesters sour and fail when synthetic plastics contaminate organic slurry.</li>
              <li>Open dumps emit methane uncontrollably, sparking toxic subterranean fires.</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-emerald-500/20 space-y-3">
            <h3 className="text-base font-bold text-emerald-300 flex items-center gap-2">
              Our Innovation: Point-of-Ingestion Segregation
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc list-inside">
              <li>Autonomous decision-making removes human apathy and sorting errors.</li>
              <li>Sensory redundancy (camera + conductivity + eddy current) prevents spoofing.</li>
              <li>Enables direct piping into localized anaerobic micro-digesters for school canteen biogas.</li>
              <li>Strict non-hazardous conceptual design complies with scientific safety codes.</li>
            </ul>
          </div>
        </div>

        {/* Call to action */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-cyan-900/40 via-blue-900/30 to-slate-900 border border-cyan-500/40 text-center space-y-4">
          <h3 className="text-xl font-black text-white">Experience the 3D Cyber-Physical Simulation</h3>
          <p className="text-xs text-slate-300 max-w-xl mx-auto">
            Interact with the virtual smart bin, choose from 9 test items, inspect internal sensors, and observe live telemetry and servo movements.
          </p>
          <button
            onClick={onLaunchSimulation}
            className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-500/30 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open 3D Virtual Exhibition Model</span>
          </button>
        </div>
      </main>
    </div>
  );
};
