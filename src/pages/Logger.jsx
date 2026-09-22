import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRoutine, saveWorkout, getLastWorkout, getCustomExerciseMap, saveCustomExerciseMap, getPlan } from '../utils/storage';
import { baseExerciseMap, musclesByDay, findExerciseMatch, allMuscles } from '../utils/exerciseDatabase';
import { Plus, Trash2, Save, Activity, CalendarCheck } from 'lucide-react';

const Logger = () => {
  const [dayType, setDayType] = useState('');
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState([]);
  const [editModeId, setEditModeId] = useState(null);
  const [ghostData, setGhostData] = useState({});
  const [customMap, setCustomMap] = useState({});
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
  const [savedPlan, setSavedPlan] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Load custom mapping
    getCustomExerciseMap().then(setCustomMap);
  }, []);

  useEffect(() => {
    if (location.state && location.state.editWorkout) {
      const { id, dayType: dt, date, exercises: ex } = location.state.editWorkout;
      setEditModeId(id);
      setDayType(dt);
      setWorkoutDate(new Date(date).toISOString().split('T')[0]);
      
      const formattedEx = ex.map(e => {
        let details = e.setDetails || [];
        if (details.length === 0 && e.sets) {
          const legacySets = parseInt(e.sets) || 0;
          for (let i = 0; i < legacySets; i++) {
            details.push({ reps: e.reps || '', weight: e.weight || '' });
          }
        }
        
        return {
          name: e.name,
          sets: e.sets || details.length || '',
          unit: e.unit || 'lbs',
          setDetails: details,
          customMapping: { primary: [], secondary: [] }
        };
      });
      setExercises(formattedEx);
      return;
    }

    const fetchRoutine = async () => {
      try {
        if (dayType && !editModeId) {
          const routine = await getRoutine(dayType);
          if (routine.length > 0) {
            setExercises(routine.map(name => ({ name, sets: '', unit: 'lbs', setDetails: [], customMapping: { primary: [], secondary: [] } })));
          } else {
            setExercises([{ name: '', sets: '', unit: 'lbs', setDetails: [], customMapping: { primary: [], secondary: [] } }]);
          }
          
          const lastWorkout = await getLastWorkout(dayType);
          if (lastWorkout && lastWorkout.exercises) {
            const ghostMap = {};
            lastWorkout.exercises.forEach(ex => {
              ghostMap[ex.name] = ex;
            });
            setGhostData(ghostMap);
          } else {
            setGhostData({});
          }
        } else if (!editModeId) {
          setExercises([]);
          setGhostData({});
        }
      } catch (err) {
        console.error(err);
        alert(`Error loading routine: ${err.message}`);
      }
    };
    fetchRoutine();
  }, [dayType, location.state, editModeId]);

  const [routineCache, setRoutineCache] = useState([]);
  
  useEffect(() => {
    if (dayType) {
      getRoutine(dayType).then(setRoutineCache);
      getPlan(dayType).then(plan => {
        if (plan && plan.length > 0) {
          setSavedPlan(plan);
        } else {
          setSavedPlan(null);
        }
      });
    } else {
      setSavedPlan(null);
    }
  }, [dayType]);

  const handleAddExercise = () => {
    setExercises([...exercises, { name: '', sets: '', unit: 'lbs', setDetails: [], customMapping: { primary: [], secondary: [] } }]);
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

  const addMapping = (exIndex, type, muscle) => {
    if (!muscle) return;
    const newEx = [...exercises];
    if (!newEx[exIndex].customMapping[type].includes(muscle)) {
      newEx[exIndex].customMapping[type].push(muscle);
    }
    setExercises(newEx);
  };

  const removeMapping = (exIndex, type, muscle) => {
    const newEx = [...exercises];
    newEx[exIndex].customMapping[type] = newEx[exIndex].customMapping[type].filter(m => m !== muscle);
    setExercises(newEx);
  };

  const [bodyWeight, setBodyWeight] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const validExercises = exercises.filter(ex => 
      ex.name.trim() !== '' && 
      ex.setDetails && 
      ex.setDetails.some(s => s.reps !== '' && s.weight !== '')
    );
    if (validExercises.length === 0) return alert("Please enter at least one valid exercise with reps/weight.");
    
    setIsSaving(true);

    const combinedDb = { ...baseExerciseMap, ...customMap };
    const newCustomMap = { ...customMap };
    let hasNewCustomExercises = false;

    const formattedEx = validExercises.map(ex => {
      // Check if it's a new exercise that was just mapped
      const isMatched = findExerciseMatch(ex.name, combinedDb);
      if (!isMatched && ex.customMapping && ex.customMapping.primary.length > 0) {
        // Save to our custom map
        newCustomMap[ex.name] = {
          primary: ex.customMapping.primary,
          secondary: ex.customMapping.secondary
        };
        hasNewCustomExercises = true;
      }

      return {
        name: ex.name,
        sets: parseInt(ex.sets) || ex.setDetails.length,
        unit: ex.unit || 'lbs',
        setDetails: ex.setDetails.map(s => ({
          reps: parseInt(s.reps) || 0,
          weight: parseFloat(s.weight) || 0
        }))
      };
    });

    if (hasNewCustomExercises) {
      await saveCustomExerciseMap(newCustomMap);
      setCustomMap(newCustomMap);
    }

    await saveWorkout(dayType, formattedEx, workoutDate, editModeId, bodyWeight);
    setIsSaving(false);
    navigate('/history');
  };

  const handleLoadPlan = () => {
    if (savedPlan) {
      if (window.confirm("This will replace your current exercises with your saved plan. Continue?")) {
        // Deep copy the plan so modifications don't mutate the state directly
        const clonedPlan = JSON.parse(JSON.stringify(savedPlan));
        setExercises(clonedPlan);
      }
    }
  };

  const currentDayMuscles = dayType ? musclesByDay[dayType] : allMuscles;
  const combinedDb = { ...baseExerciseMap, ...customMap };
  const allKnownExercises = Object.keys(combinedDb);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', width: '100%', paddingBottom: '100px' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h2 className="text-gradient" style={{ fontSize: '2.5rem', margin: '0 0 8px 0' }}>
          {editModeId ? 'Edit Workout' : 'Log Workout'}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>Track your progress and volume</p>
      </div>

      <div className="glass-panel" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label className="form-label" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Workout Day</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Push', 'Pull', 'Leg'].map(type => (
                <button
                  key={type}
                  className={`btn ${dayType === type ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '10px 16px' }}
                  onClick={() => setDayType(type)}
                  disabled={editModeId !== null}
                >
                  <Activity size={18} />
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Date</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="date" 
                className="form-input" 
                value={workoutDate}
                onChange={(e) => setWorkoutDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {dayType && (
        <div className="glass-panel animate-fade-in stagger-1" style={{ overflowX: 'visible' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <h3 style={{ margin: 0 }}>Exercises</h3>
              {savedPlan && !editModeId && (
                <button 
                  onClick={handleLoadPlan}
                  className="btn btn-outline"
                  style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <CalendarCheck size={16} /> Load Plan
                </button>
              )}
            </div>
            {routineCache.length === 0 && !editModeId && !savedPlan && (
              <span style={{ fontSize: '0.85rem', color: 'var(--success-color)', background: 'rgba(204, 255, 0, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                First Time Setup
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
            {exercises.map((ex, index) => {
              const isPredefined = routineCache.includes(ex.name) && !editModeId;
              const ghost = ghostData[ex.name];
              const isMatched = findExerciseMatch(ex.name, combinedDb);
              
              // Suggestions logic
              const showSuggestions = activeDropdownIndex === index && ex.name.length >= 2;
              const suggestions = showSuggestions 
                ? allKnownExercises.filter(name => name.toLowerCase().includes(ex.name.toLowerCase()) && name !== ex.name).slice(0, 5)
                : [];

              return (
                <div key={index} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)', position: 'relative' }}>
                  {/* Exercise Header Row */}
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
                        readOnly={isPredefined && ex.name !== ''}
                        style={{ 
                          opacity: isPredefined && ex.name !== '' ? 0.7 : 1,
                          background: isPredefined && ex.name !== '' ? 'rgba(0,0,0,0.2)' : 'var(--bg-color)'
                        }}
                      />
                      
                      {/* Autocomplete Dropdown */}
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
                              style={{
                                padding: '10px 12px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                color: 'var(--text-primary)'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(204, 255, 0, 0.1)'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}

                      {ghost && !editModeId && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Last: {ghost.setDetails ? `${ghost.setDetails.length} sets` : `${ghost.sets} sets`}
                        </span>
                      )}
                    </div>
                    
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Total Sets"
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

                  {/* Mapping UI for Unknown Exercises */}
                  {!isMatched && ex.name.length >= 3 && (
                    <div className="animate-fade-in" style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.9rem', color: 'var(--accent-color)', marginBottom: '12px', fontWeight: 600 }}>
                        New Exercise Detected. Please map its target muscles.
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {/* Primary Muscles */}
                        <div>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Primary Muscles</label>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {ex.customMapping.primary.map((m, mIdx) => (
                              <span key={mIdx} style={{ background: 'var(--primary-color)', color: '#000', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                                {m} <button onClick={() => removeMapping(index, 'primary', m)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'rgba(0,0,0,0.6)' }}>×</button>
                              </span>
                            ))}
                            
                            <select 
                              className="form-input" 
                              style={{ padding: '4px 8px', width: 'auto', flex: 1, minWidth: '120px' }}
                              value=""
                              onChange={(e) => addMapping(index, 'primary', e.target.value)}
                            >
                              <option value="">+ Add Primary</option>
                              {currentDayMuscles.filter(m => !ex.customMapping.primary.includes(m)).map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Secondary Muscles */}
                        <div>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Secondary Muscles (Optional)</label>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {ex.customMapping.secondary.map((m, mIdx) => (
                              <span key={mIdx} style={{ background: 'var(--surface-color-light)', color: 'var(--text-primary)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                                {m} <button onClick={() => removeMapping(index, 'secondary', m)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>×</button>
                              </span>
                            ))}
                            
                            <select 
                              className="form-input" 
                              style={{ padding: '4px 8px', width: 'auto', flex: 1, minWidth: '120px' }}
                              value=""
                              onChange={(e) => addMapping(index, 'secondary', e.target.value)}
                            >
                              <option value="">+ Add Secondary</option>
                              {currentDayMuscles.filter(m => !ex.customMapping.secondary.includes(m)).map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Individual Set Rows */}
                  {ex.setDetails && ex.setDetails.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '16px', borderLeft: '2px solid var(--border-color)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: '12px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, paddingBottom: '4px' }}>
                        <div>Set</div>
                        <div>Reps</div>
                        <div>Total Weight</div>
                      </div>
                      
                      {ex.setDetails.map((setDetail, setIndex) => (
                        <div key={setIndex} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: '12px', alignItems: 'center' }}>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            #{setIndex + 1}
                          </div>
                          <input
                            type="number"
                            className="form-input"
                            placeholder="Reps"
                            value={setDetail.reps}
                            onChange={(e) => handleSetDetailChange(index, setIndex, 'reps', e.target.value)}
                          />
                          <input
                            type="number"
                            className="form-input"
                            placeholder="Weight"
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

          <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <label className="form-label">Body Weight (kg) - Optional</label>
            <input 
              type="number" 
              step="0.1"
              className="form-input" 
              placeholder="e.g. 76.5"
              value={bodyWeight}
              onChange={(e) => setBodyWeight(e.target.value)}
              style={{ maxWidth: '200px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={handleAddExercise}>
              <Plus size={20} /> Add Exercise
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>
              <Save size={20} /> {editModeId ? 'Update Workout' : 'Save Workout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logger;
