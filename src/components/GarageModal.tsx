import React, { useState } from 'react';
import { X, Check, Lock, Zap, Shield, Flame, Sparkles, ArrowLeft, ArrowRight, Palette } from 'lucide-react';
import { CarConfig, UserProgress } from '../game/types';
import { COLOR_PALETTES } from '../game/cars';
import { audio } from '../game/audio';

interface GarageModalProps {
  cars: CarConfig[];
  userProgress: UserProgress;
  onSelectCar: (carId: string) => void;
  onUnlockCar: (carId: string, price: number) => boolean;
  onSetCarColor: (carId: string, colorHex: string) => void;
  onClose: () => void;
  onPlay: () => void;
}

export const GarageModal: React.FC<GarageModalProps> = ({
  cars,
  userProgress,
  onSelectCar,
  onUnlockCar,
  onSetCarColor,
  onClose,
  onPlay,
}) => {
  const initialIndex = Math.max(0, cars.findIndex(c => c.id === userProgress.selectedCarId));
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  const car = cars[selectedIndex];
  const isUnlocked = userProgress.unlockedCarIds.includes(car.id);
  const isSelected = userProgress.selectedCarId === car.id;
  const currentColor = userProgress.customCarColors[car.id] || car.baseColor;

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : cars.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < cars.length - 1 ? prev + 1 : 0));
  };

  const handleBuy = () => {
    const success = onUnlockCar(car.id, car.price);
    if (success) {
      audio.playCoin();
      onSelectCar(car.id);
    }
  };

  const handleSelect = () => {
    onSelectCar(car.id);
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
              City Garage <span className="text-red-500">& Showroom</span>
            </h2>
            <p className="text-xs text-slate-400">Unlock & customize your open-world fleet</p>
          </div>
        </div>

        {/* User Coins Balance */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl shadow-xl">
          <span className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 font-black text-xs">
            $
          </span>
          <span className="font-mono tabular-nums font-bold text-amber-300 text-base md:text-lg">
            {userProgress.coins.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Showcase Stage */}
      <div className="flex-1 max-w-4xl w-full mx-auto my-4 flex flex-col items-center justify-center">
        {/* Carousel Navigator */}
        <div className="relative w-full flex items-center justify-between">
          <button
            onClick={handlePrev}
            className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white shadow-xl active:scale-90 transition-all z-20"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          {/* Car Display Stage */}
          <div className="flex-1 flex flex-col items-center px-4">
            {/* Showroom Spotlight Pedestal */}
            <div className="relative flex flex-col items-center justify-center py-6 w-full max-w-lg">
              <div 
                className="absolute w-72 md:w-96 h-28 rounded-full blur-3xl opacity-35"
                style={{ backgroundColor: currentColor }}
              />

              {/* 2D Vector Car Graphic */}
              <div className="relative w-72 md:w-96 h-44 flex items-center justify-center">
                <svg 
                  viewBox="-45 -30 90 60" 
                  className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)] filter hover:scale-105 transition-transform duration-300"
                >
                  {/* Wheels */}
                  <rect x="-35" y="-26" width="18" height="8" rx="3" fill="#090D16" />
                  <rect x="17" y="-26" width="18" height="8" rx="3" fill="#090D16" />
                  <rect x="-35" y="18" width="18" height="8" rx="3" fill="#090D16" />
                  <rect x="17" y="18" width="18" height="8" rx="3" fill="#090D16" />

                  {/* Body Exterior */}
                  <rect x="-40" y="-21" width="80" height="42" rx="10" fill={currentColor} />

                  {/* Accent stripe */}
                  <rect x="-38" y="-4" width="76" height="8" fill={car.accentColor} />

                  {/* Hood scoop */}
                  <rect x="16" y="-8" width="12" height="16" rx="2" fill="#0F172A" />

                  {/* Windshield */}
                  <rect x="-18" y="-16" width="34" height="32" rx="6" fill="#020617" />
                  <path d="M-6 -14 L-1 -14 L-11 14 L-16 14 Z" fill="rgba(255,255,255,0.3)" />

                  {/* Spoiler */}
                  <rect x="-42" y="-19" width="6" height="38" rx="2" fill={car.accentColor} />

                  {/* Headlights */}
                  <rect x="37" y="-17" width="4" height="10" rx="2" fill="#FEF08A" />
                  <rect x="37" y="7" width="4" height="10" rx="2" fill="#FEF08A" />

                  {/* Brake lights */}
                  <rect x="-41" y="-17" width="4" height="10" rx="1" fill="#EF4444" />
                  <rect x="-41" y="7" width="4" height="10" rx="1" fill="#EF4444" />
                </svg>
              </div>

              {/* Locked Watermark Badge if not owned */}
              {!isUnlocked && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-slate-900 border border-amber-500/50 flex items-center justify-center shadow-2xl">
                    <Lock className="w-7 h-7 text-amber-400" />
                  </div>
                  <span className="font-mono text-amber-300 font-bold text-lg mt-2">
                    ${car.price.toLocaleString()} COINS
                  </span>
                </div>
              )}
            </div>

            {/* Car Name & Description */}
            <div className="text-center mt-1">
              <span className="text-xs font-bold uppercase tracking-widest text-red-400">
                {car.category} VEHICLE
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-white">{car.name}</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">{car.description}</p>
            </div>

            {/* Performance Stats Bars */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-xl mt-4">
              {/* Top Speed */}
              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" /> Top Speed
                  </span>
                  <span className="font-mono tabular-nums text-white font-bold">
                    {Math.round(car.maxSpeed * 0.32)} km/h
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-400" 
                    style={{ width: `${(car.maxSpeed / 850) * 100}%` }}
                  />
                </div>
              </div>

              {/* Acceleration */}
              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    <Flame className="w-3.5 h-3.5 text-amber-400" /> Acceleration
                  </span>
                  <span className="font-mono tabular-nums text-white font-bold">
                    {Math.round((car.acceleration / 650) * 100)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-400" 
                    style={{ width: `${(car.acceleration / 650) * 100}%` }}
                  />
                </div>
              </div>

              {/* Durability */}
              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" /> Armor / Health
                  </span>
                  <span className="font-mono tabular-nums text-white font-bold">{car.maxHealth} HP</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400" 
                    style={{ width: `${(car.maxHealth / 250) * 100}%` }}
                  />
                </div>
              </div>

              {/* Drift Rating */}
              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Drift Index
                  </span>
                  <span className="font-mono tabular-nums text-white font-bold">{car.driftFactor}x</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-400" 
                    style={{ width: `${(car.driftFactor / 2.5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Coin Multiplier */}
              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    💰 Cash Boost
                  </span>
                  <span className="font-mono tabular-nums text-amber-400 font-bold">{car.coinMultiplier}x</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-400" 
                    style={{ width: `${(car.coinMultiplier / 2.5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Nitro Tank */}
              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    ⚡ Nitro Capacity
                  </span>
                  <span className="font-mono tabular-nums text-cyan-400 font-bold">{car.nitroCapacity}s</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-400" 
                    style={{ width: `${(car.nitroCapacity / 8.0) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Custom Color Palette Selector (Only if unlocked) */}
            {isUnlocked && (
              <div className="flex items-center gap-2 mt-4 bg-slate-900/80 border border-slate-800 p-2 rounded-2xl">
                <div className="flex items-center gap-1.5 px-2 text-xs text-slate-400 font-semibold">
                  <Palette className="w-4 h-4 text-slate-300" />
                  <span>Paint:</span>
                </div>
                <div className="flex items-center gap-2">
                  {COLOR_PALETTES.map((cp) => (
                    <button
                      key={cp.name}
                      onClick={() => onSetCarColor(car.id, cp.hex)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${currentColor === cp.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: cp.hex }}
                      title={cp.name}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleNext}
            className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white shadow-xl active:scale-90 transition-all z-20"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Bottom CTA Action Bar */}
      <div className="w-full max-w-md mx-auto flex items-center gap-3">
        {isUnlocked ? (
          isSelected ? (
            <button
              onClick={() => {
                onClose();
                onPlay();
              }}
              className="flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 transition-all"
            >
              <Check className="w-5 h-5" />
              <span>DRIVE THIS CAR</span>
            </button>
          ) : (
            <button
              onClick={handleSelect}
              className="flex-1 py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition-all"
            >
              <span>SELECT CAR</span>
            </button>
          )
        ) : (
          <button
            onClick={handleBuy}
            disabled={userProgress.coins < car.price}
            className={`flex-1 py-4 rounded-2xl font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all ${userProgress.coins >= car.price ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
          >
            <Lock className="w-5 h-5" />
            <span>UNLOCK FOR ${car.price.toLocaleString()}</span>
          </button>
        )}
      </div>
    </div>
  );
};
