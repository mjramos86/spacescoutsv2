import type { Equipment, Rarity } from '../types/game';
import { generateEquipment } from '../data/equipment';

const RARITY_WEIGHTS: { rarity: Rarity; weight: number }[] = [
  { rarity: 'Common', weight: 50 },
  { rarity: 'Uncommon', weight: 25 },
  { rarity: 'Rare', weight: 15 },
  { rarity: 'Epic', weight: 8 },
  { rarity: 'Legendary', weight: 2 },
];

export function rollRarity(): Rarity {
  const total = RARITY_WEIGHTS.reduce((sum, r) => sum + r.weight, 0);
  let roll = Math.random() * total;
  for (const { rarity, weight } of RARITY_WEIGHTS) {
    roll -= weight;
    if (roll <= 0) return rarity;
  }
  return 'Common';
}

export function generateLoot(count: number): Equipment[] {
  const entityTypes: ('captain' | 'ship' | 'robot')[] = ['captain', 'ship', 'robot'];
  return Array.from({ length: count }, () => {
    const rarity = rollRarity();
    const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
    return generateEquipment(rarity, entityType);
  });
}

export function rarityColor(rarity: Rarity): string {
  const colors: Record<Rarity, string> = {
    Common: '#94a3b8',
    Uncommon: '#4ade80',
    Rare: '#60a5fa',
    Epic: '#a855f7',
    Legendary: '#f97316',
  };
  return colors[rarity];
}
