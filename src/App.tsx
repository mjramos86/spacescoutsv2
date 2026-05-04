import React from 'react';
import { useGameStore } from './store/gameStore';
import { LoginScreen } from './components/Auth/LoginScreen';
import { CharacterCreation } from './components/Auth/CharacterCreation';
import { FrontierStation } from './components/Hub/FrontierStation';
import { SpaceCombat } from './components/Combat/SpaceCombat';
import { SurfaceCombat } from './components/Combat/SurfaceCombat';
import { MissionResult } from './components/Combat/MissionResult';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          width: '100vw', height: '100vh', background: '#0a0e1a',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: '#e2e8f0', fontFamily: 'monospace', padding: 40,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: '#ef4444', marginBottom: 12 }}>Game Error</h2>
          <pre style={{
            background: '#0f1629', border: '1px solid #ef4444', borderRadius: 8,
            padding: 20, maxWidth: 700, width: '100%', overflowX: 'auto',
            fontSize: 13, color: '#fca5a5', whiteSpace: 'pre-wrap',
          }}>
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            style={{
              marginTop: 20, padding: '10px 24px', background: '#1e2a4a',
              border: '1px solid #00d4ff', borderRadius: 6, color: '#00d4ff',
              cursor: 'pointer', fontSize: 14,
            }}
          >
            Reload Game
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function GameRouter() {
  const screen = useGameStore(s => s.screen);

  switch (screen) {
    case 'login':
      return <LoginScreen />;
    case 'characterCreation':
      return <CharacterCreation />;
    case 'hub':
      return <FrontierStation />;
    case 'spaceCombat':
      return <SpaceCombat />;
    case 'surfaceCombat':
      return <SurfaceCombat />;
    case 'missionResult':
      return <MissionResult />;
    default:
      return <LoginScreen />;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <GameRouter />
    </ErrorBoundary>
  );
}
