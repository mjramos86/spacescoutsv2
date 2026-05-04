import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export function Modal({ isOpen, onClose, title, children, width = '500px' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#0f1629',
          border: '1px solid #1e2a4a',
          borderRadius: 8,
          width, maxWidth: '95vw',
          maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 0 40px rgba(0,212,255,0.15)',
        }}
      >
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #1e2a4a',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#00d4ff', textTransform: 'uppercase', letterSpacing: 1 }}>
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', color: '#94a3b8',
              fontSize: 22, cursor: 'pointer', lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
