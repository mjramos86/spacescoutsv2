import type { Captain, Ship, Robot } from '../types/game';

export function captainXpToNext(level: number): number {
  return level * 150;
}

export function shipXpToNext(level: number): number {
  return level * 120;
}

export function robotXpToNext(level: number): number {
  return level * 80;
}

export function applyStatScale(base: number, level: number): number {
  return Math.round(base * (1 + (level - 1) * 0.05));
}

export function levelUpCaptain(captain: Captain, xpGained: number): { captain: Captain; leveled: boolean } {
  let newXp = captain.xp + xpGained;
  let level = captain.level;
  let leveled = false;

  const maxLevel = 100;
  while (level < maxLevel && newXp >= captainXpToNext(level)) {
    newXp -= captainXpToNext(level);
    level++;
    leveled = true;
  }
  if (level >= maxLevel) newXp = 0;

  const scale = 1 + (level - 1) * 0.05;
  const base = captain.baseStats;
  const updatedCaptain: Captain = {
    ...captain,
    level,
    xp: newXp,
    xpToNext: captainXpToNext(level),
    currentStats: {
      hp: Math.round(base.maxHp * scale),
      maxHp: Math.round(base.maxHp * scale),
      energy: Math.round(base.maxEnergy * scale),
      maxEnergy: Math.round(base.maxEnergy * scale),
      atk: Math.round(base.atk * scale),
      def: Math.round(base.def * scale),
      spd: base.spd,
      acc: base.acc,
      lck: base.lck,
    },
    talentPoints: captain.talentPoints + (leveled ? level - captain.level : 0),
  };

  return { captain: updatedCaptain, leveled };
}

export function levelUpShip(ship: Ship, xpGained: number): { ship: Ship; leveled: boolean } {
  let newXp = ship.xp + xpGained;
  let level = ship.level;
  let leveled = false;

  const maxLevel = 80;
  while (level < maxLevel && newXp >= shipXpToNext(level)) {
    newXp -= shipXpToNext(level);
    level++;
    leveled = true;
  }
  if (level >= maxLevel) newXp = 0;

  const scale = 1 + (level - 1) * 0.05;
  const base = ship.baseStats;
  const updatedShip: Ship = {
    ...ship,
    level,
    xp: newXp,
    xpToNext: shipXpToNext(level),
    currentStats: {
      hp: Math.round(base.maxHp * scale),
      maxHp: Math.round(base.maxHp * scale),
      shield: Math.round(base.maxShield * scale),
      maxShield: Math.round(base.maxShield * scale),
      atk: Math.round(base.atk * scale),
      acc: base.acc,
      eva: base.eva,
      move: base.move,
      init: base.init,
    },
  };

  return { ship: updatedShip, leveled };
}

export function levelUpRobot(robot: Robot, xpGained: number): { robot: Robot; leveled: boolean } {
  let newXp = robot.xp + xpGained;
  let level = robot.level;
  let leveled = false;

  const maxLevel = 60;
  while (level < maxLevel && newXp >= robotXpToNext(level)) {
    newXp -= robotXpToNext(level);
    level++;
    leveled = true;
  }
  if (level >= maxLevel) newXp = 0;

  const scale = 1 + (level - 1) * 0.05;
  const base = robot.baseStats;
  const updatedRobot: Robot = {
    ...robot,
    level,
    xp: newXp,
    xpToNext: robotXpToNext(level),
    currentStats: {
      hp: Math.round(base.maxHp * scale),
      maxHp: Math.round(base.maxHp * scale),
      battery: Math.round(base.maxBattery * scale),
      maxBattery: Math.round(base.maxBattery * scale),
      atk: Math.round(base.atk * scale),
      def: Math.round(base.def * scale),
      spd: base.spd,
      acc: base.acc,
      lck: base.lck,
    },
  };

  return { robot: updatedRobot, leveled };
}
