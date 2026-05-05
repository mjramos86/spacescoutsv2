import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';

export function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useGameStore(s => s.login);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Username and password required');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login(username.trim(), password);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Login failed');
    }
  }

  return (
    <div className="screen-full" style={{
      background: '#0a0e1a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', padding: '20px 16px',
    }}>
      {/* Stars background */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {Array.from({ length: 80 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: Math.random() * 2 + 1 + 'px',
            height: Math.random() * 2 + 1 + 'px',
            background: 'white',
            borderRadius: '50%',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            opacity: Math.random() * 0.7 + 0.1,
          }} />
        ))}
      </div>

      {/* Login panel */}
      <div style={{
        background: '#0f1629',
        border: '1px solid #1e2a4a',
        borderRadius: 12,
        padding: 'clamp(24px, 5vw, 48px) clamp(20px, 5vw, 40px)',
        width: 'min(400px, 100%)',
        boxShadow: '0 0 60px rgba(0,212,255,0.1)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🚀</div>
          <h1 style={{
            fontSize: 32, fontWeight: 700, letterSpacing: 4,
            background: 'linear-gradient(90deg, #00d4ff, #7c3aed)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            SPACE SCOUTS
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 6, letterSpacing: 1 }}>
            FRONTIER EDITION
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
              Scout ID
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              style={{
                width: '100%', padding: '10px 14px',
                background: '#0a0e1a', border: '1px solid #1e2a4a',
                borderRadius: 6, color: '#e2e8f0', fontSize: 15,
                outline: 'none', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#00d4ff'}
              onBlur={e => e.target.style.borderColor = '#1e2a4a'}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
              Access Code
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: '100%', padding: '10px 14px',
                background: '#0a0e1a', border: '1px solid #1e2a4a',
                borderRadius: 6, color: '#e2e8f0', fontSize: 15,
                outline: 'none', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#00d4ff'}
              onBlur={e => e.target.style.borderColor = '#1e2a4a'}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444',
              borderRadius: 6, padding: '10px 14px', marginBottom: 16,
              color: '#ef4444', fontSize: 14,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: 16, letterSpacing: 2 }}
          >
            {loading ? 'AUTHENTICATING...' : 'ENGAGE'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: 12, marginTop: 20 }}>
          New scout? Enter a username and password to create your account.
        </p>

        <div style={{
          marginTop: 24, padding: '12px', background: 'rgba(0,212,255,0.05)',
          border: '1px solid rgba(0,212,255,0.1)', borderRadius: 6,
        }}>
          <p style={{ color: '#64748b', fontSize: 11, textAlign: 'center' }}>
            🔒 All data stored locally • No server required
          </p>
        </div>
      </div>
    </div>
  );
}
