import { Player, ServerInfo } from '../types';

const PIRATE_NAMES = [
  'Captain Blackbeard', 'Calico Jack', 'Anne Bonny', 'Mary Read', 'Redbeard Drake',
  'Kraken Chaser', 'Davy Jones', 'Scurvy Sam', 'Siren Vane', 'Pegleg Pete',
  'Golden Corsair', 'Sea Wolf Morgan', 'Storm Corsair', 'Iron Hook Kidd', 'Grog Guzzler',
  'Ghost Captain Jack', 'Shadow Galleon', 'Ocean Scourge', 'Tide Breaker', 'Coral Queen',
  'Scurvy Dog Jack', 'Cannonball Joe', 'Barnacle Bob', 'Flintlock Francis', 'Silver Blade',
  'Buccaneer Bart', 'Plunder Pete', 'Cutlass Clara', 'Reef Raider', 'Mariner Molly',
  'Skull Smuggler', 'Wave Walker', 'Abyssal Admiral', 'Scurvy Sid', 'Brimstone Bill'
];

const PIRATE_TITLES = [
  'Terror of the Caribbees', 'Master of the High Seas', 'Island Swashbuckler',
  'Treasure Hunter', 'Kraken Slayer', 'Ghost Ship Commander', 'Golden Galleon Lord',
  'Corsair King', 'Plunder Captain', 'Scourge of Tortuga'
];

export function generatePlayers(count: number): Player[] {
  const players: Player[] = [];
  for (let i = 1; i <= count; i++) {
    const name = PIRATE_NAMES[(i - 1) % PIRATE_NAMES.length] + (i > PIRATE_NAMES.length ? ` ${i}` : '');
    const title = PIRATE_TITLES[i % PIRATE_TITLES.length];
    const shipLevel = Math.min(10, Math.floor(Math.random() * 8) + 1);
    const maxHp = 5000 + (shipLevel - 1) * 5000;
    const condition = Math.floor(Math.random() * 60) + 40; // 40% - 100%
    const currentHp = Math.round(maxHp * (condition / 100));
    const cannonLevel = Math.min(10, Math.floor(Math.random() * 6) + 1);
    const cannonCount = Math.floor(Math.random() * 4) + 1;
    const shieldLevel = Math.floor(Math.random() * 4); // 0 to 3

    players.push({
      id: `player_${i}`,
      name,
      title,
      avatarUrl: `https://picsum.photos/seed/pirate${i}/100/100`,
      shipLevel,
      shipCondition: condition,
      currentHp,
      maxHp,
      cannonLevel,
      cannonCount,
      shieldLevel,
      isOnline: Math.random() > 0.3,
    });
  }
  return players;
}

export const INITIAL_SERVERS: ServerInfo[] = [
  {
    code: 'SEA-GLOBAL-020',
    type: 'global',
    name: 'The Vast Sea (Main Fleet)',
    playerCount: 18,
    maxPlayers: 20,
    players: generatePlayers(18),
  },
  {
    code: 'BEACH-PRIV-020',
    type: 'private',
    name: 'Tortuga Cove (Private Beach)',
    playerCount: 12,
    maxPlayers: 20,
    players: generatePlayers(12),
  },
  {
    code: 'SKULL-BAY-888',
    type: 'private',
    name: 'Skull Rock Haven',
    playerCount: 15,
    maxPlayers: 20,
    players: generatePlayers(15),
  }
];
