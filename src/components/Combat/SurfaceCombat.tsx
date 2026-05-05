import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { Combatant } from '../../types/game';
import { rarityColor, generateLoot } from '../../utils/loot';

function useCheatWin() {
  useEffect(() => {
    const buf = { value: '' };
    function onKey(e: KeyboardEvent) {
      buf.value = (buf.value + e.key.toUpperCase()).slice(-3);
      if (buf.value === 'MJR') {
        const sc = useGameStore.getState().surfaceCombat;
        if (!sc || sc.phase === 'victory' || sc.phase === 'defeat') return;
        const loot = generateLoot(sc.mission.lootDrops);
        useGameStore.setState({
          missionResult: {
            success: true,
            xpGained: sc.mission.xpReward,
            creditsGained: sc.mission.creditReward,
            loot,
            missionName: sc.mission.name,
          },
          screen: 'missionResult',
        });
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

function EnemyFigure({ enemy, isTarget, onClick }: { enemy: Combatant; isTarget: boolean; onClick: () => void }) {
  const hpPct = (enemy.hp / enemy.maxHp) * 100;
  const shapes: Record<string, React.ReactNode> = {
    circle: <circle cx="40" cy="50" r="35" />,
    square: <rect x="8" y="15" width="64" height="68" rx="4" />,
    triangle: <polygon points="40,5 75,82 5,82" />,
    diamond: <polygon points="40,5 75,50 40,82 5,50" />,
  };

  // Determine shape based on enemy name hash
  const shapeKeys = ['circle', 'square', 'triangle', 'diamond'];
  const shapeKey = shapeKeys[enemy.name.charCodeAt(0) % shapeKeys.length];

  // Determine color based on enemy faction
  const colors: Record<string, string> = {
    Marauders: '#ef4444',
    'Alien Swarm': '#10b981',
    'Rogue AI': '#7c3aed',
    'Void Cult': '#00d4ff',
  };
  const color = colors[enemy.name] ?? '#94a3b8';

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        cursor: enemy.hp > 0 ? 'pointer' : 'default',
        opacity: enemy.hp <= 0 ? 0.3 : 1,
        transition: 'transform 0.2s',
        transform: isTarget ? 'scale(1.1)' : 'scale(1)',
      }}
    >
      <svg width="80" height="90" viewBox="0 0 80 90" style={{ filter: isTarget ? 'drop-shadow(0 0 8px #ef4444)' : undefined }}>
        <g fill={color} opacity={0.85}>
          {shapes[shapeKey]}
        </g>
        {/* Status indicators */}
        {enemy.statusEffects.slice(0, 2).map((effect, i) => (
          <text key={effect} x={5 + i * 30} y={88} fontSize={8} fill="#f59e0b" fontFamily="monospace">{effect.slice(0, 4)}</text>
        ))}
      </svg>
      <div style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600, textAlign: 'center', maxWidth: 80 }}>
        {enemy.name}
      </div>
      <div style={{ width: 64, height: 5, background: '#1e2a4a', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 3,
          background: hpPct > 60 ? '#10b981' : hpPct > 30 ? '#f59e0b' : '#ef4444',
          width: `${hpPct}%`,
        }} />
      </div>
      <div style={{ fontSize: 10, color: '#64748b' }}>{enemy.hp}/{enemy.maxHp}</div>
      {enemy.statusEffects.length > 0 && (
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 90 }}>
          {enemy.statusEffects.map(e => (
            <span key={e} style={{
              fontSize: 9, padding: '1px 4px', borderRadius: 2,
              background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid #ef444466',
            }}>{e}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function AllyCard({ combatant, isActive, isTarget, onClick, onSelect }: {
  combatant: Combatant; isActive: boolean; isTarget: boolean;
  onClick: () => void; onSelect: () => void;
}) {
  const hpPct = (combatant.hp / combatant.maxHp) * 100;
  const energyKey = combatant.energy !== undefined ? 'energy' : 'battery';
  const energyVal = combatant.energy ?? combatant.battery ?? 0;
  const maxEnergy = combatant.maxEnergy ?? combatant.maxBattery ?? 1;
  const energyPct = (energyVal / maxEnergy) * 100;

  return (
    <div
      style={{
        background: '#0f1629',
        border: `2px solid ${isActive ? '#00d4ff' : isTarget ? '#10b981' : '#1e2a4a'}`,
        borderRadius: 8, padding: '10px 12px',
        boxShadow: isActive ? '0 0 15px rgba(0,212,255,0.2)' : undefined,
        cursor: 'pointer', opacity: combatant.hp <= 0 ? 0.4 : 1,
        transition: 'border-color 0.2s',
      }}
      onClick={onSelect}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontWeight: 700, color: isActive ? '#00d4ff' : '#e2e8f0', fontSize: 13 }}>
          {combatant.name}
          {isActive && <span style={{ marginLeft: 6, fontSize: 10, color: '#00d4ff' }}>▶ ACTING</span>}
        </span>
        <span style={{ fontSize: 11, color: '#64748b' }}>Lv.{combatant.level}</span>
      </div>
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 2 }}>
          <span>HP</span><span style={{ color: hpPct > 60 ? '#10b981' : hpPct > 30 ? '#f59e0b' : '#ef4444' }}>{combatant.hp}/{combatant.maxHp}</span>
        </div>
        <div className="stat-bar" style={{ height: 5 }}>
          <div className="stat-bar-fill hp" style={{ width: `${hpPct}%` }} />
        </div>
      </div>
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 2 }}>
          <span>{energyKey === 'energy' ? 'Energy' : 'Battery'}</span>
          <span>{energyVal}/{maxEnergy}</span>
        </div>
        <div className="stat-bar" style={{ height: 5 }}>
          <div className={`stat-bar-fill ${energyKey}`} style={{ width: `${energyPct}%` }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, fontSize: 11, color: '#64748b', marginTop: 4 }}>
        <span>ATK {combatant.atk}</span>
        <span>DEF {combatant.def}</span>
        <span>SPD {combatant.spd}</span>
      </div>
      {combatant.statusEffects.length > 0 && (
        <div style={{ display: 'flex', gap: 3, marginTop: 5, flexWrap: 'wrap' }}>
          {combatant.statusEffects.map(e => (
            <span key={e} style={{
              fontSize: 9, padding: '1px 4px', borderRadius: 2,
              background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid #00d4ff44',
            }}>{e}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function SurfaceCombat() {
  const sc = useGameStore(s => s.surfaceCombat);
  const selectSurfaceAction = useGameStore(s => s.selectSurfaceAction);
  const selectSurfaceSkill = useGameStore(s => s.selectSurfaceSkill);
  const selectSurfaceTarget = useGameStore(s => s.selectSurfaceTarget);
  const executePlayerTurn = useGameStore(s => s.executePlayerTurn);
  const logRef = useRef<HTMLDivElement>(null);
  useCheatWin();

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [sc?.log]);

  if (!sc) return null;

  const { combatants, initiativeOrder, currentTurnId, phase, selectedAction, selectedSkill, selectedTargetId, log } = sc;

  const current = combatants.find(c => c.id === currentTurnId);
  const allies = combatants.filter(c => !c.isEnemy);
  const enemies = combatants.filter(c => c.isEnemy);
  const aliveEnemies = enemies.filter(e => e.hp > 0);

  function handleMissionVictory() {
    const loot = generateLoot(sc!.mission.lootDrops);
    const result: import('../../types/game').MissionResult = {
      success: true,
      xpGained: sc!.mission.xpReward,
      creditsGained: sc!.mission.creditReward,
      loot,
      missionName: sc!.mission.name,
    };
    useGameStore.setState({ missionResult: result, screen: 'missionResult' });
  }

  function handleMissionDefeat() {
    const result: import('../../types/game').MissionResult = {
      success: false,
      xpGained: { captain: 0, ship: 0, robots: 0 },
      creditsGained: 0,
      loot: [],
      missionName: sc!.mission.name,
    };
    useGameStore.setState({ missionResult: result, screen: 'missionResult' });
  }

  function handleFlee() {
    const result: import('../../types/game').MissionResult = {
      success: false,
      xpGained: { captain: Math.round(sc!.mission.xpReward.captain * 0.25), ship: 0, robots: 0 },
      creditsGained: 0,
      loot: [],
      missionName: sc!.mission.name,
    };
    useGameStore.setState({ missionResult: result, screen: 'missionResult' });
  }

  const isPlayerTurn = phase === 'playerTurn' && !current?.isEnemy;

  const needsTarget = selectedAction === 'attack' ||
    (selectedAction === 'skill' && selectedSkill && !selectedSkill.aoe &&
     (selectedSkill.damage !== undefined || (selectedSkill.statusEffect && ['Glitched', 'EMPd', 'Burning', 'Slowed'].includes(selectedSkill.statusEffect))));

  const needsAllyTarget = selectedAction === 'skill' && selectedSkill && !selectedSkill.aoe &&
    (selectedSkill.healing !== undefined ||
     (selectedSkill.statusEffect && ['Overcharged', 'Shielded', 'Energized', 'Regenerating'].includes(selectedSkill.statusEffect)));

  const canExecute = selectedAction &&
    (selectedAction === 'defend' || selectedAction === 'flee' ||
     (selectedAction === 'attack' && selectedTargetId) ||
     (selectedAction === 'skill' && selectedSkill && (selectedSkill.aoe || selectedTargetId)));

  return (
    <div style={{
      width: '100%', height: '100vh',
      background: '#0a0e1a',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 16px',
        background: '#0f1629',
        borderBottom: '1px solid #1e2a4a',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: 2 }}>
            SURFACE COMBAT
          </span>
          <span style={{ marginLeft: 12, color: '#94a3b8', fontSize: 12 }}>
            {sc.mission.name} — {sc.mission.biome}
          </span>
        </div>
        <span style={{ color: '#f59e0b', fontSize: 12 }}>Turn {sc.turn}</span>
      </div>

      {/* Initiative strip */}
      <div style={{
        padding: '6px 16px',
        background: '#060a14',
        borderBottom: '1px solid #1e2a4a',
        display: 'flex', gap: 6, alignItems: 'center', overflowX: 'auto',
      }}>
        <span style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', marginRight: 4, whiteSpace: 'nowrap' }}>Initiative:</span>
        {initiativeOrder.map(id => {
          const c = combatants.find(cb => cb.id === id);
          if (!c) return null;
          const isCurrent = id === currentTurnId;
          return (
            <div key={id} style={{
              padding: '3px 8px', borderRadius: 4,
              background: isCurrent ? (c.isEnemy ? 'rgba(239,68,68,0.3)' : 'rgba(0,212,255,0.2)') : 'rgba(30,42,74,0.5)',
              border: `1px solid ${isCurrent ? (c.isEnemy ? '#ef4444' : '#00d4ff') : '#1e2a4a'}`,
              color: c.hp <= 0 ? '#1e2a4a' : isCurrent ? (c.isEnemy ? '#ef4444' : '#00d4ff') : '#94a3b8',
              fontSize: 10, fontWeight: isCurrent ? 700 : 400,
              whiteSpace: 'nowrap', textDecoration: c.hp <= 0 ? 'line-through' : 'none',
            }}>
              {c.name}
            </div>
          );
        })}
      </div>

      {/* Main area */}
      <div className="combat-body">
        {/* Battle field */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', minWidth: 0 }}>
          {/* Enemy area (top half) */}
          <div style={{
            flex: 1, background: 'linear-gradient(180deg, #0a0614 0%, #0a0e1a 100%)',
            borderBottom: '2px solid #1e2a4a',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40,
            padding: 20, minHeight: 200,
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: 8, left: 16, fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
              Enemy Forces
            </div>
            {aliveEnemies.length === 0 ? (
              <div style={{ color: '#10b981', fontSize: 16, fontWeight: 700 }}>All enemies defeated!</div>
            ) : (
              aliveEnemies.map(e => (
                <EnemyFigure
                  key={e.id}
                  enemy={e}
                  isTarget={selectedTargetId === e.id}
                  onClick={() => {
                    if ((needsTarget) && isPlayerTurn) {
                      selectSurfaceTarget(e.id);
                    }
                  }}
                />
              ))
            )}
            {/* Phase indicator */}
            <div style={{
              position: 'absolute', top: 8, right: 16,
              fontSize: 12, fontWeight: 700,
              color: phase === 'enemyTurn' ? '#ef4444' : phase === 'playerTurn' ? '#00d4ff' : '#94a3b8',
              textTransform: 'uppercase', letterSpacing: 1,
            }}>
              {phase === 'enemyTurn' ? '⚡ ENEMY TURN' : phase === 'playerTurn' ? '▶ PLAYER TURN' : phase.toUpperCase()}
            </div>
          </div>

          {/* Ally area (bottom) */}
          <div style={{
            background: '#0a0e1a',
            padding: '12px 16px',
            display: 'flex', gap: 10, justifyContent: 'center',
          }}>
            {allies.map(ally => (
              <div key={ally.id} style={{ flex: 1, maxWidth: 200 }}>
                <AllyCard
                  combatant={ally}
                  isActive={ally.id === currentTurnId}
                  isTarget={selectedTargetId === ally.id}
                  onClick={() => {}}
                  onSelect={() => {
                    if (needsAllyTarget && isPlayerTurn) {
                      selectSurfaceTarget(ally.id);
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar - combat UI */}
        <div className="combat-sidebar">
          {/* Action menu */}
          {isPlayerTurn && (
            <div style={{ padding: 12 }}>
              <div style={{ color: '#00d4ff', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                {current?.name}'s Actions
              </div>

              {/* Action buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
                {(['attack', 'skill', 'defend', 'flee'] as const).map(action => (
                  <button
                    key={action}
                    onClick={() => selectSurfaceAction(action)}
                    style={{
                      padding: '8px 6px',
                      background: selectedAction === action ? 'rgba(0,212,255,0.2)' : '#0f1629',
                      border: `1px solid ${selectedAction === action ? '#00d4ff' : '#1e2a4a'}`,
                      borderRadius: 6, color: selectedAction === action ? '#00d4ff' : '#94a3b8',
                      fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      textTransform: 'uppercase', letterSpacing: 0.5,
                    }}
                  >
                    {action === 'attack' ? '⚔️ Attack' :
                     action === 'skill' ? '✨ Skill' :
                     action === 'defend' ? '🛡️ Defend' : '🏃 Flee'}
                  </button>
                ))}
              </div>

              {/* Skill list */}
              {selectedAction === 'skill' && current?.skills && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 5 }}>Select Skill</div>
                  {current.skills.map(skill => {
                    const resource = current.energy ?? current.battery ?? 0;
                    const canUse = resource >= skill.energyCost;
                    const onCooldown = (skill.currentCooldown ?? 0) > 0;
                    return (
                      <div
                        key={skill.id}
                        onClick={() => !onCooldown && canUse && selectSurfaceSkill(skill.id)}
                        style={{
                          padding: '7px 9px', marginBottom: 5,
                          background: selectedSkill?.id === skill.id ? 'rgba(0,212,255,0.1)' : '#0a0e1a',
                          border: `1px solid ${selectedSkill?.id === skill.id ? '#00d4ff' : '#1e2a4a'}`,
                          borderRadius: 5, cursor: canUse && !onCooldown ? 'pointer' : 'not-allowed',
                          opacity: canUse && !onCooldown ? 1 : 0.4,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{skill.name}</span>
                          <span style={{ fontSize: 10, color: '#64748b' }}>{skill.energyCost} E</span>
                        </div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>{skill.description}</div>
                        {onCooldown && <div style={{ fontSize: 10, color: '#ef4444' }}>CD: {skill.currentCooldown}</div>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Target prompt */}
              {needsTarget && !selectedTargetId && (
                <div style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef44444a', borderRadius: 5, fontSize: 11, color: '#ef4444', marginBottom: 8 }}>
                  Click an enemy to target
                </div>
              )}
              {needsAllyTarget && !selectedTargetId && (
                <div style={{ padding: '6px 10px', background: 'rgba(16,185,129,0.1)', border: '1px solid #10b9814a', borderRadius: 5, fontSize: 11, color: '#10b981', marginBottom: 8 }}>
                  Click an ally to target
                </div>
              )}
              {selectedTargetId && (
                <div style={{ padding: '6px 10px', background: 'rgba(0,212,255,0.1)', border: '1px solid #00d4ff4a', borderRadius: 5, fontSize: 11, color: '#00d4ff', marginBottom: 8 }}>
                  Target: {combatants.find(c => c.id === selectedTargetId)?.name}
                </div>
              )}

              {/* Execute button */}
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '10px', fontSize: 13 }}
                disabled={!canExecute}
                onClick={executePlayerTurn}
              >
                EXECUTE
              </button>
            </div>
          )}

          {phase === 'enemyTurn' && (
            <div style={{ padding: 12 }}>
              <div style={{
                padding: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8, textAlign: 'center',
              }}>
                <div style={{ color: '#ef4444', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>ENEMY TURN</div>
                <div style={{ color: '#94a3b8', fontSize: 12 }}>Processing enemy actions...</div>
              </div>
            </div>
          )}

          {/* Combat log */}
          <div style={{ flex: 1, padding: '0 12px 12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5, paddingTop: 8 }}>
              Combat Log
            </div>
            <div
              ref={logRef}
              style={{
                flex: 1, overflowY: 'auto',
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

      {/* Victory/Defeat/Flee overlays */}
      {(phase === 'victory' || phase === 'defeat' || phase === 'flee') && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#0f1629',
            border: `1px solid ${phase === 'victory' ? '#10b981' : '#ef4444'}`,
            borderRadius: 12, padding: 'clamp(24px, 5vw, 40px) clamp(20px, 6vw, 48px)', textAlign: 'center',
            boxShadow: `0 0 60px ${phase === 'victory' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            maxWidth: '92vw',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              {phase === 'victory' ? '🏆' : phase === 'flee' ? '🏃' : '💀'}
            </div>
            <h2 style={{
              fontSize: 32, fontWeight: 700, letterSpacing: 3,
              color: phase === 'victory' ? '#10b981' : '#ef4444',
              marginBottom: 12,
            }}>
              {phase === 'victory' ? 'VICTORY!' : phase === 'flee' ? 'FLED!' : 'DEFEAT!'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>
              {phase === 'victory'
                ? 'Mission complete! Collect your rewards.'
                : phase === 'flee'
                ? 'You escaped but received no rewards.'
                : 'Your team was defeated. No rewards.'}
            </p>
            {phase === 'victory' ? (
              <button className="btn btn-primary" style={{ padding: '12px 32px', fontSize: 16, letterSpacing: 2 }} onClick={handleMissionVictory}>
                COLLECT REWARDS
              </button>
            ) : (
              <button className="btn btn-danger" style={{ padding: '12px 32px', fontSize: 16, letterSpacing: 2 }} onClick={phase === 'flee' ? handleFlee : handleMissionDefeat}>
                RETURN TO BASE
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
