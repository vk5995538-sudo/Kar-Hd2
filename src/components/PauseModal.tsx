import React from 'react';
import { Play, RotateCcw, Wrench, MapPin, Home, Settings as SettingsIcon } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenGarage: () => void;
  onOpenMap: () => void;
  onOpenSettings: () => void;
  onHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onOpenGarage,
  onOpenMap,
  onOpenSettings,
  onHome,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-3">
        <h3 className="text-2xl font-black text-white uppercase tracking-wider">
          GAME <span className="text-red-500">PAUSED</span>
        </h3>
        <p className="text-xs text-slate-400 text-center mb-2">Take a breather or customize your ride</p>

        {/* Resume Button */}
        <button
          onClick={onResume}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-95 transition-all"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>RESUME DRIVING</span>
        </button>

        {/* Reset / Respawn Car */}
        <button
          onClick={() => {
            onRestart();
            onResume();
          }}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
          <span>RESPAWN ON ROAD</span>
        </button>

        {/* City Map */}
        <button
          onClick={onOpenMap}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span>CITY GPS MAP</span>
        </button>

        {/* Garage */}
        <button
          onClick={onOpenGarage}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Wrench className="w-4 h-4 text-cyan-400" />
          <span>CHANGE CAR / GARAGE</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <SettingsIcon className="w-4 h-4 text-slate-400" />
          <span>SETTINGS</span>
        </button>

        {/* Return to Home Screen */}
        <button
          onClick={onHome}
          className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors mt-1"
        >
          <Home className="w-4 h-4" />
          <span>Exit to Main Menu</span>
        </button>
      </div>
    </div>
  );
};
