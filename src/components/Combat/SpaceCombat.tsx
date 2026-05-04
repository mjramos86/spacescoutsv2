import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { HexGrid } from './HexGrid';
import { getShipTypeData } from '../../data/classes';

export function SpaceCombat() {
  const sc = useGameStore(s => s.spaceCombat);
  const selectSpaceCell = useGameStore(s => s.selectSpaceCell);
  const endSpaceTurn = useGameStore(s => s.endSpaceTurn);
  const setScreen = useGameStore(s => s.setScreen);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [sc?.log]);

  if (!sc) return null;

  const { playerShip, enemies, grid, playerQ, playerR, phase, validMoves, validAttacks, log, turn } = sc;
  const shipTypeData = getShipTypeData(playerShip.type);

  function handleProceedToSurface() {
    // Initialize surface combat
    if (!sc) return;
    const mission = sc.mission;
    const storeState = useGameStore.getState();
    const profile = storeState.currentUser ? storeState.profiles[storeState.currentUser] : null;
    if (!profile) return;

    const { captain, selectedRobots, robots } = profile;
    const r1 = robots.find(r => r.id === selectedRobots[0]);
    const r2 = robots.find(r => r.id === selectedRobots[1]);

    // Build combatants
    const captainCombatant = {
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
      statusEffects: [] as import('../../types/game').StatusEffect[],
      entityRef: 'captain' as const,
      level: captain.level,
    };

    const robotCombatants = [r1, r2].filter(Boolean).map((robot, idx) => ({
      id: robot!.id,
      name: robot!.name,
      isEnemy: false,
      hp: robot!.currentStats.hp,
      maxHp: robot!.currentStats.maxHp,
      battery: robot!.currentStats.battery,
      maxBattery: robot!.currentStats.maxBattery,
      atk: robot!.currentStats.atk,
      def: robot!.currentStats.def,
      spd: robot!.currentStats.spd,
      acc: robot!.currentStats.acc,
      lck: robot!.currentStats.lck,
      skills: robot!.skills.map(s => ({ ...s, currentCooldown: 0 })),
      statusEffects: [] as import('../../types/game').StatusEffect[],
      entityRef: (idx === 0 ? 'robot0' : 'robot1') as 'robot0' | 'robot1',
      level: robot!.level,
    }));

    // Build enemy combatants from first wave
    const enemyGroup = mission.surfaceEnemies[0] ?? [];
    const enemyCombatants = enemyGroup.map(e => ({
      id: e.id,
      name: e.name,
      isEnemy: true,
      hp: e.hp,
      maxHp: e.maxHp,
      atk: e.atk,
      def: e.def,
      spd: e.spd,
      acc: e.acc,
      lck: 3,
      skills: e.skills,
      statusEffects: [] as import('../../types/game').StatusEffect[],
      entityRef: 'enemy' as const,
      level: e.level,
    }));

    const allCombatants = [...captainCombatant ? [captainCombatant] : [], ...robotCombatants, ...enemyCombatants];

    // Calculate initiative
    const initiativeOrder = [...allCombatants]
      .sort((a, b) => b.spd - a.spd)
      .map(c => c.id);

    const firstId = initiativeOrder[0];
    const firstCombatant = allCombatants.find(c => c.id === firstId);

    const surfaceState: import('../../types/game').SurfaceCombatState = {
      mission,
      combatants: allCombatants,
      initiativeOrder,
      currentTurnId: firstId,
      phase: firstCombatant?.isEnemy ? 'enemyTurn' : 'playerTurn',
      log: [`Surface combat begins! ${firstCombatant?.name} acts first.`],
      turn: 1,
      enemyGroups: mission.surfaceEnemies,
      selectedAction: undefined,
      selectedSkill: undefined,
      selectedTargetId: undefined,
    };

    useGameStore.setState({ surfaceCombat: surfaceState, screen: 'surfaceCombat' });

    // If enemy goes first, trigger enemy AI
    if (firstCombatant?.isEnemy) {
      setTimeout(() => useGameStore.getState().runEnemyTurn(), 800);
    }
  }

  function handleDefeat() {
    if (!sc) return;
    // Generate partial result on defeat
    const result: import('../../types/game').MissionResult = {
      success: false,
      xpGained: { captain: 0, ship: 0, robots: 0 },
      creditsGained: 0,
      loot: [],
      missionName: sc.mission.name,
    };
    useGameStore.setState({ missionResult: result, screen: 'missionResult' });
  }

  const phaseLabel: Record<string, string> = {
    select: 'SELECT — Click ship to start your turn',
    move: 'MOVE — Click highlighted hex to move, or red hex to attack',
    attack: 'ATTACK — Click red hex to attack enemy',
    enemy: 'ENEMY TURN — Wait...',
    victory: 'VICTORY — All enemies destroyed!',
    defeat: 'DEFEAT — Your ship was destroyed',
  };

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: '#0a0e1a',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 16px',
        background: '#0f1629',
        borderBottom: '1px solid #1e2a4a',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#00d4ff', textTransform: 'uppercase', letterSpacing: 2 }}>
            SPACE COMBAT
          </span>
          <span style={{ marginLeft: 16, color: '#94a3b8', fontSize: 13 }}>
            {sc.mission.name} — {sc.mission.biome}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ color: '#f59e0b', fontSize: 13 }}>Turn {turn}</span>
          <span style={{ color: '#94a3b8', fontSize: 13 }}>Enemies: {enemies.length}</span>
        </div>
      </div>

      {/* Phase indicator */}
      <div style={{
        padding: '8px 16px',
        background: phase === 'victory' ? 'rgba(16,185,129,0.15)' : phase === 'defeat' ? 'rgba(239,68,68,0.15)' : 'rgba(0,212,255,0.08)',
        borderBottom: '1px solid #1e2a4a',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{
          fontWeight: 700, fontSize: 13,
          color: phase === 'victory' ? '#10b981' : phase === 'defeat' ? '#ef4444' : '#00d4ff',
          textTransform: 'uppercase', letterSpacing: 1,
        }}>
          {phaseLabel[phase] ?? phase.toUpperCase()}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {(phase === 'select' || phase === 'move' || phase === 'attack') && (
            <button className="btn" style={{ fontSize: 12 }} onClick={endSpaceTurn}>
              END TURN
            </button>
          )}
          {phase === 'enemy' && (
            <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={endSpaceTurn}>
              PROCESS ENEMY TURN
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Hex grid area */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          <HexGrid
            grid={grid}
            playerQ={playerQ}
            playerR={playerR}
            enemies={enemies}
            validMoves={validMoves}
            validAttacks={validAttacks}
            onCellClick={selectSpaceCell}
            playerShipColor={shipTypeData.color}
          />
        </div>

        {/* Right sidebar */}
        <div style={{ width: 280, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', borderLeft: '1px solid #1e2a4a' }}>
          {/* Player ship status */}
          <div style={{ background: '#0f1629', border: '1px solid #1e2a4a', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ color: shipTypeData.color, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
              {shipTypeData.icon} {playerShip.name}
            </div>
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginBottom: 3 }}>
                <span>Hull</span><span>{playerShip.currentStats.hp}/{playerShip.currentStats.maxHp}</span>
              </div>
              <div className="stat-bar"><div className="stat-bar-fill hp" style={{ width: `${(playerShip.currentStats.hp / playerShip.currentStats.maxHp) * 100}%` }} /></div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginBottom: 3 }}>
                <span>Shield</span><span>{playerShip.currentStats.shield}/{playerShip.currentStats.maxShield}</span>
              </div>
              <div className="stat-bar"><div className="stat-bar-fill shield" style={{ width: `${(playerShip.currentStats.shield / playerShip.currentStats.maxShield) * 100}%` }} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 10, fontSize: 12 }}>
              <div style={{ color: '#64748b' }}>ATK: <span style={{ color: '#ef4444' }}>{playerShip.currentStats.atk}</span></div>
              <div style={{ color: '#64748b' }}>ACC: <span style={{ color: '#10b981' }}>{playerShip.currentStats.acc}%</span></div>
              <div style={{ color: '#64748b' }}>EVA: <span style={{ color: '#f59e0b' }}>{playerShip.currentStats.eva}%</span></div>
              <div style={{ color: '#64748b' }}>MOV: <span style={{ color: '#00d4ff' }}>{playerShip.currentStats.move}</span></div>
            </div>
          </div>

          {/* Enemy ships */}
          <div>
            <div style={{ color: '#ef4444', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Enemies ({enemies.length})
            </div>
            {enemies.map(e => (
              <div key={e.id} style={{ background: '#0f1629', border: '1px solid #1e2a4a', borderRadius: 6, padding: '8px 10px', marginBottom: 6 }}>
                <div style={{ color: e.color, fontWeight: 600, fontSize: 12, marginBottom: 4 }}>{e.name}</div>
                <div style={{ marginBottom: 3 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 2 }}>
                    <span>HP</span><span>{e.hp}/{e.maxHp}</span>
                  </div>
                  <div className="stat-bar" style={{ height: 4 }}><div className="stat-bar-fill hp" style={{ width: `${(e.hp / e.maxHp) * 100}%` }} /></div>
                </div>
                {e.maxShield > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 2 }}>
                      <span>Shield</span><span>{e.shield}/{e.maxShield}</span>
                    </div>
                    <div className="stat-bar" style={{ height: 4 }}><div className="stat-bar-fill shield" style={{ width: `${(e.shield / e.maxShield) * 100}%` }} /></div>
                  </div>
                )}
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  ATK {e.atk} • EVA {e.eva}% • Pos ({e.hexQ},{e.hexR})
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ background: '#0f1629', border: '1px solid #1e2a4a', borderRadius: 8, padding: '10px 12px', fontSize: 11, color: '#64748b' }}>
            <div style={{ fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>Zone Effects</div>
            <div style={{ marginBottom: 3 }}>🟣 <span style={{ color: '#7c3aed' }}>Nebula</span>: +15% EVA</div>
            <div style={{ marginBottom: 3 }}>🔵 <span style={{ color: '#00d4ff' }}>Ion Storm</span>: -20% Move</div>
            <div>🟡 <span style={{ color: '#f59e0b' }}>Debris</span>: -5% HP/turn</div>
          </div>

          {/* Combat log */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
              Combat Log
            </div>
            <div
              ref={logRef}
              style={{
                flex: 1, minHeight: 120, maxHeight: 200, overflowY: 'auto',
                background: '#0a0e1a', border: '1px solid #1e2a4a', borderRadius: 6, padding: '8px 10px',
              }}
            >
              {log.map((line, i) => (
                <div key={i} style={{
                  fontSize: 11, color: i === log.length - 1 ? '#e2e8f0' : '#64748b',
                  marginBottom: 3, lineHeight: 1.4,
                }}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Victory/Defeat overlay */}
      {(phase === 'victory' || phase === 'defeat') && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#0f1629', border: `1px solid ${phase === 'victory' ? '#10b981' : '#ef4444'}`,
            borderRadius: 12, padding: '40px 48px', textAlign: 'center',
            boxShadow: `0 0 60px ${phase === 'victory' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{phase === 'victory' ? '🎖️' : '💥'}</div>
            <h2 style={{
              fontSize: 32, fontWeight: 700, letterSpacing: 3,
              color: phase === 'victory' ? '#10b981' : '#ef4444',
              marginBottom: 12,
            }}>
              {phase === 'victory' ? 'SPACE VICTORY' : 'SHIP DESTROYED'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>
              {phase === 'victory'
                ? 'All enemy ships have been neutralized. Proceed to the surface.'
                : 'Your ship was destroyed. Mission failed.'}
            </p>
            {phase === 'victory' ? (
              <button className="btn btn-primary" style={{ padding: '12px 32px', fontSize: 16, letterSpacing: 2 }} onClick={handleProceedToSurface}>
                PROCEED TO SURFACE
              </button>
            ) : (
              <button className="btn btn-danger" style={{ padding: '12px 32px', fontSize: 16, letterSpacing: 2 }} onClick={handleDefeat}>
                RETURN TO BASE
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
