import React, { useState } from 'react';
import { auth, provider } from '../utils/storage';
import { signInWithPopup } from 'firebase/auth';
import { Dumbbell, LogIn } from 'lucide-react';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '24px'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        padding: '40px 32px'
      }}>
        <div style={{
          background: 'var(--primary-color)',
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000',
          margin: '0 auto 24px auto'
        }}>
          <Dumbbell size={32} />
        </div>
        
        <h2 style={{ marginBottom: '8px', fontSize: '2rem' }}>PPL Tracker</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Secure your data and track your progressive overload across all devices.
        </p>

        {error && (
          <div style={{
            background: 'rgba(255, 51, 51, 0.1)',
            color: 'var(--danger-color)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
            fontSize: '0.9rem',
            border: '1px solid var(--danger-color)'
          }}>
            {error}
          </div>
        )}

        <button 
          className="btn btn-primary" 
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
        >
          {loading ? 'Connecting...' : (
            <>
              <LogIn size={20} />
              Sign In with Google
            </>
          )}
        </button>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '24px' }}>
          By signing in, your data is securely locked to your personal Google account.
        </p>
      </div>
    </div>
  );
};

export default Login;
