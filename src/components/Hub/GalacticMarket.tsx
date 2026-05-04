import React, { useState } from 'react';
import { useProfile, useGameStore } from '../../store/gameStore';
import { rarityColor } from '../../utils/loot';
import type { Equipment } from '../../types/game';

export function GalacticMarket() {
  const profile = useProfile();
  const [activeTab, setActiveTab] = useState<'market' | 'inventory'>('market');
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const buyMarketItem = useGameStore(s => s.buyMarketItem);
  const sellItem = useGameStore(s => s.sellItem);
  const salvageItem = useGameStore(s => s.salvageItem);
  const refreshMarket = useGameStore(s => s.refreshMarket);

  if (!profile) return null;

  const tabStyle = (tab: string) => ({
    flex: 1, padding: '8px 4px',
    background: activeTab === tab ? 'rgba(0,212,255,0.15)' : 'transparent',
    border: 'none', borderBottom: `2px solid ${activeTab === tab ? '#00d4ff' : 'transparent'}`,
    color: activeTab === tab ? '#00d4ff' : '#94a3b8', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', textTransform: 'uppercase' as const, letterSpacing: 0.5,
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #1e2a4a', flex: 1 }}>
          <button style={tabStyle('market')} onClick={() => setActiveTab('market')}>Market</button>
          <button style={tabStyle('inventory')} onClick={() => setActiveTab('inventory')}>Inventory ({profile.inventory.length})</button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: 18 }}>💰 {profile.credits.toLocaleString()} credits</span>
        {activeTab === 'market' && (
          <button className="btn" style={{ fontSize: 12 }} onClick={refreshMarket}>REFRESH MARKET</button>
        )}
      </div>

      {activeTab === 'market' && (
        <div>
          {profile.marketItems.map(mi => (
            <div key={mi.equipment.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 12px', background: '#0a0e1a', borderRadius: 8, marginBottom: 8,
              border: '1px solid #1e2a4a',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ color: rarityColor(mi.equipment.rarity), fontWeight: 700, fontSize: 14 }}>
                    {mi.equipment.name}
                  </span>
                  <span className={`badge badge-${mi.equipment.rarity.toLowerCase()}`}>{mi.equipment.rarity}</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{mi.equipment.entityType}</span>
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {Object.entries(mi.equipment.stats).map(([k, v]) => `+${v} ${k}`).join(', ')}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Slot: {mi.equipment.slot}</div>
              </div>
              <div style={{ textAlign: 'right', minWidth: 80 }}>
                <div style={{ color: '#f59e0b', fontWeight: 700, marginBottom: 4 }}>{mi.price}cr</div>
                <div style={{ color: '#64748b', fontSize: 11, marginBottom: 6 }}>Stock: {mi.stock}</div>
                <button
                  className="btn btn-primary"
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  disabled={mi.stock <= 0 || profile.credits < mi.price}
                  onClick={() => buyMarketItem(mi.equipment.id)}
                >
                  BUY
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'inventory' && (
        <div>
          {profile.inventory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
              <p>Your inventory is empty.</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Complete missions to earn loot!</p>
            </div>
          ) : (
            profile.inventory.map(item => (
              <div key={item.id} style={{
                padding: '10px 12px', background: '#0a0e1a', borderRadius: 8, marginBottom: 8,
                border: `1px solid ${selectedItem?.id === item.id ? '#00d4ff' : '#1e2a4a'}`,
                cursor: 'pointer',
              }}
                onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ color: rarityColor(item.rarity), fontWeight: 700, fontSize: 14 }}>{item.name}</span>
                      <span className={`badge badge-${item.rarity.toLowerCase()}`}>{item.rarity}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {Object.entries(item.stats).map(([k, v]) => `+${v} ${k}`).join(', ')}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                      {item.entityType} • {item.slot}
                    </div>
                  </div>
                  <span style={{ color: '#f59e0b', fontSize: 12 }}>{item.sellValue}cr</span>
                </div>

                {selectedItem?.id === item.id && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button
                      className="btn btn-danger"
                      style={{ fontSize: 11, padding: '4px 10px' }}
                      onClick={e => { e.stopPropagation(); sellItem(item.id); setSelectedItem(null); }}
                    >
                      SELL ({item.sellValue}cr)
                    </button>
                    <button
                      className="btn btn-purple"
                      style={{ fontSize: 11, padding: '4px 10px' }}
                      onClick={e => { e.stopPropagation(); salvageItem(item.id); setSelectedItem(null); }}
                    >
                      SALVAGE ({Math.round(item.sellValue * 0.3)}cr)
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
