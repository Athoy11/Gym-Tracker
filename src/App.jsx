import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Dumbbell, LayoutDashboard, History, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Logger from './pages/Logger';
import HistoryPage from './pages/History';
import Login from './pages/Login';
import { auth } from './utils/storage';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/log', icon: <Dumbbell size={20} />, label: 'Log Workout' },
    { path: '/history', icon: <History size={20} />, label: 'History' }
  ];

  const handleLogout = () => {
    signOut(auth);
  };
  
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
          background: 'var(--primary-color)',
          padding: '8px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000'
        }}>
          <Dumbbell size={24} />
        </div>
        <h1 style={{ fontSize: '1.25rem', margin: 0, letterSpacing: '0.05em' }} className="text-gradient">
          PPL TRACKER
        </h1>
      </div>
      
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
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
                borderRadius: '4px',
                background: isActive ? 'rgba(204, 255, 0, 0.1)' : 'transparent'
              }}
            >
              {item.icon}
              <span className="hide-on-mobile">{item.label}</span>
            </Link>
          );
        })}
        
        <button 
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--danger-color)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px 12px',
            fontWeight: 600,
            fontSize: '0.95rem',
            marginLeft: '8px'
          }}
          title="Sign Out"
        >
          <LogOut size={20} />
          <span className="hide-on-mobile">Sign Out</span>
        </button>
      </div>
    </nav>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Dumbbell size={48} color="var(--primary-color)" style={{ animation: 'spin 2s linear infinite' }} />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Navigation />
      <main className="container animate-fade-in" style={{ padding: '32px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
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
