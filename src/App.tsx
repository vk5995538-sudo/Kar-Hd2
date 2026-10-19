import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameCanvas, GameCanvasHandles } from './game/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { HomeScreen } from './components/HomeScreen';
import { GarageModal } from './components/GarageModal';
import { CityMapModal } from './components/CityMapModal';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { PauseModal } from './components/PauseModal';
import { GameOverOrRepairModal } from './components/GameOverOrRepairModal';
import { GameScreen, GameSettings, UserProgress } from './game/types';
import { INITIAL_CARS, loadUserProgress, saveUserProgress } from './game/cars';
import { audio } from './game/audio';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('HOME');
  const [userProgress, setUserProgress] = useState<UserProgress>(loadUserProgress());
  const [settings, setSettings] = useState<GameSettings>({
    sfxVolume: 0.8,
    musicVolume: 0.5,
    controlType: 'buttons',
    vibration: true,
    showFPS: false,
    speedUnit: 'kmh',
    selectedRadioStation: 0,
  });

  const [isPaused, setIsPaused] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState(false);

  // HUD live data
  const [hudData, setHudData] = useState({
    speedKmh: 0,
    gear: '1',
    rpm: 0.2,
    health: 100,
    maxHealth: 100,
    nitro: 1.0,
    driftScore: 0,
    driftMultiplier: 1.0,
    playerX: 1800,
    playerY: 1800,
    playerAngle: 0,
    coins: userProgress.coins,
    isAirborne: false,
  });

  // Game canvas handles ref
  const canvasHandlesRef = useRef<GameCanvasHandles | null>(null);

  const selectedCar = INITIAL_CARS.find(c => c.id === userProgress.selectedCarId) || INITIAL_CARS[0];

  // Save progress changes
  useEffect(() => {
    saveUserProgress(userProgress);
  }, [userProgress]);

  // Handle coins earned (drifting, coin pickups, secret bundles, stunt jumps, speed traps)
  const handleCoinsEarned = useCallback((amount: number, reason: string) => {
    setUserProgress((prev) => {
      const nextCoins = prev.coins + amount;
      return {
        ...prev,
        coins: nextCoins,
      };
    });
  }, []);

  // Handle stunt finish
  const handleStuntFinished = useCallback((airtime: number, reward: number) => {
    setUserProgress((prev) => ({
      ...prev,
      stuntsCompleted: prev.stuntsCompleted + 1,
      coins: prev.coins + reward,
    }));
  }, []);

  // Handle car wrecked / game over
  const handleGameOver = useCallback(() => {
    setIsGameOverOpen(true);
    setIsPaused(true);
  }, []);

  // Unlock car in garage
  const handleUnlockCar = useCallback((carId: string, price: number): boolean => {
    if (userProgress.coins < price) return false;

    setUserProgress((prev) => ({
      ...prev,
      coins: prev.coins - price,
      unlockedCarIds: [...prev.unlockedCarIds, carId],
      selectedCarId: carId,
    }));
    return true;
  }, [userProgress.coins]);

  // Select active car
  const handleSelectCar = useCallback((carId: string) => {
    setUserProgress((prev) => ({
      ...prev,
      selectedCarId: carId,
    }));
  }, []);

  // Change car color in garage
  const handleSetCarColor = useCallback((carId: string, colorHex: string) => {
    setUserProgress((prev) => ({
      ...prev,
      customCarColors: {
        ...prev.customCarColors,
        [carId]: colorHex,
      },
    }));
  }, []);

  // Repair and respawn from total loss
  const handleRepairAndRespawn = useCallback((cost: number) => {
    if (cost > 0) {
      setUserProgress((prev) => ({
        ...prev,
        coins: Math.max(0, prev.coins - cost),
      }));
    }
    canvasHandlesRef.current?.repairCar();
    canvasHandlesRef.current?.resetCar();
    setIsGameOverOpen(false);
    setIsPaused(false);
  }, []);

  // Global key navigation (Escape to pause, M for map)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (screen === 'PLAYING') {
          setIsPaused((p) => !p);
        } else if (screen === 'GARAGE' || screen === 'MAP' || screen === 'SETTINGS') {
          setScreen('PLAYING');
        }
      }
      if (e.code === 'KeyM') {
        if (screen === 'PLAYING') {
          setScreen('MAP');
        } else if (screen === 'MAP') {
          setScreen('PLAYING');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen]);

  return (
    <div className="relative w-screen h-screen h-dvh overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. Underlying Game Canvas (Always running 60fps in PLAYING or PAUSED state) */}
      {(screen === 'PLAYING' || isPaused || screen === 'MAP') && (
        <GameCanvas
          carConfig={selectedCar}
          userProgress={userProgress}
          settings={settings}
          isPaused={isPaused || screen === 'MAP'}
          onUpdateHUD={setHudData}
          onCoinsEarned={handleCoinsEarned}
          onStuntFinished={handleStuntFinished}
          onGameOver={handleGameOver}
          canvasRefCallback={(handles) => {
            canvasHandlesRef.current = handles;
          }}
        />
      )}

      {/* 2. In-Game HUD overlay (Only in PLAYING mode when not paused) */}
      {screen === 'PLAYING' && !isPaused && !isGameOverOpen && (
        <GameHUD
          handles={canvasHandlesRef.current}
          hudData={hudData}
          onPause={() => setIsPaused(true)}
          onOpenMap={() => setScreen('MAP')}
          controlType={settings.controlType}
        />
      )}

      {/* 3. Home Screen */}
      {screen === 'HOME' && (
        <HomeScreen
          userProgress={userProgress}
          selectedCar={selectedCar}
          onPlay={() => {
            setScreen('PLAYING');
            setIsPaused(false);
          }}
          onOpenGarage={() => setScreen('GARAGE')}
          onOpenMap={() => setScreen('MAP')}
          onOpenSettings={() => setScreen('SETTINGS')}
          onOpenHelp={() => setIsHelpOpen(true)}
        />
      )}

      {/* 4. Garage & Car Customization Showroom */}
      {screen === 'GARAGE' && (
        <GarageModal
          cars={INITIAL_CARS}
          userProgress={userProgress}
          onSelectCar={handleSelectCar}
          onUnlockCar={handleUnlockCar}
          onSetCarColor={handleSetCarColor}
          onClose={() => setScreen('PLAYING')}
          onPlay={() => {
            setScreen('PLAYING');
            setIsPaused(false);
          }}
        />
      )}

      {/* 5. City GPS Map */}
      {screen === 'MAP' && (
        <CityMapModal
          playerX={hudData.playerX}
          playerY={hudData.playerY}
          playerAngle={hudData.playerAngle}
          onClose={() => setScreen('PLAYING')}
        />
      )}

      {/* 6. Settings Modal */}
      {screen === 'SETTINGS' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={(newVals) => setSettings((s) => ({ ...s, ...newVals }))}
          onClose={() => setScreen('HOME')}
        />
      )}

      {/* 7. Help & Controls Modal */}
      {isHelpOpen && (
        <HelpModal onClose={() => setIsHelpOpen(false)} />
      )}

      {/* 8. Pause Modal */}
      {isPaused && !isGameOverOpen && screen === 'PLAYING' && (
        <PauseModal
          onResume={() => setIsPaused(false)}
          onRestart={() => canvasHandlesRef.current?.resetCar()}
          onOpenGarage={() => setScreen('GARAGE')}
          onOpenMap={() => setScreen('MAP')}
          onOpenSettings={() => setScreen('SETTINGS')}
          onHome={() => {
            setIsPaused(false);
            setScreen('HOME');
          }}
        />
      )}

      {/* 9. Car Totaled / Emergency Tow Modal */}
      {isGameOverOpen && (
        <GameOverOrRepairModal
          userCoins={userProgress.coins}
          onRepairAndRespawn={handleRepairAndRespawn}
          onOpenGarage={() => {
            setIsGameOverOpen(false);
            setScreen('GARAGE');
          }}
          onHome={() => {
            setIsGameOverOpen(false);
            setScreen('HOME');
          }}
        />
      )}
    </div>
  );
}
