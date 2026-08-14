import React from 'react';
import { useGame } from '../context/GameContext';
import { Volume2, VolumeX, Shield, Zap, Globe, Lock } from 'lucide-react';

interface HeaderHUDProps {
  activeTab: 'home' | 'game';
  setActiveTab: (tab: 'home' | 'game') => void;
  openModal: (modal: 'upgrades' | 'shop' | 'server' | 'repair' | 'raids' | 'profile') => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({ activeTab, setActiveTab, openModal }) => {
  const { coins, gems, energy, maxEnergy, currentServer, isMuted, toggleMute, shipCondition, profile } = useGame();

  return (
    <header className="sticky top-0 z-40 bg-[#451a03] border-b-4 sm:border-b-8 border-[#78350f] shadow-2xl text-amber-100 select-none">
      {/* Top Resource Bar - Centered on Mobile */}
      <div className="px-2 sm:px-3 py-1.5 flex items-center justify-center sm:justify-between gap-1.5 max-w-4xl mx-auto flex-wrap">
        {/* Logo / Badge & Currencies */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {/* Captain Emblem Profile Circle Button */}
          <button
            onClick={() => openModal('profile')}
            className="w-8 h-8 sm:w-10 sm:h-10 bg-[#facc15] border-2 sm:border-3 border-[#ca8a04] rounded-full flex items-center justify-center shadow-md overflow-hidden flex-shrink-0 hover:scale-105 active:scale-95 transition-transform"
            title="My Captain Profile"
          >
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.username}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-base sm:text-xl">☠️</span>
            )}
          </button>

          {/* Gold Coins */}
          <div className="flex items-center bg-[#78350f] border-2 border-[#b45309] rounded-lg px-2 sm:px-3 py-0.5 sm:py-1 shadow-md">
            <span className="text-sm sm:text-lg mr-1 animate-pulse">🪙</span>
            <div className="flex flex-col">
              <span className="text-[9px] sm:text-[10px] text-[#fde68a] uppercase font-bold leading-none">GOLD</span>
              <span className="text-[#fbbf24] text-xs sm:text-sm font-bold tracking-wide">{coins.toLocaleString()}</span>
            </div>
          </div>

          {/* Gems / Steps Badge */}
          <div className="flex items-center bg-[#1e1b4b] border-2 border-[#4338ca] rounded-lg px-2 sm:px-3 py-0.5 sm:py-1 shadow-md">
            <span className="text-sm sm:text-lg mr-1">💎</span>
            <div className="flex flex-col">
              <span className="text-[9px] sm:text-[10px] text-[#818cf8] uppercase font-bold leading-none">GEMS</span>
              <span className="text-white text-xs sm:text-sm font-bold tracking-wide">{gems}</span>
            </div>
          </div>
        </div>

        {/* Energy Bar */}
        <div className="flex items-center bg-[#451a03] border-2 border-[#b45309] rounded-lg px-2 sm:px-3 py-0.5 sm:py-1 shadow-md">
          <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#facc15] fill-[#facc15] mr-1 animate-bounce" />
          <div className="flex flex-col">
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-[#fde68a] font-bold uppercase tracking-wider">
              <span>Energy</span>
              <span className="ml-1.5 text-[#fbbf24] font-mono">{energy}/{maxEnergy}</span>
            </div>
            <div className="flex gap-0.5 sm:gap-1 mt-0.5">
              {Array.from({ length: maxEnergy }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 sm:w-3.5 h-1.5 sm:h-2 rounded-sm border border-[#78350f] ${
                    i < energy
                      ? 'bg-[#16a34a] shadow-[0_0_8px_#16a34a]'
                      : 'bg-[#1e1108]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Server & Mute Control */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openModal('server')}
            className="flex items-center gap-1 bg-[#78350f] hover:bg-[#92400e] border-2 border-[#b45309] rounded-lg px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-bold text-[#fde68a] active:scale-95 transition-transform"
          >
            {currentServer.type === 'global' ? (
              <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400" />
            ) : (
              <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#facc15]" />
            )}
            <span className="truncate max-w-[60px] sm:max-w-[120px]">{currentServer.code}</span>
          </button>

          <button
            onClick={toggleMute}
            className="p-1 sm:p-1.5 bg-[#78350f] hover:bg-[#92400e] border border-[#b45309] rounded-lg text-[#fde68a] active:scale-90"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#facc15]" />}
          </button>
        </div>
      </div>

      {/* Swipe Gesture Indicator Bar (Replaces Tab Buttons) */}
      <div 
        onClick={() => setActiveTab(activeTab === 'home' ? 'game' : 'home')}
        className="bg-[#1c0a02] border-t border-[#78350f] px-3 py-1.5 flex items-center justify-between cursor-pointer group hover:bg-[#2e1204] transition-colors"
      >
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#fde68a]">
          {activeTab === 'home' ? (
            <>
              <span className="text-sm">👟</span>
              <span className="font-black uppercase text-amber-300">Steps Bar</span>
            </>
          ) : (
            <>
              <span className="text-sm">🏴‍☠️</span>
              <span className="font-black uppercase text-amber-300">Game Screen</span>
            </>
          )}
        </div>

        {/* Swipe Instruction & Animated Gesture Hint */}
        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-extrabold text-[#fbbf24] bg-[#451a03] px-2.5 py-0.5 rounded-full border border-[#b45309]">
          {activeTab === 'home' ? (
            <>
              <span className="animate-pulse text-[#facc15]">👈</span>
              <span className="italic">Swipe left for Game Screen</span>
            </>
          ) : (
            <>
              <span className="italic">Swipe right for Steps Bar</span>
              <span className="animate-pulse text-[#facc15]">👉</span>
            </>
          )}
        </div>

        {/* Quick Ship Repair Alert Button if damaged */}
        {shipCondition <= 50 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              openModal('repair');
            }}
            className="bg-[#16a34a] hover:bg-[#22c55e] text-white font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-lg border border-[#064e3b] animate-bounce flex items-center gap-1 shadow-md"
          >
            <Shield className="w-3 h-3" />
            <span>REPAIR</span>
          </button>
        )}
      </div>
    </header>
  );
};
