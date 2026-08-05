import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Dumbbell, LayoutDashboard, History } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Logger from './pages/Logger';
import HistoryPage from './pages/History';

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/log', icon: <Dumbbell size={20} />, label: 'Log Workout' },
    { path: '/history', icon: <History size={20} />, label: 'History' }
  ];
  
  return (
    <nav style={{
      background: 'var(--surface-color)',
      padding: '16px 24px',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: 'var(--gradient-primary)',
          padding: '8px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <Dumbbell size={24} />
        </div>
        <h1 style={{ fontSize: '1.25rem', margin: 0, letterSpacing: '0.05em' }} className="text-gradient">
          PPL TRACKER
        </h1>
      </div>
      <div style={{ display: 'flex', gap: '20px' }}>
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                transition: 'color 0.2s',
                padding: '8px 12px',
                borderRadius: '8px',
                background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
              }}
            >
              {item.icon}
              <span className="hide-on-mobile">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <main className="container" style={{ padding: '32px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/log" element={<Logger />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
