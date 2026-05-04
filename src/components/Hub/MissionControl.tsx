import React, { useState } from 'react';
import { useProfile, useGameStore } from '../../store/gameStore';
import type { Difficulty } from '../../types/game';
import { DIFFICULTY_MODIFIERS } from '../../data/missions';

export function MissionControl() {
  const profile = useProfile();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('Normal');
  const launchMission = useGameStore(s => s.launchMission);

  if (!profile) return null;

  const diffMod = DIFFICULTY_MODIFIERS[selectedDifficulty];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: '#00d4ff', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          Mission Briefing
        </div>
        <div style={{ background: '#0a0e1a', border: '1px solid #1e2a4a', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
          <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>
            Scout Captain {profile.captain.name}, your mission is to breach the wormhole and engage hostile forces
            in uncharted space. Complete the space combat phase, then lead your ground crew in surface combat.
          </p>
        </div>

        {/* Mission crew summary */}
        <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
          Mission Crew
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
          <div style={{ background: '#0a0e1a', borderRadius: 8, padding: '10px 12px', border: '1px solid #1e2a4a' }}>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Captain</div>
            <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 13 }}>{profile.captain.name}</div>
            <div style={{ color: '#94a3b8', fontSize: 11 }}>{profile.captain.class} Lv.{profile.captain.level}</div>
          </div>
          {profile.selectedRobots.map((rid, i) => {
            const r = profile.robots.find(rb => rb.id === rid);
            return (
              <div key={rid} style={{ background: '#0a0e1a', borderRadius: 8, padding: '10px 12px', border: '1px solid #1e2a4a' }}>
                <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Robot {i + 1}</div>
                <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 13 }}>{r?.name ?? 'None'}</div>
                <div style={{ color: '#94a3b8', fontSize: 11 }}>{r?.archetype ?? '—'} Lv.{r?.level ?? '—'}</div>
              </div>
            );
          })}
        </div>

        {/* Difficulty selection */}
        <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
          Difficulty
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
          {(['Easy', 'Normal', 'Hard', 'Nightmare'] as Difficulty[]).map(diff => {
            const mod = DIFFICULTY_MODIFIERS[diff];
            const isSelected = selectedDifficulty === diff;
            return (
              <div
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                style={{
                  background: isSelected ? `${mod.color}22` : '#0a0e1a',
                  border: `2px solid ${isSelected ? mod.color : '#1e2a4a'}`,
                  borderRadius: 8, padding: '12px 8px', cursor: 'pointer',
                  textAlign: 'center', transition: 'all 0.2s',
                }}
              >
                <div style={{ fontWeight: 700, color: mod.color, fontSize: 14 }}>{diff}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>x{mod.rewardMult} rewards</div>
              </div>
            );
          })}
        </div>

        {/* Estimated rewards */}
        <div style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: '#00d4ff', fontSize: 14, marginBottom: 10 }}>Estimated Rewards</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>
              Captain XP: <span style={{ color: '#f59e0b', fontWeight: 600 }}>~{Math.round(120 * diffMod.rewardMult)}</span>
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>
              Ship XP: <span style={{ color: '#f59e0b', fontWeight: 600 }}>~{Math.round(90 * diffMod.rewardMult)}</span>
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>
              Robot XP: <span style={{ color: '#f59e0b', fontWeight: 600 }}>~{Math.round(60 * diffMod.rewardMult)}</span>
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>
              Credits: <span style={{ color: '#f59e0b', fontWeight: 600 }}>~{Math.round(300 * diffMod.rewardMult)}</span>
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: 16, letterSpacing: 2 }}
          onClick={() => launchMission(selectedDifficulty)}
        >
          LAUNCH MISSION
        </button>

        <p style={{ color: '#64748b', fontSize: 12, textAlign: 'center', marginTop: 12 }}>
          Missions include Space Combat followed by Surface Combat. Completing both earns full rewards.
        </p>
      </div>
    </div>
  );
}
