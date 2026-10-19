import React from 'react';
import { X, Smartphone, Keyboard, Sparkles, Zap, DollarSign, ShieldAlert, Award } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-4 md:p-8 select-none overflow-y-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
              How To Play & <span className="text-red-500">Controls</span>
            </h2>
            <p className="text-xs text-slate-400">Master the open-world streets and score bonuses</p>
          </div>
        </div>
      </div>

      {/* Guide Content */}
      <div className="flex-1 max-w-2xl w-full mx-auto my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mobile Touch Controls */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-sm font-bold text-cyan-400">
            <Smartphone className="w-4 h-4" />
            <span>Mobile Phone Controls</span>
          </div>
          <ul className="text-xs text-slate-300 flex flex-col gap-2">
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center font-bold text-cyan-300">◀ ▶</span>
              <span>Steer Left & Right (left thumb)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-emerald-700 flex items-center justify-center font-bold text-white">▲</span>
              <span>Gas Pedal: Accelerate forward</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-red-700 flex items-center justify-center font-bold text-white">▼</span>
              <span>Brake / Hold to Reverse</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-amber-600 flex items-center justify-center font-bold text-white">⚡</span>
              <span>Handbrake / Drift: Initiate power slide</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-cyan-600 flex items-center justify-center font-bold text-white">🔥</span>
              <span>Nitro Boost: Instant rocket speed</span>
            </li>
          </ul>
        </div>

        {/* Desktop Keyboard Controls */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
            <Keyboard className="w-4 h-4" />
            <span>Keyboard Shortcuts</span>
          </div>
          <ul className="text-xs text-slate-300 flex flex-col gap-2">
            <li className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-800 font-mono font-bold text-amber-300">W / ↑</span>
              <span>Accelerate</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-800 font-mono font-bold text-amber-300">S / ↓</span>
              <span>Brake / Reverse</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-800 font-mono font-bold text-amber-300">A / D</span>
              <span>Steer Left & Right</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-800 font-mono font-bold text-amber-300">Space</span>
              <span>Handbrake / Drift</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-800 font-mono font-bold text-amber-300">Shift</span>
              <span>Nitro Boost</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-800 font-mono font-bold text-amber-300">H / M / R</span>
              <span>Horn / GPS Map / Reset Car</span>
            </li>
          </ul>
        </div>

        {/* Earning Coins & Stunts */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
            <DollarSign className="w-4 h-4" />
            <span>Earning Coins & Upgrades</span>
          </div>
          <ul className="text-xs text-slate-300 flex flex-col gap-1.5">
            <li>• <strong>Street Coins:</strong> Collect golden coins on roads & secret bundles ($100) in alleys.</li>
            <li>• <strong>Drift Combos:</strong> Slide smoothly around corners. Longer drifts multiply bonus cash!</li>
            <li>• <strong>Speed Traps:</strong> Blast through highway radar cameras at &gt;110 km/h to trigger cash flashes.</li>
            <li>• <strong>Stunt Ramps:</strong> Hit launch ramps at high speed for big airtime rewards!</li>
          </ul>
        </div>

        {/* City Rules & Survival */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-sm font-bold text-purple-400">
            <ShieldAlert className="w-4 h-4" />
            <span>Traffic & Pit Stops</span>
          </div>
          <ul className="text-xs text-slate-300 flex flex-col gap-1.5">
            <li>• <strong>Avoid Traffic:</strong> Taxis, sedans and vans drive across city lanes. Watch your speed!</li>
            <li>• <strong>Repair Stations (⚡):</strong> Visit green service stations to repair car health & refill nitro.</li>
            <li>• <strong>Garage Fleet:</strong> Save up coins to unlock faster hypercars and heavy trucks in the Garage.</li>
          </ul>
        </div>
      </div>

      {/* Close Button */}
      <div className="w-full max-w-md mx-auto">
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
        >
          <span>LET'S DRIVE!</span>
        </button>
      </div>
    </div>
  );
};
