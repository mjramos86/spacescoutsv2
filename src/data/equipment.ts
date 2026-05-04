import type { Equipment, Rarity, CaptainEquipSlot, ShipEquipSlot, RobotEquipSlot } from '../types/game';

interface EquipmentTemplate {
  name: string;
  slot: CaptainEquipSlot | ShipEquipSlot | RobotEquipSlot;
  entityType: 'captain' | 'ship' | 'robot';
  description: string;
  baseStats: Record<string, number>;
}

const CAPTAIN_TEMPLATES: EquipmentTemplate[] = [
  { name: 'Combat Helmet', slot: 'helmet', entityType: 'captain', description: 'Reinforced headgear.', baseStats: { hp: 15, def: 3 } },
  { name: 'Neural Crown', slot: 'helmet', entityType: 'captain', description: 'Enhances mental acuity.', baseStats: { energy: 20, acc: 3 } },
  { name: 'Battle Armor', slot: 'armor', entityType: 'captain', description: 'Heavy duty combat armor.', baseStats: { hp: 30, def: 8 } },
  { name: 'Stealth Suit', slot: 'armor', entityType: 'captain', description: 'Light armor with stealth coating.', baseStats: { spd: 3, def: 5, hp: 10 } },
  { name: 'Power Gauntlets', slot: 'gloves', entityType: 'captain', description: 'Amplify striking force.', baseStats: { atk: 8, def: 2 } },
  { name: 'Holo-Gloves', slot: 'gloves', entityType: 'captain', description: 'Interface gloves.', baseStats: { acc: 5, energy: 10 } },
  { name: 'Mag-Boots', slot: 'boots', entityType: 'captain', description: 'Magnetic boots for stability.', baseStats: { spd: 4, def: 3 } },
  { name: 'Thruster Boots', slot: 'boots', entityType: 'captain', description: 'Micro-thrusters for mobility.', baseStats: { spd: 6, hp: 10 } },
  { name: 'Plasma Rifle', slot: 'primaryWeapon', entityType: 'captain', description: 'High energy ranged weapon.', baseStats: { atk: 18, acc: 5 } },
  { name: 'Void Blade', slot: 'primaryWeapon', entityType: 'captain', description: 'Blade forged from dark matter.', baseStats: { atk: 22, lck: 3 } },
  { name: 'Ion Pistol', slot: 'secondaryWeapon', entityType: 'captain', description: 'Secondary sidearm.', baseStats: { atk: 10, acc: 8 } },
  { name: 'Shield Generator', slot: 'secondaryWeapon', entityType: 'captain', description: 'Personal shield emitter.', baseStats: { def: 12, hp: 20 } },
  { name: 'Combat Implant', slot: 'implant', entityType: 'captain', description: 'Neural combat enhancement.', baseStats: { atk: 6, spd: 3 } },
  { name: 'Health Matrix', slot: 'implant', entityType: 'captain', description: 'Bio-regeneration implant.', baseStats: { hp: 40, lck: 4 } },
  { name: 'Scout Badge', slot: 'badge', entityType: 'captain', description: 'Badge of the Scout Corps.', baseStats: { lck: 5, acc: 3 } },
  { name: 'Captain Badge', slot: 'badge', entityType: 'captain', description: 'Mark of a true captain.', baseStats: { atk: 4, def: 4, hp: 15 } },
];

const SHIP_TEMPLATES: EquipmentTemplate[] = [
  { name: 'Titanium Plating', slot: 'hullPlating', entityType: 'ship', description: 'Extra hull reinforcement.', baseStats: { hp: 60, shield: 10 } },
  { name: 'Composite Armor', slot: 'hullPlating', entityType: 'ship', description: 'Lightweight composite materials.', baseStats: { hp: 40, eva: 5 } },
  { name: 'Hyperdrive Core', slot: 'engineCore', entityType: 'ship', description: 'Advanced engine system.', baseStats: { eva: 8 } },
  { name: 'Ion Thrusters', slot: 'engineCore', entityType: 'ship', description: 'High-thrust ion engines.', baseStats: { eva: 5, hp: 20 } },
  { name: 'Pulse Cannon', slot: 'weaponArray1', entityType: 'ship', description: 'Ship-mounted pulse cannon.', baseStats: { atk: 25, acc: 5 } },
  { name: 'Railgun', slot: 'weaponArray1', entityType: 'ship', description: 'Kinetic railgun system.', baseStats: { atk: 35, acc: -5 } },
  { name: 'Missile Pod', slot: 'weaponArray2', entityType: 'ship', description: 'Guided missile launcher.', baseStats: { atk: 20, acc: 8 } },
  { name: 'Point Defense', slot: 'weaponArray2', entityType: 'ship', description: 'Anti-missile point defense.', baseStats: { eva: 6, acc: 5 } },
  { name: 'Deflector Shield', slot: 'shieldSystem', entityType: 'ship', description: 'Enhanced shield generator.', baseStats: { shield: 60 } },
  { name: 'Ablative Shields', slot: 'shieldSystem', entityType: 'ship', description: 'Sacrificial ablative layers.', baseStats: { shield: 40, hp: 30 } },
  { name: 'Stealth Module', slot: 'auxModule1', entityType: 'ship', description: 'Stealth coating system.', baseStats: { eva: 10 } },
  { name: 'Repair Drones', slot: 'auxModule1', entityType: 'ship', description: 'Auto-repair nanodrones.', baseStats: { hp: 50, shield: 15 } },
  { name: 'Target Computer', slot: 'auxModule2', entityType: 'ship', description: 'Advanced targeting system.', baseStats: { acc: 12, atk: 8 } },
  { name: 'Warp Drive', slot: 'auxModule2', entityType: 'ship', description: 'Short-range warp capability.', baseStats: { eva: 8, hp: 20 } },
];

const ROBOT_TEMPLATES: EquipmentTemplate[] = [
  { name: 'Reinforced Chassis', slot: 'chassisUpgrade', entityType: 'robot', description: 'Stronger robot frame.', baseStats: { hp: 40, def: 8 } },
  { name: 'Combat Frame', slot: 'chassisUpgrade', entityType: 'robot', description: 'Optimized combat chassis.', baseStats: { atk: 10, spd: 3 } },
  { name: 'Laser Arm', slot: 'weaponModule', entityType: 'robot', description: 'Integrated laser weapon.', baseStats: { atk: 18, acc: 5 } },
  { name: 'Plasma Cutter', slot: 'weaponModule', entityType: 'robot', description: 'Industrial plasma weapon.', baseStats: { atk: 22, acc: -2 } },
  { name: 'Targeting Chip', slot: 'utilityChip1', entityType: 'robot', description: 'Enhanced targeting AI.', baseStats: { acc: 8, lck: 3 } },
  { name: 'Speed Chip', slot: 'utilityChip1', entityType: 'robot', description: 'Overclocked processor.', baseStats: { spd: 5, battery: 15 } },
  { name: 'Shield Emitter', slot: 'utilityChip2', entityType: 'robot', description: 'Personal shield emitter.', baseStats: { def: 10, hp: 20 } },
  { name: 'Energy Cell', slot: 'utilityChip2', entityType: 'robot', description: 'Extended battery cell.', baseStats: { battery: 30, hp: 10 } },
];

const ALL_TEMPLATES = [...CAPTAIN_TEMPLATES, ...SHIP_TEMPLATES, ...ROBOT_TEMPLATES];

const RARITY_MULTIPLIERS: Record<Rarity, number> = {
  Common: 1.0,
  Uncommon: 1.3,
  Rare: 1.7,
  Epic: 2.3,
  Legendary: 3.0,
};

const RARITY_BONUS_STATS: Record<Rarity, number> = {
  Common: 0,
  Uncommon: 1,
  Rare: 2,
  Epic: 3,
  Legendary: 5,
};

export const SELL_VALUES: Record<Rarity, number> = {
  Common: 20,
  Uncommon: 60,
  Rare: 150,
  Epic: 400,
  Legendary: 1000,
};

export function generateEquipment(rarity: Rarity, entityType?: 'captain' | 'ship' | 'robot', seed?: number): Equipment {
  const templates = entityType ? ALL_TEMPLATES.filter(t => t.entityType === entityType) : ALL_TEMPLATES;
  const idx = seed !== undefined ? seed % templates.length : Math.floor(Math.random() * templates.length);
  const template = templates[idx];
  const mult = RARITY_MULTIPLIERS[rarity];
  const bonus = RARITY_BONUS_STATS[rarity];

  const stats: Record<string, number> = {};
  Object.entries(template.baseStats).forEach(([key, val]) => {
    stats[key] = Math.round(val * mult);
  });

  // Add bonus stat for higher rarities
  if (bonus > 0) {
    const bonusStatPool = ['atk', 'def', 'hp', 'spd', 'acc', 'lck'];
    const bonusStat = bonusStatPool[Math.floor(Math.random() * bonusStatPool.length)];
    stats[bonusStat] = (stats[bonusStat] || 0) + bonus * 3;
  }

  return {
    id: `equip_${rarity}_${template.slot}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name: rarity !== 'Common' ? `${rarity} ${template.name}` : template.name,
    rarity,
    slot: template.slot,
    entityType: template.entityType,
    stats,
    description: template.description,
    sellValue: SELL_VALUES[rarity],
  };
}

export function generateMarketInventory(): import('../types/game').MarketItem[] {
  const items: import('../types/game').MarketItem[] = [];
  const rarities: Rarity[] = ['Common', 'Common', 'Common', 'Uncommon', 'Uncommon', 'Rare', 'Epic'];
  const types: ('captain' | 'ship' | 'robot')[] = ['captain', 'captain', 'ship', 'ship', 'robot', 'robot', 'captain'];

  for (let i = 0; i < 7; i++) {
    const equip = generateEquipment(rarities[i], types[i]);
    items.push({
      equipment: equip,
      price: Math.round(equip.sellValue * 2.5),
      stock: Math.floor(Math.random() * 3) + 1,
    });
  }
  return items;
}

export { ALL_TEMPLATES };
