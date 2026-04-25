import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LobbyScreen from './screens/LobbyScreen';
import RoomScreen from './screens/RoomScreen';
import GameScreen from './screens/GameScreen';
import { useSocket } from './hooks/useSocket';

function App() {
  const { isConnected } = useSocket();

  return (
    <div className="bg-background text-foreground min-h-screen font-sans antialiased">
      {!isConnected && (
        <div className="fixed top-0 left-0 w-full bg-destructive text-destructive-foreground py-1 text-center text-xs font-bold z-50">
          DISCONNECTED - RETRYING...
        </div>
      )}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LobbyScreen />} />
          <Route path="/room/:id" element={<RoomScreen />} />
          <Route path="/game/:id" element={<GameScreen />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
