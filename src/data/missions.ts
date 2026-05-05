import type { Biome, Difficulty, EnemyFaction, Mission, HexCell, HexZone } from '../types/game';
import { ENEMY_TEMPLATES, SPACE_ENEMY_TEMPLATES, generateEnemyUnit, generateSpaceEnemy } from './enemies';

export interface BiomeData {
  biome: Biome;
  description: string;
  color: string;
  bgColor: string;
  icon: string;
  factions: EnemyFaction[];
}

export const BIOMES: BiomeData[] = [
  {
    biome: 'Desert Planet',
    description: 'A scorching desert world with ancient ruins and fierce indigenous life.',
    color: '#f59e0b',
    bgColor: '#1a0f00',
    icon: '🏜️',
    factions: ['Marauders', 'Alien Swarm'],
  },
  {
    biome: 'Ice Moon',
    description: 'A frigid moon with crystalline caves and hidden outposts.',
    color: '#60a5fa',
    bgColor: '#000d1a',
    icon: '❄️',
    factions: ['Rogue AI', 'Void Cult'],
  },
  {
    biome: 'Derelict Space Station',
    description: 'An abandoned space station overrun by hostile forces.',
    color: '#94a3b8',
    bgColor: '#0a0a0a',
    icon: '🛰️',
    factions: ['Rogue AI', 'Marauders', 'Void Cult'],
  },
];

export const DIFFICULTY_MODIFIERS: Record<Difficulty, {
  levelMod: number; rewardMult: number; label: string; color: string;
  spaceCount: { min: number; max: number };
  surfaceSize: { min: number; max: number };
}> = {
  Easy:      { levelMod: -2, rewardMult: 0.7, label: 'Easy',      color: '#10b981', spaceCount: { min: 1, max: 1 }, surfaceSize: { min: 1, max: 1 } },
  Normal:    { levelMod:  0, rewardMult: 1.0, label: 'Normal',    color: '#60a5fa', spaceCount: { min: 2, max: 3 }, surfaceSize: { min: 1, max: 2 } },
  Hard:      { levelMod:  3, rewardMult: 1.5, label: 'Hard',      color: '#f59e0b', spaceCount: { min: 3, max: 4 }, surfaceSize: { min: 2, max: 3 } },
  Nightmare: { levelMod:  7, rewardMult: 2.5, label: 'Nightmare', color: '#ef4444', spaceCount: { min: 4, max: 4 }, surfaceSize: { min: 3, max: 4 } },
};

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateHexGrid(seed: number): HexCell[][] {
  const rand = seededRandom(seed);
  const zones: HexZone[] = ['OpenSpace', 'OpenSpace', 'OpenSpace', 'Nebula', 'IonStorm', 'Debris'];
  const grid: HexCell[][] = [];

  for (let q = 0; q < 7; q++) {
    grid[q] = [];
    for (let r = 0; r < 7; r++) {
      const zoneIdx = Math.floor(rand() * zones.length);
      grid[q][r] = { q, r, zone: zones[zoneIdx] };
    }
  }
  return grid;
}

export function generateMission(
  captainLevel: number,
  difficulty: Difficulty,
  customSeed?: number
): Mission {
  const seed = customSeed ?? Math.floor(Math.random() * 999999);
  const rand = seededRandom(seed);

  const biomeData = BIOMES[Math.floor(rand() * BIOMES.length)];
  const faction = biomeData.factions[Math.floor(rand() * biomeData.factions.length)];
  const diffMod = DIFFICULTY_MODIFIERS[difficulty];
  const enemyLevel = Math.max(1, captainLevel + diffMod.levelMod);

  const missionNames = [
    'Signal Lost', 'Dark Frontier', 'Void Breach', 'Iron Curtain',
    'Last Stand', 'Ghost Protocol', 'Warp Surge', 'Eclipse',
    'Critical Mass', 'Zero Hour',
  ];
  const missionName = missionNames[Math.floor(rand() * missionNames.length)];

  // Generate space enemies — count scales with difficulty
  const spaceTemplates = SPACE_ENEMY_TEMPLATES.filter(t => t.faction === faction);
  const { min: sMin, max: sMax } = diffMod.spaceCount;
  const numSpaceEnemies = sMin + Math.floor(rand() * (sMax - sMin + 1));
  const spacePositions = [
    { q: 5, r: 1 }, { q: 6, r: 3 }, { q: 5, r: 5 }, { q: 4, r: 6 },
  ];

  const spaceEnemies = Array.from({ length: numSpaceEnemies }, (_, i) => {
    const template = spaceTemplates[Math.floor(rand() * spaceTemplates.length)];
    const pos = spacePositions[i];
    return generateSpaceEnemy(template, enemyLevel, pos.q, pos.r);
  });

  // Generate surface enemies — unit count scales with difficulty
  const surfaceTemplates = ENEMY_TEMPLATES.filter(t => t.faction === faction);
  const { min: uMin, max: uMax } = diffMod.surfaceSize;
  const groupSize = uMin + Math.floor(rand() * (uMax - uMin + 1));

  const surfaceEnemies = [
    Array.from({ length: groupSize }, (_, i) => {
      const template = surfaceTemplates[Math.floor(rand() * surfaceTemplates.length)];
      return generateEnemyUnit(template, enemyLevel, i);
    }),
  ];

  const baseCredits = { Easy: 150, Normal: 300, Hard: 500, Nightmare: 900 }[difficulty];
  const creditVariance = Math.floor(rand() * 200);

  return {
    id: `mission_${seed}`,
    name: missionName,
    biome: biomeData.biome,
    faction,
    difficulty,
    description: `${biomeData.description} ${faction} forces have been detected in the area.`,
    xpReward: {
      captain: Math.round(120 * diffMod.rewardMult),
      ship: Math.round(90 * diffMod.rewardMult),
      robots: Math.round(60 * diffMod.rewardMult),
    },
    creditReward: Math.round((baseCredits + creditVariance) * diffMod.rewardMult),
    lootDrops: difficulty === 'Easy' ? 1 : difficulty === 'Normal' ? 2 : difficulty === 'Hard' ? 3 : 5,
    spaceEnemies,
    surfaceEnemies,
    seed,
  };
}

export { generateHexGrid };
