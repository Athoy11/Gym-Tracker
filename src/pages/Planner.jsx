import React, { useState, useEffect } from 'react';
import { getPlan, savePlan, getCustomExerciseMap } from '../utils/storage';
import { baseExerciseMap, musclesByDay, findExerciseMatch, allMuscles } from '../utils/exerciseDatabase';
import { Plus, Trash2, Save, Activity, Calendar } from 'lucide-react';

const Planner = () => {
  const [dayType, setDayType] = useState('Push');
  const [exercises, setExercises] = useState([]);
  const [customMap, setCustomMap] = useState({});
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCustomExerciseMap().then(setCustomMap);
  }, []);

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      try {
        const plan = await getPlan(dayType);
        if (plan && plan.length > 0) {
          setExercises(plan);
        } else {
          setExercises([{ name: '', sets: '', unit: 'Kgs', setDetails: [], customMapping: { primary: [], secondary: [] } }]);
        }
      } catch (err) {
        console.error("Failed to load plan:", err);
      } finally {
        setLoading(false);
      }
    };
    if (dayType) {
      fetchPlan();
    }
  }, [dayType]);

  const handleAddExercise = () => {
    setExercises([...exercises, { name: '', sets: '', unit: 'Kgs', setDetails: [], customMapping: { primary: [], secondary: [] } }]);
  };

  const handleRemoveExercise = (index) => {
    const newEx = [...exercises];
    newEx.splice(index, 1);
    setExercises(newEx);
  };

  const handleNameChange = (index, value) => {
    const newEx = [...exercises];
    newEx[index].name = value;
    setExercises(newEx);
  };

  const selectSuggestion = (index, name) => {
    const newEx = [...exercises];
    newEx[index].name = name;
    setExercises(newEx);
    setActiveDropdownIndex(null);
  };

  const handleUnitChange = (index, value) => {
    const newEx = [...exercises];
    newEx[index].unit = value;
    setExercises(newEx);
  };

  const handleSetCountChange = (index, value) => {
    const newEx = [...exercises];
    newEx[index].sets = value;
    
    const newSetsCount = parseInt(value) || 0;
    let details = [...(newEx[index].setDetails || [])];
    
    if (newSetsCount > details.length) {
      for (let i = details.length; i < newSetsCount; i++) {
        details.push({ reps: '', weight: '' });
      }
    } else if (newSetsCount < details.length) {
      details = details.slice(0, newSetsCount);
    }
    
    newEx[index].setDetails = details;
    setExercises(newEx);
  };

  const handleSetDetailChange = (exIndex, setIndex, field, value) => {
    const newEx = [...exercises];
    newEx[exIndex].setDetails[setIndex][field] = value;
    setExercises(newEx);
  };

  const handleSave = async () => {
    const validExercises = exercises.filter(ex => ex.name.trim() !== '');
    if (validExercises.length === 0) return alert("Please enter at least one valid exercise.");
    
    setIsSaving(true);
    try {
      await savePlan(dayType, validExercises);
      alert(`${dayType} Day plan saved successfully! You can load it in the Logger.`);
    } catch (err) {
      alert("Error saving plan: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const combinedDb = { ...baseExerciseMap, ...customMap };
  const allKnownExercises = Object.keys(combinedDb);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', width: '100%', paddingBottom: '100px' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h2 className="text-gradient" style={{ fontSize: '2.5rem', margin: '0 0 8px 0' }}>
          Workout Planner
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>Set your target weights and reps for future sessions</p>
      </div>

      <div className="glass-panel" style={{ marginBottom: '24px' }}>
        <label className="form-label" style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'block' }}>Which day are you planning?</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['Push', 'Pull', 'Leg'].map(type => (
            <button
              key={type}
              className={`btn ${dayType === type ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '10px 16px' }}
              onClick={() => setDayType(type)}
            >
              <Calendar size={18} />
              {type} Day
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '64px', color: 'var(--text-secondary)' }}>Loading plan...</div>
      ) : (
        <div className="glass-panel animate-fade-in stagger-1" style={{ overflowX: 'visible' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Target Exercises</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
            {exercises.map((ex, index) => {
              // Suggestions logic
              const showSuggestions = activeDropdownIndex === index && ex.name.length >= 2;
              const suggestions = showSuggestions 
                ? allKnownExercises.filter(name => name.toLowerCase().includes(ex.name.toLowerCase()) && name !== ex.name).slice(0, 5)
                : [];

              return (
                <div key={index} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)', position: 'relative' }}>
                  <div className="exercise-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Exercise Name"
                        value={ex.name}
                        onChange={(e) => handleNameChange(index, e.target.value)}
                        onFocus={() => setActiveDropdownIndex(index)}
                        onBlur={() => setTimeout(() => { if (activeDropdownIndex === index) setActiveDropdownIndex(null); }, 200)}
                      />
                      
                      {suggestions.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: 'var(--surface-color)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          marginTop: '4px',
                          zIndex: 1000,
                          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                          overflow: 'hidden'
                        }}>
                          {suggestions.map(suggestion => (
                            <div 
                              key={suggestion}
                              onMouseDown={() => selectSuggestion(index, suggestion)}
                              style={{ padding: '10px 12px', cursor: 'pointer', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-primary)' }}
                              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(204, 255, 0, 0.1)'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Target Sets"
                      value={ex.sets}
                      onChange={(e) => handleSetCountChange(index, e.target.value)}
                      min="0" max="20"
                    />
                    
                    <select 
                      className="form-input" 
                      value={ex.unit}
                      onChange={(e) => handleUnitChange(index, e.target.value)}
                      style={{ padding: '12px 8px', cursor: 'pointer' }}
                    >
                      <option value="lbs">lbs</option>
                      <option value="Kgs">Kgs</option>
                      <option value="plates">plates</option>
                    </select>
                    
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '12px', color: 'var(--danger-color)', width: '44px' }}
                      onClick={() => handleRemoveExercise(index)}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  {ex.setDetails && ex.setDetails.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '16px', borderLeft: '2px solid var(--border-color)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: '12px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, paddingBottom: '4px' }}>
                        <div>Set</div>
                        <div>Target Reps</div>
                        <div>Target Weight</div>
                      </div>
                      
                      {ex.setDetails.map((setDetail, setIndex) => (
                        <div key={setIndex} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: '12px', alignItems: 'center' }}>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            #{setIndex + 1}
                          </div>
                          <input
                            type="number"
                            className="form-input"
                            placeholder="Target Reps"
                            value={setDetail.reps}
                            onChange={(e) => handleSetDetailChange(index, setIndex, 'reps', e.target.value)}
                          />
                          <input
                            type="number"
                            className="form-input"
                            placeholder="Target Weight"
                            step="0.5"
                            value={setDetail.weight}
                            onChange={(e) => handleSetDetailChange(index, setIndex, 'weight', e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={handleAddExercise}>
              <Plus size={20} /> Add Exercise
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={isSaving}>
              <Save size={20} /> {isSaving ? 'Saving...' : `Save ${dayType} Plan`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planner;
