import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { Biome, Combatant } from '../../types/game';
import { generateLoot } from '../../utils/loot';

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

// Pre-computed stars — stable across renders
const STARS = Array.from({ length: 50 }, (_, i) => ({
  left: ((i * 1973 + 317) % 1000) / 10,
  top: ((i * 1301 + 97) % 550) / 10,
  size: (i % 3) + 1,
  opacity: 0.15 + (i % 7) * 0.07,
}));

function BattlefieldBG({ biome }: { biome: Biome }) {
  const skyColors: Record<string, [string, string]> = {
    'Desert Planet':          ['#2d0e00', '#0a0614'],
    'Ice Moon':               ['#000d1a', '#0a0e2a'],
    'Derelict Space Station': ['#050505', '#0a0a12'],
  };
  const [skyTop, skyBot] = skyColors[biome] ?? ['#0a0614', '#0a0e1a'];

  const planetColor: Record<string, string> = {
    'Desert Planet':          '#c2410c',
    'Ice Moon':               '#1d4ed8',
    'Derelict Space Station': '#334155',
  };
  const pColor = planetColor[biome] ?? '#7c3aed';

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: `linear-gradient(180deg, ${skyTop} 0%, ${skyBot} 70%, #060a0a 100%)`,
      pointerEvents: 'none',
    }}>
      {/* Stars */}
      {STARS.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${s.left}%`, top: `${s.top}%`,
          width: s.size, height: s.size,
          borderRadius: '50%',
          background: '#e2e8f0',
          opacity: s.opacity,
        }} />
      ))}
      {/* Planet / moon */}
      <div style={{
        position: 'absolute', top: 16, right: 40,
        width: 64, height: 64, borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${pColor}aa, ${pColor}44 60%, transparent)`,
        boxShadow: `0 0 20px ${pColor}55`,
        opacity: 0.7,
      }} />
      {/* Ground */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%',
        background: 'linear-gradient(180deg, transparent 0%, #0d1117 40%, #060a0a 100%)',
      }} />
      {/* Crystal/rock formations */}
      <svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: '30%' }} viewBox="0 0 800 200" preserveAspectRatio="none">
        <polygon points="60,200 80,120 100,200" fill="#1e2a4a" opacity="0.6" />
        <polygon points="90,200 115,90 140,200" fill="#162035" opacity="0.7" />
        <polygon points="650,200 680,105 710,200" fill="#1e2a4a" opacity="0.6" />
        <polygon points="700,200 730,130 760,200" fill="#162035" opacity="0.7" />
        <polygon points="370,200 390,140 410,200" fill="#1e2a4a" opacity="0.4" />
      </svg>
    </div>
  );
}

function CaptainSprite({ active }: { active: boolean }) {
  return (
    <svg width="70" height="90" viewBox="0 0 70 90" style={{
      filter: active ? 'drop-shadow(0 0 8px #00d4ff)' : undefined,
      animation: active ? 'floatUp 2s ease-in-out infinite' : undefined,
    }}>
      {/* Helmet */}
      <ellipse cx="35" cy="18" rx="16" ry="17" fill="#1e3a5f" />
      <ellipse cx="35" cy="17" rx="10" ry="9" fill="#00d4ff" opacity="0.5" />
      <ellipse cx="35" cy="17" rx="7" ry="6" fill="#0099bb" opacity="0.6" />
      {/* Neck */}
      <rect x="30" y="33" width="10" height="6" fill="#1e3a5f" />
      {/* Body / torso */}
      <rect x="18" y="38" width="34" height="30" rx="4" fill="#1d4ed8" />
      {/* Chest plate */}
      <rect x="24" y="42" width="22" height="18" rx="3" fill="#1e3a8a" />
      <rect x="29" y="46" width="12" height="3" rx="1" fill="#00d4ff" opacity="0.5" />
      {/* Shoulder pads */}
      <rect x="10" y="38" width="10" height="12" rx="3" fill="#1e40af" />
      <rect x="50" y="38" width="10" height="12" rx="3" fill="#1e40af" />
      {/* Left arm (hangs down) */}
      <rect x="10" y="49" width="8" height="18" rx="3" fill="#1d4ed8" />
      {/* Right arm with gun pointing right */}
      <rect x="52" y="48" width="8" height="10" rx="3" fill="#1d4ed8" />
      <rect x="58" y="50" width="16" height="6" rx="2" fill="#374151" />
      <rect x="72" y="52" width="4" height="2" rx="1" fill="#6b7280" />
      {/* Legs */}
      <rect x="20" y="67" width="13" height="22" rx="3" fill="#1e3a8a" />
      <rect x="37" y="67" width="13" height="22" rx="3" fill="#1e3a8a" />
      {/* Boots */}
      <rect x="19" y="85" width="15" height="5" rx="2" fill="#111827" />
      <rect x="36" y="85" width="15" height="5" rx="2" fill="#111827" />
    </svg>
  );
}

function RobotSprite({ color, active }: { color: string; active: boolean }) {
  return (
    <svg width="65" height="88" viewBox="0 0 65 88" style={{
      filter: active ? `drop-shadow(0 0 8px ${color})` : undefined,
      animation: active ? 'floatUp 2s ease-in-out infinite' : undefined,
    }}>
      {/* Antenna */}
      <line x1="32" y1="4" x2="32" y2="12" stroke={color} strokeWidth="2" />
      <circle cx="32" cy="3" r="3" fill={color} opacity="0.8" />
      {/* Head */}
      <rect x="16" y="12" width="32" height="24" rx="4" fill="#1e293b" />
      {/* Eyes */}
      <rect x="21" y="18" width="10" height="7" rx="2" fill={color} opacity="0.9" />
      <rect x="34" y="18" width="10" height="7" rx="2" fill={color} opacity="0.9" />
      {/* Mouth grille */}
      <rect x="22" y="28" width="20" height="4" rx="1" fill="#0f172a" />
      <line x1="26" y1="28" x2="26" y2="32" stroke={color} strokeWidth="1" opacity="0.4" />
      <line x1="30" y1="28" x2="30" y2="32" stroke={color} strokeWidth="1" opacity="0.4" />
      <line x1="34" y1="28" x2="34" y2="32" stroke={color} strokeWidth="1" opacity="0.4" />
      <line x1="38" y1="28" x2="38" y2="32" stroke={color} strokeWidth="1" opacity="0.4" />
      {/* Neck */}
      <rect x="27" y="36" width="10" height="5" fill="#1e293b" />
      {/* Torso */}
      <rect x="10" y="40" width="44" height="28" rx="4" fill="#0f172a" />
      <rect x="16" y="45" width="14" height="14" rx="2" fill="#1e293b" />
      <circle cx="23" cy="52" r="5" fill={color} opacity="0.3" />
      <circle cx="23" cy="52" r="2" fill={color} opacity="0.7" />
      {/* Panel detail */}
      <rect x="34" y="46" width="14" height="5" rx="1" fill="#1e293b" />
      <rect x="34" y="54" width="14" height="5" rx="1" fill="#1e293b" />
      {/* Left shoulder */}
      <rect x="2" y="40" width="10" height="14" rx="3" fill="#1e293b" />
      {/* Right arm with gun */}
      <rect x="52" y="40" width="10" height="14" rx="3" fill="#1e293b" />
      <rect x="60" y="46" width="18" height="6" rx="2" fill="#374151" />
      <rect x="76" y="48" width="4" height="2" rx="1" fill={color} opacity="0.8" />
      {/* Legs */}
      <rect x="13" y="67" width="16" height="20" rx="3" fill="#1e293b" />
      <rect x="35" y="67" width="16" height="20" rx="3" fill="#1e293b" />
      {/* Feet */}
      <rect x="11" y="83" width="20" height="5" rx="2" fill="#0f172a" />
      <rect x="33" y="83" width="20" height="5" rx="2" fill="#0f172a" />
    </svg>
  );
}

function EnemySVG({ faction, active, isTarget }: { faction: string; active: boolean; isTarget: boolean }) {
  const glow = isTarget ? `drop-shadow(0 0 10px #ef4444)` : active ? `drop-shadow(0 0 6px #f59e0b)` : undefined;

  if (faction === 'Marauders') {
    return (
      <svg width="75" height="95" viewBox="0 0 75 95" style={{ filter: glow, transform: 'scaleX(-1)' }}>
        {/* Horned helmet */}
        <ellipse cx="37" cy="20" rx="18" ry="18" fill="#7f1d1d" />
        <polygon points="20,14 14,2 24,12" fill="#991b1b" />
        <polygon points="54,14 60,2 50,12" fill="#991b1b" />
        {/* Visor slit */}
        <rect x="26" y="16" width="22" height="7" rx="2" fill="#0a0a0a" />
        <rect x="28" y="17" width="18" height="4" rx="1" fill="#ef4444" opacity="0.6" />
        {/* Neck */}
        <rect x="31" y="36" width="12" height="6" fill="#7f1d1d" />
        {/* Armored body */}
        <rect x="14" y="41" width="46" height="32" rx="4" fill="#991b1b" />
        {/* Chest plate */}
        <polygon points="22,44 52,44 56,60 18,60" fill="#7f1d1d" />
        <line x1="37" y1="44" x2="37" y2="60" stroke="#ef4444" strokeWidth="1" opacity="0.4" />
        {/* Left arm with shield */}
        <rect x="4" y="40" width="12" height="26" rx="3" fill="#991b1b" />
        <rect x="0" y="38" width="10" height="30" rx="3" fill="#b91c1c" />
        <rect x="1" y="42" width="8" height="4" rx="1" fill="#ef4444" opacity="0.4" />
        <rect x="1" y="50" width="8" height="4" rx="1" fill="#ef4444" opacity="0.4" />
        <rect x="1" y="58" width="8" height="4" rx="1" fill="#ef4444" opacity="0.4" />
        {/* Right arm with axe */}
        <rect x="58" y="40" width="12" height="22" rx="3" fill="#991b1b" />
        <rect x="68" y="28" width="6" height="28" rx="2" fill="#4b5563" />
        <polygon points="68,28 80,20 80,40 68,38" fill="#6b7280" />
        {/* Legs */}
        <rect x="16" y="72" width="18" height="22" rx="3" fill="#7f1d1d" />
        <rect x="40" y="72" width="18" height="22" rx="3" fill="#7f1d1d" />
        {/* Boots */}
        <rect x="14" y="90" width="22" height="5" rx="2" fill="#111827" />
        <rect x="38" y="90" width="22" height="5" rx="2" fill="#111827" />
      </svg>
    );
  }

  if (faction === 'Alien Swarm') {
    return (
      <svg width="78" height="95" viewBox="0 0 78 95" style={{ filter: glow, transform: 'scaleX(-1)' }}>
        {/* Head / carapace */}
        <ellipse cx="39" cy="20" rx="22" ry="19" fill="#065f46" />
        {/* Compound eyes */}
        <ellipse cx="24" cy="15" rx="9" ry="7" fill="#10b981" opacity="0.9" />
        <ellipse cx="54" cy="15" rx="9" ry="7" fill="#10b981" opacity="0.9" />
        <ellipse cx="24" cy="14" rx="5" ry="4" fill="#34d399" opacity="0.7" />
        <ellipse cx="54" cy="14" rx="5" ry="4" fill="#34d399" opacity="0.7" />
        {/* Mandibles */}
        <path d="M28,30 Q20,40 14,38" stroke="#047857" strokeWidth="3" fill="none" />
        <path d="M50,30 Q58,40 64,38" stroke="#047857" strokeWidth="3" fill="none" />
        {/* Thorax */}
        <ellipse cx="39" cy="52" rx="20" ry="22" fill="#065f46" />
        {/* Carapace segments */}
        <ellipse cx="39" cy="44" rx="16" ry="6" fill="#047857" opacity="0.6" />
        <ellipse cx="39" cy="54" rx="16" ry="6" fill="#047857" opacity="0.6" />
        <ellipse cx="39" cy="64" rx="14" ry="5" fill="#047857" opacity="0.6" />
        {/* Upper claws */}
        <path d="M20,42 Q6,32 0,22" stroke="#059669" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M58,42 Q72,32 78,22" stroke="#059669" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Lower arms */}
        <path d="M18,58 Q4,55 0,48" stroke="#059669" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M60,58 Q74,55 78,48" stroke="#059669" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Legs */}
        <path d="M28,72 Q22,82 18,92" stroke="#065f46" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M38,74 Q38,84 38,94" stroke="#065f46" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M50,72 Q56,82 60,92" stroke="#065f46" strokeWidth="6" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  if (faction === 'Rogue AI') {
    return (
      <svg width="72" height="95" viewBox="0 0 72 95" style={{ filter: glow, transform: 'scaleX(-1)' }}>
        {/* Angular head */}
        <polygon points="14,8 58,8 64,22 54,36 18,36 8,22" fill="#1e1b4b" />
        {/* Scanner visor */}
        <rect x="16" y="16" width="40" height="10" rx="1" fill="#0a0a0a" />
        <rect x="16" y="16" width="40" height="10" rx="1" fill="#ef4444" opacity="0.5" />
        <rect x="16" y="18" width="20" height="6" rx="0" fill="#ef4444" opacity="0.3" />
        {/* Circuit lines on head */}
        <line x1="24" y1="8" x2="24" y2="16" stroke="#7c3aed" strokeWidth="1" opacity="0.5" />
        <line x1="48" y1="8" x2="48" y2="16" stroke="#7c3aed" strokeWidth="1" opacity="0.5" />
        {/* Neck connector */}
        <rect x="28" y="36" width="16" height="6" fill="#312e81" />
        {/* Torso — geometric */}
        <polygon points="10,42 62,42 66,70 6,70" fill="#1e1b4b" />
        {/* Chest core */}
        <rect x="26" y="48" width="20" height="14" rx="2" fill="#0a0a0a" />
        <circle cx="36" cy="55" r="5" fill="#7c3aed" opacity="0.4" />
        <circle cx="36" cy="55" r="2" fill="#a855f7" opacity="0.9" />
        {/* Circuit detail */}
        <line x1="16" y1="50" x2="26" y2="50" stroke="#7c3aed" strokeWidth="1" opacity="0.5" />
        <line x1="46" y1="50" x2="56" y2="50" stroke="#7c3aed" strokeWidth="1" opacity="0.5" />
        <line x1="16" y1="60" x2="26" y2="60" stroke="#7c3aed" strokeWidth="1" opacity="0.5" />
        <line x1="46" y1="60" x2="56" y2="60" stroke="#7c3aed" strokeWidth="1" opacity="0.5" />
        {/* Left arm */}
        <rect x="0" y="42" width="12" height="24" rx="2" fill="#312e81" />
        {/* Right arm with cannon */}
        <rect x="60" y="42" width="12" height="20" rx="2" fill="#312e81" />
        <rect x="70" y="46" width="20" height="8" rx="2" fill="#4c1d95" />
        <circle cx="88" cy="50" r="3" fill="#a855f7" opacity="0.7" />
        {/* Legs */}
        <rect x="12" y="70" width="20" height="24" rx="2" fill="#312e81" />
        <rect x="40" y="70" width="20" height="24" rx="2" fill="#312e81" />
        {/* Feet */}
        <rect x="10" y="90" width="24" height="5" rx="1" fill="#1e1b4b" />
        <rect x="38" y="90" width="24" height="5" rx="1" fill="#1e1b4b" />
      </svg>
    );
  }

  // Void Cult
  return (
    <svg width="70" height="98" viewBox="0 0 70 98" style={{ filter: glow, transform: 'scaleX(-1)' }}>
      {/* Hood */}
      <ellipse cx="35" cy="16" rx="20" ry="16" fill="#0c4a6e" />
      <ellipse cx="35" cy="20" rx="14" ry="12" fill="#0a0a14" />
      {/* Glowing eyes */}
      <ellipse cx="28" cy="17" rx="4" ry="3" fill="#00d4ff" opacity="0.9" />
      <ellipse cx="42" cy="17" rx="4" ry="3" fill="#00d4ff" opacity="0.9" />
      <ellipse cx="28" cy="17" rx="2" ry="1.5" fill="#7dd3fc" />
      <ellipse cx="42" cy="17" rx="2" ry="1.5" fill="#7dd3fc" />
      {/* Robe body */}
      <path d="M14,32 Q10,60 8,95 L62,95 Q60,60 56,32 Q48,28 35,28 Q22,28 14,32 Z" fill="#0c4a6e" />
      {/* Robe shading */}
      <path d="M22,32 Q20,60 18,95" stroke="#0369a1" strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M35,30 Q35,62 35,95" stroke="#0369a1" strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M48,32 Q50,60 52,95" stroke="#0369a1" strokeWidth="1.5" fill="none" opacity="0.4" />
      {/* Collar */}
      <ellipse cx="35" cy="30" rx="12" ry="4" fill="#075985" />
      {/* Left glowing hand */}
      <ellipse cx="10" cy="58" rx="7" ry="6" fill="#00d4ff" opacity="0.25" />
      <circle cx="10" cy="58" r="4" fill="#0891b2" opacity="0.6" />
      <circle cx="10" cy="58" r="2" fill="#00d4ff" opacity="0.9" />
      {/* Right glowing hand */}
      <ellipse cx="60" cy="58" rx="7" ry="6" fill="#00d4ff" opacity="0.25" />
      <circle cx="60" cy="58" r="4" fill="#0891b2" opacity="0.6" />
      <circle cx="60" cy="58" r="2" fill="#00d4ff" opacity="0.9" />
      {/* Rune on chest */}
      <text x="35" y="56" fontSize="16" textAnchor="middle" fill="#00d4ff" opacity="0.6" fontFamily="serif">✦</text>
    </svg>
  );
}

function AllyFigure({ combatant, isActive, isTarget, onClick }: {
  combatant: Combatant; isActive: boolean; isTarget: boolean; onClick: () => void;
}) {
  const hpPct = (combatant.hp / combatant.maxHp) * 100;
  const energyVal = combatant.energy ?? combatant.battery ?? 0;
  const maxEnergy = combatant.maxEnergy ?? combatant.maxBattery ?? 1;
  const energyPct = (energyVal / maxEnergy) * 100;
  const energyLabel = combatant.energy !== undefined ? 'E' : 'BAT';

  const isRobot = combatant.id.startsWith('robot');
  const robotColors = ['#7c3aed', '#10b981', '#f59e0b', '#ec4899'];
  const robotColor = robotColors[combatant.name.charCodeAt(0) % robotColors.length];

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        cursor: 'default', opacity: combatant.hp <= 0 ? 0.25 : 1,
        filter: isTarget ? 'drop-shadow(0 0 8px #10b981)' : undefined,
      }}
    >
      {isRobot
        ? <RobotSprite color={robotColor} active={isActive} />
        : <CaptainSprite active={isActive} />}
      {/* Stat card */}
      <div style={{
        background: 'rgba(15,22,41,0.85)', border: `1px solid ${isActive ? '#00d4ff' : '#1e2a4a'}`,
        borderRadius: 5, padding: '4px 8px', minWidth: 80, maxWidth: 110,
        boxShadow: isActive ? '0 0 10px rgba(0,212,255,0.25)' : undefined,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: isActive ? '#00d4ff' : '#e2e8f0', marginBottom: 3, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {combatant.name}
          {isActive && <span style={{ color: '#00d4ff', marginLeft: 4 }}>▶</span>}
        </div>
        <div style={{ marginBottom: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#64748b', marginBottom: 1 }}>
            <span>HP</span>
            <span style={{ color: hpPct > 60 ? '#10b981' : hpPct > 30 ? '#f59e0b' : '#ef4444' }}>{combatant.hp}</span>
          </div>
          <div style={{ height: 3, background: '#1e2a4a', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: hpPct > 60 ? '#10b981' : hpPct > 30 ? '#f59e0b' : '#ef4444', width: `${hpPct}%` }} />
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#64748b', marginBottom: 1 }}>
            <span>{energyLabel}</span><span>{energyVal}</span>
          </div>
          <div style={{ height: 3, background: '#1e2a4a', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#3b82f6', width: `${energyPct}%` }} />
          </div>
        </div>
        {combatant.statusEffects.length > 0 && (
          <div style={{ display: 'flex', gap: 2, marginTop: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
            {combatant.statusEffects.map(e => (
              <span key={e} style={{ fontSize: 8, padding: '1px 3px', borderRadius: 2, background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid #00d4ff44' }}>{e.slice(0, 5)}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EnemyFigure({ enemy, isTarget, onClick }: { enemy: Combatant; isTarget: boolean; onClick: () => void }) {
  const hpPct = (enemy.hp / enemy.maxHp) * 100;
  const faction = (enemy as { faction?: string }).faction ?? '';

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        cursor: enemy.hp > 0 ? 'pointer' : 'default',
        opacity: enemy.hp <= 0 ? 0.2 : 1,
        transform: isTarget ? 'scale(1.08)' : 'scale(1)',
        transition: 'transform 0.2s',
      }}
    >
      <EnemySVG faction={faction} active={false} isTarget={isTarget} />
      {/* HP card */}
      <div style={{
        background: 'rgba(15,22,41,0.85)', border: `1px solid ${isTarget ? '#ef4444' : '#1e2a4a'}`,
        borderRadius: 5, padding: '4px 8px', minWidth: 80, maxWidth: 110,
        boxShadow: isTarget ? '0 0 10px rgba(239,68,68,0.3)' : undefined,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: isTarget ? '#ef4444' : '#e2e8f0', textAlign: 'center', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {enemy.name}
        </div>
        <div style={{ marginBottom: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#64748b', marginBottom: 1 }}>
            <span>HP</span>
            <span style={{ color: hpPct > 60 ? '#10b981' : hpPct > 30 ? '#f59e0b' : '#ef4444' }}>{enemy.hp}/{enemy.maxHp}</span>
          </div>
          <div style={{ height: 3, background: '#1e2a4a', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: hpPct > 60 ? '#10b981' : hpPct > 30 ? '#f59e0b' : '#ef4444', width: `${hpPct}%` }} />
          </div>
        </div>
        {enemy.statusEffects.length > 0 && (
          <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', marginTop: 2 }}>
            {enemy.statusEffects.map(e => (
              <span key={e} style={{ fontSize: 8, padding: '1px 3px', borderRadius: 2, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid #ef444444' }}>{e.slice(0, 5)}</span>
            ))}
          </div>
        )}
        {isTarget && <div style={{ textAlign: 'center', fontSize: 9, color: '#ef4444', marginTop: 2 }}>◀ TARGET</div>}
      </div>
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
      success: true, xpGained: sc!.mission.xpReward,
      creditsGained: sc!.mission.creditReward, loot, missionName: sc!.mission.name,
    };
    useGameStore.setState({ missionResult: result, screen: 'missionResult' });
  }

  function handleMissionDefeat() {
    const result: import('../../types/game').MissionResult = {
      success: false, xpGained: { captain: 0, ship: 0, robots: 0 },
      creditsGained: 0, loot: [], missionName: sc!.mission.name,
    };
    useGameStore.setState({ missionResult: result, screen: 'missionResult' });
  }

  function handleFlee() {
    const result: import('../../types/game').MissionResult = {
      success: false,
      xpGained: { captain: Math.round(sc!.mission.xpReward.captain * 0.25), ship: 0, robots: 0 },
      creditsGained: 0, loot: [], missionName: sc!.mission.name,
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
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 16px',
        background: '#0f1629',
        borderBottom: '1px solid #1e2a4a',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0,
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
        flexShrink: 0,
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

      {/* Battlefield */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <BattlefieldBG biome={sc.mission.biome} />

        {/* Allies — left column */}
        <div style={{
          position: 'relative', zIndex: 1,
          width: '38%', display: 'flex', alignItems: 'flex-end',
          justifyContent: 'space-evenly', padding: '0 8px 20px',
          flexWrap: 'wrap', gap: 8,
        }}>
          {allies.map(ally => (
            <AllyFigure
              key={ally.id}
              combatant={ally}
              isActive={ally.id === currentTurnId}
              isTarget={selectedTargetId === ally.id}
              onClick={() => { if (needsAllyTarget && isPlayerTurn) selectSurfaceTarget(ally.id); }}
            />
          ))}
        </div>

        {/* Center — phase label */}
        <div style={{
          position: 'relative', zIndex: 1, flex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 8,
        }}>
          {(phase === 'playerTurn' || phase === 'enemyTurn') && (
            <div style={{
              background: 'rgba(0,0,0,0.6)',
              border: `1px solid ${phase === 'enemyTurn' ? '#ef4444' : '#00d4ff'}`,
              borderRadius: 6, padding: '5px 12px',
              fontSize: 12, fontWeight: 700,
              color: phase === 'enemyTurn' ? '#ef4444' : '#00d4ff',
              textTransform: 'uppercase', letterSpacing: 1,
              whiteSpace: 'nowrap',
            }}>
              {phase === 'enemyTurn' ? '⚡ ENEMY TURN' : '▶ YOUR TURN'}
            </div>
          )}
        </div>

        {/* Enemies — right column */}
        <div style={{
          position: 'relative', zIndex: 1,
          width: '38%', display: 'flex', alignItems: 'flex-end',
          justifyContent: 'space-evenly', padding: '0 8px 20px',
          flexWrap: 'wrap', gap: 8,
        }}>
          {aliveEnemies.length === 0 ? (
            <div style={{
              color: '#10b981', fontWeight: 700, fontSize: 14,
              alignSelf: 'center', width: '100%', textAlign: 'center',
              background: 'rgba(0,0,0,0.6)', padding: '8px', borderRadius: 6,
            }}>
              All enemies defeated!
            </div>
          ) : aliveEnemies.map(e => (
            <EnemyFigure
              key={e.id}
              enemy={e}
              isTarget={selectedTargetId === e.id}
              onClick={() => { if (needsTarget && isPlayerTurn) selectSurfaceTarget(e.id); }}
            />
          ))}
        </div>
      </div>

      {/* Bottom action panel */}
      <div className="surface-bottom-panel" style={{
        borderTop: '2px solid #1e2a4a', background: '#0a0e1a',
        padding: '10px 14px', display: 'flex', gap: 12,
        maxHeight: 220, flexShrink: 0,
      }}>
        {/* Left: action controls */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0, overflowY: 'auto' }}>
          {isPlayerTurn && (
            <>
              <div style={{ fontSize: 11, color: '#00d4ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, flexShrink: 0 }}>
                {current?.name}'s Actions
              </div>
              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {(['attack', 'skill', 'defend', 'flee'] as const).map(action => (
                  <button
                    key={action}
                    onClick={() => selectSurfaceAction(action)}
                    style={{
                      flex: 1, padding: '7px 2px',
                      background: selectedAction === action ? 'rgba(0,212,255,0.2)' : '#0f1629',
                      border: `1px solid ${selectedAction === action ? '#00d4ff' : '#1e2a4a'}`,
                      borderRadius: 5, color: selectedAction === action ? '#00d4ff' : '#94a3b8',
                      fontFamily: 'inherit', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    {action === 'attack' ? '⚔️ Atk' : action === 'skill' ? '✨ Skill' : action === 'defend' ? '🛡️ Def' : '🏃 Flee'}
                  </button>
                ))}
              </div>

              {/* Skill list */}
              {selectedAction === 'skill' && current?.skills && (
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0, paddingBottom: 2 }}>
                  {current.skills.map(skill => {
                    const resource = current.energy ?? current.battery ?? 0;
                    const canUse = resource >= skill.energyCost;
                    const onCooldown = (skill.currentCooldown ?? 0) > 0;
                    return (
                      <div
                        key={skill.id}
                        onClick={() => !onCooldown && canUse && selectSurfaceSkill(skill.id)}
                        style={{
                          padding: '5px 8px', flexShrink: 0, borderRadius: 5,
                          background: selectedSkill?.id === skill.id ? 'rgba(0,212,255,0.1)' : '#0f1629',
                          border: `1px solid ${selectedSkill?.id === skill.id ? '#00d4ff' : '#1e2a4a'}`,
                          cursor: canUse && !onCooldown ? 'pointer' : 'not-allowed',
                          opacity: canUse && !onCooldown ? 1 : 0.4,
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap' }}>{skill.name}</div>
                        <div style={{ fontSize: 9, color: '#64748b', whiteSpace: 'nowrap' }}>
                          {skill.energyCost}E {onCooldown ? `· CD:${skill.currentCooldown}` : ''}
                        </div>
                        <div style={{ fontSize: 9, color: '#94a3b8', maxWidth: 120 }}>{skill.description}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Target prompts */}
              {needsTarget && !selectedTargetId && (
                <div style={{ fontSize: 11, color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid #ef44444a', borderRadius: 4, padding: '4px 8px', flexShrink: 0 }}>
                  Click an enemy to target
                </div>
              )}
              {needsAllyTarget && !selectedTargetId && (
                <div style={{ fontSize: 11, color: '#10b981', background: 'rgba(16,185,129,0.08)', border: '1px solid #10b9814a', borderRadius: 4, padding: '4px 8px', flexShrink: 0 }}>
                  Click an ally to target
                </div>
              )}
              {selectedTargetId && (
                <div style={{ fontSize: 11, color: '#00d4ff', background: 'rgba(0,212,255,0.08)', border: '1px solid #00d4ff4a', borderRadius: 4, padding: '4px 8px', flexShrink: 0 }}>
                  Target: {combatants.find(c => c.id === selectedTargetId)?.name}
                </div>
              )}

              {/* Execute */}
              <button
                className="btn btn-primary"
                style={{ padding: '8px', fontSize: 13, flexShrink: 0 }}
                disabled={!canExecute}
                onClick={executePlayerTurn}
              >
                EXECUTE
              </button>
            </>
          )}

          {phase === 'enemyTurn' && (
            <div style={{
              padding: '12px', background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, textAlign: 'center',
            }}>
              <div style={{ color: '#ef4444', fontWeight: 700, fontSize: 13 }}>ENEMY TURN</div>
              <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>Processing actions...</div>
            </div>
          )}
        </div>

        {/* Right: combat log */}
        <div style={{ width: 210, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            Combat Log
          </div>
          <div
            ref={logRef}
            style={{
              flex: 1, overflowY: 'auto', minHeight: 0,
              background: '#060a14', border: '1px solid #1e2a4a',
              borderRadius: 5, padding: '6px 8px',
            }}
          >
            {log.map((line, i) => (
              <div key={i} style={{
                fontSize: 10, lineHeight: 1.4, marginBottom: 2,
                color: i === log.length - 1 ? '#e2e8f0' : '#64748b',
              }}>
                {line}
              </div>
            ))}
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
              color: phase === 'victory' ? '#10b981' : '#ef4444', marginBottom: 12,
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
