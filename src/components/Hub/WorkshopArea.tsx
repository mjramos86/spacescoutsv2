import React, { useState } from 'react';
import { useProfile, useGameStore } from '../../store/gameStore';
import { rarityColor } from '../../utils/loot';
import type { Equipment, Rarity } from '../../types/game';
import { SELL_VALUES } from '../../data/equipment';

const UPGRADE_COSTS: Record<Rarity, number> = {
  Common: 100,
  Uncommon: 250,
  Rare: 600,
  Epic: 1500,
  Legendary: 4000,
};

const NEXT_RARITY: Record<Rarity, Rarity | null> = {
  Common: 'Uncommon',
  Uncommon: 'Rare',
  Rare: 'Epic',
  Epic: 'Legendary',
  Legendary: null,
};

export function WorkshopArea() {
  const profile = useProfile();
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const equipItem = useGameStore(s => s.equipItem);

  // Use store directly to upgrade (modifying inventory)
  const store = useGameStore();

  if (!profile) return null;

  function upgradeItem(item: Equipment) {
    const nextRarity = NEXT_RARITY[item.rarity];
    if (!nextRarity || !profile) return;
    const cost = UPGRADE_COSTS[item.rarity];
    if (profile.credits < cost) return;

    // Apply stat boost
    const boostMultiplier = 1.35;
    const newStats: Record<string, number> = {};
    Object.entries(item.stats).forEach(([k, v]) => {
      newStats[k] = Math.round((v as number) * boostMultiplier);
    });

    const upgradedItem: Equipment = {
      ...item,
      rarity: nextRarity,
      name: item.name.replace(/^(Common |Uncommon |Rare |Epic |Legendary )/, '') ,
      stats: newStats,
      sellValue: SELL_VALUES[nextRarity],
    };
    upgradedItem.name = `${nextRarity} ${upgradedItem.name.replace(/^(Common |Uncommon |Rare |Epic |Legendary )/, '')}`;

    // Update inventory in store
    useGameStore.setState(s => {
      const user = s.currentUser;
      if (!user) return s;
      const prof = s.profiles[user];
      if (!prof) return s;
      const newInventory = prof.inventory.map(i => i.id === item.id ? upgradedItem : i);
      return {
        profiles: {
          ...s.profiles,
          [user]: {
            ...prof,
            inventory: newInventory,
            credits: prof.credits - cost,
          },
        },
      };
    });

    setSelectedItem(upgradedItem);
  }

  return (
    <div>
      <div style={{ color: '#00d4ff', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
        Upgrade Workshop
      </div>
      <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
        Spend credits to upgrade equipment rarity, boosting all stats by ~35%.
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: 16 }}>💰 {profile.credits.toLocaleString()} credits</span>
      </div>

      {/* Upgrade costs reference */}
      <div style={{ background: '#0a0e1a', border: '1px solid #1e2a4a', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
        <div style={{ fontWeight: 600, color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', marginBottom: 8 }}>Upgrade Costs</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {(Object.entries(UPGRADE_COSTS) as [Rarity, number][]).map(([rarity, cost]) => (
            <div key={rarity} style={{ fontSize: 12, color: '#64748b' }}>
              <span style={{ color: rarityColor(rarity) }}>{rarity}</span>
              {NEXT_RARITY[rarity] && (
                <>
                  <span style={{ color: '#64748b' }}> → </span>
                  <span style={{ color: rarityColor(NEXT_RARITY[rarity]!) }}>{NEXT_RARITY[rarity]}</span>
                </>
              )}
              <span style={{ color: '#f59e0b' }}> {cost}cr</span>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory for upgrading */}
      {profile.inventory.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔧</div>
          <p>No items to upgrade. Go on missions to collect loot!</p>
        </div>
      ) : (
        profile.inventory.map(item => {
          const nextRarity = NEXT_RARITY[item.rarity];
          const cost = UPGRADE_COSTS[item.rarity];
          const canAfford = profile.credits >= cost;
          const isSelected = selectedItem?.id === item.id;

          return (
            <div key={item.id} style={{
              padding: '10px 12px', background: '#0a0e1a', borderRadius: 8, marginBottom: 8,
              border: `1px solid ${isSelected ? '#00d4ff' : '#1e2a4a'}`, cursor: 'pointer',
            }}
              onClick={() => setSelectedItem(isSelected ? null : item)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ color: rarityColor(item.rarity), fontWeight: 700, fontSize: 13 }}>{item.name}</span>
                    <span className={`badge badge-${item.rarity.toLowerCase()}`}>{item.rarity}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {Object.entries(item.stats).map(([k, v]) => `+${v} ${k}`).join(', ')}
                  </div>
                </div>
                {nextRarity && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>→ <span style={{ color: rarityColor(nextRarity) }}>{nextRarity}</span></div>
                    <span style={{ color: canAfford ? '#f59e0b' : '#ef4444', fontSize: 12, fontWeight: 600 }}>{cost}cr</span>
                  </div>
                )}
                {!nextRarity && (
                  <span style={{ fontSize: 11, color: '#f97316', fontStyle: 'italic' }}>MAX</span>
                )}
              </div>

              {isSelected && nextRarity && (
                <div style={{ marginTop: 10 }}>
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: 12, padding: '5px 14px' }}
                    disabled={!canAfford}
                    onClick={e => { e.stopPropagation(); upgradeItem(item); }}
                  >
                    UPGRADE FOR {cost}cr
                  </button>
                  {!canAfford && <span style={{ fontSize: 12, color: '#ef4444', marginLeft: 10 }}>Insufficient credits</span>}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
