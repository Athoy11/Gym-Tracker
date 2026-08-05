import React, { useState, useMemo, useEffect } from 'react';
import { getHistory } from '../utils/storage';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Flame, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
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
    fetchHistory();
  }, []);

  // Process data for charts
  const { exerciseData, insights } = useMemo(() => {
    if (!history.length) return { exerciseData: {}, insights: [] };

    const exData = {};
    const recentImprovements = [];
    const plateauing = [];

    // Reverse history to process chronologically
    const chronologicalHistory = [...history].reverse();

    chronologicalHistory.forEach(entry => {
      const dateStr = new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      
      entry.exercises.forEach(ex => {
        if (!exData[ex.name]) {
          exData[ex.name] = [];
        }
        exData[ex.name].push({
          date: dateStr,
          weight: ex.weight
        });
      });
    });

    // Generate insights based on the last 3 sessions of each exercise
    Object.keys(exData).forEach(exName => {
      const data = exData[exName];
      if (data.length >= 2) {
        const last = data[data.length - 1].weight;
        const prev = data[data.length - 2].weight;
        
        if (last > prev) {
          recentImprovements.push(exName);
        } else if (last === prev && data.length >= 3 && data[data.length - 3].weight === last) {
          plateauing.push(exName);
        }
      }
    });

    const generatedInsights = [];
    if (recentImprovements.length > 0) {
      generatedInsights.push({
        type: 'success',
        icon: <TrendingUp size={24} />,
        title: "Great Progress!",
        message: `You've recently increased your weight on: ${recentImprovements.join(', ')}.`
      });
    }
    
    if (plateauing.length > 0) {
      generatedInsights.push({
        type: 'warning',
        icon: <AlertCircle size={24} />,
        title: "Plateau Alert",
        message: `Your weight hasn't changed in the last few sessions for: ${plateauing.join(', ')}. Consider a deload or changing rep ranges.`
      });
    }

    if (history.length >= 3) {
      generatedInsights.push({
        type: 'fire',
        icon: <Flame size={24} />,
        title: "Consistent!",
        message: `You've logged ${history.length} workouts. Keep the momentum going!`
      });
    }

    return { exerciseData: exData, insights: generatedInsights };
  }, [history]);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '64px', color: 'var(--text-secondary)' }}>Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '64px', color: 'var(--danger-color)' }}>
        <h2>Error Loading Dashboard</h2>
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
        <h2 style={{ color: 'var(--text-secondary)' }}>Welcome to PPL Tracker</h2>
        <p style={{ color: 'var(--text-muted)' }}>Start logging your workouts to see your progress dashboard.</p>
      </div>
    );
  }

  // Choose a top exercise to display on the chart by default
  const topExercises = Object.keys(exerciseData).filter(key => exerciseData[key].length > 1);
  
  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Your progress and insights</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {insights.map((insight, idx) => (
          <div key={idx} className={`stat-card stagger-${idx + 1}`} style={{
            borderTop: insight.type === 'success' ? '4px solid var(--success-color)' : 
                       insight.type === 'warning' ? '4px solid var(--warning-color)' : 
                       '4px solid var(--primary-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ 
                color: insight.type === 'success' ? 'var(--success-color)' : 
                       insight.type === 'warning' ? 'var(--warning-color)' : 
                       'var(--primary-color)'
              }}>
                {insight.icon}
              </div>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{insight.title}</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
              {insight.message}
            </p>
          </div>
        ))}
      </div>

      <div className="glass-panel animate-fade-in stagger-3">
        <h3 style={{ marginBottom: '24px', fontSize: '1.3rem' }}>Progress Overview</h3>
        {topExercises.length > 0 ? (
          <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--text-muted)" 
                  tick={{ fill: 'var(--text-secondary)' }}
                  allowDuplicatedCategory={false}
                />
                <YAxis 
                  stroke="var(--text-muted)" 
                  tick={{ fill: 'var(--text-secondary)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--surface-color)', 
                    borderColor: 'var(--border-color)',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                {topExercises.slice(0, 5).map((exName, idx) => {
                  const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];
                  return (
                    <Line 
                      key={exName}
                      data={exerciseData[exName]}
                      type="monotone" 
                      dataKey="weight" 
                      name={exName}
                      stroke={colors[idx % colors.length]} 
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
            Not enough data to display progress charts yet. Keep logging!
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
