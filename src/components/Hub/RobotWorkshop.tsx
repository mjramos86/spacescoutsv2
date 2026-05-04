import React, { useState } from 'react';
import { useProfile, useGameStore } from '../../store/gameStore';
import { getRobotArchetypeData } from '../../data/classes';
import { rarityColor } from '../../utils/loot';
import type { RobotEquipSlot, Equipment } from '../../types/game';

const SLOT_LABELS: Record<RobotEquipSlot, string> = {
  chassisUpgrade: 'Chassis Upgrade',
  weaponModule: 'Weapon Module',
  utilityChip1: 'Utility Chip 1',
  utilityChip2: 'Utility Chip 2',
};

export function RobotWorkshop() {
  const profile = useProfile();
  const [selectedRobotId, setSelectedRobotId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'equip' | 'skills'>('stats');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<RobotEquipSlot | null>(null);

  const selectRobots = useGameStore(s => s.selectRobots);
  const renameRobot = useGameStore(s => s.renameRobot);
  const equipItem = useGameStore(s => s.equipItem);
  const unequipItem = useGameStore(s => s.unequipItem);

  if (!profile) return null;
  const safeProfile = profile;

  const selectedRobot = selectedRobotId ? safeProfile.robots.find(r => r.id === selectedRobotId) ?? null : null;
  const archData = selectedRobot ? getRobotArchetypeData(selectedRobot.archetype) : null;
  const robotInventory = safeProfile.inventory.filter(i => i.entityType === 'robot');

  function toggleMissionRobot(id: string) {
    const [r1, r2] = safeProfile.selectedRobots;
    if (r1 === id) {
      const others = safeProfile.robots.filter(r => r.id !== id && r.id !== r2);
      if (others.length > 0) selectRobots([others[0].id, r2]);
    } else if (r2 === id) {
      const others = safeProfile.robots.filter(r => r.id !== id && r.id !== r1);
      if (others.length > 0) selectRobots([r1, others[0].id]);
    } else {
      // Slot in
      if (r1 === id || r2 === id) return;
      selectRobots([r1, id]);
    }
  }

  function handleEquip(item: Equipment) {
    if (!selectedRobotId) return;
    equipItem('robot', selectedRobotId, item);
    setSelectedSlot(null);
  }

  return (
    <div>
      <div style={{ color: '#00d4ff', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
        Robot Roster ({safeProfile.robots.length}/10)
      </div>

      {/* Robot list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {safeProfile.robots.map(robot => {
          const arch = getRobotArchetypeData(robot.archetype);
          const isSelected = selectedRobotId === robot.id;
          const inMission = safeProfile.selectedRobots.includes(robot.id);

          return (
            <div key={robot.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#0a0e1a',
              border: `1px solid ${isSelected ? '#00d4ff' : inMission ? '#10b981' : '#1e2a4a'}`,
              borderRadius: 8, padding: '10px 12px', cursor: 'pointer',
            }}
              onClick={() => { setSelectedRobotId(isSelected ? null : robot.id); setActiveTab('stats'); setSelectedSlot(null); }}
            >
              <div style={{ fontSize: 24 }}>{arch.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 14 }}>
                  {robot.name}
                  {inMission && <span style={{ marginLeft: 8, fontSize: 10, color: '#10b981', border: '1px solid #10b981', padding: '1px 5px', borderRadius: 3 }}>ACTIVE</span>}
                </div>
                <div style={{ color: arch.color, fontSize: 12 }}>{robot.archetype} • Lv.{robot.level}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 3, fontSize: 11, color: '#64748b' }}>
                  <span>HP: {robot.currentStats.hp}</span>
                  <span>ATK: {robot.currentStats.atk}</span>
                  <span>SPD: {robot.currentStats.spd}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button
                  className={inMission ? 'btn btn-danger' : 'btn btn-success'}
                  style={{ fontSize: 10, padding: '2px 8px' }}
                  onClick={e => { e.stopPropagation(); toggleMissionRobot(robot.id); }}
                >
                  {inMission ? 'REMOVE' : 'DEPLOY'}
                </button>
                {renamingId === robot.id ? (
                  <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                    <input
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      style={{
                        width: 80, padding: '2px 4px', fontSize: 11,
                        background: '#0a0e1a', border: '1px solid #00d4ff', borderRadius: 3, color: '#e2e8f0',
                      }}
                    />
                    <button className="btn btn-primary" style={{ fontSize: 10, padding: '2px 6px' }}
                      onClick={() => { renameRobot(robot.id, renameValue); setRenamingId(null); }}>OK</button>
                  </div>
                ) : (
                  <button className="btn" style={{ fontSize: 10, padding: '2px 8px' }}
                    onClick={e => { e.stopPropagation(); setRenamingId(robot.id); setRenameValue(robot.name); }}>
                    RENAME
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mission selection info */}
      <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 6, padding: '8px 12px', marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600, marginBottom: 4 }}>Mission Crew</div>
        <div style={{ fontSize: 13, color: '#e2e8f0' }}>
          {profile.selectedRobots.map(id => {
            const r = profile.robots.find(rb => rb.id === id);
            return r ? r.name : 'None';
          }).join(' + ')}
        </div>
      </div>

      {/* Selected robot detail */}
      {selectedRobot && archData && (
        <div style={{ background: '#0a0e1a', border: '1px solid #1e2a4a', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
            <div style={{ fontSize: 32 }}>{archData.icon}</div>
            <div>
              <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 16 }}>{selectedRobot.name}</div>
              <div style={{ color: archData.color, fontSize: 13 }}>{selectedRobot.archetype}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12, borderBottom: '1px solid #1e2a4a', paddingBottom: 8 }}>
            {(['stats', 'equip', 'skills'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: '6px 4px', background: activeTab === tab ? 'rgba(0,212,255,0.15)' : 'transparent',
                border: 'none', borderBottom: `2px solid ${activeTab === tab ? '#00d4ff' : 'transparent'}`,
                color: activeTab === tab ? '#00d4ff' : '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase',
              }}>
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'stats' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'HP', val: `${selectedRobot.currentStats.hp}/${selectedRobot.currentStats.maxHp}`, color: '#10b981' },
                { label: 'Battery', val: `${selectedRobot.currentStats.battery}/${selectedRobot.currentStats.maxBattery}`, color: '#a855f7' },
                { label: 'ATK', val: selectedRobot.currentStats.atk, color: '#ef4444' },
                { label: 'DEF', val: selectedRobot.currentStats.def, color: '#60a5fa' },
                { label: 'SPD', val: selectedRobot.currentStats.spd, color: '#f59e0b' },
                { label: 'ACC', val: `${selectedRobot.currentStats.acc}%`, color: '#10b981' },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ background: '#0f1629', borderRadius: 6, padding: '8px 10px' }}>
                  <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color }}>{val}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'equip' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                {(Object.keys(SLOT_LABELS) as RobotEquipSlot[]).map(slot => {
                  const equipped = selectedRobot.equipment[slot];
                  return (
                    <div key={slot} onClick={() => setSelectedSlot(selectedSlot === slot ? null : slot)} style={{
                      background: '#0f1629', border: `1px solid ${selectedSlot === slot ? '#00d4ff' : '#1e2a4a'}`,
                      borderRadius: 6, padding: '7px 9px', cursor: 'pointer',
                    }}>
                      <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{SLOT_LABELS[slot]}</div>
                      {equipped ? (
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: rarityColor(equipped.rarity) }}>{equipped.name}</div>
                          <div style={{ fontSize: 10, color: '#64748b' }}>
                            {Object.entries(equipped.stats).map(([k, v]) => `+${v} ${k}`).join(', ')}
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: '#1e2a4a', fontStyle: 'italic' }}>Empty</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedSlot && (
                <div>
                  {selectedRobot.equipment[selectedSlot] && (
                    <button className="btn btn-danger" style={{ fontSize: 11, marginBottom: 8 }}
                      onClick={() => { unequipItem('robot', selectedRobot.id, selectedSlot); setSelectedSlot(null); }}>
                      UNEQUIP
                    </button>
                  )}
                  {robotInventory.filter(i => i.slot === selectedSlot).map(item => (
                    <div key={item.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '7px 9px', background: '#0f1629', borderRadius: 6, marginBottom: 6, border: '1px solid #1e2a4a',
                    }}>
                      <div>
                        <span style={{ color: rarityColor(item.rarity), fontWeight: 600, fontSize: 12 }}>{item.name}</span>
                        <div style={{ fontSize: 10, color: '#64748b' }}>{Object.entries(item.stats).map(([k, v]) => `+${v} ${k}`).join(', ')}</div>
                      </div>
                      <button className="btn btn-primary" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => handleEquip(item)}>EQUIP</button>
                    </div>
                  ))}
                  {robotInventory.filter(i => i.slot === selectedSlot).length === 0 &&
                    <p style={{ color: '#64748b', fontSize: 12, fontStyle: 'italic' }}>No compatible items</p>}
                </div>
              )}
            </div>
          )}

          {activeTab === 'skills' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedRobot.skills.map(skill => (
                <div key={skill.id} style={{ background: '#0f1629', border: '1px solid #1e2a4a', borderRadius: 6, padding: '8px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, color: archData.color, fontSize: 13 }}>{skill.name}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{skill.energyCost} BAT</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#94a3b8' }}>{skill.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
