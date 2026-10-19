import React from 'react';
import { X, Volume2, Music, Smartphone, Vibrate, Gauge, Check } from 'lucide-react';
import { GameSettings } from '../game/types';
import { audio } from '../game/audio';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const handleSfxChange = (val: number) => {
    onUpdateSettings({ sfxVolume: val });
    audio.setSfxVolume(val);
  };

  const handleMusicChange = (val: number) => {
    onUpdateSettings({ musicVolume: val });
    audio.setMusicVolume(val);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-4 md:p-8 select-none overflow-y-auto">
      {/* Top Header */}
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
              Game <span className="text-red-500">Settings</span>
            </h2>
            <p className="text-xs text-slate-400">Audio, Controls & Display Preferences</p>
          </div>
        </div>
      </div>

      {/* Settings Options Container */}
      <div className="flex-1 max-w-xl w-full mx-auto my-6 flex flex-col gap-4">
        {/* Sound Effects Volume */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-200">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>Sound Effects (SFX)</span>
            </span>
            <span className="font-mono text-xs text-cyan-400 font-bold">
              {Math.round(settings.sfxVolume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.sfxVolume}
            onChange={(e) => handleSfxChange(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Music / Radio Volume */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-200">
              <Music className="w-4 h-4 text-purple-400" />
              <span>City Radio / Music</span>
            </span>
            <span className="font-mono text-xs text-purple-400 font-bold">
              {Math.round(settings.musicVolume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.musicVolume}
            onChange={(e) => handleMusicChange(parseFloat(e.target.value))}
            className="w-full accent-purple-400 cursor-pointer"
          />
        </div>

        {/* Mobile Touch Control Mode */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200 mb-3">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Mobile Steering Layout</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onUpdateSettings({ controlType: 'buttons' })}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${settings.controlType === 'buttons' ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-slate-850 border-slate-700 text-slate-400'}`}
            >
              <span>Left / Right Buttons</span>
              {settings.controlType === 'buttons' && <Check className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onUpdateSettings({ controlType: 'wheel' })}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${settings.controlType === 'wheel' ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-slate-850 border-slate-700 text-slate-400'}`}
            >
              <span>Dynamic Pedal Cluster</span>
              {settings.controlType === 'wheel' && <Check className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Haptic Vibration */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Vibrate className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-sm font-bold text-slate-200 block">Mobile Vibration / Haptics</span>
              <span className="text-xs text-slate-400">Tactile rumble on collisions & speed traps</span>
            </div>
          </div>
          <button
            onClick={() => onUpdateSettings({ vibration: !settings.vibration })}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${settings.vibration ? 'bg-amber-500' : 'bg-slate-700'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.vibration ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Speed Unit */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-sm font-bold text-slate-200 block">Speedometer Units</span>
              <span className="text-xs text-slate-400">Kilometers (KM/H) or Miles (MPH)</span>
            </div>
          </div>
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onUpdateSettings({ speedUnit: 'kmh' })}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${settings.speedUnit === 'kmh' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
            >
              KM/H
            </button>
            <button
              onClick={() => onUpdateSettings({ speedUnit: 'mph' })}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${settings.speedUnit === 'mph' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
            >
              MPH
            </button>
          </div>
        </div>
      </div>

      {/* Done / Close Button */}
      <div className="w-full max-w-md mx-auto">
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
        >
          <span>SAVE & CLOSE</span>
        </button>
      </div>
    </div>
  );
};
