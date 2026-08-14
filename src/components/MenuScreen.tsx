import React from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';
import { ASSETS } from '../assets';
import { useCutoutImage } from '../utils/imageUtils';
import { useGame } from '../context/GameContext';

interface MenuScreenProps {
  onSelectSteps: () => void;
  onSelectGame: () => void;
}

export function MenuScreen({ onSelectSteps, onSelectGame }: MenuScreenProps) {
  const transparentLogo = useCutoutImage(ASSETS.logo, { mode: 'edge' });
  const { isMuted, toggleMute } = useGame();

  return (
    <div className="absolute inset-0 w-full h-full z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${ASSETS.menuBg})` }}
      />
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Top Bar / Controls */}
      <div className="absolute top-0 right-0 p-4 sm:p-6 z-20">
        <button
          onClick={toggleMute}
          className="w-12 h-12 bg-[#78350f]/80 backdrop-blur-sm border-2 border-[#d97706] rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full px-4 pt-12 pb-16 sm:pb-24 h-full justify-between">
        
        {/* Logo Section */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
          className="w-full max-w-lg mt-8 sm:mt-16 flex justify-center drop-shadow-2xl"
        >
          <img 
            src={transparentLogo} 
            alt="SeaStride Logo" 
            className="w-full max-w-[420px] sm:max-w-[480px] h-auto object-contain" 
          />
        </motion.div>

        {/* Buttons Section */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col gap-5 w-full max-w-[280px] sm:max-w-[320px] mb-8"
        >
          {/* Steps Counter Button */}
          <button 
            onClick={onSelectSteps}
            className="w-full relative group active:scale-95 transition-transform"
          >
            <div className="absolute inset-0 bg-[#451a03] rounded-xl translate-y-1 sm:translate-y-2"></div>
            <div className="relative h-16 sm:h-20 bg-gradient-to-b from-[#f59e0b] to-[#d97706] rounded-xl border-2 border-[#fef3c7] flex flex-col items-center justify-center shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-30 mix-blend-overlay"></div>
              <div className="flex items-center justify-center gap-3 z-10">
                <span className="text-2xl sm:text-3xl drop-shadow-md">👟</span>
                <span className="font-black text-white text-xl sm:text-2xl tracking-wider drop-shadow-md uppercase">
                  Steps Counter
                </span>
              </div>
            </div>
          </button>

          {/* Gameplay Button */}
          <button 
            onClick={onSelectGame}
            className="w-full relative group active:scale-95 transition-transform"
          >
            <div className="absolute inset-0 bg-[#064e3b] rounded-xl translate-y-1 sm:translate-y-2"></div>
            <div className="relative h-16 sm:h-20 bg-gradient-to-b from-[#10b981] to-[#059669] rounded-xl border-2 border-[#ecfdf5] flex flex-col items-center justify-center shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-30 mix-blend-overlay"></div>
              <div className="flex items-center justify-center gap-3 z-10">
                <span className="text-2xl sm:text-3xl drop-shadow-md">🏴‍☠️</span>
                <span className="font-black text-white text-xl sm:text-2xl tracking-wider drop-shadow-md uppercase">
                  Gameplay
                </span>
              </div>
            </div>
          </button>
        </motion.div>

      </div>
    </div>
  );
}
