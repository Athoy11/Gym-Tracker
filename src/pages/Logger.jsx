import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRoutine, saveWorkout } from '../utils/storage';
import { Plus, Trash2, Save, Activity, Calendar } from 'lucide-react';

const Logger = () => {
  const [dayType, setDayType] = useState('');
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState([]);
  const [editModeId, setEditModeId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we are editing an existing workout
    if (location.state && location.state.editWorkout) {
      const { id, dayType: dt, date, exercises: ex } = location.state.editWorkout;
      setEditModeId(id);
      setDayType(dt);
      setWorkoutDate(new Date(date).toISOString().split('T')[0]);
      
      const formattedEx = ex.map(e => ({
        name: e.name,
        weight: e.weight || '',
        sets: e.sets || '',
        reps: e.reps || '',
        unit: e.unit || 'lbs'
      }));
      setExercises(formattedEx);
      return;
    }

    const fetchRoutine = async () => {
      try {
        if (dayType && !editModeId) {
          const routine = await getRoutine(dayType);
          if (routine.length > 0) {
            setExercises(routine.map(name => ({ name, weight: '', sets: '', reps: '', unit: 'lbs' })));
          } else {
            setExercises([{ name: '', weight: '', sets: '', reps: '', unit: 'lbs' }]);
          }
        } else if (!editModeId) {
          setExercises([]);
        }
      } catch (err) {
        console.error(err);
        alert(`Error loading routine: ${err.message}. Check your Firebase permissions.`);
      }
    };
    fetchRoutine();
  }, [dayType, location.state, editModeId]);

  const [routineCache, setRoutineCache] = useState([]);
  
  useEffect(() => {
    if (dayType) {
      getRoutine(dayType).then(setRoutineCache);
    }
  }, [dayType]);

  const handleAddExercise = () => {
    setExercises([...exercises, { name: '', weight: '', sets: '', reps: '', unit: 'lbs' }]);
  };

  const handleRemoveExercise = (index) => {
    const newEx = [...exercises];
    newEx.splice(index, 1);
    setExercises(newEx);
  };

  const handleChange = (index, field, value) => {
    const newEx = [...exercises];
    newEx[index][field] = value;
    setExercises(newEx);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const validExercises = exercises.filter(ex => ex.name.trim() !== '' && ex.weight !== '');
    if (validExercises.length === 0) return alert("Please enter at least one valid exercise with weight.");
    
    setIsSaving(true);
    const formattedEx = validExercises.map(ex => ({
      ...ex,
      weight: parseFloat(ex.weight) || 0,
      sets: parseInt(ex.sets) || 0,
      reps: parseInt(ex.reps) || 0,
      unit: ex.unit || 'lbs'
    }));

    await saveWorkout(dayType, formattedEx, workoutDate, editModeId);
    setIsSaving(false);
    navigate('/history');
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
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
                  disabled={editModeId !== null} // Don't allow changing day type while editing
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
        <div className="glass-panel animate-fade-in stagger-1" style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Exercises</h3>
            {routineCache.length === 0 && !editModeId && (
              <span style={{ fontSize: '0.85rem', color: 'var(--success-color)', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                First Time Setup
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <div className="exercise-header" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
              <div>Exercise</div>
              <div>Sets</div>
              <div>Reps</div>
              <div>Weight</div>
              <div>Unit</div>
              <div style={{ width: '44px' }}></div>
            </div>

            {exercises.map((ex, index) => {
              const isPredefined = routineCache.includes(ex.name) && !editModeId;
              return (
                <div key={index} className="exercise-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Name"
                    value={ex.name}
                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                    readOnly={isPredefined && ex.name !== ''}
                    style={{ 
                      opacity: isPredefined && ex.name !== '' ? 0.7 : 1,
                      background: isPredefined && ex.name !== '' ? 'rgba(0,0,0,0.2)' : 'var(--bg-color)'
                    }}
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Sets"
                    value={ex.sets}
                    onChange={(e) => handleChange(index, 'sets', e.target.value)}
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Reps"
                    value={ex.reps}
                    onChange={(e) => handleChange(index, 'reps', e.target.value)}
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Weight"
                    value={ex.weight}
                    onChange={(e) => handleChange(index, 'weight', e.target.value)}
                  />
                  <select 
                    className="form-input" 
                    value={ex.unit}
                    onChange={(e) => handleChange(index, 'unit', e.target.value)}
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
              );
            })}
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
