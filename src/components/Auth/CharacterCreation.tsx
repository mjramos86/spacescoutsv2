import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { CAPTAIN_CLASSES, SHIP_TYPES } from '../../data/classes';
import type { CaptainClass, ShipType } from '../../types/game';

type Step = 'name' | 'class' | 'ship' | 'done';

export function CharacterCreation() {
  const [step, setStep] = useState<Step>('name');
  const [captainName, setCaptainName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CaptainClass | null>(null);
  const [selectedShip, setSelectedShip] = useState<ShipType | null>(null);
  const [nameError, setNameError] = useState('');
  const createCharacter = useGameStore(s => s.createCharacter);
  const logout = useGameStore(s => s.logout);

  function handleNameSubmit() {
    if (!captainName.trim()) { setNameError('Name required'); return; }
    if (captainName.trim().length < 2) { setNameError('Min 2 characters'); return; }
    setNameError('');
    setStep('class');
  }

  function handleClassSelect(cls: CaptainClass) {
    setSelectedClass(cls);
  }

  function handleClassConfirm() {
    if (!selectedClass) return;
    setStep('ship');
  }

  function handleShipSelect(ship: ShipType) {
    setSelectedShip(ship);
  }

  function handleFinish() {
    if (!selectedClass || !selectedShip) return;
    createCharacter(captainName.trim(), selectedClass, selectedShip);
  }

  const StepIndicator = () => (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
      {(['name', 'class', 'ship'] as Step[]).map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: step === s ? '#00d4ff' : (i < ['name','class','ship'].indexOf(step) ? '#10b981' : '#1e2a4a'),
            color: step === s ? '#0a0e1a' : '#e2e8f0',
            fontSize: 13, fontWeight: 700,
            border: `2px solid ${step === s ? '#00d4ff' : '#1e2a4a'}`,
          }}>
            {i + 1}
          </div>
          {i < 2 && <div style={{ width: 40, height: 2, background: i < ['name','class','ship'].indexOf(step) ? '#10b981' : '#1e2a4a' }} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="screen-full" style={{
      background: '#0a0e1a',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '20px 16px',
    }}>
      <div style={{
        width: 'min(700px, 100%)',
        background: '#0f1629',
        border: '1px solid #1e2a4a',
        borderRadius: 12,
        padding: 'clamp(20px, 4vw, 36px) clamp(16px, 4vw, 40px)',
        boxShadow: '0 0 60px rgba(0,212,255,0.1)',
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: 3, color: '#00d4ff', textTransform: 'uppercase' }}>
            Create Your Scout
          </h2>
          <p style={{ color: '#94a3b8', marginTop: 6 }}>Begin your journey through the wormhole</p>
        </div>

        <StepIndicator />

        {/* Step 1: Name */}
        {step === 'name' && (
          <div style={{ maxWidth: 380, margin: '0 auto' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#e2e8f0' }}>
              Name Your Captain
            </h3>
            <input
              type="text"
              value={captainName}
              onChange={e => setCaptainName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleNameSubmit(); }}
              placeholder="Enter captain name..."
              maxLength={20}
              style={{
                width: '100%', padding: '12px 16px',
                background: '#0a0e1a', border: '1px solid #1e2a4a',
                borderRadius: 6, color: '#e2e8f0', fontSize: 18,
                marginBottom: 8, outline: 'none',
              }}
              autoFocus
            />
            {nameError && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{nameError}</p>}
            <button className="btn btn-primary" style={{ width: '100%', padding: 12, marginTop: 8 }} onClick={handleNameSubmit}>
              NEXT: CHOOSE CLASS
            </button>
          </div>
        )}

        {/* Step 2: Class */}
        {step === 'class' && (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: '#e2e8f0' }}>
              Choose Your Class
            </h3>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20 }}>Captain: <strong style={{ color: '#00d4ff' }}>{captainName}</strong></p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
              {CAPTAIN_CLASSES.map(cls => (
                <div
                  key={cls.class}
                  onClick={() => handleClassSelect(cls.class)}
                  style={{
                    background: selectedClass === cls.class ? `rgba(0,212,255,0.1)` : '#0a0e1a',
                    border: `2px solid ${selectedClass === cls.class ? '#00d4ff' : '#1e2a4a'}`,
                    borderRadius: 8, padding: 16, cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{cls.icon}</div>
                  <div style={{ fontWeight: 700, color: cls.color, fontSize: 16, marginBottom: 4 }}>{cls.class}</div>
                  <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 10 }}>{cls.description}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {Object.entries({
                      'HP': cls.baseStats.hp,
                      'ATK': cls.baseStats.atk,
                      'DEF': cls.baseStats.def,
                      'SPD': cls.baseStats.spd,
                      'ACC': cls.baseStats.acc,
                    }).map(([stat, val]) => (
                      <div key={stat} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: '#64748b' }}>{stat}</span>
                        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn" onClick={() => setStep('name')} style={{ flex: 1 }}>BACK</button>
              <button className="btn btn-primary" onClick={handleClassConfirm} disabled={!selectedClass} style={{ flex: 2 }}>
                NEXT: CHOOSE SHIP
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Ship */}
        {step === 'ship' && (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: '#e2e8f0' }}>
              Choose Your Ship
            </h3>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20 }}>
              Class: <strong style={{ color: '#00d4ff' }}>{selectedClass}</strong>
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
              {SHIP_TYPES.map(ship => (
                <div
                  key={ship.type}
                  onClick={() => handleShipSelect(ship.type)}
                  style={{
                    background: selectedShip === ship.type ? 'rgba(0,212,255,0.1)' : '#0a0e1a',
                    border: `2px solid ${selectedShip === ship.type ? '#00d4ff' : '#1e2a4a'}`,
                    borderRadius: 8, padding: 16, cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{ship.icon}</div>
                  <div style={{ fontWeight: 700, color: ship.color, fontSize: 15, marginBottom: 4 }}>{ship.type}</div>
                  <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 10 }}>{ship.description}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {Object.entries({
                      'HP': ship.baseStats.hp,
                      'Shield': ship.baseStats.shield,
                      'ATK': ship.baseStats.atk,
                      'EVA': ship.baseStats.eva,
                      'MOVE': ship.baseStats.move,
                    }).map(([stat, val]) => (
                      <div key={stat} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: '#64748b' }}>{stat}</span>
                        <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
              You will receive 3 random robots to crew your vessel.
            </p>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn" onClick={() => setStep('class')} style={{ flex: 1 }}>BACK</button>
              <button className="btn btn-primary" onClick={handleFinish} disabled={!selectedShip} style={{ flex: 2 }}>
                BEGIN MISSION
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button onClick={logout} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13 }}>
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
