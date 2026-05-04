import React, { useState } from 'react';
import { useProfile, useGameStore } from '../../store/gameStore';
import { getShipTypeData } from '../../data/classes';
import { rarityColor } from '../../utils/loot';
import type { ShipEquipSlot, Equipment } from '../../types/game';

const SLOT_LABELS: Record<ShipEquipSlot, string> = {
  hullPlating: 'Hull Plating',
  engineCore: 'Engine Core',
  weaponArray1: 'Weapon Array 1',
  weaponArray2: 'Weapon Array 2',
  shieldSystem: 'Shield System',
  auxModule1: 'Aux Module 1',
  auxModule2: 'Aux Module 2',
};

export function HangarBay() {
  const profile = useProfile();
  const [selectedSlot, setSelectedSlot] = useState<ShipEquipSlot | null>(null);
  const equipItem = useGameStore(s => s.equipItem);
  const unequipItem = useGameStore(s => s.unequipItem);

  if (!profile) return null;
  const { ship } = profile;
  const typeData = getShipTypeData(ship.type);

  const shipInventory = profile.inventory.filter(i => i.entityType === 'ship');

  function handleEquip(item: Equipment) {
    equipItem('ship', null, item);
    setSelectedSlot(null);
  }

  return (
    <div>
      {/* Ship Header */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 8, fontSize: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${typeData.color}22`, border: `2px solid ${typeData.color}`,
        }}>
          {typeData.icon}
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0' }}>{ship.name}</div>
          <div style={{ color: typeData.color, fontWeight: 600, fontSize: 14 }}>{ship.type}</div>
          <div style={{ color: '#94a3b8', fontSize: 13 }}>Level {ship.level}</div>
        </div>
      </div>

      {/* XP Bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: '#94a3b8' }}>
          <span>Ship XP</span><span>{ship.xp} / {ship.xpToNext}</span>
        </div>
        <div className="stat-bar"><div className="stat-bar-fill xp" style={{ width: `${(ship.xp / ship.xpToNext) * 100}%` }} /></div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
        {[
          { label: 'HP', val: `${ship.currentStats.hp}/${ship.currentStats.maxHp}`, color: '#10b981' },
          { label: 'Shield', val: `${ship.currentStats.shield}/${ship.currentStats.maxShield}`, color: '#60a5fa' },
          { label: 'ATK', val: ship.currentStats.atk, color: '#ef4444' },
          { label: 'ACC', val: `${ship.currentStats.acc}%`, color: '#10b981' },
          { label: 'EVA', val: `${ship.currentStats.eva}%`, color: '#f59e0b' },
          { label: 'MOVE', val: ship.currentStats.move, color: '#a855f7' },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background: '#0a0e1a', borderRadius: 6, padding: '8px 10px' }}>
            <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color }}>{val}</div>
          </div>
        ))}
      </div>

      {/* HP/Shield Bars */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Hull Integrity</div>
          <div className="stat-bar" style={{ height: 8 }}>
            <div className="stat-bar-fill hp" style={{ width: `${(ship.currentStats.hp / ship.currentStats.maxHp) * 100}%` }} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Shield</div>
          <div className="stat-bar" style={{ height: 8 }}>
            <div className="stat-bar-fill shield" style={{ width: `${(ship.currentStats.shield / ship.currentStats.maxShield) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Equipment Slots */}
      <div style={{ fontWeight: 600, color: '#00d4ff', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
        Equipment
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        {(Object.keys(SLOT_LABELS) as ShipEquipSlot[]).map(slot => {
          const equipped = ship.equipment[slot];
          return (
            <div
              key={slot}
              onClick={() => setSelectedSlot(selectedSlot === slot ? null : slot)}
              style={{
                background: '#0a0e1a', border: `1px solid ${selectedSlot === slot ? '#00d4ff' : '#1e2a4a'}`,
                borderRadius: 6, padding: '8px 10px', cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                {SLOT_LABELS[slot]}
              </div>
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
          <div style={{ color: '#00d4ff', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
            {SLOT_LABELS[selectedSlot]}
          </div>
          {ship.equipment[selectedSlot] && (
            <button
              className="btn btn-danger"
              style={{ marginBottom: 8, fontSize: 12 }}
              onClick={() => { unequipItem('ship', null, selectedSlot); setSelectedSlot(null); }}
            >
              UNEQUIP
            </button>
          )}
          {shipInventory.filter(i => i.slot === selectedSlot).length === 0 ? (
            <p style={{ color: '#64748b', fontSize: 13, fontStyle: 'italic' }}>No compatible items</p>
          ) : (
            shipInventory.filter(i => i.slot === selectedSlot).map(item => (
              <div key={item.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 10px', background: '#0a0e1a', borderRadius: 6, marginBottom: 6,
                border: '1px solid #1e2a4a',
              }}>
                <div>
                  <span style={{ color: rarityColor(item.rarity), fontWeight: 600, fontSize: 13 }}>{item.name}</span>
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
  );
}
