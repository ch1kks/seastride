import React, { useState, useRef, useEffect } from 'react';
import { GameProvider } from './context/GameContext';
import { HeaderHUD } from './components/HeaderHUD';
import { HomeScreen } from './components/HomeScreen';
import { GameScreen } from './components/GameScreen';
import { MenuScreen } from './components/MenuScreen';
import { UpgradesModal } from './components/UpgradesModal';
import { ShopModal } from './components/ShopModal';
import { ServerModal } from './components/ServerModal';
import { RepairModal } from './components/RepairModal';
import { RaidHistoryModal } from './components/RaidHistoryModal';
import { AttackModal } from './components/AttackModal';
import { ShipInspectModal } from './components/ShipInspectModal';
import { ProfileModal } from './components/ProfileModal';
import { soundFx } from './utils/audio';

type ActiveModal = 'upgrades' | 'shop' | 'server' | 'repair' | 'raids' | 'attack' | 'shipInspect' | 'profile' | null;

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<'menu' | 'home' | 'game'>('menu');
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  // Smooth Drag & Swipe Physics State for Side-by-Side Screens
  const [dragOffsetX, setDragOffsetX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Auto-start pirate BGM on load & play distinct sounds for buttons
  useEffect(() => {
    soundFx.startBgm();

    const handleFirstUserInteraction = () => {
      soundFx.startBgm();
    };

    const handleGlobalButtonClick = (e: MouseEvent) => {
      soundFx.startBgm();
      const target = e.target as HTMLElement | null;
      if (target) {
        const button = target.closest('button, [role="button"]') as HTMLElement | null;
        if (button) {
          const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
          const title = button.getAttribute('title')?.toLowerCase() || '';
          const text = button.innerText?.trim() || '';

          const isCloseButton =
            ariaLabel.includes('close') ||
            title.includes('close') ||
            text === '✕' ||
            text === '×' ||
            text.toLowerCase().includes('close') ||
            button.querySelector('svg.lucide-x') !== null ||
            button.classList.contains('close-btn');

          if (isCloseButton) {
            soundFx.playClose();
          } else {
            soundFx.playClick();
          }
        }
      }
    };

    window.addEventListener('pointerdown', handleFirstUserInteraction);
    window.addEventListener('touchstart', handleFirstUserInteraction);
    window.addEventListener('mousedown', handleFirstUserInteraction);
    window.addEventListener('keydown', handleFirstUserInteraction);
    window.addEventListener('click', handleGlobalButtonClick, true);

    return () => {
      window.removeEventListener('pointerdown', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
      window.removeEventListener('mousedown', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
      window.removeEventListener('click', handleGlobalButtonClick, true);
    };
  }, []);

  // Continuous Drag & Side-by-Side Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent | React.PointerEvent) => {
    // Avoid capturing inputs/buttons
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, textarea, [role="button"]')) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    touchStartRef.current = { x: clientX, y: clientY };
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent | React.PointerEvent) => {
    if (!touchStartRef.current || !isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - touchStartRef.current.x;
    const deltaY = clientY - touchStartRef.current.y;

    // Trigger drag when horizontal motion exceeds vertical scroll
    if (Math.abs(deltaX) > Math.abs(deltaY) + 4) {
      // Rubberband dampening when pulling past bounds
      if ((activeTab === 'home' && deltaX > 0) || (activeTab === 'game' && deltaX < 0)) {
        setDragOffsetX(deltaX * 0.25);
      } else {
        setDragOffsetX(deltaX);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current) return;

    // Minimum swipe threshold of 40px to switch tabs
    if (dragOffsetX < -40 && activeTab === 'home') {
      setActiveTab('game');
    } else if (dragOffsetX > 40 && activeTab === 'game') {
      setActiveTab('home');
    }

    touchStartRef.current = null;
    setIsDragging(false);
    setDragOffsetX(0);
  };

  const openModal = (modal: NonNullable<ActiveModal>) => {
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  // Base translate percentage for side-by-side screens (0% for Home/Steps, -50% for Game)
  const baseTranslatePercent = activeTab === 'home' ? 0 : -50;

  return (
    <div className="h-[100dvh] w-full bg-[#0c4a6e] font-serif text-amber-100 antialiased selection:bg-[#facc15] selection:text-stone-950 flex justify-center items-center p-0 sm:p-2 relative overflow-hidden">
      {/* Background theme ambient elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute bottom-0 w-full h-[30%] bg-[#fde68a]/20" />
        <div className="absolute top-10 right-10 w-48 h-48 bg-[#fef08a] rounded-full blur-3xl opacity-20" />
      </div>

      {/* Mobile / Desktop Frame Container */}
      <div className="w-full max-w-md sm:max-w-2xl bg-[#78350f] border-0 sm:border-8 border-[#451a03] sm:rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden h-full max-h-[100dvh] sm:max-h-[850px] flex flex-col relative z-10">
        
        {/* HUD Top Bar */}
        {activeTab !== 'menu' && (
          <HeaderHUD
            activeTab={activeTab as 'home' | 'game'}
            setActiveTab={(tab: 'home' | 'game') => setActiveTab(tab)}
            openModal={openModal}
          />
        )}

        {/* Main View Area */}
        {activeTab === 'menu' ? (
          <MenuScreen 
            onSelectSteps={() => setActiveTab('home')}
            onSelectGame={() => setActiveTab('game')}
          />
        ) : (
          <main 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            className="flex-1 relative overflow-hidden flex flex-col select-none touch-pan-y"
          >
            <div 
              className={`w-[200%] h-full flex flex-row ${
                isDragging ? 'transition-none' : 'transition-transform duration-300 ease-out'
              }`}
              style={{
                transform: `translateX(calc(${baseTranslatePercent}% + ${dragOffsetX}px))`,
              }}
            >
              {/* Screen 1: Steps Bar (Home) */}
              <div className="w-1/2 h-full overflow-y-auto flex-shrink-0">
                <HomeScreen />
              </div>

              {/* Screen 2: Game Screen */}
              <div className="w-1/2 h-full overflow-y-auto flex-shrink-0">
                <GameScreen openModal={openModal} />
              </div>
            </div>
          </main>
        )}

        {/* Theme Footer - Compact */}
        <footer className="w-full h-6 sm:h-8 bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 text-[9px] sm:text-[10px] tracking-widest uppercase font-bold border-t border-[#78350f] flex-shrink-0">
          Voyage Phase: The Serpent Seas • SeaStride Expedition
        </footer>

        {/* Interactive Modals */}
        {activeModal === 'upgrades' && <UpgradesModal onClose={closeModal} />}
        {activeModal === 'shop' && <ShopModal onClose={closeModal} />}
        {activeModal === 'server' && <ServerModal onClose={closeModal} />}
        {activeModal === 'repair' && <RepairModal onClose={closeModal} />}
        {activeModal === 'raids' && <RaidHistoryModal onClose={closeModal} />}
        {activeModal === 'attack' && <AttackModal onClose={closeModal} />}
        {activeModal === 'shipInspect' && (
          <ShipInspectModal
            onClose={closeModal}
            onOpenRepair={() => openModal('repair')}
            onOpenUpgrades={() => openModal('upgrades')}
          />
        )}
        {activeModal === 'profile' && <ProfileModal onClose={closeModal} />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <MainAppContent />
    </GameProvider>
  );
}
