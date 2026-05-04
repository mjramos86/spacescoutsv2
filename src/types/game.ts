// ===== ENUMS =====

export type CaptainClass = 'Vanguard' | 'Techno-Mage' | 'Gunslinger' | 'Medic' | 'Psycher';
export type ShipType = 'Scout Frigate' | 'Heavy Cruiser' | 'Stealth Corvette' | 'Support Carrier' | 'Drone Commander';
export type RobotArchetype = 'Tank-Bot' | 'Sniper-Bot' | 'Healer-Bot' | 'Hacker-Bot' | 'Demo-Bot' | 'Recon-Bot';
export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type Biome = 'Desert Planet' | 'Ice Moon' | 'Derelict Space Station';
export type Difficulty = 'Easy' | 'Normal' | 'Hard' | 'Nightmare';
export type EnemyFaction = 'Marauders' | 'Alien Swarm' | 'Rogue AI' | 'Void Cult';

export type CaptainEquipSlot = 'helmet' | 'armor' | 'gloves' | 'boots' | 'primaryWeapon' | 'secondaryWeapon' | 'implant' | 'badge';
export type ShipEquipSlot = 'hullPlating' | 'engineCore' | 'weaponArray1' | 'weaponArray2' | 'shieldSystem' | 'auxModule1' | 'auxModule2';
export type RobotEquipSlot = 'chassisUpgrade' | 'weaponModule' | 'utilityChip1' | 'utilityChip2';

export type StatusEffect = 'Overcharged' | 'Shielded' | 'Energized' | 'Regenerating' | 'Glitched' | 'EMPd' | 'Burning' | 'Slowed';
export type HexZone = 'Nebula' | 'IonStorm' | 'OpenSpace' | 'Debris';

// ===== STATS =====

export interface CaptainStats {
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  atk: number;
  def: number;
  spd: number;
  acc: number;
  lck: number;
}

export interface ShipStats {
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  atk: number;
  acc: number;
  eva: number;
  move: number;
  init: number;
}

export interface RobotStats {
  hp: number;
  maxHp: number;
  battery: number;
  maxBattery: number;
  atk: number;
  def: number;
  spd: number;
  acc: number;
  lck: number;
}

// ===== EQUIPMENT =====

export interface StatBonus {
  hp?: number;
  energy?: number;
  atk?: number;
  def?: number;
  spd?: number;
  acc?: number;
  lck?: number;
  shield?: number;
  eva?: number;
  battery?: number;
}

export interface Equipment {
  id: string;
  name: string;
  rarity: Rarity;
  slot: CaptainEquipSlot | ShipEquipSlot | RobotEquipSlot;
  entityType: 'captain' | 'ship' | 'robot';
  stats: StatBonus;
  description: string;
  sellValue: number;
}

// ===== SKILLS =====

export interface Skill {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  damage?: number;
  healing?: number;
  statusEffect?: StatusEffect;
  aoe?: boolean;
  cooldown: number;
  currentCooldown?: number;
}

// ===== CAPTAIN =====

export interface Captain {
  id: string;
  name: string;
  class: CaptainClass;
  level: number;
  xp: number;
  xpToNext: number;
  baseStats: CaptainStats;
  currentStats: CaptainStats;
  equipment: Partial<Record<CaptainEquipSlot, Equipment>>;
  skills: Skill[];
  statusEffects: StatusEffect[];
  talentPoints: number;
  talents: string[];
}

// ===== SHIP =====

export interface Ship {
  id: string;
  name: string;
  type: ShipType;
  level: number;
  xp: number;
  xpToNext: number;
  baseStats: ShipStats;
  currentStats: ShipStats;
  equipment: Partial<Record<ShipEquipSlot, Equipment>>;
  statusEffects: StatusEffect[];
}

// ===== ROBOT =====

export interface Robot {
  id: string;
  name: string;
  archetype: RobotArchetype;
  level: number;
  xp: number;
  xpToNext: number;
  baseStats: RobotStats;
  currentStats: RobotStats;
  equipment: Partial<Record<RobotEquipSlot, Equipment>>;
  skills: Skill[];
  statusEffects: StatusEffect[];
}

// ===== ENEMIES =====

export interface EnemyUnit {
  id: string;
  name: string;
  faction: EnemyFaction;
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  acc: number;
  shield?: number;
  maxShield?: number;
  eva?: number;
  move?: number;
  skills: Skill[];
  statusEffects: StatusEffect[];
  xpReward: number;
  lootChance: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle' | 'diamond';
}

export interface SpaceEnemyShip {
  id: string;
  name: string;
  faction: EnemyFaction;
  level: number;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  atk: number;
  acc: number;
  eva: number;
  move: number;
  hexQ: number;
  hexR: number;
  xpReward: number;
  color: string;
}

// ===== HEX GRID =====

export interface HexCell {
  q: number;
  r: number;
  zone: HexZone;
  occupied?: 'player' | 'enemy';
  occupantId?: string;
}

// ===== MISSIONS =====

export interface Mission {
  id: string;
  name: string;
  biome: Biome;
  faction: EnemyFaction;
  difficulty: Difficulty;
  description: string;
  xpReward: { captain: number; ship: number; robots: number };
  creditReward: number;
  lootDrops: number;
  spaceEnemies: SpaceEnemyShip[];
  surfaceEnemies: EnemyUnit[][];
  seed: number;
}

// ===== COMBAT STATE =====

export interface SpaceCombatState {
  mission: Mission;
  playerShip: Ship;
  enemies: SpaceEnemyShip[];
  grid: HexCell[][];
  playerQ: number;
  playerR: number;
  phase: 'select' | 'move' | 'attack' | 'enemy' | 'victory' | 'defeat';
  selectedCell?: { q: number; r: number };
  validMoves: { q: number; r: number }[];
  validAttacks: { q: number; r: number }[];
  log: string[];
  turn: number;
  shipMoved: boolean;
  shipAttacked: boolean;
}

export interface Combatant {
  id: string;
  name: string;
  isEnemy: boolean;
  hp: number;
  maxHp: number;
  energy?: number;
  maxEnergy?: number;
  battery?: number;
  maxBattery?: number;
  atk: number;
  def: number;
  spd: number;
  acc: number;
  lck: number;
  skills: Skill[];
  statusEffects: StatusEffect[];
  entityRef: 'captain' | 'robot0' | 'robot1' | 'enemy';
  level: number;
}

export interface SurfaceCombatState {
  mission: Mission;
  combatants: Combatant[];
  initiativeOrder: string[];
  currentTurnId: string;
  phase: 'playerTurn' | 'enemyTurn' | 'animating' | 'victory' | 'defeat' | 'flee';
  selectedAction?: 'attack' | 'skill' | 'item' | 'defend' | 'flee';
  selectedSkill?: Skill;
  selectedTargetId?: string;
  log: string[];
  turn: number;
  enemyGroups: EnemyUnit[][];
}

// ===== LOOT =====

export interface LootDrop {
  equipment: Equipment;
  isNew: boolean;
}

// ===== MISSION RESULT =====

export interface MissionResult {
  success: boolean;
  xpGained: { captain: number; ship: number; robots: number };
  creditsGained: number;
  loot: Equipment[];
  missionName: string;
}

// ===== MARKET =====

export interface MarketItem {
  equipment: Equipment;
  price: number;
  stock: number;
}

// ===== ACHIEVEMENT =====

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number;
}

// ===== ACCOUNT / PLAYER =====

export interface Account {
  username: string;
  passwordHash: string;
  createdAt: number;
}

export interface PlayerProfile {
  username: string;
  captain: Captain;
  ship: Ship;
  robots: Robot[];
  selectedRobots: [string, string];
  inventory: Equipment[];
  credits: number;
  completedMissions: number;
  totalXpEarned: number;
  achievements: Achievement[];
  marketRefreshTime: number;
  marketItems: MarketItem[];
  stats: {
    missionsCompleted: number;
    enemiesDefeated: number;
    totalDamageDealt: number;
    totalHealingDone: number;
    totalCreditsEarned: number;
    totalLootFound: number;
  };
}

// ===== GAME STATE =====

export type GameScreen = 'login' | 'characterCreation' | 'hub' | 'spaceCombat' | 'surfaceCombat' | 'missionResult';

export interface GameState {
  screen: GameScreen;
  currentUser?: string;
  accounts: Record<string, Account>;
  profiles: Record<string, PlayerProfile>;
  activeMission?: Mission;
  spaceCombat?: SpaceCombatState;
  surfaceCombat?: SurfaceCombatState;
  missionResult?: MissionResult;
}
