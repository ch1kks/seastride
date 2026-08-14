export type ServerType = 'global' | 'private';

export interface StepRecord {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // Mon, Tue, etc.
  steps: number;
}

export interface StepStats {
  dailyAverage: number;
  weeklyAverage: number;
  monthlyAverage: number;
  totalStepsToday: number;
  stepsToNextReward: number; // steps out of 100
}

export interface CannonItem {
  id: string;
  level: number; // 1 to 10
}

export interface ShieldItem {
  id: string;
  level: number; // 1 to 3
}

export interface Player {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
  shipLevel: number;
  shipCondition: number; // %
  currentHp: number;
  maxHp: number;
  cannonLevel: number; // We might want to remove this and replace with total damage, but let's just keep as average or max for display.
  cannonCount: number; // For backward compatibility in Player type if needed, or update to show damage.
  shieldLevel: number; 
  isOnline: boolean;
}


export interface ServerInfo {
  code: string;
  type: ServerType;
  name: string;
  playerCount: number;
  maxPlayers: number; // 100 for global, 30 for private
  players: Player[];
}

export interface BattleResult {
  targetPlayer: Player;
  damageDealt: number;
  enemyRemainingHpPercent: number;
  coinsEarned: number;
  gemsEarned: number;
  cannonLooted: boolean;
  lootedCannonLevel?: number;
  shieldBlocked: boolean;
}

export interface RaidLog {
  id: string;
  timestamp: string;
  type: 'attack' | 'defense';
  opponentName: string;
  outcome: 'victory' | 'defeat' | 'defended';
  coinsChange: number;
  damage: number;
  cannonLostOrWon?: string;
}

export interface Decoration {
  id: string;
  name: string;
  description: string;
  currency: 'coins' | 'gems';
  price: number;
  icon: string;
  category: 'flag' | 'figurehead' | 'lantern' | 'effect';
}
