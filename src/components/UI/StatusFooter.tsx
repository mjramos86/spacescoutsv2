import React from 'react';
import { useProfile } from '../../store/gameStore';

export function StatusFooter() {
  const profile = useProfile();
  if (!profile) return null;

  const { captain, ship, robots, selectedRobots, credits } = profile;
  const r1 = robots.find(r => r.id === selectedRobots[0]);
  const r2 = robots.find(r => r.id === selectedRobots[1]);

  const XpBar = ({ label, xp, xpToNext, color }: { label: string; xp: number; xpToNext: number; color: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 140, flexShrink: 0 }}>
      <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, minWidth: 50, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 4, background: '#1e2a4a', borderRadius: 2, overflow: 'hidden', minWidth: 40 }}>
        <div style={{ width: `${Math.min(100, (xp / xpToNext) * 100)}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 10, color: '#64748b', whiteSpace: 'nowrap' }}>{xp}/{xpToNext}</span>
    </div>
  );

  const Divider = () => (
    <div style={{ width: 1, height: 28, background: '#1e2a4a', flexShrink: 0 }} />
  );

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(10,14,26,0.97)',
      borderTop: '1px solid #1e2a4a',
      padding: '6px 12px',
      zIndex: 50, backdropFilter: 'blur(10px)',
    }}>
      <div className="status-footer-scroll">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: '#00d4ff', fontWeight: 700, whiteSpace: 'nowrap' }}>
            {captain.name} <span style={{ color: '#64748b' }}>Lv.{captain.level}</span>
          </span>
          <XpBar label="Captain" xp={captain.xp} xpToNext={captain.xpToNext} color="#f59e0b" />
        </div>

        <Divider />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: '#60a5fa', fontWeight: 700, whiteSpace: 'nowrap' }}>
            {ship.name} <span style={{ color: '#64748b' }}>Lv.{ship.level}</span>
          </span>
          <XpBar label="Ship" xp={ship.xp} xpToNext={ship.xpToNext} color="#60a5fa" />
        </div>

        {r1 && (
          <>
            <Divider />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: '#a855f7', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {r1.name} <span style={{ color: '#64748b' }}>Lv.{r1.level}</span>
              </span>
              <XpBar label="Bot 1" xp={r1.xp} xpToNext={r1.xpToNext} color="#a855f7" />
            </div>
          </>
        )}

        {r2 && (
          <>
            <Divider />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: '#a855f7', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {r2.name} <span style={{ color: '#64748b' }}>Lv.{r2.level}</span>
              </span>
              <XpBar label="Bot 2" xp={r2.xp} xpToNext={r2.xpToNext} color="#a855f7" />
            </div>
          </>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, paddingLeft: 8 }}>
          <span style={{ fontSize: 16 }}>💰</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#f59e0b', whiteSpace: 'nowrap' }}>{credits.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
