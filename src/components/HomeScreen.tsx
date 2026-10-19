import React from 'react';
import { Play, Wrench, MapPin, Settings as SettingsIcon, Sparkles, Trophy, Zap, Shield, HelpCircle } from 'lucide-react';
import { CarConfig, UserProgress } from '../game/types';
import { audio } from '../game/audio';

interface HomeScreenProps {
  userProgress: UserProgress;
  selectedCar: CarConfig;
  onPlay: () => void;
  onOpenGarage: () => void;
  onOpenMap: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userProgress,
  selectedCar,
  onPlay,
  onOpenGarage,
  onOpenMap,
  onOpenSettings,
  onOpenHelp,
}) => {
  const customColor = userProgress.customCarColors[selectedCar.id] || selectedCar.baseColor;

  return (
    <div className="relative w-full h-screen h-dvh bg-slate-950 text-white flex flex-col justify-between p-4 md:p-8 overflow-hidden select-none">
      {/* Background City Skyline & Grid Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(220,38,38,0.22),rgba(255,255,255,0))]" />
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top Bar: Brand, Coins Wallet, Settings */}
      <div className="relative z-10 w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-black text-xl shadow-[0_0_15px_#EF4444]">
            🏎️
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-wider uppercase text-white">
              Open World <span className="text-red-500">Car Game</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Free Roam 2D City Driving Simulator</p>
          </div>
        </div>

        {/* Coins Wallet & Audio Toggle */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-2xl shadow-xl">
            <span className="w-5 h-5 rounded-full bg-amber-400 border border-amber-300 flex items-center justify-center text-slate-950 font-black text-xs shadow-[0_0_8px_#F59E0B]">
              $
            </span>
            <span className="font-mono tabular-nums font-bold text-amber-300 text-base md:text-lg">
              {userProgress.coins.toLocaleString()}
            </span>
          </div>

          <button
            onClick={onOpenSettings}
            className="w-11 h-11 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white shadow-xl active:scale-95 transition-all"
            title="Settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Showcase: Selected Car in Showroom Spotlight */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-auto">
        {/* Glow Pedestal */}
        <div className="relative flex flex-col items-center">
          <div className="absolute -bottom-6 w-72 md:w-96 h-20 bg-red-600/25 rounded-full blur-2xl" />

          {/* 2D Vector Car Hero Graphic */}
          <div className="relative p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md shadow-2xl flex flex-col items-center">
            {/* Animated Car Canvas Preview */}
            <div className="relative w-64 md:w-80 h-36 flex items-center justify-center">
              <svg 
                viewBox="-40 -25 80 50" 
                className="w-full h-full drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] filter hover:scale-105 transition-transform duration-300"
              >
                {/* Wheels */}
                <rect x="-30" y="-22" width="16" height="7" rx="3" fill="#090D16" />
                <rect x="14" y="-22" width="16" height="7" rx="3" fill="#090D16" />
                <rect x="-30" y="15" width="16" height="7" rx="3" fill="#090D16" />
                <rect x="14" y="15" width="16" height="7" rx="3" fill="#090D16" />

                {/* Body */}
                <rect x="-34" y="-18" width="68" height="36" rx="9" fill={customColor} />

                {/* Racing Accent */}
                <rect x="-32" y="-3" width="64" height="6" fill={selectedCar.accentColor} />

                {/* Hood Scoop */}
                <rect x="14" y="-7" width="10" height="14" rx="2" fill="#0F172A" />

                {/* Cabin Windshield */}
                <rect x="-16" y="-14" width="28" height="28" rx="5" fill="#020617" />
                <path d="M-6 -12 L-2 -12 L-10 12 L-14 12 Z" fill="rgba(255,255,255,0.25)" />

                {/* Spoiler */}
                <rect x="-36" y="-16" width="5" height="32" rx="2" fill={selectedCar.accentColor} />

                {/* Headlights */}
                <rect x="31" y="-15" width="4" height="8" rx="2" fill="#FEF08A" />
                <rect x="31" y="7" width="4" height="8" rx="2" fill="#FEF08A" />

                {/* Tail lights */}
                <rect x="-35" y="-15" width="3" height="8" rx="1" fill="#EF4444" />
                <rect x="-35" y="7" width="3" height="8" rx="1" fill="#EF4444" />
              </svg>
            </div>

            {/* Car Name & Category Badge */}
            <div className="text-center mt-2">
              <span className="text-xs uppercase tracking-widest text-red-400 font-extrabold">
                {selectedCar.category} CLASS
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide">
                {selectedCar.name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{selectedCar.subtitle}</p>
            </div>

            {/* Quick Car Stats Badges */}
            <div className="flex items-center gap-4 mt-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>{Math.round(selectedCar.maxSpeed * 0.32)} KM/H</span>
              </div>
              <span className="text-slate-600">·</span>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>{selectedCar.maxHealth} HP</span>
              </div>
              <span className="text-slate-600">·</span>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{selectedCar.coinMultiplier}x COINS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions: Play Game (Primary CTA), Garage, Map */}
      <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col gap-3">
        {/* Big Prominent Play Button */}
        <button
          onClick={() => {
            audio.init();
            audio.resume();
            onPlay();
          }}
          className="group w-full py-4 md:py-5 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-lg md:text-xl tracking-wider uppercase flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(239,68,68,0.5)] active:scale-98 transition-all cursor-pointer"
        >
          <Play className="w-7 h-7 fill-white group-hover:scale-110 transition-transform" />
          <span>PLAY GAME</span>
        </button>

        {/* Secondary Navigation Row: Garage, Map, Help */}
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <button
            onClick={onOpenGarage}
            className="py-3 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center gap-2 text-xs md:text-sm font-bold text-slate-200 hover:text-white shadow-lg active:scale-95 transition-all"
          >
            <Wrench className="w-4 h-4 text-cyan-400" />
            <span>GARAGE</span>
          </button>

          <button
            onClick={onOpenMap}
            className="py-3 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center gap-2 text-xs md:text-sm font-bold text-slate-200 hover:text-white shadow-lg active:scale-95 transition-all"
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>CITY MAP</span>
          </button>

          <button
            onClick={onOpenHelp}
            className="py-3 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center gap-2 text-xs md:text-sm font-bold text-slate-200 hover:text-white shadow-lg active:scale-95 transition-all"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>HOW TO PLAY</span>
          </button>
        </div>

        {/* Control Hint Footer */}
        <p className="text-center text-[11px] text-slate-500 font-medium">
          Touch controls on Android · WASD / Arrows on Desktop · Esc to Pause
        </p>
      </div>
    </div>
  );
};
