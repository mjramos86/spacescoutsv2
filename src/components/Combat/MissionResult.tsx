import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { rarityColor } from '../../utils/loot';

export function MissionResult() {
  const result = useGameStore(s => s.missionResult);
  const collectResults = useGameStore(s => s.collectResults);

  if (!result) return null;

  const totalXp = result.xpGained.captain + result.xpGained.ship + result.xpGained.robots;

  return (
    <div className="screen-full" style={{
      background: '#0a0e1a',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '20px 16px',
    }}>
      <div style={{
        width: 'min(560px, 100%)',
        background: '#0f1629',
        border: `1px solid ${result.success ? '#10b981' : '#ef4444'}`,
        borderRadius: 12,
        padding: 'clamp(20px, 4vw, 36px) clamp(16px, 4vw, 40px)',
        boxShadow: `0 0 60px ${result.success ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>
            {result.success ? '🏆' : '💀'}
          </div>
          <h2 style={{
            fontSize: 32, fontWeight: 700, letterSpacing: 3,
            color: result.success ? '#10b981' : '#ef4444',
            marginBottom: 8,
          }}>
            {result.success ? 'MISSION COMPLETE' : 'MISSION FAILED'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 15 }}>
            Operation: <span style={{ color: '#00d4ff', fontWeight: 600 }}>{result.missionName}</span>
          </p>
        </div>

        {result.success && (
          <>
            {/* XP Rewards */}
            <div style={{ background: '#0a0e1a', border: '1px solid #1e2a4a', borderRadius: 8, padding: '16px 18px', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                Experience Gained
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Captain</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#f59e0b' }}>+{result.xpGained.captain}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>XP</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Ship</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#60a5fa' }}>+{result.xpGained.ship}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>XP</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Robots</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#a855f7' }}>+{result.xpGained.robots}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>XP</div>
                </div>
              </div>
            </div>

            {/* Credits */}
            <div style={{
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 8, padding: '14px 18px', marginBottom: 16,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Credits Earned</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>+{result.creditsGained.toLocaleString()}</div>
              </div>
              <div style={{ fontSize: 36 }}>💰</div>
            </div>

            {/* Loot */}
            {result.loot.length > 0 && (
              <div style={{ background: '#0a0e1a', border: '1px solid #1e2a4a', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: '#00d4ff', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                  Loot Found ({result.loot.length} item{result.loot.length !== 1 ? 's' : ''})
                </div>
                {result.loot.map(item => (
                  <div key={item.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '7px 10px', background: '#0f1629', borderRadius: 6, marginBottom: 6,
                    border: `1px solid ${rarityColor(item.rarity)}33`,
                  }}>
                    <div>
                      <div style={{ color: rarityColor(item.rarity), fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {Object.entries(item.stats).map(([k, v]) => `+${v} ${k}`).join(', ')}
                      </div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>{item.entityType} • {item.slot}</div>
                    </div>
                    <span className={`badge badge-${item.rarity.toLowerCase()}`} style={{ marginLeft: 10 }}>{item.rarity}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!result.success && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8, padding: '20px', marginBottom: 20, textAlign: 'center',
          }}>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 8 }}>
              Your mission ended in failure. No rewards have been granted.
            </p>
            <p style={{ color: '#64748b', fontSize: 13 }}>
              Train harder and try again, Captain.
            </p>
          </div>
        )}

        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: 16, letterSpacing: 2 }}
          onClick={collectResults}
        >
          {result.success ? 'COLLECT REWARDS' : 'RETURN TO BASE'}
        </button>
      </div>
    </div>
  );
}
