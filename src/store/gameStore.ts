import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  GameState, GameScreen, PlayerProfile, Account, Captain, Ship, Robot,
  CaptainClass, ShipType, Equipment, CaptainEquipSlot, ShipEquipSlot, RobotEquipSlot,
  Mission, SpaceCombatState, SurfaceCombatState, MissionResult, HexCell,
  Combatant, StatusEffect, Difficulty, MarketItem,
} from '../types/game';
import { getCaptainClassData, getShipTypeData, getRobotArchetypeData, ROBOT_ARCHETYPES } from '../data/classes';
import { generateMarketInventory } from '../data/equipment';
import { generateMission, generateHexGrid } from '../data/missions';
import { generateLoot } from '../utils/loot';
import { levelUpCaptain, levelUpShip, levelUpRobot, captainXpToNext, shipXpToNext, robotXpToNext } from '../utils/progression';
import { hexDistance, getReachableCells, getAttackableCells, calculateSpaceDamage, enemyAiMove, calculateDamage, calculateSkillDamage, processStatusEffects, calculateInitiative } from '../utils/combat';

// Simple SHA-256 substitute using a hash function
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function createCaptain(name: string, captainClass: CaptainClass): Captain {
  const classData = getCaptainClassData(captainClass);
  return {
    id: generateId(),
    name,
    class: captainClass,
    level: 1,
    xp: 0,
    xpToNext: captainXpToNext(1),
    baseStats: { ...classData.baseStats },
    currentStats: { ...classData.baseStats },
    equipment: {},
    skills: classData.skills.map(s => ({ ...s, currentCooldown: 0 })),
    statusEffects: [],
    talentPoints: 0,
    talents: [],
  };
}

function createShip(shipType: ShipType): Ship {
  const typeData = getShipTypeData(shipType);
  return {
    id: generateId(),
    name: `${shipType} Alpha`,
    type: shipType,
    level: 1,
    xp: 0,
    xpToNext: shipXpToNext(1),
    baseStats: { ...typeData.baseStats },
    currentStats: { ...typeData.baseStats },
    equipment: {},
    statusEffects: [],
  };
}

function createRobot(archetype: typeof ROBOT_ARCHETYPES[0]['archetype'], index: number): Robot {
  const archData = getRobotArchetypeData(archetype);
  return {
    id: generateId(),
    name: `${archetype}-${index + 1}`,
    archetype,
    level: 1,
    xp: 0,
    xpToNext: robotXpToNext(1),
    baseStats: { ...archData.baseStats },
    currentStats: { ...archData.baseStats },
    equipment: {},
    skills: archData.skills.map(s => ({ ...s, currentCooldown: 0 })),
    statusEffects: [],
  };
}

function createStartingRobots(): Robot[] {
  const archetypes = [...ROBOT_ARCHETYPES].sort(() => Math.random() - 0.5).slice(0, 3);
  return archetypes.map((a, i) => createRobot(a.archetype, i));
}

function createCombatantFromCaptain(captain: Captain): Combatant {
  return {
    id: captain.id,
    name: captain.name,
    isEnemy: false,
    hp: captain.currentStats.hp,
    maxHp: captain.currentStats.maxHp,
    energy: captain.currentStats.energy,
    maxEnergy: captain.currentStats.maxEnergy,
    atk: captain.currentStats.atk,
    def: captain.currentStats.def,
    spd: captain.currentStats.spd,
    acc: captain.currentStats.acc,
    lck: captain.currentStats.lck,
    skills: captain.skills.map(s => ({ ...s, currentCooldown: 0 })),
    statusEffects: [],
    entityRef: 'captain',
    level: captain.level,
  };
}

function createCombatantFromRobot(robot: Robot, index: number): Combatant {
  return {
    id: robot.id,
    name: robot.name,
    isEnemy: false,
    hp: robot.currentStats.hp,
    maxHp: robot.currentStats.maxHp,
    battery: robot.currentStats.battery,
    maxBattery: robot.currentStats.maxBattery,
    atk: robot.currentStats.atk,
    def: robot.currentStats.def,
    spd: robot.currentStats.spd,
    acc: robot.currentStats.acc,
    lck: robot.currentStats.lck,
    skills: robot.skills.map(s => ({ ...s, currentCooldown: 0 })),
    statusEffects: [],
    entityRef: index === 0 ? 'robot0' : 'robot1',
    level: robot.level,
  };
}

interface GameActions {
  // Auth
  login: (username: string, password: string) => Promise<{ success: boolean; isNew: boolean; error?: string }>;
  logout: () => void;
  // Character creation
  createCharacter: (captainName: string, captainClass: CaptainClass, shipType: ShipType) => void;
  // Navigation
  setScreen: (screen: GameScreen) => void;
  // Equipment
  equipItem: (entityType: 'captain' | 'ship' | 'robot', robotId: string | null, item: Equipment) => void;
  unequipItem: (entityType: 'captain' | 'ship' | 'robot', robotId: string | null, slot: CaptainEquipSlot | ShipEquipSlot | RobotEquipSlot) => void;
  sellItem: (itemId: string) => void;
  salvageItem: (itemId: string) => void;
  // Market
  buyMarketItem: (itemId: string) => void;
  refreshMarket: () => void;
  // Robot management
  selectRobots: (robotIds: [string, string]) => void;
  renameRobot: (robotId: string, name: string) => void;
  // Missions
  launchMission: (difficulty: Difficulty) => void;
  // Space combat
  selectSpaceCell: (q: number, r: number) => void;
  endSpaceTurn: () => void;
  // Surface combat
  selectSurfaceAction: (action: 'attack' | 'skill' | 'item' | 'defend' | 'flee') => void;
  selectSurfaceSkill: (skillId: string) => void;
  selectSurfaceTarget: (targetId: string) => void;
  executePlayerTurn: () => void;
  runEnemyTurn: () => void;
  // Mission result
  collectResults: () => void;
  // Talent
  learnTalent: (talentName: string) => void;
}

const initialState: GameState = {
  screen: 'login',
  currentUser: undefined,
  accounts: {},
  profiles: {},
  activeMission: undefined,
  spaceCombat: undefined,
  surfaceCombat: undefined,
  missionResult: undefined,
};

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (username: string, password: string) => {
        const state = get();
        const hash = await hashPassword(password);
        const existingAccount = state.accounts[username];

        if (existingAccount) {
          if (existingAccount.passwordHash !== hash) {
            return { success: false, isNew: false, error: 'Invalid password' };
          }
          const hasProfile = !!state.profiles[username];
          set({ currentUser: username, screen: hasProfile ? 'hub' : 'characterCreation' });
          return { success: true, isNew: !hasProfile };
        } else {
          // New account
          const newAccount: Account = { username, passwordHash: hash, createdAt: Date.now() };
          set(s => ({
            accounts: { ...s.accounts, [username]: newAccount },
            currentUser: username,
            screen: 'characterCreation',
          }));
          return { success: true, isNew: true };
        }
      },

      logout: () => {
        set({ currentUser: undefined, screen: 'login', activeMission: undefined, spaceCombat: undefined, surfaceCombat: undefined });
      },

      createCharacter: (captainName, captainClass, shipType) => {
        const state = get();
        if (!state.currentUser) return;

        const captain = createCaptain(captainName, captainClass);
        const ship = createShip(shipType);
        const robots = createStartingRobots();
        const marketItems = generateMarketInventory();

        const profile: PlayerProfile = {
          username: state.currentUser,
          captain,
          ship,
          robots,
          selectedRobots: [robots[0].id, robots[1].id],
          inventory: [],
          credits: 500,
          completedMissions: 0,
          totalXpEarned: 0,
          achievements: [],
          marketRefreshTime: Date.now() + 24 * 60 * 60 * 1000,
          marketItems,
          stats: {
            missionsCompleted: 0,
            enemiesDefeated: 0,
            totalDamageDealt: 0,
            totalHealingDone: 0,
            totalCreditsEarned: 0,
            totalLootFound: 0,
          },
        };

        set(s => ({
          profiles: { ...s.profiles, [state.currentUser!]: profile },
          screen: 'hub',
        }));
      },

      setScreen: (screen) => set({ screen }),

      equipItem: (entityType, robotId, item) => {
        const state = get();
        if (!state.currentUser) return;
        const profile = state.profiles[state.currentUser];
        if (!profile) return;

        let updatedProfile = { ...profile };

        if (entityType === 'captain') {
          const slot = item.slot as CaptainEquipSlot;
          const oldItem = profile.captain.equipment[slot];
          const newInventory = profile.inventory.filter(i => i.id !== item.id);
          if (oldItem) newInventory.push(oldItem);
          updatedProfile.captain = {
            ...profile.captain,
            equipment: { ...profile.captain.equipment, [slot]: item },
          };
          updatedProfile.inventory = newInventory;
        } else if (entityType === 'ship') {
          const slot = item.slot as ShipEquipSlot;
          const oldItem = profile.ship.equipment[slot];
          const newInventory = profile.inventory.filter(i => i.id !== item.id);
          if (oldItem) newInventory.push(oldItem);
          updatedProfile.ship = {
            ...profile.ship,
            equipment: { ...profile.ship.equipment, [slot]: item },
          };
          updatedProfile.inventory = newInventory;
        } else if (entityType === 'robot' && robotId) {
          const slot = item.slot as RobotEquipSlot;
          const robot = profile.robots.find(r => r.id === robotId);
          if (!robot) return;
          const oldItem = robot.equipment[slot];
          const newInventory = profile.inventory.filter(i => i.id !== item.id);
          if (oldItem) newInventory.push(oldItem);
          const updatedRobot = { ...robot, equipment: { ...robot.equipment, [slot]: item } };
          updatedProfile.robots = profile.robots.map(r => r.id === robotId ? updatedRobot : r);
          updatedProfile.inventory = newInventory;
        }

        set(s => ({ profiles: { ...s.profiles, [state.currentUser!]: updatedProfile } }));
      },

      unequipItem: (entityType, robotId, slot) => {
        const state = get();
        if (!state.currentUser) return;
        const profile = state.profiles[state.currentUser];
        if (!profile) return;

        let updatedProfile = { ...profile };

        if (entityType === 'captain') {
          const item = profile.captain.equipment[slot as CaptainEquipSlot];
          if (!item) return;
          const newEquip = { ...profile.captain.equipment };
          delete newEquip[slot as CaptainEquipSlot];
          updatedProfile.captain = { ...profile.captain, equipment: newEquip };
          updatedProfile.inventory = [...profile.inventory, item];
        } else if (entityType === 'ship') {
          const item = profile.ship.equipment[slot as ShipEquipSlot];
          if (!item) return;
          const newEquip = { ...profile.ship.equipment };
          delete newEquip[slot as ShipEquipSlot];
          updatedProfile.ship = { ...profile.ship, equipment: newEquip };
          updatedProfile.inventory = [...profile.inventory, item];
        } else if (entityType === 'robot' && robotId) {
          const robot = profile.robots.find(r => r.id === robotId);
          if (!robot) return;
          const item = robot.equipment[slot as RobotEquipSlot];
          if (!item) return;
          const newEquip = { ...robot.equipment };
          delete newEquip[slot as RobotEquipSlot];
          const updatedRobot = { ...robot, equipment: newEquip };
          updatedProfile.robots = profile.robots.map(r => r.id === robotId ? updatedRobot : r);
          updatedProfile.inventory = [...profile.inventory, item];
        }

        set(s => ({ profiles: { ...s.profiles, [state.currentUser!]: updatedProfile } }));
      },

      sellItem: (itemId) => {
        const state = get();
        if (!state.currentUser) return;
        const profile = state.profiles[state.currentUser];
        if (!profile) return;
        const item = profile.inventory.find(i => i.id === itemId);
        if (!item) return;
        set(s => ({
          profiles: {
            ...s.profiles,
            [state.currentUser!]: {
              ...profile,
              inventory: profile.inventory.filter(i => i.id !== itemId),
              credits: profile.credits + item.sellValue,
            },
          },
        }));
      },

      salvageItem: (itemId) => {
        const state = get();
        if (!state.currentUser) return;
        const profile = state.profiles[state.currentUser];
        if (!profile) return;
        const item = profile.inventory.find(i => i.id === itemId);
        if (!item) return;
        const salvageValue = Math.round(item.sellValue * 0.3);
        set(s => ({
          profiles: {
            ...s.profiles,
            [state.currentUser!]: {
              ...profile,
              inventory: profile.inventory.filter(i => i.id !== itemId),
              credits: profile.credits + salvageValue,
            },
          },
        }));
      },

      buyMarketItem: (itemId) => {
        const state = get();
        if (!state.currentUser) return;
        const profile = state.profiles[state.currentUser];
        if (!profile) return;
        const marketItem = profile.marketItems.find(m => m.equipment.id === itemId);
        if (!marketItem || marketItem.stock <= 0 || profile.credits < marketItem.price) return;
        const updatedMarket = profile.marketItems.map(m =>
          m.equipment.id === itemId ? { ...m, stock: m.stock - 1 } : m
        );
        set(s => ({
          profiles: {
            ...s.profiles,
            [state.currentUser!]: {
              ...profile,
              credits: profile.credits - marketItem.price,
              inventory: [...profile.inventory, { ...marketItem.equipment, id: `${marketItem.equipment.id}_${Date.now()}` }],
              marketItems: updatedMarket,
            },
          },
        }));
      },

      refreshMarket: () => {
        const state = get();
        if (!state.currentUser) return;
        const profile = state.profiles[state.currentUser];
        if (!profile) return;
        set(s => ({
          profiles: {
            ...s.profiles,
            [state.currentUser!]: {
              ...profile,
              marketItems: generateMarketInventory(),
              marketRefreshTime: Date.now() + 24 * 60 * 60 * 1000,
            },
          },
        }));
      },

      selectRobots: (robotIds) => {
        const state = get();
        if (!state.currentUser) return;
        const profile = state.profiles[state.currentUser];
        if (!profile) return;
        set(s => ({
          profiles: {
            ...s.profiles,
            [state.currentUser!]: { ...profile, selectedRobots: robotIds },
          },
        }));
      },

      renameRobot: (robotId, name) => {
        const state = get();
        if (!state.currentUser) return;
        const profile = state.profiles[state.currentUser];
        if (!profile) return;
        set(s => ({
          profiles: {
            ...s.profiles,
            [state.currentUser!]: {
              ...profile,
              robots: profile.robots.map(r => r.id === robotId ? { ...r, name } : r),
            },
          },
        }));
      },

      launchMission: (difficulty) => {
        const state = get();
        if (!state.currentUser) return;
        const profile = state.profiles[state.currentUser];
        if (!profile) return;

        const mission = generateMission(profile.captain.level, difficulty);
        const grid = generateHexGrid(mission.seed);

        const spaceState: SpaceCombatState = {
          mission,
          playerShip: { ...profile.ship, currentStats: { ...profile.ship.currentStats } },
          enemies: mission.spaceEnemies.map(e => ({ ...e })),
          grid,
          playerQ: 0,
          playerR: 3,
          phase: 'select',
          validMoves: [],
          validAttacks: [],
          log: ['Mission started! Space combat phase.'],
          turn: 1,
          shipMoved: false,
          shipAttacked: false,
        };

        set({ activeMission: mission, spaceCombat: spaceState, screen: 'spaceCombat' });
      },

      selectSpaceCell: (q, r) => {
        const state = get();
        const sc = state.spaceCombat;
        if (!sc) return;

        if (sc.phase === 'select') {
          // Show valid moves and attacks
          const moves = getReachableCells(sc.playerQ, sc.playerR, sc.playerShip.currentStats.move, sc.grid, sc.enemies);
          const attacks = getAttackableCells(sc.playerQ, sc.playerR, sc.enemies);
          set({ spaceCombat: { ...sc, phase: 'move', validMoves: moves, validAttacks: attacks, selectedCell: { q, r } } });
        } else if (sc.phase === 'move') {
          // Check if clicking a valid move cell
          const isMove = sc.validMoves.some(m => m.q === q && m.r === r);
          const isAttack = sc.validAttacks.some(a => a.q === q && a.r === r);

          if (isMove && !sc.shipMoved) {
            // Move to cell
            const newAttacks = getAttackableCells(q, r, sc.enemies);
            const cell = sc.grid[q]?.[r];
            let newHp = sc.playerShip.currentStats.hp;
            const newLog = [...sc.log];

            if (cell?.zone === 'Debris') {
              const debris = Math.round(sc.playerShip.currentStats.maxHp * 0.05);
              newHp = Math.max(0, newHp - debris);
              newLog.push(`Debris field! Ship takes ${debris} damage.`);
            }

            const updatedShip = {
              ...sc.playerShip,
              currentStats: { ...sc.playerShip.currentStats, hp: newHp },
            };

            set({
              spaceCombat: {
                ...sc,
                playerQ: q,
                playerR: r,
                playerShip: updatedShip,
                shipMoved: true,
                phase: 'attack',
                validMoves: [],
                validAttacks: newAttacks,
                log: newLog,
              },
            });
          } else if (isAttack && !sc.shipAttacked) {
            // Attack enemy
            const enemy = sc.enemies.find(e => e.hexQ === q && e.hexR === r);
            if (!enemy) return;

            const cell = sc.grid[enemy.hexQ]?.[enemy.hexR];
            const { hpDamage, shieldDamage, missed } = calculateSpaceDamage(
              sc.playerShip.currentStats.atk,
              sc.playerShip.currentStats.acc,
              enemy.eva,
              enemy.shield,
              enemy.hp,
              cell?.zone
            );

            const newLog = [...sc.log];
            let updatedEnemies = [...sc.enemies];

            if (missed) {
              newLog.push(`Attack missed ${enemy.name}!`);
            } else {
              newLog.push(`Hit ${enemy.name} for ${hpDamage + shieldDamage} damage! (${shieldDamage} shield, ${hpDamage} hull)`);
              updatedEnemies = sc.enemies.map(e => {
                if (e.id === enemy.id) {
                  const newShield = Math.max(0, e.shield - shieldDamage);
                  const newHp = Math.max(0, e.hp - hpDamage);
                  return { ...e, shield: newShield, hp: newHp };
                }
                return e;
              });
            }

            // Remove dead enemies
            const deadEnemies = updatedEnemies.filter(e => e.hp <= 0);
            deadEnemies.forEach(e => newLog.push(`${e.name} destroyed!`));
            updatedEnemies = updatedEnemies.filter(e => e.hp > 0);

            const victory = updatedEnemies.length === 0;

            if (victory) {
              set({
                spaceCombat: {
                  ...sc,
                  enemies: updatedEnemies,
                  shipAttacked: true,
                  phase: 'victory',
                  log: [...newLog, 'All enemy ships destroyed! Proceeding to surface.'],
                },
              });
            } else {
              set({
                spaceCombat: {
                  ...sc,
                  enemies: updatedEnemies,
                  shipAttacked: true,
                  phase: sc.shipMoved ? 'enemy' : 'attack',
                  validAttacks: [],
                  log: newLog,
                },
              });
            }
          }
        } else if (sc.phase === 'attack') {
          // Check for attack
          const isAttack = sc.validAttacks.some(a => a.q === q && a.r === r);
          if (isAttack) {
            const enemy = sc.enemies.find(e => e.hexQ === q && e.hexR === r);
            if (!enemy) return;

            const cell = sc.grid[enemy.hexQ]?.[enemy.hexR];
            const { hpDamage, shieldDamage, missed } = calculateSpaceDamage(
              sc.playerShip.currentStats.atk,
              sc.playerShip.currentStats.acc,
              enemy.eva,
              enemy.shield,
              enemy.hp,
              cell?.zone
            );

            const newLog = [...sc.log];
            let updatedEnemies = [...sc.enemies];

            if (missed) {
              newLog.push(`Attack missed ${enemy.name}!`);
            } else {
              newLog.push(`Hit ${enemy.name} for ${hpDamage + shieldDamage} total! (${shieldDamage} shield, ${hpDamage} hull)`);
              updatedEnemies = sc.enemies.map(e => {
                if (e.id === enemy.id) {
                  return { ...e, shield: Math.max(0, e.shield - shieldDamage), hp: Math.max(0, e.hp - hpDamage) };
                }
                return e;
              });
            }

            const deadEnemies = updatedEnemies.filter(e => e.hp <= 0);
            deadEnemies.forEach(e => newLog.push(`${e.name} destroyed!`));
            updatedEnemies = updatedEnemies.filter(e => e.hp > 0);

            if (updatedEnemies.length === 0) {
              set({ spaceCombat: { ...sc, enemies: updatedEnemies, shipAttacked: true, phase: 'victory', log: [...newLog, 'All enemy ships destroyed!'] } });
            } else {
              set({ spaceCombat: { ...sc, enemies: updatedEnemies, shipAttacked: true, phase: 'enemy', validAttacks: [], log: newLog } });
            }
          }
        }
      },

      endSpaceTurn: () => {
        const state = get();
        const sc = state.spaceCombat;
        if (!sc) return;

        // Enemy turns
        let updatedEnemies = [...sc.enemies];
        let playerHp = sc.playerShip.currentStats.hp;
        let playerShield = sc.playerShip.currentStats.shield;
        const newLog = [...sc.log, '--- Enemy Turn ---'];

        for (const enemy of updatedEnemies) {
          if (enemy.hp <= 0) continue;

          // Move toward player
          const newPos = enemyAiMove(enemy, sc.playerQ, sc.playerR, sc.grid, updatedEnemies);
          const movedEnemy = { ...enemy, hexQ: newPos.q, hexR: newPos.r };

          // Attack if in range
          const dist = hexDistance(movedEnemy.hexQ, movedEnemy.hexR, sc.playerQ, sc.playerR);
          if (dist <= 2) {
            const { hpDamage, shieldDamage, missed } = calculateSpaceDamage(
              movedEnemy.atk,
              movedEnemy.acc,
              sc.playerShip.currentStats.eva,
              playerShield,
              playerHp
            );

            if (missed) {
              newLog.push(`${enemy.name} attack missed!`);
            } else {
              playerShield = Math.max(0, playerShield - shieldDamage);
              playerHp = Math.max(0, playerHp - hpDamage);
              newLog.push(`${enemy.name} hits for ${hpDamage + shieldDamage}! (${shieldDamage} shield, ${hpDamage} hull)`);
            }
          }

          updatedEnemies = updatedEnemies.map(e => e.id === enemy.id ? movedEnemy : e);
        }

        const updatedShip = {
          ...sc.playerShip,
          currentStats: { ...sc.playerShip.currentStats, hp: playerHp, shield: playerShield },
        };

        if (playerHp <= 0) {
          set({ spaceCombat: { ...sc, playerShip: updatedShip, enemies: updatedEnemies, phase: 'defeat', log: [...newLog, 'Your ship was destroyed!'] } });
          return;
        }

        set({
          spaceCombat: {
            ...sc,
            playerShip: updatedShip,
            enemies: updatedEnemies,
            phase: 'select',
            validMoves: [],
            validAttacks: [],
            shipMoved: false,
            shipAttacked: false,
            turn: sc.turn + 1,
            log: [...newLog, `--- Turn ${sc.turn + 1} ---`],
          },
        });
      },

      selectSurfaceAction: (action) => {
        const state = get();
        const sc = state.surfaceCombat;
        if (!sc || sc.phase !== 'playerTurn') return;
        set({ surfaceCombat: { ...sc, selectedAction: action, selectedSkill: undefined, selectedTargetId: undefined } });
      },

      selectSurfaceSkill: (skillId) => {
        const state = get();
        const sc = state.surfaceCombat;
        if (!sc) return;
        const current = sc.combatants.find(c => c.id === sc.currentTurnId);
        if (!current) return;
        const skill = current.skills.find(s => s.id === skillId);
        if (!skill) return;
        set({ surfaceCombat: { ...sc, selectedSkill: skill } });
      },

      selectSurfaceTarget: (targetId) => {
        const state = get();
        const sc = state.surfaceCombat;
        if (!sc) return;
        set({ surfaceCombat: { ...sc, selectedTargetId: targetId } });
      },

      executePlayerTurn: () => {
        const state = get();
        const sc = state.surfaceCombat;
        if (!sc || sc.phase !== 'playerTurn') return;

        const current = sc.combatants.find(c => c.id === sc.currentTurnId);
        if (!current || current.isEnemy) return;

        const action = sc.selectedAction;
        if (!action) return;

        let updatedCombatants = [...sc.combatants];
        const newLog = [...sc.log];

        // Process action
        if (action === 'flee') {
          set({ surfaceCombat: { ...sc, phase: 'flee', log: [...newLog, `${current.name} fled from battle!`] } });
          return;
        }

        if (action === 'defend') {
          updatedCombatants = updatedCombatants.map(c =>
            c.id === current.id ? { ...c, statusEffects: [...c.statusEffects.filter(e => e !== 'Shielded'), 'Shielded' as StatusEffect] } : c
          );
          newLog.push(`${current.name} takes a defensive stance!`);
        }

        if (action === 'attack') {
          const targetId = sc.selectedTargetId;
          const target = updatedCombatants.find(c => c.id === targetId);
          if (!target) return;

          const attacker = updatedCombatants.find(c => c.id === current.id)!;
          const { damage, isCrit, missed } = calculateDamage(attacker, target);

          if (missed) {
            newLog.push(`${current.name} attacks ${target.name} - MISS!`);
          } else {
            newLog.push(`${current.name} attacks ${target.name} for ${damage}${isCrit ? ' CRITICAL!' : ''}!`);
            updatedCombatants = updatedCombatants.map(c =>
              c.id === target.id ? { ...c, hp: Math.max(0, c.hp - damage) } : c
            );
          }
        }

        if (action === 'skill') {
          const skill = sc.selectedSkill;
          if (!skill) return;

          // Check energy/battery cost
          const attacker = updatedCombatants.find(c => c.id === current.id)!;
          const resource = attacker.energy !== undefined ? attacker.energy : (attacker.battery ?? 0);
          if (resource < skill.energyCost) {
            newLog.push(`${current.name} doesn't have enough energy!`);
          } else {
            // Deduct energy
            updatedCombatants = updatedCombatants.map(c => {
              if (c.id === current.id) {
                const newEnergy = c.energy !== undefined ? Math.max(0, c.energy - skill.energyCost) : c.energy;
                const newBattery = c.battery !== undefined ? Math.max(0, c.battery - skill.energyCost) : c.battery;
                return { ...c, energy: newEnergy, battery: newBattery };
              }
              return c;
            });

            // Glitch check
            if (attacker.statusEffects.includes('Glitched') && Math.random() < 0.3) {
              newLog.push(`${current.name}'s ${skill.name} GLITCHED and failed!`);
            } else if (skill.damage) {
              if (skill.aoe) {
                // Hit all enemies
                const enemies = updatedCombatants.filter(c => c.isEnemy);
                enemies.forEach(enemy => {
                  const { damage, isCrit, missed } = calculateSkillDamage(attacker, enemy, skill.damage!);
                  if (!missed) {
                    newLog.push(`${skill.name} hits ${enemy.name} for ${damage}${isCrit ? ' CRITICAL!' : ''}!`);
                    updatedCombatants = updatedCombatants.map(c =>
                      c.id === enemy.id ? { ...c, hp: Math.max(0, c.hp - damage) } : c
                    );
                  }
                });
              } else {
                const targetId = sc.selectedTargetId;
                const target = updatedCombatants.find(c => c.id === targetId);
                if (target) {
                  const { damage, isCrit, missed } = calculateSkillDamage(attacker, target, skill.damage!);
                  if (missed) {
                    newLog.push(`${skill.name} missed!`);
                  } else {
                    newLog.push(`${skill.name} hits ${target.name} for ${damage}${isCrit ? ' CRITICAL!' : ''}!`);
                    updatedCombatants = updatedCombatants.map(c =>
                      c.id === target.id ? { ...c, hp: Math.max(0, c.hp - damage) } : c
                    );
                  }
                }
              }
            } else if (skill.healing) {
              if (skill.aoe) {
                const allies = updatedCombatants.filter(c => !c.isEnemy);
                allies.forEach(ally => {
                  const healAmt = skill.healing!;
                  newLog.push(`${skill.name} heals ${ally.name} for ${healAmt} HP!`);
                  updatedCombatants = updatedCombatants.map(c =>
                    c.id === ally.id ? { ...c, hp: Math.min(c.maxHp, c.hp + healAmt) } : c
                  );
                });
              } else {
                const targetId = sc.selectedTargetId;
                const target = updatedCombatants.find(c => c.id === targetId);
                if (target) {
                  const healAmt = skill.healing!;
                  newLog.push(`${skill.name} heals ${target.name} for ${healAmt} HP!`);
                  updatedCombatants = updatedCombatants.map(c =>
                    c.id === target.id ? { ...c, hp: Math.min(c.maxHp, c.hp + healAmt) } : c
                  );
                }
              }
            } else if (skill.statusEffect) {
              const targetId = skill.aoe ? null : sc.selectedTargetId;
              if (skill.aoe) {
                const targets = updatedCombatants.filter(c => c.isEnemy !== !attacker.isEnemy);
                targets.forEach(t => {
                  newLog.push(`${skill.name} applies ${skill.statusEffect} to ${t.name}!`);
                  updatedCombatants = updatedCombatants.map(c =>
                    c.id === t.id ? { ...c, statusEffects: [...c.statusEffects, skill.statusEffect!] } : c
                  );
                });
              } else if (targetId) {
                const target = updatedCombatants.find(c => c.id === targetId);
                if (target) {
                  newLog.push(`${skill.name} applies ${skill.statusEffect} to ${target.name}!`);
                  updatedCombatants = updatedCombatants.map(c =>
                    c.id === target.id ? { ...c, statusEffects: [...c.statusEffects, skill.statusEffect!] } : c
                  );
                }
              }
            }
          }
        }

        // Check if all enemies dead
        const aliveEnemies = updatedCombatants.filter(c => c.isEnemy && c.hp > 0);
        if (aliveEnemies.length === 0) {
          set({ surfaceCombat: { ...sc, combatants: updatedCombatants, phase: 'victory', log: [...newLog, 'All enemies defeated!'] } });
          return;
        }

        // Check if all allies dead
        const aliveAllies = updatedCombatants.filter(c => !c.isEnemy && c.hp > 0);
        if (aliveAllies.length === 0) {
          set({ surfaceCombat: { ...sc, combatants: updatedCombatants, phase: 'defeat', log: [...newLog, 'All allies defeated!'] } });
          return;
        }

        // Advance turn in initiative order
        const initiativeOrder = sc.initiativeOrder.filter(id => {
          const c = updatedCombatants.find(cb => cb.id === id);
          return c && c.hp > 0;
        });

        const currentIdx = initiativeOrder.indexOf(sc.currentTurnId);
        const nextIdx = (currentIdx + 1) % initiativeOrder.length;
        const nextId = initiativeOrder[nextIdx];
        const nextCombatant = updatedCombatants.find(c => c.id === nextId);

        if (nextCombatant?.isEnemy) {
          // Do enemy turn immediately
          set({
            surfaceCombat: {
              ...sc,
              combatants: updatedCombatants,
              currentTurnId: nextId,
              initiativeOrder,
              phase: 'enemyTurn',
              selectedAction: undefined,
              selectedSkill: undefined,
              selectedTargetId: undefined,
              log: newLog,
            },
          });
          // Trigger enemy action
          setTimeout(() => get().runEnemyTurn(), 800);
        } else {
          set({
            surfaceCombat: {
              ...sc,
              combatants: updatedCombatants,
              currentTurnId: nextId,
              initiativeOrder,
              phase: 'playerTurn',
              selectedAction: undefined,
              selectedSkill: undefined,
              selectedTargetId: undefined,
              log: newLog,
            },
          });
        }
      },

      // Internal method for enemy turn
      runEnemyTurn: () => {
        const state = get();
        const sc = state.surfaceCombat;
        if (!sc || sc.phase !== 'enemyTurn') return;

        const current = sc.combatants.find(c => c.id === sc.currentTurnId);
        if (!current || !current.isEnemy) return;

        // Skip if EMPd
        if (current.statusEffects.includes('EMPd')) {
          const newLog = [...sc.log, `${current.name} is EMP'd and skips its turn!`];
          advanceAfterEnemyTurn(sc, sc.combatants, newLog, set, get);
          return;
        }

        let updatedCombatants = [...sc.combatants];
        const newLog = [...sc.log];

        // Simple AI: attack random ally
        const aliveAllies = updatedCombatants.filter(c => !c.isEnemy && c.hp > 0);
        if (aliveAllies.length > 0) {
          const target = aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
          const { damage, isCrit, missed } = calculateDamage(current, target);

          if (missed) {
            newLog.push(`${current.name} attacks ${target.name} - MISS!`);
          } else {
            newLog.push(`${current.name} attacks ${target.name} for ${damage}${isCrit ? ' CRITICAL!' : ''}!`);
            updatedCombatants = updatedCombatants.map(c =>
              c.id === target.id ? { ...c, hp: Math.max(0, c.hp - damage) } : c
            );
          }
        }

        advanceAfterEnemyTurn(sc, updatedCombatants, newLog, set, get);
      },

      collectResults: () => {
        const state = get();
        const result = state.missionResult;
        if (!result || !state.currentUser) return;

        const profile = state.profiles[state.currentUser];
        if (!profile) return;

        let updatedProfile = { ...profile };

        if (result.success) {
          // Apply XP
          const { captain: updCaptain } = levelUpCaptain(profile.captain, result.xpGained.captain);
          const { ship: updShip } = levelUpShip(profile.ship, result.xpGained.ship);

          const updRobots = profile.robots.map(r => {
            if (profile.selectedRobots.includes(r.id)) {
              const { robot: updR } = levelUpRobot(r, result.xpGained.robots);
              return updR;
            }
            return r;
          });

          updatedProfile = {
            ...updatedProfile,
            captain: updCaptain,
            ship: updShip,
            robots: updRobots,
            credits: profile.credits + result.creditsGained,
            inventory: [...profile.inventory, ...result.loot],
            completedMissions: profile.completedMissions + 1,
            totalXpEarned: profile.totalXpEarned + result.xpGained.captain + result.xpGained.ship + result.xpGained.robots,
            stats: {
              ...profile.stats,
              missionsCompleted: profile.stats.missionsCompleted + 1,
              totalCreditsEarned: profile.stats.totalCreditsEarned + result.creditsGained,
              totalLootFound: profile.stats.totalLootFound + result.loot.length,
            },
          };
        }

        set(s => ({
          profiles: { ...s.profiles, [state.currentUser!]: updatedProfile },
          screen: 'hub',
          activeMission: undefined,
          spaceCombat: undefined,
          surfaceCombat: undefined,
          missionResult: undefined,
        }));
      },

      learnTalent: (talentName) => {
        const state = get();
        if (!state.currentUser) return;
        const profile = state.profiles[state.currentUser];
        if (!profile || profile.captain.talentPoints <= 0) return;
        if (profile.captain.talents.includes(talentName)) return;
        set(s => ({
          profiles: {
            ...s.profiles,
            [state.currentUser!]: {
              ...profile,
              captain: {
                ...profile.captain,
                talents: [...profile.captain.talents, talentName],
                talentPoints: profile.captain.talentPoints - 1,
              },
            },
          },
        }));
      },
    }),
    {
      name: 'space-scouts-v2',
      partialize: (state) => ({
        accounts: state.accounts,
        profiles: state.profiles,
        currentUser: state.currentUser,
      }),
    }
  )
);

function advanceAfterEnemyTurn(
  sc: SurfaceCombatState,
  updatedCombatants: Combatant[],
  newLog: string[],
  set: (state: Partial<GameState & GameActions>) => void,
  get: () => GameState & GameActions
) {
  // Check if allies dead
  const aliveAllies = updatedCombatants.filter(c => !c.isEnemy && c.hp > 0);
  if (aliveAllies.length === 0) {
    set({ surfaceCombat: { ...sc, combatants: updatedCombatants, phase: 'defeat', log: [...newLog, 'Your team was defeated!'] } });
    return;
  }

  // Check if enemies dead
  const aliveEnemies = updatedCombatants.filter(c => c.isEnemy && c.hp > 0);
  if (aliveEnemies.length === 0) {
    set({ surfaceCombat: { ...sc, combatants: updatedCombatants, phase: 'victory', log: [...newLog, 'All enemies defeated!'] } });
    return;
  }

  const initiativeOrder = sc.initiativeOrder.filter(id => {
    const c = updatedCombatants.find(cb => cb.id === id);
    return c && c.hp > 0;
  });

  const currentIdx = initiativeOrder.indexOf(sc.currentTurnId);
  const nextIdx = (currentIdx + 1) % initiativeOrder.length;
  const nextId = initiativeOrder[nextIdx];
  const nextCombatant = updatedCombatants.find(c => c.id === nextId);

  if (nextCombatant?.isEnemy) {
    set({
      surfaceCombat: {
        ...sc,
        combatants: updatedCombatants,
        currentTurnId: nextId,
        initiativeOrder,
        phase: 'enemyTurn',
        log: newLog,
      },
    });
    setTimeout(() => get().runEnemyTurn(), 800);
  } else {
    set({
      surfaceCombat: {
        ...sc,
        combatants: updatedCombatants,
        currentTurnId: nextId,
        initiativeOrder,
        phase: 'playerTurn',
        selectedAction: undefined,
        selectedSkill: undefined,
        selectedTargetId: undefined,
        log: [...newLog, `--- ${nextCombatant?.name}'s turn ---`],
      },
    });
  }
}

// Helper selector
export function useProfile() {
  return useGameStore(state => {
    if (!state.currentUser) return null;
    return state.profiles[state.currentUser] ?? null;
  });
}

