import type { CaptainClass, ShipType, RobotArchetype, CaptainStats, ShipStats, RobotStats, Skill } from '../types/game';

// ===== CAPTAIN CLASSES =====

export interface CaptainClassData {
  class: CaptainClass;
  description: string;
  baseStats: CaptainStats;
  color: string;
  icon: string;
  skills: Skill[];
  talentBranches: { name: string; talents: string[] }[];
}

export const CAPTAIN_CLASSES: CaptainClassData[] = [
  {
    class: 'Vanguard',
    description: 'A frontline warrior with exceptional defense and melee prowess. Absorbs punishment and protects allies.',
    color: '#ef4444',
    icon: '⚔️',
    baseStats: { hp: 120, maxHp: 120, energy: 80, maxEnergy: 80, atk: 18, def: 15, spd: 10, acc: 85, lck: 5 },
    skills: [
      { id: 'shield_bash', name: 'Shield Bash', description: 'Bash enemy with shield, stuns and deals damage', energyCost: 20, damage: 25, cooldown: 2 },
      { id: 'war_cry', name: 'War Cry', description: 'Battle cry that increases ATK for all allies', energyCost: 30, statusEffect: 'Overcharged', aoe: true, cooldown: 3 },
      { id: 'iron_wall', name: 'Iron Wall', description: 'Enter defensive stance, massively boost DEF', energyCost: 25, statusEffect: 'Shielded', cooldown: 2 },
      { id: 'charge', name: 'Charge', description: 'Rush enemy dealing heavy melee damage', energyCost: 35, damage: 45, cooldown: 3 },
    ],
    talentBranches: [
      { name: 'Fortification', talents: ['Iron Skin', 'Bulwark', 'Unbreakable'] },
      { name: 'Aggression', talents: ['Power Strike', 'Frenzy', 'Berserker'] },
      { name: 'Leadership', talents: ['Rally', 'Inspire', 'Warlord'] },
    ],
  },
  {
    class: 'Techno-Mage',
    description: 'A balanced mage who blends technology and arcane power. Versatile caster with strong skills.',
    color: '#7c3aed',
    icon: '🔮',
    baseStats: { hp: 90, maxHp: 90, energy: 130, maxEnergy: 130, atk: 22, def: 8, spd: 12, acc: 90, lck: 8 },
    skills: [
      { id: 'plasma_bolt', name: 'Plasma Bolt', description: 'Fires a superheated plasma projectile', energyCost: 25, damage: 35, cooldown: 1 },
      { id: 'overcharge', name: 'Overcharge', description: 'Supercharge own systems, boosting ATK', energyCost: 30, statusEffect: 'Overcharged', cooldown: 3 },
      { id: 'emp_burst', name: 'EMP Burst', description: 'Burst of electromagnetic energy, EMPs robots', energyCost: 40, statusEffect: 'EMPd', aoe: true, cooldown: 4 },
      { id: 'nano_repair', name: 'Nano Repair', description: 'Deploy nanobots to heal self or ally', energyCost: 35, healing: 40, cooldown: 2 },
    ],
    talentBranches: [
      { name: 'Arcane', talents: ['Amplify', 'Resonance', 'Singularity'] },
      { name: 'Technology', talents: ['Overclock', 'Redundancy', 'Overload'] },
      { name: 'Synergy', talents: ['Link', 'Harmony', 'Fusion'] },
    ],
  },
  {
    class: 'Gunslinger',
    description: 'A deadly marksman with unmatched accuracy and speed. Shreds enemies from a distance.',
    color: '#f97316',
    icon: '🔫',
    baseStats: { hp: 85, maxHp: 85, energy: 90, maxEnergy: 90, atk: 28, def: 6, spd: 14, acc: 95, lck: 10 },
    skills: [
      { id: 'rapid_fire', name: 'Rapid Fire', description: 'Unleash a burst of shots hitting multiple times', energyCost: 30, damage: 20, aoe: false, cooldown: 2 },
      { id: 'headshot', name: 'Headshot', description: 'Aim for the critical spot for massive damage', energyCost: 35, damage: 55, cooldown: 3 },
      { id: 'fan_the_hammer', name: 'Fan the Hammer', description: 'Spray bullets at all enemies', energyCost: 45, damage: 18, aoe: true, cooldown: 4 },
      { id: 'quick_draw', name: 'Quick Draw', description: 'Boost own speed dramatically', energyCost: 20, statusEffect: 'Energized', cooldown: 2 },
    ],
    talentBranches: [
      { name: 'Precision', talents: ['Eagle Eye', 'Steady Aim', 'Deadeye'] },
      { name: 'Speed', talents: ['Hair Trigger', 'Blur', 'Lightning Draw'] },
      { name: 'Cunning', talents: ['Dirty Trick', 'Exploit', 'Marked'] },
    ],
  },
  {
    class: 'Medic',
    description: 'A battlefield surgeon who keeps allies alive. Has potent healing and support capabilities.',
    color: '#10b981',
    icon: '💊',
    baseStats: { hp: 95, maxHp: 95, energy: 120, maxEnergy: 120, atk: 12, def: 10, spd: 11, acc: 88, lck: 7 },
    skills: [
      { id: 'field_medic', name: 'Field Medic', description: 'Heal a target for significant HP', energyCost: 30, healing: 50, cooldown: 1 },
      { id: 'mass_heal', name: 'Mass Heal', description: 'Heal all allies at once', energyCost: 50, healing: 30, aoe: true, cooldown: 4 },
      { id: 'regen_patch', name: 'Regen Patch', description: 'Apply regeneration to an ally', energyCost: 25, statusEffect: 'Regenerating', cooldown: 2 },
      { id: 'stim_shot', name: 'Stim Shot', description: 'Inject stimulants to boost ally speed and attack', energyCost: 35, statusEffect: 'Energized', cooldown: 3 },
    ],
    talentBranches: [
      { name: 'Healing', talents: ['Potent Meds', 'Overhealing', 'Miracle Worker'] },
      { name: 'Support', talents: ['Buffer', 'Guardian', 'Aura Mastery'] },
      { name: 'Combat Medic', talents: ['Injector Shot', 'Pain Relief', 'Combat Triage'] },
    ],
  },
  {
    class: 'Psycher',
    description: 'A powerful psychic who twists minds and bends reality. Excels at debuffing and crowd control.',
    color: '#00d4ff',
    icon: '🧠',
    baseStats: { hp: 80, maxHp: 80, energy: 140, maxEnergy: 140, atk: 20, def: 7, spd: 13, acc: 92, lck: 12 },
    skills: [
      { id: 'mind_blast', name: 'Mind Blast', description: 'Psychic explosion that damages and stuns', energyCost: 30, damage: 30, cooldown: 2 },
      { id: 'slow_field', name: 'Slow Field', description: 'Create a psychic field that slows all enemies', energyCost: 40, statusEffect: 'Slowed', aoe: true, cooldown: 3 },
      { id: 'glitch_wave', name: 'Glitch Wave', description: 'Destabilize robot systems causing glitches', energyCost: 35, statusEffect: 'Glitched', aoe: true, cooldown: 3 },
      { id: 'psychic_barrier', name: 'Psychic Barrier', description: 'Erect a psychic shield around self', energyCost: 25, statusEffect: 'Shielded', cooldown: 2 },
    ],
    talentBranches: [
      { name: 'Telepathy', talents: ['Probe', 'Override', 'Dominate'] },
      { name: 'Telekinesis', talents: ['Push', 'Crush', 'Singularity'] },
      { name: 'Precognition', talents: ['Foresight', 'Dodge Matrix', 'Oracle'] },
    ],
  },
];

// ===== SHIP TYPES =====

export interface ShipTypeData {
  type: ShipType;
  description: string;
  baseStats: ShipStats;
  color: string;
  icon: string;
}

export const SHIP_TYPES: ShipTypeData[] = [
  {
    type: 'Scout Frigate',
    description: 'Fast and mobile. Excels at hit-and-run tactics. Great for solo explorers.',
    color: '#00d4ff',
    icon: '🚀',
    baseStats: { hp: 200, maxHp: 200, shield: 50, maxShield: 50, atk: 25, acc: 88, eva: 20, move: 5, init: 15 },
  },
  {
    type: 'Heavy Cruiser',
    description: 'A tanky warship built to take punishment and dish it out. Slow but devastating.',
    color: '#ef4444',
    icon: '🛸',
    baseStats: { hp: 400, maxHp: 400, shield: 100, maxShield: 100, atk: 45, acc: 75, eva: 8, move: 2, init: 8 },
  },
  {
    type: 'Stealth Corvette',
    description: 'Impossible to hit, strikes from the shadows. High evasion assassination vessel.',
    color: '#7c3aed',
    icon: '🌑',
    baseStats: { hp: 160, maxHp: 160, shield: 30, maxShield: 30, atk: 30, acc: 85, eva: 35, move: 4, init: 14 },
  },
  {
    type: 'Support Carrier',
    description: 'Tough support platform with excellent shielding. Great for sustained engagements.',
    color: '#10b981',
    icon: '🛡️',
    baseStats: { hp: 300, maxHp: 300, shield: 150, maxShield: 150, atk: 20, acc: 80, eva: 10, move: 3, init: 10 },
  },
  {
    type: 'Drone Commander',
    description: 'Deploys swarms of attack drones for area-of-effect devastation. Versatile commander.',
    color: '#f97316',
    icon: '🤖',
    baseStats: { hp: 250, maxHp: 250, shield: 80, maxShield: 80, atk: 35, acc: 82, eva: 12, move: 3, init: 11 },
  },
];

// ===== ROBOT ARCHETYPES =====

export interface RobotArchetypeData {
  archetype: RobotArchetype;
  description: string;
  baseStats: RobotStats;
  color: string;
  icon: string;
  skills: Skill[];
}

export const ROBOT_ARCHETYPES: RobotArchetypeData[] = [
  {
    archetype: 'Tank-Bot',
    description: 'Built for frontline combat. Absorbs damage and protects allies.',
    color: '#94a3b8',
    icon: '🦾',
    baseStats: { hp: 150, maxHp: 150, battery: 60, maxBattery: 60, atk: 15, def: 20, spd: 7, acc: 80, lck: 3 },
    skills: [
      { id: 'taunt', name: 'Taunt', description: 'Force enemy to target this robot', energyCost: 15, cooldown: 2 },
      { id: 'power_block', name: 'Power Block', description: 'Block incoming attack, reduce damage by 50%', energyCost: 20, statusEffect: 'Shielded', cooldown: 2 },
    ],
  },
  {
    archetype: 'Sniper-Bot',
    description: 'Long-range precision destruction. Low survivability but massive damage output.',
    color: '#60a5fa',
    icon: '🎯',
    baseStats: { hp: 80, maxHp: 80, battery: 70, maxBattery: 70, atk: 35, def: 5, spd: 10, acc: 95, lck: 8 },
    skills: [
      { id: 'precision_shot', name: 'Precision Shot', description: 'Guaranteed critical hit for high damage', energyCost: 30, damage: 60, cooldown: 3 },
      { id: 'target_lock', name: 'Target Lock', description: 'Lock onto target, next hit always crits', energyCost: 20, statusEffect: 'Overcharged', cooldown: 2 },
    ],
  },
  {
    archetype: 'Healer-Bot',
    description: 'Medical support unit. Heals allies and removes status effects.',
    color: '#10b981',
    icon: '💉',
    baseStats: { hp: 90, maxHp: 90, battery: 100, maxBattery: 100, atk: 8, def: 10, spd: 9, acc: 85, lck: 6 },
    skills: [
      { id: 'repair_beam', name: 'Repair Beam', description: 'Restore HP to an ally', energyCost: 25, healing: 45, cooldown: 1 },
      { id: 'system_restore', name: 'System Restore', description: 'Remove all status effects from ally', energyCost: 35, cooldown: 3 },
    ],
  },
  {
    archetype: 'Hacker-Bot',
    description: 'Electronic warfare specialist. Disrupts and debuffs enemy systems.',
    color: '#7c3aed',
    icon: '💻',
    baseStats: { hp: 75, maxHp: 75, battery: 90, maxBattery: 90, atk: 18, def: 6, spd: 12, acc: 90, lck: 10 },
    skills: [
      { id: 'system_glitch', name: 'System Glitch', description: 'Glitch an enemy, 30% skill fail chance', energyCost: 25, statusEffect: 'Glitched', cooldown: 2 },
      { id: 'emp_pulse', name: 'EMP Pulse', description: 'Disable robot enemies for one turn', energyCost: 35, statusEffect: 'EMPd', aoe: true, cooldown: 4 },
    ],
  },
  {
    archetype: 'Demo-Bot',
    description: 'Demolitions expert. Area-of-effect damage with explosive ordnance.',
    color: '#f59e0b',
    icon: '💣',
    baseStats: { hp: 100, maxHp: 100, battery: 80, maxBattery: 80, atk: 28, def: 8, spd: 8, acc: 78, lck: 7 },
    skills: [
      { id: 'grenade_toss', name: 'Grenade Toss', description: 'Throw grenade at all enemies', energyCost: 30, damage: 25, aoe: true, cooldown: 2 },
      { id: 'incendiary', name: 'Incendiary', description: 'Set enemy on fire for damage over time', energyCost: 25, statusEffect: 'Burning', cooldown: 2 },
    ],
  },
  {
    archetype: 'Recon-Bot',
    description: 'Fast scout and striker. Acts early and hits multiple times.',
    color: '#00d4ff',
    icon: '⚡',
    baseStats: { hp: 70, maxHp: 70, battery: 75, maxBattery: 75, atk: 20, def: 7, spd: 16, acc: 92, lck: 9 },
    skills: [
      { id: 'blitz', name: 'Blitz', description: 'Strike twice in one action', energyCost: 30, damage: 18, cooldown: 2 },
      { id: 'dodge_matrix', name: 'Dodge Matrix', description: 'Boost own evasion and speed', energyCost: 20, statusEffect: 'Energized', cooldown: 2 },
    ],
  },
];

export function getCaptainClassData(cls: CaptainClass): CaptainClassData {
  return CAPTAIN_CLASSES.find(c => c.class === cls)!;
}

export function getShipTypeData(type: ShipType): ShipTypeData {
  return SHIP_TYPES.find(s => s.type === type)!;
}

export function getRobotArchetypeData(arch: RobotArchetype): RobotArchetypeData {
  return ROBOT_ARCHETYPES.find(r => r.archetype === arch)!;
}
