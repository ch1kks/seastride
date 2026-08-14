import React from 'react';
import { useGame } from '../context/GameContext';
import { getShipImageForLevel, getCannonImageForLevel, getShieldImageForLevel } from '../assets';
import { useCutoutImage } from '../utils/imageUtils';
import { Shield, Sparkles, Heart, Wrench, ChevronUp } from 'lucide-react';

interface ShipDisplayProps {
  onInspectShip?: () => void;
  isHugeBuildMode?: boolean;
}

export const ShipDisplay: React.FC<ShipDisplayProps> = ({
  onInspectShip,
  isHugeBuildMode = true,
}) => {
  const {
    shipLevel,
    shipCondition,
    shipCurrentHp,
    shipMaxHp,
    cannonLevel,
    cannonCount,
    shieldLevel,
    equippedDecorations,
  } = useGame();

  const rawShipImg = getShipImageForLevel(shipLevel);
  const rawCannonImg = getCannonImageForLevel(cannonLevel);
  const rawShieldImg = getShieldImageForLevel(shieldLevel);

  // Opaque cutout hooks so ship/items have 0 background and 100% opaque bodies
  const shipImg = useCutoutImage(rawShipImg, { mode: 'edge' });
  const cannonImg = useCutoutImage(rawCannonImg);
  const shieldImg = useCutoutImage(rawShieldImg);

  const isCritical = shipCondition <= 0;
  const isLow = shipCondition <= 50;

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full my-2">
      {/* Container for Giant Ship - NO BOX, NO BORDER */}
      <div
        onClick={onInspectShip}
        className="relative cursor-pointer transition-transform hover:scale-105 active:scale-95 duration-300 flex flex-col items-center justify-center"
      >
        {/* Animated Water Reflection & Splash Base */}
        <div className="absolute -bottom-6 w-3/4 h-12 bg-sky-500/30 rounded-full blur-xl animate-pulse pointer-events-none" />

        {/* Shield Barrier Energy Dome */}
        {shieldLevel > 0 && (
          <div className="absolute -inset-6 rounded-full border-4 border-cyan-400/80 bg-cyan-400/10 shadow-[0_0_30px_rgba(0,210,255,0.6)] animate-pulse pointer-events-none z-10 flex items-center justify-center">
            <span className="absolute -top-3 bg-[#1e1b4b] border-2 border-[#4338ca] text-cyan-200 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-lg uppercase italic">
              ✨ Shield Aura Lv{shieldLevel} Active
            </span>
          </div>
        )}

        {/* SHOP DECORATION OVERLAYS ATTACHED VISUALLY TO SHIP */}
        
        {/* 1. Jolly Roger Flag / Crimson Sails on Top Mast */}
        {equippedDecorations.includes('dec_jolly_roger') && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 z-30 text-3xl sm:text-4xl animate-bounce drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
            title="Classic Jolly Roger Flag"
          >
            🏴‍☠️
          </div>
        )}
        {equippedDecorations.includes('dec_spectral_sails') && (
          <div
            className="absolute top-0 right-1/4 z-30 text-3xl sm:text-4xl animate-pulse drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
            title="Blood Red Pirate Sails"
          >
            🚩
          </div>
        )}

        {/* 2. Kraken Figurehead on Ship Bow (Front) */}
        {equippedDecorations.includes('dec_kraken_figurehead') && (
          <div
            className="absolute top-1/3 left-2 sm:left-4 z-30 text-3xl sm:text-4xl animate-pulse drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
            title="Golden Kraken Figurehead"
          >
            🦑
          </div>
        )}

        {/* 3. Captain's Parrot on Helm */}
        {equippedDecorations.includes('dec_parrot_perch') && (
          <div
            className="absolute top-1/2 right-2 sm:right-4 z-30 text-2xl sm:text-3xl animate-bounce drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
            title="Captain's Red Parrot"
          >
            🦜
          </div>
        )}

        {/* 4. Ghost Aura Glow around hull */}
        {equippedDecorations.includes('dec_ghost_glow') && (
          <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-lg pointer-events-none animate-pulse z-0" />
        )}

        {/* 5. Polished Brass Trim Sparkles */}
        {equippedDecorations.includes('dec_golden_cannons') && (
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-between px-6">
            <Sparkles className="w-6 h-6 text-[#facc15] animate-spin" />
            <Sparkles className="w-6 h-6 text-[#facc15] animate-ping" />
          </div>
        )}

        {/* GIANT SHIP IMAGE - COMPLETELY OPAQUE WITHOUT BORDERS OR BOXES */}
        <div className="relative w-48 h-48 sm:w-72 sm:h-72 md:w-88 md:h-88 flex items-center justify-center">
          <img
            src={shipImg}
            alt={`Lv.${shipLevel} Pirate Flagship`}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] transition-all ${
              isCritical ? 'grayscale opacity-60 contrast-125' : ''
            }`}
          />

          {/* MOUNTED CANNONS ATTACHED DIRECTLY ON THE SHIP DECK */}
          {cannonCount > 0 && (
            <div className="absolute bottom-2 right-2 sm:bottom-8 sm:right-8 z-20 bg-[#451a03]/95 border-2 border-[#b45309] rounded-xl sm:rounded-2xl p-1.5 sm:p-2 flex items-center gap-1.5 shadow-2xl backdrop-blur-sm">
              <img
                src={cannonImg}
                alt="Cannon"
                referrerPolicy="no-referrer"
                className="w-5 h-5 sm:w-8 sm:h-8 object-contain"
              />
              <div className="flex flex-col">
                <span className="text-[8px] sm:text-[10px] text-[#fde68a] font-bold uppercase leading-none">Deck Cannons</span>
                <span className="text-[10px] sm:text-xs font-black text-[#fbbf24] font-mono leading-tight">
                  Lv.{cannonLevel} x{cannonCount}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* SHIP CONDITION & HP STATUS DISPLAY */}
        <div className="w-full max-w-sm bg-[#78350f]/95 border-4 border-[#451a03] rounded-2xl p-3 shadow-2xl backdrop-blur-sm mt-2 space-y-1.5 text-amber-100">
          <div className="flex justify-between items-center text-xs font-serif font-black">
            <span className="text-white flex items-center gap-1">
              <span>⛵</span> Level {shipLevel} Flagship
            </span>
            <span
              className={`font-mono text-xs px-2 py-0.5 rounded-lg font-black border ${
                isCritical
                  ? 'bg-red-950 text-red-300 border-red-600 animate-pulse'
                  : isLow
                  ? 'bg-[#451a03] text-[#fde68a] border-[#b45309]'
                  : 'bg-[#064e3b] text-emerald-200 border-[#16a34a]'
              }`}
            >
              {shipCondition}% Condition
            </span>
          </div>

          {/* HP Bar */}
          <div className="w-full bg-[#1c0a02] h-4 rounded-full border-2 border-[#78350f] overflow-hidden relative shadow-inner">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isCritical
                  ? 'bg-red-600'
                  : isLow
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, shipCondition))}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white font-mono tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
              {shipCurrentHp.toLocaleString()} / {shipMaxHp.toLocaleString()} HP
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
