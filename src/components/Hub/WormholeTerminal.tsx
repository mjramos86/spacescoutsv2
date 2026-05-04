import React, { useState } from 'react';
import { useProfile, useGameStore } from '../../store/gameStore';
import type { Difficulty } from '../../types/game';

interface DailyContract {
  id: string;
  description: string;
  difficulty: Difficulty;
  reward: number;
  completed: boolean;
}

function generateDailyContracts(): DailyContract[] {
  return [
    { id: 'c1', description: 'Eliminate Marauder forces from the frontier zone', difficulty: 'Normal', reward: 300, completed: false },
    { id: 'c2', description: 'Investigate alien activity on the ice moon', difficulty: 'Hard', reward: 600, completed: false },
    { id: 'c3', description: 'Destroy Rogue AI threat at derelict station', difficulty: 'Nightmare', reward: 1200, completed: false },
  ];
}

export function WormholeTerminal() {
  const profile = useProfile();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('Normal');
  const launchMission = useGameStore(s => s.launchMission);
  const [contracts] = useState<DailyContract[]>(generateDailyContracts());

  if (!profile) return null;

  const difficultyColors: Record<Difficulty, string> = {
    Easy: '#10b981',
    Normal: '#60a5fa',
    Hard: '#f59e0b',
    Nightmare: '#ef4444',
  };

  return (
    <div>
      {/* Quick launch */}
      <div style={{ color: '#00d4ff', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
        Quick Launch
      </div>
      <div style={{ background: '#0a0e1a', border: '1px solid #1e2a4a', borderRadius: 8, padding: '16px', marginBottom: 20 }}>
        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
          Launch a randomized mission immediately. Full rewards based on selected difficulty.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {(['Easy', 'Normal', 'Hard', 'Nightmare'] as Difficulty[]).map(d => (
            <button
              key={d}
              onClick={() => setSelectedDifficulty(d)}
              style={{
                padding: '10px', background: selectedDifficulty === d ? `${difficultyColors[d]}22` : 'transparent',
                border: `2px solid ${selectedDifficulty === d ? difficultyColors[d] : '#1e2a4a'}`,
                borderRadius: 6, color: difficultyColors[d], fontWeight: 700, fontSize: 14, cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {d}
            </button>
          ))}
        </div>
        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: 12, fontSize: 16, letterSpacing: 2 }}
          onClick={() => launchMission(selectedDifficulty)}
        >
          🚀 LAUNCH MISSION
        </button>
      </div>

      {/* Daily contracts */}
      <div style={{ color: '#00d4ff', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
        Daily Contracts
      </div>
      <p style={{ color: '#64748b', fontSize: 12, marginBottom: 12 }}>
        Special contracts refresh daily. Complete for bonus credits.
      </p>
      {contracts.map(contract => (
        <div key={contract.id} style={{
          padding: '12px 14px', background: '#0a0e1a', borderRadius: 8, marginBottom: 10,
          border: `1px solid ${contract.completed ? '#10b981' : '#1e2a4a'}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{contract.description}</div>
              <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                <span style={{ color: difficultyColors[contract.difficulty] }}>{contract.difficulty}</span>
                <span style={{ color: '#f59e0b' }}>+{contract.reward}cr</span>
              </div>
            </div>
            {contract.completed ? (
              <span style={{ color: '#10b981', fontSize: 12, fontWeight: 700 }}>✓ DONE</span>
            ) : (
              <button
                className="btn btn-primary"
                style={{ fontSize: 11, padding: '5px 12px' }}
                onClick={() => launchMission(contract.difficulty)}
              >
                ACCEPT
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Wormhole info */}
      <div style={{ marginTop: 20, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8, padding: '14px 16px' }}>
        <div style={{ fontWeight: 700, color: '#7c3aed', fontSize: 14, marginBottom: 8 }}>Wormhole Status</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>Status: <span style={{ color: '#10b981' }}>STABLE</span></div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>Missions: <span style={{ color: '#e2e8f0' }}>{profile.stats.missionsCompleted}</span></div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>Stability: <span style={{ color: '#10b981' }}>98%</span></div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>Next event: <span style={{ color: '#f59e0b' }}>—</span></div>
        </div>
      </div>
    </div>
  );
}
