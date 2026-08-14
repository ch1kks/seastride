import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Footprints, Activity, Flame, Award, Zap, Compass, Map as MapIcon, BarChart3 } from 'lucide-react';
import { usePedometer } from '../hooks/usePedometer';
import { StepMapView } from './StepMapView';

export const HomeScreen: React.FC = () => {
  const { totalStepsToday, stepRecords, stepStats, addSteps } = useGame();
  const [activeTab, setActiveTab] = useState<'map' | 'chart'>('map');
  const [chartMode, setChartMode] = useState<'day' | 'week' | 'month'>('week');

  // Integrated Pedometer Sensor Hook
  const { permissionStatus, requestPermission } = usePedometer({
    onStep: (count) => {
      addSteps(count);
    },
  });

  // Chart data calculation
  const dayData = [
    { label: '6am', steps: 400 },
    { label: '9am', steps: 1200 },
    { label: '12pm', steps: 850 },
    { label: '3pm', steps: 1100 },
    { label: '6pm', steps: 700 },
    { label: '9pm', steps: 300 },
  ];

  const weekData = stepRecords.map(r => ({
    label: r.dayOfWeek,
    steps: r.steps,
  }));

  const monthData = [
    { label: 'Wk 1', steps: 48000 },
    { label: 'Wk 2', steps: 52000 },
    { label: 'Wk 3', steps: 45000 },
    { label: 'Wk 4', steps: totalStepsToday + 32000 },
  ];

  const activeChart = chartMode === 'day' ? dayData : chartMode === 'week' ? weekData : monthData;
  const maxChartSteps = Math.max(...activeChart.map(d => d.steps), 1000);

  // Calculate calories burned & distance approx
  const caloriesBurned = Math.round(totalStepsToday * 0.04);
  const distanceKm = (totalStepsToday * 0.0008).toFixed(2);

  // If user hasn't granted motion pedometer permission yet, show permission prompt box only
  if (permissionStatus !== 'granted') {
    return (
      <div className="p-4 max-w-md mx-auto my-auto text-amber-100 select-none flex-1 flex flex-col justify-center items-center">
        <div className="bg-[#78350f] border-2 sm:border-4 border-[#451a03] rounded-2xl p-5 sm:p-6 shadow-2xl text-center space-y-4 w-full relative overflow-hidden">
          {/* Decorative corner skulls */}
          <div className="absolute top-2 left-2 text-lg opacity-40">☠️</div>
          <div className="absolute top-2 right-2 text-lg opacity-40">☠️</div>

          <div className="w-16 h-16 bg-[#451a03] border-2 border-[#b45309] rounded-full flex items-center justify-center mx-auto text-amber-300 shadow-inner">
            <Footprints className="w-8 h-8 text-[#facc15] animate-bounce" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-serif font-black uppercase text-[#fde68a] tracking-wide">
              Allow Motion Pedometer
            </h3>
            <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
              SeaStride uses your phone's motion sensor to track physical footsteps while walking.
              Allow pedometer access to unlock your step box, earn Gold Coins, and voyage the seas!
            </p>
          </div>

          <button
            onClick={() => requestPermission()}
            className="w-full bg-[#16a34a] hover:bg-[#22c55e] active:scale-95 text-white font-serif font-black text-xs sm:text-sm py-3 px-4 rounded-xl border-b-4 border-[#064e3b] shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider transition-transform cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#fde68a]" />
            <span>Allow Motion Pedometer</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 max-w-2xl mx-auto space-y-2 sm:space-y-4 text-amber-100 pb-2 select-none flex-1 flex flex-col justify-between">
      {/* Pirate Parchment Main Banner */}
      <div className="bg-[#78350f] border-2 sm:border-4 border-[#451a03] rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-xl relative overflow-hidden">
        {/* Decorative corner skulls */}
        <div className="absolute top-1.5 left-2 text-sm sm:text-xl opacity-40">☠️</div>
        <div className="absolute top-1.5 right-2 text-sm sm:text-xl opacity-40">☠️</div>

        <div className="text-center space-y-0.5 sm:space-y-1">
          <div className="inline-flex items-center gap-1 bg-[#451a03] px-2.5 py-0.5 rounded-full border border-[#b45309] text-[#fde68a] text-[10px] sm:text-xs font-serif font-black uppercase tracking-widest shadow-inner">
            <Footprints className="w-3.5 h-3.5 text-[#facc15]" />
            <span>Today's SeaStride Walk</span>
          </div>

          <div className="py-1">
            <span className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-[#fbbf24] drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)]">
              {totalStepsToday.toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-[#fde68a] uppercase ml-1.5">Steps</span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            <div className="bg-[#451a03] border border-[#b45309] rounded-lg sm:rounded-xl p-1.5 sm:p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-red-400 text-[10px] sm:text-xs font-extrabold">
                <Flame className="w-3 h-3" />
                <span>BURNT</span>
              </div>
              <div className="text-xs sm:text-base font-extrabold text-white mt-0.5">{caloriesBurned} kcal</div>
            </div>

            <div className="bg-[#451a03] border border-[#b45309] rounded-lg sm:rounded-xl p-1.5 sm:p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-sky-400 text-[10px] sm:text-xs font-extrabold">
                <Activity className="w-3 h-3" />
                <span>DISTANCE</span>
              </div>
              <div className="text-xs sm:text-base font-extrabold text-white mt-0.5">{distanceKm} km</div>
            </div>

            <div className="bg-[#451a03] border border-[#b45309] rounded-lg sm:rounded-xl p-1.5 sm:p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[#facc15] text-[10px] sm:text-xs font-extrabold">
                <Award className="w-3 h-3" />
                <span>COINS</span>
              </div>
              <div className="text-xs sm:text-base font-extrabold text-[#fbbf24] mt-0.5">
                +{Math.floor(totalStepsToday / 100) * 10} 🪙
              </div>
            </div>
          </div>
        </div>

        {/* Steps Bar Reward Gauge (Every 100 steps = 10 coins) */}
        <div className="mt-2 bg-[#451a03] border border-[#b45309] rounded-lg p-2 shadow-inner">
          <div className="flex justify-between items-center text-[10px] sm:text-xs font-serif font-black text-[#fde68a] mb-1">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#facc15] fill-[#facc15]" />
              <span>Next Gold Reward Meter</span>
            </span>
            <span className="text-[#fbbf24]">{100 - stepStats.stepsToNextReward} / 100 steps</span>
          </div>

          <div className="w-full bg-[#1c0a02] h-3.5 sm:h-4 rounded-full border border-[#78350f] overflow-hidden relative">
            <div
              className="h-full bg-[#16a34a] rounded-full shadow-[0_0_10px_#16a34a] transition-all duration-300"
              style={{ width: `${((100 - stepStats.stepsToNextReward) / 100) * 100}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest drop-shadow">
              Walk {stepStats.stepsToNextReward} more steps for +10 Gold Coins!
            </span>
          </div>
        </div>
      </div>

      {/* VIEW SWITCHER TABS: Map View vs Step Charts */}
      <div className="flex items-center justify-center gap-1.5 bg-[#451a03] border-2 sm:border-3 border-[#78350f] rounded-xl p-1 shadow-lg">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-serif font-black text-[11px] sm:text-xs uppercase italic flex items-center justify-center gap-1.5 transition-all shadow-md ${
            activeTab === 'map'
              ? 'bg-[#b45309] border border-[#facc15] text-white'
              : 'bg-[#78350f] text-[#fde68a] hover:bg-[#92400e]'
          }`}
        >
          <MapIcon className="w-3.5 h-3.5 text-[#facc15]" />
          <span>Footprint Voyage Map</span>
        </button>

        <button
          onClick={() => setActiveTab('chart')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-serif font-black text-[11px] sm:text-xs uppercase italic flex items-center justify-center gap-1.5 transition-all shadow-md ${
            activeTab === 'chart'
              ? 'bg-[#b45309] border border-[#facc15] text-white'
              : 'bg-[#78350f] text-[#fde68a] hover:bg-[#92400e]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-sky-300" />
          <span>Step Activity</span>
        </button>
      </div>

      {/* MODE 1: FOOTPRINT GPS MAP VIEW */}
      {activeTab === 'map' ? (
        <div className="w-full flex-1 flex flex-col">
          <StepMapView />
        </div>
      ) : (
        /* MODE 2: STEP CHART VIEW */
        <div className="bg-[#78350f] border-2 sm:border-4 border-[#451a03] rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-xl space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-1.5">
            <h2 className="text-[11px] sm:text-sm font-serif font-black uppercase text-[#fde68a] tracking-wider flex items-center gap-1">
              <span>📊</span> Step Activity History
            </h2>

            <div className="flex bg-[#451a03] border border-[#b45309] rounded-md p-0.5">
              {(['day', 'week', 'month'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setChartMode(mode)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                    chartMode === mode
                      ? 'bg-[#b45309] text-white shadow'
                      : 'text-[#fde68a]/70 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Bar Chart */}
          <div className="h-32 sm:h-44 bg-[#451a03] border border-[#b45309] rounded-lg p-2 flex items-end justify-between gap-1.5 pt-4">
            {activeChart.map((item, idx) => {
              const heightPercent = Math.min(100, Math.max(12, (item.steps / maxChartSteps) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[8px] sm:text-[9px] font-mono text-[#fde68a] mb-0.5 opacity-80 group-hover:opacity-100 font-bold">
                    {item.steps >= 1000 ? `${(item.steps / 1000).toFixed(1)}k` : item.steps}
                  </span>

                  <div className="w-full max-w-[24px] bg-[#1c0a02] rounded-t-md h-full flex items-end overflow-hidden p-0.5 border border-[#78350f]">
                    <div
                      className="w-full bg-[#16a34a] rounded-t-sm transition-all duration-500 shadow-[0_0_8px_#16a34a]"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  <span className="text-[9px] sm:text-[10px] font-bold text-[#fde68a] mt-1 font-serif uppercase leading-none">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
