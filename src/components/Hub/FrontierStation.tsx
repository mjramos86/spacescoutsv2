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

interface Hotspot {
  id: Exclude<HubArea, null>;
  label: string;
  icon: string;
  description: string;
  color: string;
  // % from left, % from top of the image container
  x: number;
  y: number;
}

// Each hotspot is pinned to a distinct architectural feature on the station image
const HOTSPOTS: Hotspot[] = [
  {
    id: 'commandBridge',
    label: 'Command Bridge',
    icon: '👨‍✈️',
    description: 'Captain stats, equipment & talents',
    color: '#ef4444',
    x: 47, y: 13,   // top dome / command tower
  },
  {
    id: 'wormholeTerminal',
    label: 'Wormhole Terminal',
    icon: '🌀',
    description: 'Quick-launch & daily contracts',
    color: '#7c3aed',
    x: 65, y: 20,   // upper-right comm antenna
  },
  {
    id: 'hangarBay',
    label: 'Hangar Bay',
    icon: '🛸',
    description: 'Ship stats & equipment',
    color: '#60a5fa',
    x: 14, y: 46,   // left docking modules
  },
  {
    id: 'robotWorkshop',
    label: 'Robot Workshop',
    icon: '🤖',
    description: 'Roster management & crew selection',
    color: '#a855f7',
    x: 77, y: 35,   // right ring arm
  },
  {
    id: 'missionControl',
    label: 'Mission Control',
    icon: '🎯',
    description: 'Launch missions, choose difficulty',
    color: '#10b981',
    x: 50, y: 51,   // glowing central core
  },
  {
    id: 'galacticMarket',
    label: 'Galactic Market',
    icon: '🏪',
    description: 'Buy, sell & salvage equipment',
    color: '#f59e0b',
    x: 21, y: 67,   // lower-left arm junction
  },
  {
    id: 'officersLounge',
    label: "Officer's Lounge",
    icon: '🏆',
    description: 'Achievements, stats & codex',
    color: '#f97316',
    x: 74, y: 63,   // lower-right observation deck
  },
  {
    id: 'workshop',
    label: 'Workshop',
    icon: '🔧',
    description: 'Upgrade & craft equipment',
    color: '#94a3b8',
    x: 50, y: 79,   // bottom vertical tower
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
  const [hoveredArea, setHoveredArea] = useState<Exclude<HubArea, null> | null>(null);
  const [isMobileList, setIsMobileList] = useState(false);
  const logout = useGameStore(s => s.logout);

  if (!profile) return null;

  return (
    <div style={{ width: '100%', height: '100vh', background: '#0a0e1a', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Top bar ── */}
      <div style={{
        padding: '10px 20px',
        background: 'rgba(10,14,26,0.92)',
        borderBottom: '1px solid #1e2a4a',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: 'blur(12px)',
        zIndex: 20, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 22 }}>🚀</span>
          <div>
            <div style={{
              fontSize: 17, fontWeight: 700, letterSpacing: 3,
              background: 'linear-gradient(90deg, #00d4ff, #7c3aed)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              SPACE SCOUTS
            </div>
            <div style={{ fontSize: 10, color: '#475569', letterSpacing: 2 }}>FRONTIER STATION</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Captain info */}
          <div style={{ textAlign: 'right', display: 'none' }} className="hide-mobile">
            <div style={{ fontSize: 13, fontWeight: 700, color: '#00d4ff' }}>{profile.captain.name}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              {profile.captain.class} · Lv.{profile.captain.level}
              {profile.stats.missionsCompleted > 0 && ` · ${profile.stats.missionsCompleted} missions`}
            </div>
          </div>
          <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: 14 }}>
            💰 {profile.credits.toLocaleString()}
          </div>
          {/* Mobile list toggle */}
          <button
            onClick={() => setIsMobileList(v => !v)}
            style={{
              background: isMobileList ? '#1e2a4a' : 'transparent',
              border: '1px solid #1e2a4a', borderRadius: 4,
              color: '#94a3b8', fontSize: 11, padding: '5px 10px', cursor: 'pointer',
              fontFamily: 'inherit', letterSpacing: 1,
            }}
          >
            {isMobileList ? '🗺 MAP' : '☰ LIST'}
          </button>
          <button className="btn btn-danger" style={{ fontSize: 11, padding: '5px 12px' }} onClick={logout}>
            LOGOUT
          </button>
        </div>
      </div>

      {/* ── Station map ── */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>

        {isMobileList ? (
          /* ── List fallback for small screens ── */
          <div style={{ height: '100%', overflowY: 'auto', padding: '16px 16px 90px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              Select a station area
            </div>
            {HOTSPOTS.map(hs => (
              <button
                key={hs.id}
                onClick={() => setOpenArea(hs.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: `${hs.color}11`, border: `1px solid ${hs.color}44`,
                  borderRadius: 8, padding: '14px 16px', cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = hs.color)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = `${hs.color}44`)}
              >
                <span style={{ fontSize: 26 }}>{hs.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: hs.color, fontSize: 14 }}>{hs.label}</div>
                  <div style={{ color: '#64748b', fontSize: 12 }}>{hs.description}</div>
                </div>
                <span style={{ marginLeft: 'auto', color: hs.color, fontSize: 18 }}>›</span>
              </button>
            ))}
          </div>
        ) : (
          /* ── Visual station map ── */
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>

            {/* Station background image */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'url(./space_station.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center 30%',
              backgroundRepeat: 'no-repeat',
            }} />

            {/* Dark vignette overlay — darkens edges, keeps center visible */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)',
            }} />

            {/* Subtle scan-line texture */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.04,
              backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 4px)',
              pointerEvents: 'none',
            }} />

            {/* Station title badge */}
            <div style={{
              position: 'absolute', top: 16, left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(10,14,26,0.75)',
              border: '1px solid rgba(0,212,255,0.25)',
              borderRadius: 6, padding: '6px 18px',
              backdropFilter: 'blur(8px)',
              textAlign: 'center', pointerEvents: 'none',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#00d4ff', textTransform: 'uppercase' }}>
                Frontier Station
              </div>
              <div style={{ fontSize: 10, color: '#475569', letterSpacing: 1 }}>
                {profile.captain.name} · {profile.captain.class} Lv.{profile.captain.level}
              </div>
            </div>

            {/* Hotspot pins */}
            {HOTSPOTS.map(hs => {
              const isHovered = hoveredArea === hs.id;

              return (
                <div
                  key={hs.id}
                  style={{
                    position: 'absolute',
                    left: `${hs.x}%`,
                    top: `${hs.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isHovered ? 15 : 10,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setHoveredArea(hs.id)}
                  onMouseLeave={() => setHoveredArea(null)}
                  onClick={() => setOpenArea(hs.id)}
                >
                  {/* Outer pulse ring */}
                  <div style={{
                    position: 'absolute',
                    inset: -10,
                    borderRadius: '50%',
                    border: `2px solid ${hs.color}`,
                    opacity: isHovered ? 0.9 : 0.5,
                    animation: 'hotspot-pulse 2.5s ease-in-out infinite',
                    animationDelay: `${HOTSPOTS.indexOf(hs) * 0.3}s`,
                    transition: 'opacity 0.2s',
                    pointerEvents: 'none',
                  }} />

                  {/* Second pulse ring (offset) */}
                  <div style={{
                    position: 'absolute',
                    inset: -20,
                    borderRadius: '50%',
                    border: `1px solid ${hs.color}`,
                    opacity: isHovered ? 0.4 : 0.2,
                    animation: 'hotspot-pulse 2.5s ease-in-out infinite',
                    animationDelay: `${HOTSPOTS.indexOf(hs) * 0.3 + 0.4}s`,
                    pointerEvents: 'none',
                  }} />

                  {/* Pin dot */}
                  <div style={{
                    width: 36, height: 36,
                    borderRadius: '50%',
                    background: isHovered
                      ? hs.color
                      : `radial-gradient(circle, ${hs.color}cc, ${hs.color}55)`,
                    border: `2px solid ${hs.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                    boxShadow: isHovered
                      ? `0 0 20px ${hs.color}, 0 0 40px ${hs.color}66`
                      : `0 0 10px ${hs.color}88`,
                    transition: 'all 0.2s',
                    transform: isHovered ? 'scale(1.25)' : 'scale(1)',
                  }}>
                    {hs.icon}
                  </div>

                  {/* Tooltip card — appears above or below depending on position */}
                  {isHovered && (
                    <div style={{
                      position: 'absolute',
                      // flip tooltip above center if pin is in lower half
                      ...(hs.y > 55
                        ? { bottom: 'calc(100% + 14px)', top: 'auto' }
                        : { top: 'calc(100% + 14px)', bottom: 'auto' }),
                      // flip tooltip right if pin is too far left
                      ...(hs.x < 20
                        ? { left: 0, right: 'auto', transform: 'none' }
                        : hs.x > 80
                        ? { right: 0, left: 'auto', transform: 'none' }
                        : { left: '50%', transform: 'translateX(-50%)' }),
                      width: 180,
                      background: 'rgba(10,14,26,0.95)',
                      border: `1px solid ${hs.color}`,
                      borderRadius: 8,
                      padding: '10px 12px',
                      backdropFilter: 'blur(12px)',
                      boxShadow: `0 4px 24px rgba(0,0,0,0.6), 0 0 12px ${hs.color}33`,
                      pointerEvents: 'none',
                      animation: 'fadeIn 0.15s ease',
                      whiteSpace: 'nowrap',
                    }}>
                      <div style={{ fontWeight: 700, color: hs.color, fontSize: 13, marginBottom: 4, letterSpacing: 0.5 }}>
                        {hs.label}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: 11, lineHeight: 1.4, whiteSpace: 'normal' }}>
                        {hs.description}
                      </div>
                      <div style={{ marginTop: 8, fontSize: 10, color: `${hs.color}99`, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Click to enter →
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Bottom-left quick stats HUD */}
            <div style={{
              position: 'absolute', bottom: 70, left: 16,
              background: 'rgba(10,14,26,0.82)',
              border: '1px solid #1e2a4a',
              borderRadius: 8, padding: '10px 14px',
              backdropFilter: 'blur(10px)',
              display: 'flex', flexDirection: 'column', gap: 6,
              minWidth: 160,
            }}>
              {[
                { label: 'Captain HP', val: profile.captain.currentStats.hp, max: profile.captain.currentStats.maxHp, cls: 'hp' },
                { label: 'Ship Hull',  val: profile.ship.currentStats.hp,    max: profile.ship.currentStats.maxHp,    cls: 'hp' },
                { label: 'Shield',     val: profile.ship.currentStats.shield, max: profile.ship.currentStats.maxShield, cls: 'shield' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b', marginBottom: 2 }}>
                    <span>{s.label}</span>
                    <span>{s.val}/{s.max}</span>
                  </div>
                  <div className="stat-bar" style={{ height: 4 }}>
                    <div className={`stat-bar-fill ${s.cls}`} style={{ width: `${(s.val / s.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>

      {/* ── Slide panel ── */}
      <SlidePanel
        isOpen={openArea !== null}
        onClose={() => setOpenArea(null)}
        title={openArea ? PANEL_TITLES[openArea] : ''}
        width="460px"
      >
        {openArea && renderPanel(openArea)}
      </SlidePanel>

      {/* ── Status footer (XP bars) ── */}
      <StatusFooter />
    </div>
  );
}
