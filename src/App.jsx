import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Import pages
import Home from './pages/Home';
import Games from './pages/Games';
import GameDetail from './pages/GameDetail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import GamesShowcase from './pages/GamesShowcase';
import GamesWithoutImages from './pages/GamesWithoutImages';

// Import context
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* Home page now has the games grid */}
            <Route path="/" element={<Home />} />
            
            {/* Games page is now a separate page for future features */}
            <Route path="/games" element={<Games />} />
            
            <Route path="/game/:gameId" element={<GameDetail />} />
            <Route path="/games-showcase" element={<GamesShowcase />} />
            <Route path="/games-without-images" element={<GamesWithoutImages />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
