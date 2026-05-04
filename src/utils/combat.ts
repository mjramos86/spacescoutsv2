import type { Combatant, StatusEffect, SpaceEnemyShip, Ship, HexCell } from '../types/game';

// ===== SURFACE COMBAT =====

export function calculateDamage(attacker: Combatant, target: Combatant): { damage: number; isCrit: boolean; missed: boolean } {
  // Check accuracy
  const hitRoll = Math.random() * 100;
  const effectiveAcc = getEffectiveAcc(attacker);
  const effectiveEva = getEffectiveEva(target);

  if (hitRoll > effectiveAcc - effectiveEva * 0.5) {
    return { damage: 0, isCrit: false, missed: true };
  }

  const critChance = attacker.lck * 2;
  const isCrit = Math.random() * 100 < critChance;

  const baseDmg = Math.max(1, attacker.atk - target.def * 0.5);
  const variance = 0.85 + Math.random() * 0.3;
  const damage = Math.round(baseDmg * variance * (isCrit ? 1.75 : 1.0));

  return { damage: Math.max(1, damage), isCrit, missed: false };
}

export function calculateSkillDamage(attacker: Combatant, target: Combatant, skillDamage: number): { damage: number; isCrit: boolean; missed: boolean } {
  const hitRoll = Math.random() * 100;
  if (hitRoll > attacker.acc) {
    return { damage: 0, isCrit: false, missed: true };
  }

  const isCrit = Math.random() * 100 < attacker.lck * 2;
  const baseDmg = Math.max(1, skillDamage - target.def * 0.3);
  const damage = Math.round(baseDmg * (isCrit ? 1.75 : 1.0));

  return { damage: Math.max(1, damage), isCrit, missed: false };
}

function getEffectiveAcc(combatant: Combatant): number {
  let acc = combatant.acc;
  if (combatant.statusEffects.includes('Energized')) acc += 10;
  if (combatant.statusEffects.includes('Glitched')) acc -= 20;
  return acc;
}

function getEffectiveEva(combatant: Combatant): number {
  if (combatant.statusEffects.includes('Slowed')) return 0;
  return 0; // ground units don't have evasion stat directly
}

export function applyStatusEffect(target: Combatant, effect: StatusEffect): Combatant {
  if (target.statusEffects.includes(effect)) return target;
  return { ...target, statusEffects: [...target.statusEffects, effect] };
}

export function processStatusEffects(combatant: Combatant): { combatant: Combatant; log: string[] } {
  const logs: string[] = [];
  let c = { ...combatant, statusEffects: [...combatant.statusEffects] };

  if (c.statusEffects.includes('Burning')) {
    const burnDmg = Math.round(c.maxHp * 0.05);
    c.hp = Math.max(0, c.hp - burnDmg);
    logs.push(`${c.name} takes ${burnDmg} burn damage!`);
  }

  if (c.statusEffects.includes('Regenerating')) {
    const healAmt = Math.round(c.maxHp * 0.08);
    c.hp = Math.min(c.maxHp, c.hp + healAmt);
    logs.push(`${c.name} regenerates ${healAmt} HP!`);
  }

  // Tick down temporary effects (simplified - remove after 1 turn in this impl)
  const tempEffects: StatusEffect[] = ['Overcharged', 'Shielded', 'Energized', 'Slowed', 'Glitched', 'EMPd'];
  // For simplicity we keep them until next turn - handled by combat logic

  return { combatant: c, log: logs };
}

export function removeExpiredEffects(combatant: Combatant): Combatant {
  // In a full impl, effects would have durations. For now, remove temp buffs each turn
  const persistentEffects: StatusEffect[] = ['Burning', 'Regenerating'];
  const filteredEffects = combatant.statusEffects.filter(e => persistentEffects.includes(e));
  return { ...combatant, statusEffects: filteredEffects };
}

export function calculateInitiative(combatants: Combatant[]): string[] {
  return [...combatants]
    .sort((a, b) => {
      const spdA = a.spd + (a.statusEffects.includes('Energized') ? 5 : 0) - (a.statusEffects.includes('Slowed') ? 5 : 0);
      const spdB = b.spd + (b.statusEffects.includes('Energized') ? 5 : 0) - (b.statusEffects.includes('Slowed') ? 5 : 0);
      return spdB - spdA;
    })
    .map(c => c.id);
}

export function getEffectiveAtk(combatant: Combatant): number {
  let atk = combatant.atk;
  if (combatant.statusEffects.includes('Overcharged')) atk = Math.round(atk * 1.3);
  return atk;
}

export function getEffectiveDef(combatant: Combatant): number {
  let def = combatant.def;
  if (combatant.statusEffects.includes('Shielded')) def = Math.round(def * 1.5);
  return def;
}

// ===== SPACE COMBAT =====

export function hexDistance(q1: number, r1: number, q2: number, r2: number): number {
  const s1 = -q1 - r1;
  const s2 = -q2 - r2;
  return Math.max(Math.abs(q1 - q2), Math.abs(r1 - r2), Math.abs(s1 - s2));
}

export function getReachableCells(
  startQ: number,
  startR: number,
  maxMove: number,
  grid: HexCell[][],
  enemies: SpaceEnemyShip[]
): { q: number; r: number }[] {
  const reachable: { q: number; r: number }[] = [];
  const enemyPositions = new Set(enemies.map(e => `${e.hexQ},${e.hexR}`));

  for (let q = 0; q < 7; q++) {
    for (let r = 0; r < 7; r++) {
      const dist = hexDistance(startQ, startR, q, r);
      if (dist > 0 && dist <= maxMove) {
        const cell = grid[q]?.[r];
        if (!cell) continue;
        // Ion storm reduces movement
        const moveCost = cell.zone === 'IonStorm' ? 2 : 1;
        const effectiveDist = moveCost === 2 ? dist + 1 : dist;
        if (effectiveDist <= maxMove && !enemyPositions.has(`${q},${r}`)) {
          reachable.push({ q, r });
        }
      }
    }
  }
  return reachable;
}

export function getAttackableCells(
  playerQ: number,
  playerR: number,
  enemies: SpaceEnemyShip[]
): { q: number; r: number }[] {
  // Can attack adjacent enemies (range 2 for space combat)
  return enemies
    .filter(e => hexDistance(playerQ, playerR, e.hexQ, e.hexR) <= 2)
    .map(e => ({ q: e.hexQ, r: e.hexR }));
}

export function calculateSpaceDamage(
  attackerAtk: number,
  attackerAcc: number,
  targetEva: number,
  targetShield: number,
  targetHp: number,
  zone?: string
): { hpDamage: number; shieldDamage: number; missed: boolean } {
  let acc = attackerAcc;
  if (zone === 'Nebula') acc -= 10; // Nebula boosts evasion for defender

  const hitRoll = Math.random() * 100;
  if (hitRoll > acc - targetEva * 0.5) {
    return { hpDamage: 0, shieldDamage: 0, missed: true };
  }

  const variance = 0.85 + Math.random() * 0.3;
  const rawDmg = Math.round(attackerAtk * variance);

  if (targetShield > 0) {
    const shieldDmg = Math.min(targetShield, rawDmg);
    const hpDmg = Math.max(0, rawDmg - targetShield);
    return { hpDamage: hpDmg, shieldDamage: shieldDmg, missed: false };
  }
  return { hpDamage: rawDmg, shieldDamage: 0, missed: false };
}

export function enemyAiMove(
  enemy: SpaceEnemyShip,
  playerQ: number,
  playerR: number,
  grid: HexCell[][],
  allEnemies: SpaceEnemyShip[]
): { q: number; r: number } {
  const otherEnemies = allEnemies.filter(e => e.id !== enemy.id);
  const reachable = getReachableCells(enemy.hexQ, enemy.hexR, enemy.move, grid, [
    ...otherEnemies,
    { hexQ: playerQ, hexR: playerR } as SpaceEnemyShip,
  ]);

  if (reachable.length === 0) return { q: enemy.hexQ, r: enemy.hexR };

  // Move toward player
  let best = reachable[0];
  let bestDist = hexDistance(best.q, best.r, playerQ, playerR);

  for (const cell of reachable) {
    const dist = hexDistance(cell.q, cell.r, playerQ, playerR);
    if (dist < bestDist) {
      bestDist = dist;
      best = cell;
    }
  }

  return best;
}
