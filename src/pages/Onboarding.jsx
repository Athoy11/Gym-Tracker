import React, { useState } from 'react';
import { saveUserProfile } from '../utils/storage';
import { Dumbbell } from 'lucide-react';

const Onboarding = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    birthday: '',
    heightFt: '',
    heightIn: '',
    weight: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.birthday || !formData.heightFt || !formData.weight) {
      setError("Please fill out all required fields.");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await saveUserProfile({
        name: formData.name,
        birthday: formData.birthday,
        heightFt: parseInt(formData.heightFt),
        heightIn: parseInt(formData.heightIn) || 0,
        weight: parseFloat(formData.weight)
      });
      
      onComplete(); // Triggers App.jsx to fetch the profile and re-render the main app
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
        maxWidth: '500px',
        width: '100%',
        padding: '40px 32px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            background: 'var(--primary-color)',
            width: '64px',
            height: '64px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            margin: '0 auto 16px auto'
          }}>
            <Dumbbell size={32} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome to PPL Tracker</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Let's get your profile set up so we can track your progress.</p>
        </div>

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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input 
              type="text" 
              name="name"
              className="form-input" 
              placeholder="e.g. Arnold"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Birthday *</label>
            <input 
              type="date" 
              name="birthday"
              className="form-input" 
              value={formData.birthday}
              onChange={handleChange}
              required
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label className="form-label">Height (ft) *</label>
              <input 
                type="number" 
                name="heightFt"
                className="form-input" 
                placeholder="5"
                min="0" max="9"
                value={formData.heightFt}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="form-label">Height (in)</label>
              <input 
                type="number" 
                name="heightIn"
                className="form-input" 
                placeholder="10"
                min="0" max="11"
                value={formData.heightIn}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label">Current Weight (kg) *</label>
            <input 
              type="number" 
              name="weight"
              step="0.1"
              className="form-input" 
              placeholder="e.g. 75.5"
              value={formData.weight}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
          >
            {loading ? 'Saving Profile...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
