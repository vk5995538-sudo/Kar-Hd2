import React, { useState } from 'react';
import { 
  Pause, 
  Map as MapIcon, 
  Radio, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Zap, 
  Flame, 
  ShieldAlert, 
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { GameCanvasHandles } from '../game/GameCanvas';
import { audio } from '../game/audio';
import { WORLD_SIZE } from '../game/city';

interface GameHUDProps {
  handles: GameCanvasHandles | null;
  hudData: {
    speedKmh: number;
    gear: string;
    rpm: number;
    health: number;
    maxHealth: number;
    nitro: number;
    driftScore: number;
    driftMultiplier: number;
    playerX: number;
    playerY: number;
    playerAngle: number;
    coins: number;
    isAirborne: boolean;
  };
  onPause: () => void;
  onOpenMap: () => void;
  controlType: 'buttons' | 'wheel' | 'slider';
}

export const GameHUD: React.FC<GameHUDProps> = ({
  handles,
  hudData,
  onPause,
  onOpenMap,
  controlType,
}) => {
  const [radioStation, setRadioStation] = useState(audio.getRadioStation());
  const [isMuted, setIsMuted] = useState(audio.isMuted);

  const stations = audio.getRadioStationsList();

  const handleNextRadio = () => {
    const next = (radioStation + 1) % stations.length;
    audio.setRadioStation(next);
    setRadioStation(next);
  };

  const handleToggleMute = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
  };

  // Speedometer angle (from -120deg to +120deg)
  const maxSpeedGauge = 260;
  const speedClamped = Math.min(maxSpeedGauge, hudData.speedKmh);
  const gaugeAngle = -120 + (speedClamped / maxSpeedGauge) * 240;

  // Mini-radar coordinates normalized to 0-100%
  const radarX = Math.round((hudData.playerX / WORLD_SIZE) * 100);
  const radarY = Math.round((hudData.playerY / WORLD_SIZE) * 100);

  const healthPct = Math.max(0, Math.min(100, (hudData.health / hudData.maxHealth) * 100));
  const nitroPct = Math.max(0, Math.min(100, hudData.nitro * 100));

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-3 md:p-6 overflow-hidden">
      {/* Top Bar Header */}
      <div className="w-full flex items-start justify-between">
        {/* Top-Left: Mini-Radar & GPS */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMap}
            className="pointer-events-auto group relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md p-1.5 shadow-xl transition-all hover:scale-105 active:scale-95"
            title="Open City GPS Map (M)"
          >
            {/* Radar Grid Graphic */}
            <div className="w-full h-full rounded-xl bg-slate-950/90 relative overflow-hidden flex items-center justify-center">
              {/* Grid Lines */}
              <div className="absolute inset-0 border border-emerald-500/20 rounded-xl" />
              <div className="absolute w-full h-[1px] bg-emerald-500/20 top-1/2 -translate-y-1/2" />
              <div className="absolute h-full w-[1px] bg-emerald-500/20 left-1/2 -translate-x-1/2" />
              <div className="absolute w-12 h-12 rounded-full border border-emerald-500/20" />

              {/* Player Radar Blip */}
              <div 
                className="absolute w-3 h-3 bg-red-500 rounded-full shadow-[0_0_8px_#EF4444] -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
                style={{
                  left: `${radarX}%`,
                  top: `${radarY}%`,
                }}
              >
                {/* Heading needle */}
                <div 
                  className="w-1.5 h-3 bg-white mx-auto -mt-1 rounded-sm shadow-sm"
                  style={{ transform: `rotate(${hudData.playerAngle + Math.PI / 2}rad)` }}
                />
              </div>

              {/* Map icon tag */}
              <div className="absolute bottom-1 right-1 flex items-center gap-1 text-[9px] text-emerald-400 font-semibold bg-slate-900/90 px-1 py-0.5 rounded">
                <MapIcon className="w-2.5 h-2.5" />
                <span>GPS</span>
              </div>
            </div>
          </button>

          {/* Quick Stats: Coins & Health */}
          <div className="flex flex-col gap-1.5">
            {/* Coins */}
            <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/80 border border-slate-800 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-lg">
              <span className="w-5 h-5 rounded-full bg-amber-400 border border-amber-300 flex items-center justify-center text-slate-950 font-black text-xs shadow-[0_0_8px_#F59E0B]">
                $
              </span>
              <span className="font-mono tabular-nums font-bold text-amber-300 text-base md:text-lg">
                {hudData.coins.toLocaleString()}
              </span>
            </div>

            {/* Radio Station Switcher */}
            <button
              onClick={handleNextRadio}
              className="pointer-events-auto flex items-center gap-2 bg-slate-900/80 border border-slate-800 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg text-xs text-slate-300 hover:text-white transition-colors active:scale-95"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-medium truncate max-w-[110px] md:max-w-[150px]">
                {stations[radioStation].name}
              </span>
            </button>
          </div>
        </div>

        {/* Top-Right: Controls & Pause */}
        <div className="flex items-center gap-2">
          {/* Audio Mute */}
          <button
            onClick={handleToggleMute}
            className="pointer-events-auto w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md flex items-center justify-center text-slate-300 hover:text-white shadow-lg active:scale-95 transition-all"
            title="Mute Sound"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>

          {/* Reset / Flip Car */}
          <button
            onClick={() => handles?.resetCar()}
            className="pointer-events-auto w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md flex items-center justify-center text-slate-300 hover:text-white shadow-lg active:scale-95 transition-all"
            title="Reset / Flip Car (R)"
          >
            <RotateCcw className="w-5 h-5 text-amber-400" />
          </button>

          {/* Pause */}
          <button
            onClick={onPause}
            className="pointer-events-auto w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md flex items-center justify-center text-slate-300 hover:text-white shadow-lg active:scale-95 transition-all"
            title="Pause Game (Esc)"
          >
            <Pause className="w-5 h-5 text-slate-200" />
          </button>
        </div>
      </div>

      {/* Middle Center: Drift Score Popup & Stunt Banner */}
      <div className="w-full flex flex-col items-center justify-center text-center">
        {hudData.driftScore > 30 && (
          <div className="bg-slate-950/80 border border-amber-500/40 backdrop-blur-md px-5 py-2 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse">
            <div className="flex items-center gap-2 text-amber-400 font-black text-sm tracking-widest uppercase">
              <Sparkles className="w-4 h-4" />
              <span>DRIFTING</span>
            </div>
            <div className="font-mono tabular-nums text-2xl md:text-3xl font-extrabold text-white">
              {hudData.driftScore.toLocaleString()}
              <span className="text-amber-400 text-lg ml-1">x{hudData.driftMultiplier.toFixed(1)}</span>
            </div>
          </div>
        )}

        {hudData.isAirborne && (
          <div className="mt-2 bg-cyan-950/80 border border-cyan-400/50 backdrop-blur-md px-4 py-1.5 rounded-xl shadow-[0_0_15px_#00F0FF] animate-bounce">
            <span className="text-cyan-300 font-extrabold text-sm tracking-wider">🚀 MEGA AIRTIME!</span>
          </div>
        )}
      </div>

      {/* Bottom Area: Tactile Touch Controls & Speedometer */}
      <div className="w-full flex items-end justify-between gap-2 pb-1">
        {/* Left Touch Controls: Steering (◀ / ▶) + Horn */}
        <div className="pointer-events-auto flex flex-col items-start gap-3">
          {/* Secondary helper: Horn */}
          <button
            onPointerDown={() => handles?.setHorn(true)}
            onPointerUp={() => handles?.setHorn(false)}
            onPointerLeave={() => handles?.setHorn(false)}
            className="w-12 h-12 rounded-full bg-slate-900/85 border border-slate-700/80 backdrop-blur-md flex items-center justify-center text-slate-200 text-xs font-bold shadow-lg active:bg-amber-500 active:text-slate-950 active:scale-95 transition-transform"
            title="Honk Horn (H)"
          >
            📢
          </button>

          {/* Steering Buttons: Left & Right */}
          <div className="flex items-center gap-3">
            <button
              onPointerDown={() => handles?.setSteer(-1)}
              onPointerUp={() => handles?.setSteer(0)}
              onPointerLeave={() => handles?.setSteer(0)}
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-900/90 border border-slate-700 active:border-cyan-400 active:bg-cyan-500/30 backdrop-blur-md flex items-center justify-center text-white shadow-2xl active:scale-95 transition-transform touch-none"
              title="Steer Left (A / Left Arrow)"
            >
              <ArrowLeft className="w-8 h-8 md:w-10 md:h-10 text-cyan-300" />
            </button>

            <button
              onPointerDown={() => handles?.setSteer(1)}
              onPointerUp={() => handles?.setSteer(0)}
              onPointerLeave={() => handles?.setSteer(0)}
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-900/90 border border-slate-700 active:border-cyan-400 active:bg-cyan-500/30 backdrop-blur-md flex items-center justify-center text-white shadow-2xl active:scale-95 transition-transform touch-none"
              title="Steer Right (D / Right Arrow)"
            >
              <ArrowRight className="w-8 h-8 md:w-10 md:h-10 text-cyan-300" />
            </button>
          </div>
        </div>

        {/* Center: HD Speedometer & Status Gauges */}
        <div className="flex flex-col items-center gap-1.5 bg-slate-950/85 border border-slate-800/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl">
          {/* Speed Digital Readout */}
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono tabular-nums text-3xl md:text-4xl font-black text-white tracking-tight">
              {hudData.speedKmh}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              KM/H
            </span>
            <span className="ml-2 px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono font-bold text-xs">
              GEAR {hudData.gear}
            </span>
          </div>

          {/* Health & Nitro Bars */}
          <div className="w-36 md:w-44 flex flex-col gap-1">
            {/* Health Bar */}
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3 text-red-400 shrink-0" />
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-150 ${healthPct < 30 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}
                  style={{ width: `${healthPct}%` }}
                />
              </div>
              <span className="text-[10px] font-mono tabular-nums text-slate-400 shrink-0">
                {Math.round(healthPct)}%
              </span>
            </div>

            {/* Nitro Gauge */}
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-cyan-400 shrink-0" />
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-100 shadow-[0_0_8px_#00F0FF]"
                  style={{ width: `${nitroPct}%` }}
                />
              </div>
              <span className="text-[10px] font-mono tabular-nums text-cyan-400 shrink-0">
                {Math.round(nitroPct)}%
              </span>
            </div>
          </div>
        </div>

        {/* Right Touch Controls: Gas, Brake, Handbrake, Nitro */}
        <div className="pointer-events-auto flex items-end gap-3">
          {/* Nitro & Handbrake buttons */}
          <div className="flex flex-col gap-2.5">
            {/* Nitro Boost */}
            <button
              onPointerDown={() => handles?.setNitro(true)}
              onPointerUp={() => handles?.setNitro(false)}
              onPointerLeave={() => handles?.setNitro(false)}
              className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-cyan-600/90 border border-cyan-400 active:bg-cyan-400 backdrop-blur-md flex flex-col items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 transition-transform touch-none"
              title="Nitro Boost (Shift)"
            >
              <Flame className="w-6 h-6 text-white" />
              <span className="text-[9px] font-black uppercase tracking-wider">NITRO</span>
            </button>

            {/* Handbrake / Drift */}
            <button
              onPointerDown={() => handles?.setHandbrake(true)}
              onPointerUp={() => handles?.setHandbrake(false)}
              onPointerLeave={() => handles?.setHandbrake(false)}
              className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-amber-600/90 border border-amber-400 active:bg-amber-400 backdrop-blur-md flex flex-col items-center justify-center text-white shadow-xl active:scale-95 transition-transform touch-none"
              title="Handbrake / Drift (Space)"
            >
              <Zap className="w-6 h-6 text-white" />
              <span className="text-[9px] font-black uppercase tracking-wider">DRIFT</span>
            </button>
          </div>

          {/* Pedals: Brake/Reverse & Accelerate */}
          <div className="flex flex-col gap-2.5">
            {/* Accelerate / Gas Pedal */}
            <button
              onPointerDown={() => handles?.setThrottle(1)}
              onPointerUp={() => handles?.setThrottle(0)}
              onPointerLeave={() => handles?.setThrottle(0)}
              className="w-16 h-20 md:w-20 md:h-24 rounded-2xl bg-emerald-600/90 border border-emerald-400 active:bg-emerald-400 backdrop-blur-md flex flex-col items-center justify-center text-white shadow-2xl active:scale-95 transition-transform touch-none"
              title="Accelerate / Gas (W / Up Arrow)"
            >
              <ArrowUp className="w-8 h-8 md:w-10 md:h-10 text-white" />
              <span className="text-[10px] font-black uppercase tracking-wider mt-0.5">GAS</span>
            </button>

            {/* Brake / Reverse Pedal */}
            <button
              onPointerDown={() => handles?.setThrottle(-1)}
              onPointerUp={() => handles?.setThrottle(0)}
              onPointerLeave={() => handles?.setThrottle(0)}
              className="w-16 h-16 md:w-20 md:h-18 rounded-2xl bg-red-600/90 border border-red-400 active:bg-red-400 backdrop-blur-md flex flex-col items-center justify-center text-white shadow-xl active:scale-95 transition-transform touch-none"
              title="Brake / Reverse (S / Down Arrow)"
            >
              <ArrowDown className="w-7 h-7 md:w-8 md:h-8 text-white" />
              <span className="text-[10px] font-black uppercase tracking-wider mt-0.5">BRAKE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
