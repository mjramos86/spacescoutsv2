import React, { useState } from 'react';
import { useProfile, useGameStore } from '../../store/gameStore';
import { getCaptainClassData } from '../../data/classes';
import { rarityColor } from '../../utils/loot';
import type { CaptainEquipSlot, Equipment } from '../../types/game';

const SLOT_LABELS: Record<CaptainEquipSlot, string> = {
  helmet: 'Helmet',
  armor: 'Armor',
  gloves: 'Gloves',
  boots: 'Boots',
  primaryWeapon: 'Primary Weapon',
  secondaryWeapon: 'Secondary Weapon',
  implant: 'Implant',
  badge: 'Badge',
};

export function CommandBridge() {
  const profile = useProfile();
  const [activeTab, setActiveTab] = useState<'stats' | 'equipment' | 'skills' | 'talents'>('stats');
  const [selectedSlot, setSelectedSlot] = useState<CaptainEquipSlot | null>(null);
  const equipItem = useGameStore(s => s.equipItem);
  const unequipItem = useGameStore(s => s.unequipItem);
  const learnTalent = useGameStore(s => s.learnTalent);

  if (!profile) return null;
  const { captain } = profile;
  const classData = getCaptainClassData(captain.class);

  const captainInventory = profile.inventory.filter(i => i.entityType === 'captain');

  function handleEquip(item: Equipment) {
    equipItem('captain', null, item);
    setSelectedSlot(null);
  }

  const TabBtn = ({ tab, label }: { tab: typeof activeTab; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      style={{
        flex: 1, padding: '8px 4px', background: activeTab === tab ? 'rgba(0,212,255,0.15)' : 'transparent',
        border: 'none', borderBottom: `2px solid ${activeTab === tab ? '#00d4ff' : 'transparent'}`,
        color: activeTab === tab ? '#00d4ff' : '#94a3b8', fontSize: 13, fontWeight: 600,
        cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5,
      }}
    >
      {label}
    </button>
  );

  return (
    <div>
      {/* Captain Header */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', fontSize: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${classData.color}22`, border: `2px solid ${classData.color}`,
        }}>
          {classData.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0' }}>{captain.name}</div>
          <div style={{ color: classData.color, fontWeight: 600, fontSize: 14 }}>{captain.class}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <span style={{ color: '#94a3b8', fontSize: 13 }}>Level {captain.level}</span>
            <span style={{ color: '#64748b' }}>•</span>
            <span style={{ color: '#64748b', fontSize: 13 }}>{captain.talentPoints} talent pts</span>
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: '#94a3b8' }}>
          <span>XP</span><span>{captain.xp} / {captain.xpToNext}</span>
        </div>
        <div className="stat-bar"><div className="stat-bar-fill xp" style={{ width: `${(captain.xp / captain.xpToNext) * 100}%` }} /></div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', marginBottom: 16, borderBottom: '1px solid #1e2a4a' }}>
        <TabBtn tab="stats" label="Stats" />
        <TabBtn tab="equipment" label="Equipment" />
        <TabBtn tab="skills" label="Skills" />
        <TabBtn tab="talents" label="Talents" />
      </div>

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'HP', val: `${captain.currentStats.hp}/${captain.currentStats.maxHp}`, color: '#10b981' },
            { label: 'Energy', val: `${captain.currentStats.energy}/${captain.currentStats.maxEnergy}`, color: '#00d4ff' },
            { label: 'ATK', val: captain.currentStats.atk, color: '#ef4444' },
            { label: 'DEF', val: captain.currentStats.def, color: '#60a5fa' },
            { label: 'SPD', val: captain.currentStats.spd, color: '#f59e0b' },
            { label: 'ACC', val: `${captain.currentStats.acc}%`, color: '#10b981' },
            { label: 'LCK', val: captain.currentStats.lck, color: '#a855f7' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: '#0a0e1a', borderRadius: 6, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color }}>{val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Equipment Tab */}
      {activeTab === 'equipment' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {(Object.keys(SLOT_LABELS) as CaptainEquipSlot[]).map(slot => {
              const equipped = captain.equipment[slot];
              return (
                <div
                  key={slot}
                  onClick={() => setSelectedSlot(selectedSlot === slot ? null : slot)}
                  style={{
                    background: '#0a0e1a', border: `1px solid ${selectedSlot === slot ? '#00d4ff' : '#1e2a4a'}`,
                    borderRadius: 6, padding: '8px 10px', cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                    {SLOT_LABELS[slot]}
                  </div>
                  {equipped ? (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: rarityColor(equipped.rarity) }}>{equipped.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {Object.entries(equipped.stats).map(([k, v]) => `+${v} ${k}`).join(', ')}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: '#1e2a4a', fontStyle: 'italic' }}>Empty</div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedSlot && (
            <div>
              <div style={{ color: '#00d4ff', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                {captain.equipment[selectedSlot] ? 'Swap or Unequip' : 'Equip Item'} — {SLOT_LABELS[selectedSlot]}
              </div>
              {captain.equipment[selectedSlot] && (
                <button
                  className="btn btn-danger"
                  style={{ marginBottom: 8, fontSize: 12 }}
                  onClick={() => { unequipItem('captain', null, selectedSlot); setSelectedSlot(null); }}
                >
                  UNEQUIP
                </button>
              )}
              {captainInventory.filter(i => i.slot === selectedSlot).length === 0 ? (
                <p style={{ color: '#64748b', fontSize: 13, fontStyle: 'italic' }}>No compatible items in inventory</p>
              ) : (
                captainInventory
                  .filter(i => i.slot === selectedSlot)
                  .map(item => (
                    <div key={item.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 10px', background: '#0a0e1a', borderRadius: 6, marginBottom: 6,
                      border: '1px solid #1e2a4a',
                    }}>
                      <div>
                        <span style={{ color: rarityColor(item.rarity), fontWeight: 600 }}>{item.name}</span>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          {Object.entries(item.stats).map(([k, v]) => `+${v} ${k}`).join(', ')}
                        </div>
                      </div>
                      <button className="btn btn-primary" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => handleEquip(item)}>EQUIP</button>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {captain.skills.map(skill => (
            <div key={skill.id} style={{ background: '#0a0e1a', border: '1px solid #1e2a4a', borderRadius: 6, padding: '10px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ fontWeight: 700, color: '#00d4ff' }}>{skill.name}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  {skill.energyCost} Energy • CD: {skill.cooldown}
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>{skill.description}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                {skill.damage && <span style={{ fontSize: 11, color: '#ef4444' }}>DMG: {skill.damage}</span>}
                {skill.healing && <span style={{ fontSize: 11, color: '#10b981' }}>HEAL: {skill.healing}</span>}
                {skill.statusEffect && <span style={{ fontSize: 11, color: '#a855f7' }}>{skill.statusEffect}</span>}
                {skill.aoe && <span style={{ fontSize: 11, color: '#f59e0b' }}>AoE</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Talents Tab */}
      {activeTab === 'talents' && (
        <div>
          <div style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 6, padding: '10px 14px', marginBottom: 16 }}>
            <span style={{ color: '#94a3b8' }}>Available Points: </span>
            <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: 18 }}>{captain.talentPoints}</span>
          </div>
          {classData.talentBranches.map(branch => (
            <div key={branch.name} style={{ marginBottom: 16 }}>
              <div style={{ color: '#00d4ff', fontWeight: 700, fontSize: 14, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                {branch.name}
              </div>
              {branch.talents.map(talent => {
                const learned = captain.talents.includes(talent);
                return (
                  <div key={talent} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 12px', background: '#0a0e1a', borderRadius: 6, marginBottom: 6,
                    border: `1px solid ${learned ? '#10b981' : '#1e2a4a'}`,
                  }}>
                    <div>
                      <span style={{ color: learned ? '#10b981' : '#e2e8f0', fontWeight: 600 }}>{talent}</span>
                      {learned && <span style={{ marginLeft: 8, fontSize: 11, color: '#10b981' }}>✓ Learned</span>}
                    </div>
                    {!learned && (
                      <button
                        className="btn btn-purple"
                        style={{ fontSize: 11, padding: '3px 10px' }}
                        disabled={captain.talentPoints <= 0}
                        onClick={() => learnTalent(talent)}
                      >
                        LEARN (1pt)
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
