import type { EnemyFaction, EnemyUnit, SpaceEnemyShip } from '../types/game';

export interface EnemyTemplate {
  name: string;
  faction: EnemyFaction;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  baseSpd: number;
  baseAcc: number;
  xpReward: number;
  lootChance: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle' | 'diamond';
}

export const ENEMY_TEMPLATES: EnemyTemplate[] = [
  // Marauders
  { name: 'Marauder Grunt', faction: 'Marauders', baseHp: 60, baseAtk: 14, baseDef: 5, baseSpd: 9, baseAcc: 80, xpReward: 15, lootChance: 0.3, color: '#ef4444', shape: 'square' },
  { name: 'Marauder Captain', faction: 'Marauders', baseHp: 110, baseAtk: 22, baseDef: 10, baseSpd: 10, baseAcc: 82, xpReward: 35, lootChance: 0.5, color: '#dc2626', shape: 'diamond' },
  { name: 'Marauder Brute', faction: 'Marauders', baseHp: 150, baseAtk: 30, baseDef: 15, baseSpd: 6, baseAcc: 75, xpReward: 50, lootChance: 0.6, color: '#b91c1c', shape: 'square' },
  // Alien Swarm
  { name: 'Swarm Drone', faction: 'Alien Swarm', baseHp: 40, baseAtk: 12, baseDef: 3, baseSpd: 14, baseAcc: 85, xpReward: 12, lootChance: 0.2, color: '#10b981', shape: 'circle' },
  { name: 'Swarm Warrior', faction: 'Alien Swarm', baseHp: 80, baseAtk: 20, baseDef: 6, baseSpd: 12, baseAcc: 88, xpReward: 28, lootChance: 0.4, color: '#059669', shape: 'triangle' },
  { name: 'Swarm Queen', faction: 'Alien Swarm', baseHp: 180, baseAtk: 28, baseDef: 12, baseSpd: 8, baseAcc: 82, xpReward: 60, lootChance: 0.7, color: '#047857', shape: 'diamond' },
  // Rogue AI
  { name: 'Rogue Drone', faction: 'Rogue AI', baseHp: 70, baseAtk: 16, baseDef: 8, baseSpd: 11, baseAcc: 90, xpReward: 20, lootChance: 0.35, color: '#7c3aed', shape: 'square' },
  { name: 'Combat Android', faction: 'Rogue AI', baseHp: 120, baseAtk: 25, baseDef: 12, baseSpd: 10, baseAcc: 92, xpReward: 40, lootChance: 0.55, color: '#6d28d9', shape: 'circle' },
  { name: 'War Machine', faction: 'Rogue AI', baseHp: 200, baseAtk: 35, baseDef: 18, baseSpd: 7, baseAcc: 85, xpReward: 70, lootChance: 0.65, color: '#5b21b6', shape: 'diamond' },
  // Void Cult
  { name: 'Cultist Acolyte', faction: 'Void Cult', baseHp: 50, baseAtk: 18, baseDef: 4, baseSpd: 12, baseAcc: 88, xpReward: 18, lootChance: 0.3, color: '#00d4ff', shape: 'triangle' },
  { name: 'Void Priest', faction: 'Void Cult', baseHp: 90, baseAtk: 26, baseDef: 7, baseSpd: 11, baseAcc: 90, xpReward: 38, lootChance: 0.5, color: '#0891b2', shape: 'diamond' },
  { name: 'Void Herald', faction: 'Void Cult', baseHp: 160, baseAtk: 34, baseDef: 10, baseSpd: 9, baseAcc: 88, xpReward: 65, lootChance: 0.7, color: '#0e7490', shape: 'circle' },
];

export interface SpaceEnemyTemplate {
  name: string;
  faction: EnemyFaction;
  baseHp: number;
  baseShield: number;
  baseAtk: number;
  baseAcc: number;
  baseEva: number;
  baseMove: number;
  xpReward: number;
  color: string;
}

export const SPACE_ENEMY_TEMPLATES: SpaceEnemyTemplate[] = [
  { name: 'Marauder Fighter', faction: 'Marauders', baseHp: 150, baseShield: 30, baseAtk: 28, baseAcc: 78, baseEva: 12, baseMove: 3, xpReward: 30, color: '#ef4444' },
  { name: 'Marauder Destroyer', faction: 'Marauders', baseHp: 280, baseShield: 60, baseAtk: 40, baseAcc: 72, baseEva: 8, baseMove: 2, xpReward: 55, color: '#dc2626' },
  { name: 'Alien Raider', faction: 'Alien Swarm', baseHp: 120, baseShield: 20, baseAtk: 22, baseAcc: 85, baseEva: 20, baseMove: 4, xpReward: 25, color: '#10b981' },
  { name: 'Alien Hive Ship', faction: 'Alien Swarm', baseHp: 350, baseShield: 80, baseAtk: 35, baseAcc: 75, baseEva: 5, baseMove: 2, xpReward: 65, color: '#059669' },
  { name: 'Rogue Warbot', faction: 'Rogue AI', baseHp: 200, baseShield: 50, baseAtk: 32, baseAcc: 88, baseEva: 14, baseMove: 3, xpReward: 40, color: '#7c3aed' },
  { name: 'Void Phantom', faction: 'Void Cult', baseHp: 130, baseShield: 40, baseAtk: 30, baseAcc: 90, baseEva: 25, baseMove: 4, xpReward: 35, color: '#00d4ff' },
];

export function generateEnemyUnit(template: EnemyTemplate, level: number, index: number): EnemyUnit {
  const scale = 1 + (level - 1) * 0.08;
  return {
    id: `enemy_${template.faction}_${index}_${Date.now()}`,
    name: template.name,
    faction: template.faction,
    level,
    hp: Math.round(template.baseHp * scale),
    maxHp: Math.round(template.baseHp * scale),
    atk: Math.round(template.baseAtk * scale),
    def: Math.round(template.baseDef * scale),
    spd: template.baseSpd,
    acc: template.baseAcc,
    skills: [],
    statusEffects: [],
    xpReward: Math.round(template.xpReward * scale),
    lootChance: template.lootChance,
    color: template.color,
    shape: template.shape,
  };
}

export function generateSpaceEnemy(template: SpaceEnemyTemplate, level: number, q: number, r: number): SpaceEnemyShip {
  const scale = 1 + (level - 1) * 0.08;
  return {
    id: `space_${template.faction}_${q}_${r}_${Date.now()}`,
    name: template.name,
    faction: template.faction,
    level,
    hp: Math.round(template.baseHp * scale),
    maxHp: Math.round(template.baseHp * scale),
    shield: Math.round(template.baseShield * scale),
    maxShield: Math.round(template.baseShield * scale),
    atk: Math.round(template.baseAtk * scale),
    acc: template.baseAcc,
    eva: template.baseEva,
    move: template.baseMove,
    hexQ: q,
    hexR: r,
    xpReward: Math.round(template.xpReward * scale),
    color: template.color,
  };
}
