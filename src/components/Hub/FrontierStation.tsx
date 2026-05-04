import React, { useState } from 'react';
import { useProfile, useGameStore } from '../../store/gameStore';
import { SlidePanel } from '../UI/SlidePanel';
import { CommandBridge } from './CommandBridge';
import { HangarBay } from './HangarBay';
import { RobotWorkshop } from './RobotWorkshop';
import { MissionControl } from './MissionControl';
import { GalacticMarket } from './GalacticMarket';
import { WorkshopArea } from './WorkshopArea';
import { OfficersLounge } from './OfficersLounge';
import { WormholeTerminal } from './WormholeTerminal';
import { StatusFooter } from '../UI/StatusFooter';

type HubArea =
  | 'commandBridge'
  | 'hangarBay'
  | 'robotWorkshop'
  | 'missionControl'
  | 'galacticMarket'
  | 'workshop'
  | 'officersLounge'
  | 'wormholeTerminal'
  | null;

interface AreaConfig {
  id: Exclude<HubArea, null>;
  label: string;
  icon: string;
  description: string;
  color: string;
  accentColor: string;
}

const AREAS: AreaConfig[] = [
  {
    id: 'commandBridge',
    label: 'Command Bridge',
    icon: '👨‍✈️',
    description: 'Captain stats, equipment, skills and talent tree',
    color: '#ef444422',
    accentColor: '#ef4444',
  },
  {
    id: 'hangarBay',
    label: 'Hangar Bay',
    icon: '🛸',
    description: 'Ship stats and equipment management',
    color: '#60a5fa22',
    accentColor: '#60a5fa',
  },
  {
    id: 'robotWorkshop',
    label: 'Robot Workshop',
    icon: '🤖',
    description: 'Manage robot roster, deploy crew for missions',
    color: '#a855f722',
    accentColor: '#a855f7',
  },
  {
    id: 'missionControl',
    label: 'Mission Control',
    icon: '🎯',
    description: 'Launch missions, select difficulty',
    color: '#10b98122',
    accentColor: '#10b981',
  },
  {
    id: 'galacticMarket',
    label: 'Galactic Market',
    icon: '🏪',
    description: 'Buy, sell and salvage equipment',
    color: '#f59e0b22',
    accentColor: '#f59e0b',
  },
  {
    id: 'workshop',
    label: 'Workshop',
    icon: '🔧',
    description: 'Upgrade equipment rarity using credits',
    color: '#94a3b822',
    accentColor: '#94a3b8',
  },
  {
    id: 'officersLounge',
    label: "Officer's Lounge",
    icon: '🏆',
    description: 'Achievements, statistics and codex',
    color: '#f9731622',
    accentColor: '#f97316',
  },
  {
    id: 'wormholeTerminal',
    label: 'Wormhole Terminal',
    icon: '🌀',
    description: 'Quick launch missions and daily contracts',
    color: '#7c3aed22',
    accentColor: '#7c3aed',
  },
];

const PANEL_TITLES: Record<Exclude<HubArea, null>, string> = {
  commandBridge: 'Command Bridge',
  hangarBay: 'Hangar Bay',
  robotWorkshop: 'Robot Workshop',
  missionControl: 'Mission Control',
  galacticMarket: 'Galactic Market',
  workshop: 'Workshop',
  officersLounge: "Officer's Lounge",
  wormholeTerminal: 'Wormhole Terminal',
};

function renderPanel(area: Exclude<HubArea, null>) {
  switch (area) {
    case 'commandBridge': return <CommandBridge />;
    case 'hangarBay': return <HangarBay />;
    case 'robotWorkshop': return <RobotWorkshop />;
    case 'missionControl': return <MissionControl />;
    case 'galacticMarket': return <GalacticMarket />;
    case 'workshop': return <WorkshopArea />;
    case 'officersLounge': return <OfficersLounge />;
    case 'wormholeTerminal': return <WormholeTerminal />;
  }
}

export function FrontierStation() {
  const profile = useProfile();
  const [openArea, setOpenArea] = useState<HubArea>(null);
  const logout = useGameStore(s => s.logout);

  if (!profile) return null;

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0e1a', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{
        padding: '12px 20px',
        background: 'rgba(15,22,41,0.95)',
        borderBottom: '1px solid #1e2a4a',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: 'blur(10px)',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 24 }}>🚀</div>
          <div>
            <div style={{
              fontSize: 18, fontWeight: 700, letterSpacing: 2,
              background: 'linear-gradient(90deg, #00d4ff, #7c3aed)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              SPACE SCOUTS
            </div>
            <div style={{ fontSize: 11, color: '#64748b', letterSpacing: 1 }}>FRONTIER STATION</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#00d4ff' }}>{profile.captain.name}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                {profile.captain.class} • Lv.{profile.captain.level} | Missions: {profile.stats.missionsCompleted}
              </div>
            </div>
          </div>
          <button
            className="btn btn-danger"
            style={{ fontSize: 12, padding: '6px 14px' }}
            onClick={logout}
          >
            LOGOUT
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 80px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Station welcome */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,212,255,0.05), rgba(124,58,237,0.05))',
          border: '1px solid rgba(0,212,255,0.15)',
          borderRadius: 12, padding: '20px 24px',
        }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>
            Welcome back, Captain {profile.captain.name}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>
            Frontier Station is operational. {profile.stats.missionsCompleted > 0
              ? `You've completed ${profile.stats.missionsCompleted} mission${profile.stats.missionsCompleted !== 1 ? 's' : ''}.`
              : 'Ready for your first mission into the unknown.'}
          </p>
        </div>

        {/* Hub areas grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {AREAS.map(area => (
            <button
              key={area.id}
              onClick={() => setOpenArea(area.id)}
              style={{
                background: area.color,
                border: `1px solid ${area.accentColor}44`,
                borderRadius: 10,
                padding: '20px 18px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.border = `1px solid ${area.accentColor}`;
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 24px ${area.accentColor}22`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.border = `1px solid ${area.accentColor}44`;
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 10 }}>{area.icon}</div>
              <div style={{ fontWeight: 700, color: area.accentColor, fontSize: 16, marginBottom: 4, letterSpacing: 0.5 }}>
                {area.label}
              </div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>{area.description}</div>
              <div style={{
                position: 'absolute', right: 12, top: 12,
                color: area.accentColor, fontSize: 18, opacity: 0.5,
              }}>›</div>
            </button>
          ))}
        </div>

        {/* Quick stats */}
        <div style={{ background: '#0f1629', border: '1px solid #1e2a4a', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontWeight: 700, color: '#00d4ff', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
            Quick Status
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {/* Captain HP */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>
                <span>Captain HP</span>
                <span>{profile.captain.currentStats.hp}/{profile.captain.currentStats.maxHp}</span>
              </div>
              <div className="stat-bar">
                <div className="stat-bar-fill hp" style={{ width: `${(profile.captain.currentStats.hp / profile.captain.currentStats.maxHp) * 100}%` }} />
              </div>
            </div>
            {/* Ship HP */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>
                <span>Ship Hull</span>
                <span>{profile.ship.currentStats.hp}/{profile.ship.currentStats.maxHp}</span>
              </div>
              <div className="stat-bar">
                <div className="stat-bar-fill hp" style={{ width: `${(profile.ship.currentStats.hp / profile.ship.currentStats.maxHp) * 100}%` }} />
              </div>
            </div>
            {/* Ship Shield */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>
                <span>Ship Shield</span>
                <span>{profile.ship.currentStats.shield}/{profile.ship.currentStats.maxShield}</span>
              </div>
              <div className="stat-bar">
                <div className="stat-bar-fill shield" style={{ width: `${(profile.ship.currentStats.shield / profile.ship.currentStats.maxShield) * 100}%` }} />
              </div>
            </div>
            {/* Credits */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>Credits</span>
              <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: 16 }}>{profile.credits.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slide panel */}
      <SlidePanel
        isOpen={openArea !== null}
        onClose={() => setOpenArea(null)}
        title={openArea ? PANEL_TITLES[openArea] : ''}
        width="460px"
      >
        {openArea && renderPanel(openArea)}
      </SlidePanel>

      {/* Status footer */}
      <StatusFooter />
    </div>
  );
}
