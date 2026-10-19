import React from 'react';
import { X, Navigation, Zap, Flame, Camera, DollarSign, Compass } from 'lucide-react';
import { WORLD_SIZE } from '../game/city';

interface CityMapModalProps {
  playerX: number;
  playerY: number;
  playerAngle: number;
  onClose: () => void;
}

export const CityMapModal: React.FC<CityMapModalProps> = ({
  playerX,
  playerY,
  playerAngle,
  onClose,
}) => {
  // Map dimensions: 4400 x 4400
  const normX = (playerX / WORLD_SIZE) * 100;
  const normY = (playerY / WORLD_SIZE) * 100;

  const districts = [
    { name: 'Skyline Downtown', x: 45, y: 38, color: '#38BDF8' },
    { name: 'Emerald Central Park', x: 33, y: 18, color: '#10B981' },
    { name: 'Ocean Marina & Beach', x: 80, y: 80, color: '#06B6D4' },
    { name: 'West Industrial Docks', x: 18, y: 80, color: '#F59E0B' },
    { name: 'Sunset Residential Hills', x: 18, y: 33, color: '#A855F7' },
    { name: 'Highland Financial Core', x: 66, y: 33, color: '#EC4899' },
  ];

  const landmarks = [
    { type: 'station', label: 'Downtown Pit Stop', x: (2150 / WORLD_SIZE) * 100, y: (1720 / WORLD_SIZE) * 100 },
    { type: 'station', label: 'Sunset Service Garage', x: (1020 / WORLD_SIZE) * 100, y: (1720 / WORLD_SIZE) * 100 },
    { type: 'station', label: 'Ocean Coastal Fuel', x: (3220 / WORLD_SIZE) * 100, y: (2520 / WORLD_SIZE) * 100 },
    { type: 'station', label: 'North Expressway Pit Stop', x: (1720 / WORLD_SIZE) * 100, y: (480 / WORLD_SIZE) * 100 },
    { type: 'ramp', label: 'Mega Ramp', x: (1750 / WORLD_SIZE) * 100, y: (1730 / WORLD_SIZE) * 100 },
    { type: 'ramp', label: 'Skyline Launch', x: (2600 / WORLD_SIZE) * 100, y: (2150 / WORLD_SIZE) * 100 },
    { type: 'camera', label: 'Highway Speed Radar', x: (2600 / WORLD_SIZE) * 100, y: (1400 / WORLD_SIZE) * 100 },
    { type: 'camera', label: 'Avenue Radar', x: (1800 / WORLD_SIZE) * 100, y: (2200 / WORLD_SIZE) * 100 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-4 md:p-6 select-none overflow-y-auto">
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
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-6 h-6 text-emerald-400" />
              <span>Metropolis <span className="text-emerald-400">GPS Map</span></span>
            </h2>
            <p className="text-xs text-slate-400">Full Open World District & Landmarks Overview</p>
          </div>
        </div>

        {/* Player Coordinate readout */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-xs text-slate-300">
          <Navigation className="w-3.5 h-3.5 text-red-500" />
          <span>GPS: X:{Math.round(playerX)} Y:{Math.round(playerY)}</span>
        </div>
      </div>

      {/* Center Interactive Map Graphic */}
      <div className="flex-1 max-w-2xl w-full mx-auto my-3 flex items-center justify-center">
        <div className="relative w-full aspect-square max-w-[500px] bg-slate-900/90 border-2 border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl p-2">
          {/* Subtle Grid */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '25px 25px',
            }}
          />

          {/* Central Park Lake */}
          <div 
            className="absolute rounded-full bg-cyan-600/40 border border-cyan-400/40"
            style={{
              left: '28%',
              top: '12%',
              width: '14%',
              height: '12%',
            }}
          />

          {/* Ocean Water on East */}
          <div 
            className="absolute right-0 top-0 bottom-0 bg-blue-600/30 border-l border-blue-400/30"
            style={{ width: '22%' }}
          />

          {/* Major Roads Lines */}
          {/* Verticals */}
          {[9, 25, 41, 59, 75, 91].map((pct, idx) => (
            <div 
              key={`v_${idx}`}
              className="absolute top-0 bottom-0 bg-slate-700/70 w-1.5 md:w-2"
              style={{ left: `${pct}%` }}
            />
          ))}

          {/* Horizontals */}
          {[9, 25, 41, 59, 77, 91].map((pct, idx) => (
            <div 
              key={`h_${idx}`}
              className="absolute left-0 right-0 bg-slate-700/70 h-1.5 md:h-2"
              style={{ top: `${pct}%` }}
            />
          ))}

          {/* Districts Labels */}
          {districts.map((d) => (
            <div
              key={d.name}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
              style={{ left: `${d.x}%`, top: `${d.y}%` }}
            >
              <span 
                className="text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs shadow-sm whitespace-nowrap"
                style={{ color: d.color, backgroundColor: 'rgba(15, 23, 42, 0.75)' }}
              >
                {d.name}
              </span>
            </div>
          ))}

          {/* Landmarks / POIs */}
          {landmarks.map((lm, i) => (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
              style={{ left: `${lm.x}%`, top: `${lm.y}%` }}
              title={lm.label}
            >
              {lm.type === 'station' && (
                <div className="w-4 h-4 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-[8px] text-white shadow-[0_0_8px_#10B981]">
                  ⚡
                </div>
              )}
              {lm.type === 'ramp' && (
                <div className="w-4 h-4 rounded-full bg-amber-500 border border-white flex items-center justify-center text-[8px] text-white shadow-[0_0_8px_#F59E0B]">
                  🚀
                </div>
              )}
              {lm.type === 'camera' && (
                <div className="w-4 h-4 rounded-full bg-pink-500 border border-white flex items-center justify-center text-[8px] text-white shadow-[0_0_8px_#EC4899]">
                  📷
                </div>
              )}
            </div>
          ))}

          {/* Live Player Position Blip */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none transition-all duration-75"
            style={{ left: `${normX}%`, top: `${normY}%` }}
          >
            <div className="relative flex items-center justify-center">
              {/* Pulsing ring */}
              <div className="absolute w-8 h-8 rounded-full bg-red-500/30 animate-ping" />
              {/* Core car blip */}
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-[0_0_12px_#EF4444]" />
              {/* Direction pointer */}
              <div 
                className="absolute w-2 h-5 bg-white -mt-3 rounded-sm shadow-sm"
                style={{ transform: `rotate(${playerAngle + Math.PI / 2}rad)` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Map Legend */}
      <div className="w-full max-w-xl mx-auto flex flex-col gap-3">
        {/* Legend Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300 bg-slate-900/80 border border-slate-800 p-2.5 rounded-2xl">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>You</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] text-white font-bold">⚡</div>
            <span>Repair Station</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500 flex items-center justify-center text-[8px] text-white font-bold">🚀</div>
            <span>Stunt Ramp</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-pink-500 flex items-center justify-center text-[8px] text-white font-bold">📷</div>
            <span>Speed Trap</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-yellow-400 flex items-center justify-center text-[8px] text-slate-950 font-bold">$</div>
            <span>Coins</span>
          </div>
        </div>

        {/* Back to Driving Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
        >
          <span>RESUME DRIVING</span>
        </button>
      </div>
    </div>
  );
};
