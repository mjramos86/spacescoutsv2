import React from 'react';
import { useGameStore } from './store/gameStore';
import { LoginScreen } from './components/Auth/LoginScreen';
import { CharacterCreation } from './components/Auth/CharacterCreation';
import { FrontierStation } from './components/Hub/FrontierStation';
import { SpaceCombat } from './components/Combat/SpaceCombat';
import { SurfaceCombat } from './components/Combat/SurfaceCombat';
import { MissionResult } from './components/Combat/MissionResult';

export default function App() {
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
