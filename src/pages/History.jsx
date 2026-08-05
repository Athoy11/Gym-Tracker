import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, deleteWorkout } from '../utils/storage';
import { Calendar, Activity, Weight, Edit2, Trash2 } from 'lucide-react';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this workout?")) {
      await deleteWorkout(id);
      loadHistory();
    }
  };

  const handleEdit = (entry) => {
    navigate('/log', { state: { editWorkout: entry } });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '64px', color: 'var(--text-secondary)' }}>Loading history...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '64px', color: 'var(--danger-color)' }}>
        <h2>Error Loading Data</h2>
        <p>{error}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '16px' }}>
          This is usually caused by missing permissions (check that your Firestore is in Test Mode) 
          or an issue with your Firebase configuration.
        </p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', marginTop: '64px' }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
          <Activity size={64} style={{ margin: '0 auto' }} />
        </div>
        <h2 style={{ color: 'var(--text-secondary)' }}>No Workouts Logged Yet</h2>
        <p style={{ color: 'var(--text-muted)' }}>Go to the Log Workout tab to record your first session.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Workout History</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Review your past sessions and consistency</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {history.map((entry, index) => {
          const date = new Date(entry.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          return (
            <div key={entry.id} className={`glass-panel animate-fade-in stagger-${(index % 3) + 1}`}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    background: 'var(--surface-color-light)',
                    padding: '10px',
                    borderRadius: '50%',
                    color: 'var(--primary-color)'
                  }}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{date}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {entry.exercises.length} exercises logged
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    background: 'var(--gradient-primary)', 
                    padding: '6px 12px', 
                    borderRadius: '999px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    color: 'white',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}>
                    {entry.dayType} Day
                  </div>
                  
                  <button 
                    onClick={() => handleEdit(entry)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    title="Edit Workout"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(entry.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}
                    title="Delete Workout"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {entry.exercises.map((ex, idx) => (
                  <div key={idx} style={{ 
                    background: 'rgba(0,0,0,0.2)', 
                    padding: '12px', 
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{ex.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                        <Weight size={14} />
                        {ex.weight} {ex.unit || 'lbs'}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {ex.sets && <span>Sets: <strong style={{color: 'var(--text-primary)'}}>{ex.sets}</strong></span>}
                      {ex.reps && <span>Reps: <strong style={{color: 'var(--text-primary)'}}>{ex.reps}</strong></span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default History;
