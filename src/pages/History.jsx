import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, deleteWorkout } from '../utils/storage';
import { exportHistoryToCSV } from '../utils/export';
import { Calendar, Activity, Weight, Edit2, Trash2, Download, Filter } from 'lucide-react';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filterDay, setFilterDay] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
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

  const filteredHistory = useMemo(() => {
    return history.filter(entry => {
      let pass = true;
      if (filterDay !== 'All' && entry.dayType !== filterDay) pass = false;
      
      if (startDate) {
        if (new Date(entry.date) < new Date(startDate)) pass = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (new Date(entry.date) > end) pass = false;
      }
      return pass;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [history, filterDay, startDate, endDate]);

  const handleExport = () => {
    exportHistoryToCSV(filteredHistory);
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

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Workout History</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Review your past sessions and consistency</p>
        </div>
        <button 
          onClick={handleExport}
          className="btn btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.9rem' }}
          disabled={filteredHistory.length === 0}
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>
      
      {history.length > 0 && (
        <div className="glass-panel" style={{ marginBottom: '32px', padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', fontWeight: 'bold' }}>
            <Filter size={18} /> Filters
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Workout Type</label>
            <select 
              className="form-input" 
              value={filterDay} 
              onChange={(e) => setFilterDay(e.target.value)}
              style={{ padding: '8px 12px', minWidth: '120px' }}
            >
              <option value="All">All Types</option>
              <option value="Push">Push</option>
              <option value="Pull">Pull</option>
              <option value="Leg">Leg</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Start Date</label>
            <input 
              type="date" 
              className="form-input" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '8px 12px' }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>End Date</label>
            <input 
              type="date" 
              className="form-input" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: '8px 12px' }}
            />
          </div>
          
          {(filterDay !== 'All' || startDate || endDate) && (
            <button 
              onClick={() => { setFilterDay('All'); setStartDate(''); setEndDate(''); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', padding: '10px 0' }}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {history.length === 0 ? (
        <div className="animate-fade-in" style={{ textAlign: 'center', marginTop: '64px' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
            <Activity size={64} style={{ margin: '0 auto' }} />
          </div>
          <h2 style={{ color: 'var(--text-secondary)' }}>No Workouts Logged Yet</h2>
          <p style={{ color: 'var(--text-muted)' }}>Go to the Log Workout tab to record your first session.</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No workouts match your current filters.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredHistory.map((entry, index) => {
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
                      background: 'var(--primary-color)', 
                      padding: '6px 12px', 
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontWeight: '800',
                      color: '#000',
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{ex.name}</span>
                        
                        {/* Legacy single-weight fallback badge */}
                        {(!ex.setDetails || ex.setDetails.length === 0) && ex.weight && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                            <Weight size={14} />
                            {ex.weight} {ex.unit || 'lbs'}
                          </div>
                        )}
                        
                        {/* New setDetails unit badge */}
                        {(ex.setDetails && ex.setDetails.length > 0) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                            <Weight size={14} />
                            {ex.unit || 'lbs'}
                          </div>
                        )}
                      </div>
                      
                      {/* Legacy Sets/Reps rendering */}
                      {(!ex.setDetails || ex.setDetails.length === 0) ? (
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {ex.sets && <span>Sets: <strong style={{color: 'var(--text-primary)'}}>{ex.sets}</strong></span>}
                          {ex.reps && <span>Reps: <strong style={{color: 'var(--text-primary)'}}>{ex.reps}</strong></span>}
                        </div>
                      ) : (
                        /* New Detailed Sets rendering */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Sets: <strong style={{color: 'var(--text-primary)'}}>{ex.sets || ex.setDetails.length}</strong>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: '6px' }}>
                            {ex.setDetails.map((set, setIdx) => (
                              <div key={setIdx} style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 4px', borderRadius: '6px', fontSize: '0.75rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ color: 'var(--text-muted)', marginBottom: '2px', fontSize: '0.7rem' }}>Set {setIdx + 1}</div>
                                <div style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{set.weight} x {set.reps}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
