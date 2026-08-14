import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { DECORATIONS } from '../data/decorations';
import { ShoppingBag, X, Tv, Check, Sparkles, Play } from 'lucide-react';

interface ShopModalProps {
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ onClose }) => {
  const {
    coins,
    gems,
    ownedDecorations,
    equippedDecorations,
    buyDecoration,
    toggleEquipDecoration,
    watchAdForGems
  } = useGame();

  const [isWatchingAd, setIsWatchingAd] = useState<boolean>(false);
  const [adTimer, setAdTimer] = useState<number>(5);

  const handleStartAd = () => {
    setIsWatchingAd(true);
    setAdTimer(5);

    const interval = setInterval(() => {
      setAdTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsWatchingAd(false);
          watchAdForGems();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 select-none">
      <div className="bg-[#78350f] border-8 border-[#451a03] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative text-amber-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#451a03] border-b-4 border-[#78350f] p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-serif font-black uppercase text-[#fde68a] tracking-wider">
              Pirate Bazaar & Ad Haven
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-[#78350f] border-2 border-[#b45309] px-2.5 py-0.5 rounded-lg text-xs font-black text-[#fbbf24]">
              🪙 {coins.toLocaleString()}
            </div>
            <div className="bg-[#1e1b4b] border-2 border-[#4338ca] px-2.5 py-0.5 rounded-lg text-xs font-black text-white">
              💎 {gems}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 bg-[#78350f] hover:bg-[#92400e] rounded-lg border border-[#b45309] text-[#fde68a]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          
          {/* Watch Ad Banner for Gems */}
          <div className="bg-[#451a03] border-4 border-[#b45309] rounded-2xl p-4 text-center shadow-xl space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs font-serif font-black uppercase text-sky-300 tracking-wider">
              <Tv className="w-4 h-4 text-sky-400" />
              <span>Watch Pirate Broadcast for Free Gems</span>
            </div>

            {isWatchingAd ? (
              <div className="py-2 space-y-1">
                <div className="text-sm font-black text-[#fbbf24] font-serif animate-pulse">
                  📺 Playing Pirate Commercial... ({adTimer}s)
                </div>
                <div className="w-full bg-[#1c0a02] h-2.5 rounded-full overflow-hidden border border-[#78350f] max-w-xs mx-auto">
                  <div
                    className="bg-[#16a34a] h-full transition-all duration-1000"
                    style={{ width: `${((5 - adTimer) / 5) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={handleStartAd}
                className="bg-[#1d4ed8] hover:bg-[#2563eb] border-b-4 border-r-2 border-[#1e3a8a] text-white font-black py-2.5 px-5 rounded-xl text-xs uppercase italic tracking-wider shadow-lg active:translate-y-1 inline-flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Watch Short Ad (+5 Gems 💎)</span>
              </button>
            )}
          </div>

          {/* Decorations Catalog */}
          <div className="space-y-2">
            <div className="text-xs font-serif font-black uppercase text-[#fde68a] flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-[#facc15]" />
              <span>Permanent Ship Customizations</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DECORATIONS.map(dec => {
                const isOwned = ownedDecorations.includes(dec.id);
                const isEquipped = equippedDecorations.includes(dec.id);

                return (
                  <div
                    key={dec.id}
                    className={`p-3 rounded-2xl border-2 flex flex-col justify-between gap-2 ${
                      isEquipped
                        ? 'bg-[#451a03] border-[#facc15] shadow-lg'
                        : isOwned
                        ? 'bg-[#451a03] border-[#b45309]'
                        : 'bg-[#451a03] border-[#78350f]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-3xl p-1 bg-[#1c0a02] border border-[#78350f] rounded-xl">
                        {dec.icon}
                      </span>
                      <div>
                        <div className="text-xs font-black text-white font-serif">{dec.name}</div>
                        <div className="text-[10px] text-[#fde68a]/80 leading-tight mt-0.5">{dec.description}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-[#78350f]">
                      <span className="text-[10px] font-bold uppercase text-[#fbbf24]">
                        {dec.currency === 'coins' ? `${dec.price} 🪙` : `${dec.price} 💎`}
                      </span>

                      {isOwned ? (
                        <button
                          onClick={() => toggleEquipDecoration(dec.id)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase italic border-b-2 ${
                            isEquipped
                              ? 'bg-[#16a34a] border-[#064e3b] text-white'
                              : 'bg-[#78350f] border-[#451a03] text-[#fde68a]'
                          }`}
                        >
                          {isEquipped && <Check className="w-3 h-3 inline mr-1" />}
                          <span>{isEquipped ? 'Equipped' : 'Equip'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => buyDecoration(dec.id, dec.currency, dec.price)}
                          className="px-3 py-1 rounded-lg text-[10px] font-black uppercase italic bg-[#b45309] hover:bg-[#d97706] border-b-2 border-[#451a03] text-white shadow active:translate-y-0.5"
                        >
                          Buy Item
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
