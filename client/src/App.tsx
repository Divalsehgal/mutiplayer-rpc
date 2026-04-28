import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import LobbyScreen from './screens/LobbyScreen';
import RoomScreen from './screens/RoomScreen';
import GameScreen from './screens/GameScreen';
import AuthScreen from './screens/AuthScreen';
import ProtectedRoute from './components/ProtectedRoute';
import { useSocket } from './hooks/useSocket';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuthStore } from './store/auth';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const ConnectionBanner = ({ isConnected, isAuthenticated }: { isConnected: boolean, isAuthenticated: boolean }) => {
  const location = useLocation();
  const isGameRoute = location.pathname.startsWith('/room') || location.pathname.startsWith('/game');

  if (isAuthenticated && !isConnected && isGameRoute) {
    return (
      <div className="fixed top-0 left-0 w-full bg-destructive text-destructive-foreground py-1 text-center text-xs font-bold z-50">
        CONNECTION INTERRUPTED - RETRYING...
      </div>
    );
  }
  return null;
};

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import { Menu, X } from 'lucide-react';
import { Button } from './components/ui/button';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === '/login';

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-x-hidden">
      {isAuthenticated && !isAuthPage && (
        <>
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          {/* Mobile Sidebar Overlay */}
          <div
            className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={toggleSidebar}
          />

          {/* Mobile Sidebar Content */}
          <div className={`fixed inset-y-0 left-0 w-64 bg-card z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <Sidebar onAction={() => setIsSidebarOpen(false)} />
          </div>

          {/* Mobile Header */}
          <header className="lg:hidden fixed top-0 left-0 right-0 h-14 border-b border-border bg-card/80 backdrop-blur-md flex items-center px-4 z-40">
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
            <span className="ml-3 font-black tracking-tighter text-xl italic">ARENA</span>
          </header>
        </>
      )}

      <main className={`flex-1 flex flex-col min-w-0 ${isAuthenticated && !isAuthPage ? 'lg:pl-0 pt-14 lg:pt-0' : ''}`}>
        {children}
      </main>
    </div>
  );
};


function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { isConnected } = useSocket();

  // On mount, check if we have a valid session
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="bg-background text-foreground min-h-screen font-sans antialiased">
        <BrowserRouter>
          <AppLayout>
            {/* Only show interruption warning when in a Room or Game */}
            <ConnectionBanner isConnected={isConnected} isAuthenticated={isAuthenticated} />

            <Routes>
              <Route path="/login" element={<AuthScreen />} />

              <Route path="/" element={
                <ProtectedRoute>
                  <LobbyScreen />
                </ProtectedRoute>
              } />

              <Route path="/room/:id" element={
                <ProtectedRoute>
                  <RoomScreen />
                </ProtectedRoute>
              } />

              <Route path="/game/:id" element={
                <ProtectedRoute>
                  <GameScreen />
                </ProtectedRoute>
              } />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </div>
    </GoogleOAuthProvider>
  );
}



export default App;
