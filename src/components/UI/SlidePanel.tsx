import React from 'react';

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export function SlidePanel({ isOpen, onClose, title, children, width = '420px' }: SlidePanelProps) {
  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.5)',
          }}
        />
      )}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: `min(${width}, 100vw)`,
          background: '#0f1629',
          borderLeft: '1px solid #1e2a4a',
          zIndex: 101,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          display: 'flex', flexDirection: 'column',
          boxShadow: isOpen ? '-10px 0 40px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #1e2a4a',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#0a0e1a',
        }}>
          <span style={{
            fontSize: 20, fontWeight: 700, color: '#00d4ff',
            textTransform: 'uppercase', letterSpacing: 2,
          }}>
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid #1e2a4a',
              color: '#94a3b8', fontSize: 18, cursor: 'pointer',
              width: 32, height: 32, borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {children}
        </div>
      </div>
    </>
  );
}
