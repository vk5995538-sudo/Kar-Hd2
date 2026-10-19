import React from 'react';
import { Wrench, RotateCcw, Home, ShieldAlert } from 'lucide-react';
import { audio } from '../game/audio';

interface GameOverOrRepairModalProps {
  userCoins: number;
  onRepairAndRespawn: (cost: number) => void;
  onOpenGarage: () => void;
  onHome: () => void;
}

export const GameOverOrRepairModal: React.FC<GameOverOrRepairModalProps> = ({
  userCoins,
  onRepairAndRespawn,
  onOpenGarage,
  onHome,
}) => {
  const repairCost = userCoins >= 40 ? 40 : 0; // Free tow if broke!

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm bg-slate-900 border border-red-500/50 p-6 rounded-3xl shadow-[0_0_30px_rgba(239,68,68,0.3)] flex flex-col items-center gap-3 text-center">
        <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-xl mb-1">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h3 className="text-2xl font-black text-white uppercase tracking-wider">
          VEHICLE <span className="text-red-500">TOTALED!</span>
        </h3>
        <p className="text-xs text-slate-300 max-w-xs">
          Your car suffered critical crash impact damage. Call the emergency roadside tow service or visit the garage.
        </p>

        {/* Repair & Respawn Button */}
        <button
          onClick={() => {
            audio.playCoin();
            onRepairAndRespawn(repairCost);
          }}
          className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 transition-all"
        >
          <Wrench className="w-5 h-5" />
          <span>REPAIR & RESPAWN {repairCost > 0 ? `(-$${repairCost})` : '(FREE TOW)'}</span>
        </button>

        {/* Change Car in Garage */}
        <button
          onClick={onOpenGarage}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <RotateCcw className="w-4 h-4 text-cyan-400" />
          <span>SELECT ANOTHER CAR</span>
        </button>

        {/* Home Screen */}
        <button
          onClick={onHome}
          className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors mt-1"
        >
          <Home className="w-4 h-4" />
          <span>Exit to Main Menu</span>
        </button>
      </div>
    </div>
  );
};
