import React from 'react';
import { useProfile } from '../../store/gameStore';

const LORE_ENTRIES = [
  {
    title: 'The Wormhole',
    content: 'Discovered in 2387, the Sagittarius Wormhole connects the Sol system to an unmapped region of the Andromeda galaxy. Scout teams are the first line of exploration.',
  },
  {
    title: 'The Marauders',
    content: 'Outcast pirates and mercenaries who prey on scouts venturing through the wormhole. Dangerous and unpredictable.',
  },
  {
    title: 'The Alien Swarm',
    content: 'An indigenous species discovered in the frontier zone. Highly aggressive and territorial. Their biology is unlike anything seen before.',
  },
  {
    title: 'Rogue AI',
    content: 'Ancient automated defense systems left by an unknown civilization. They operate without directive, attacking any who approach.',
  },
  {
    title: 'The Void Cult',
    content: 'A fanatical human sect that worships the void between stars. They seek to close the wormhole and isolate humanity forever.',
  },
  {
    title: 'Frontier Station',
    content: 'Your home base beyond the wormhole. This mobile station serves as command, market, and repair facility for all scout operations.',
  },
];

export function OfficersLounge() {
  const profile = useProfile();

  if (!profile) return null;

  const { captain, ship, robots, stats } = profile;

  return (
    <div>
      {/* Stats summary */}
      <div style={{ color: '#00d4ff', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
        Scout Record
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
        {[
          { label: 'Missions Completed', val: stats.missionsCompleted },
          { label: 'Enemies Defeated', val: stats.enemiesDefeated },
          { label: 'Total Damage Dealt', val: stats.totalDamageDealt.toLocaleString() },
          { label: 'Total Healing Done', val: stats.totalHealingDone.toLocaleString() },
          { label: 'Credits Earned', val: `${stats.totalCreditsEarned.toLocaleString()}cr` },
          { label: 'Loot Found', val: stats.totalLootFound },
        ].map(({ label, val }) => (
          <div key={label} style={{ background: '#0a0e1a', borderRadius: 6, padding: '10px 12px', border: '1px solid #1e2a4a' }}>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#00d4ff' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Entity levels */}
      <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        Crew Roster
      </div>
      <div style={{ background: '#0a0e1a', border: '1px solid #1e2a4a', borderRadius: 8, padding: '12px 14px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #1e2a4a' }}>
          <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{captain.name}</span>
          <span style={{ color: '#94a3b8' }}>{captain.class} • Lv.{captain.level}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #1e2a4a' }}>
          <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{ship.name}</span>
          <span style={{ color: '#94a3b8' }}>{ship.type} • Lv.{ship.level}</span>
        </div>
        {robots.map(robot => (
          <div key={robot.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{robot.name}</span>
            <span style={{ color: '#94a3b8' }}>{robot.archetype} • Lv.{robot.level}</span>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        Achievements
      </div>
      <div style={{ marginBottom: 20 }}>
        {[
          { id: 'first_mission', name: 'First Contact', desc: 'Complete your first mission', condition: stats.missionsCompleted >= 1 },
          { id: 'veteran', name: 'Veteran Scout', desc: 'Complete 10 missions', condition: stats.missionsCompleted >= 10 },
          { id: 'captain_10', name: 'Commander', desc: 'Reach Captain level 10', condition: captain.level >= 10 },
          { id: 'captain_50', name: 'Elite Captain', desc: 'Reach Captain level 50', condition: captain.level >= 50 },
          { id: 'rich', name: 'War Profiteer', desc: 'Earn 10,000 credits', condition: stats.totalCreditsEarned >= 10000 },
          { id: 'loot', name: 'Treasure Hunter', desc: 'Find 20 loot items', condition: stats.totalLootFound >= 20 },
        ].map(ach => (
          <div key={ach.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
            background: '#0a0e1a', borderRadius: 6, marginBottom: 8,
            border: `1px solid ${ach.condition ? '#f59e0b' : '#1e2a4a'}`,
          }}>
            <div style={{ fontSize: 20 }}>{ach.condition ? '🏆' : '🔒'}</div>
            <div>
              <div style={{ fontWeight: 600, color: ach.condition ? '#f59e0b' : '#64748b', fontSize: 13 }}>{ach.name}</div>
              <div style={{ color: '#64748b', fontSize: 11 }}>{ach.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Codex */}
      <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        Codex
      </div>
      {LORE_ENTRIES.map(entry => (
        <details key={entry.title} style={{ marginBottom: 8 }}>
          <summary style={{
            cursor: 'pointer', padding: '8px 12px', background: '#0a0e1a',
            border: '1px solid #1e2a4a', borderRadius: 6, color: '#00d4ff',
            fontWeight: 600, fontSize: 13, listStyle: 'none', userSelect: 'none',
          }}>
            ▸ {entry.title}
          </summary>
          <div style={{
            padding: '10px 12px', background: '#060a14', border: '1px solid #1e2a4a',
            borderTop: 'none', borderRadius: '0 0 6px 6px', color: '#94a3b8', fontSize: 13, lineHeight: 1.6,
          }}>
            {entry.content}
          </div>
        </details>
      ))}
    </div>
  );
}
