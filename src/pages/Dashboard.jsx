import React, { useState, useEffect, useMemo } from 'react';
import { getHistory, getUserProfile } from '../utils/storage';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, Calendar, Activity, User, Scale } from 'lucide-react';

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metricType, setMetricType] = useState('weight'); // 'weight', '1rm', 'volume'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [histData, profData] = await Promise.all([getHistory(), getUserProfile()]);
        setHistory(histData);
        setProfile(profData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Process data for charts
  const { exerciseData, insights, bodyWeightData } = useMemo(() => {
    const exData = {};
    const generatedInsights = [];
    const bwData = [];
    
    if (profile) {
      const birthDate = new Date(profile.birthday);
      const age = Math.floor((new Date() - birthDate.getTime()) / 3.15576e+10);
      
      let latestWeight = profile.weight;
      
      bwData.push({
        date: "Start",
        weight: profile.weight
      });

      const sortedHistoryForW = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
      const weightHistory = sortedHistoryForW.filter(h => h.bodyWeight).map(h => ({
        date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        weight: h.bodyWeight
      }));

      bwData.push(...weightHistory);

      if (weightHistory.length > 0) {
        latestWeight = weightHistory[weightHistory.length - 1].weight;
      }

      const heightMeters = (profile.heightFt * 12 + profile.heightIn) * 0.0254;
      const currentBmi = (latestWeight / (heightMeters * heightMeters)).toFixed(1);

      generatedInsights.push({
        icon: <User size={24} color="var(--primary-color)" />,
        title: "Age",
        value: age.toString()
      });
      generatedInsights.push({
        icon: <Scale size={24} color="var(--accent-color)" />,
        title: "Current BMI",
        value: currentBmi
      });
    }

    if (history.length > 0) {
      // Sort history chronologically for the charts (oldest to newest)
      const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
      
      sortedHistory.forEach(session => {
        const dateStr = new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        
        session.exercises.forEach(ex => {
          if (!exData[ex.name]) {
            exData[ex.name] = [];
          }
          
          const reps = ex.reps || 1;
          const sets = ex.sets || 1;
          const weight = parseFloat(ex.weight) || 0;
          
          const oneRepMax = weight > 0 ? weight * (1 + (reps / 30)) : 0;
          const volume = weight * sets * reps;

          exData[ex.name].push({
            date: dateStr,
            weight: weight,
            oneRepMax: Math.round(oneRepMax),
            volume: volume
          });
        });
      });

      // Generate insights
      let totalWorkouts = history.length;
      let mostFrequentDay = '';
      const dayCounts = { Push: 0, Pull: 0, Leg: 0 };
      
      history.forEach(h => {
        if (dayCounts[h.dayType] !== undefined) dayCounts[h.dayType]++;
      });
      
      const maxCount = Math.max(dayCounts.Push, dayCounts.Pull, dayCounts.Leg);
      if (maxCount > 0) {
        mostFrequentDay = Object.keys(dayCounts).find(k => dayCounts[k] === maxCount);
      }

      generatedInsights.push({
        icon: <Calendar size={24} color="var(--primary-color)" />,
        title: "Total Workouts",
        value: totalWorkouts.toString()
      });

      if (mostFrequentDay) {
        generatedInsights.push({
          icon: <Activity size={24} color="var(--accent-color)" />,
          title: "Most Frequent",
          value: `${mostFrequentDay} Day`
        });
      }

      // Find biggest improvement (using 1RM for truer strength calculation)
      let bestImprovement = 0;
      let bestExercise = '';

      Object.entries(exData).forEach(([name, data]) => {
        if (data.length > 1) {
          const first1RM = data[0].oneRepMax;
          const last1RM = data[data.length - 1].oneRepMax;
          if (first1RM > 0) {
            const percentIncrease = ((last1RM - first1RM) / first1RM) * 100;
            if (percentIncrease > bestImprovement) {
              bestImprovement = percentIncrease;
              bestExercise = name;
            }
          }
        }
      });

      if (bestExercise && bestImprovement > 0) {
        generatedInsights.push({
          icon: <TrendingUp size={24} color="var(--success-color)" />,
          title: "Top Progress",
          value: `${bestExercise} (+${Math.round(bestImprovement)}%)`
        });
      }
    }

    return { exerciseData: exData, insights: generatedInsights, bodyWeightData: bwData };
  }, [history, profile]);

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

  if (history.length === 0 && !profile) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', marginTop: '64px' }}>
        <div style={{ color: 'var(--primary-color)', marginBottom: '16px' }}>
          <Award size={64} style={{ margin: '0 auto' }} />
        </div>
        <h2 className="text-gradient">Welcome to Gym Tracker</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
          Your dashboard is empty. Log your first Push, Pull, or Leg workout to start seeing your progress and analytics!
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 className="text-gradient" style={{ fontSize: '2.5rem', margin: '0 0 8px 0' }}>
          {profile ? `Welcome, ${profile.name}` : 'Dashboard'}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>Track your progressive overload and body metrics</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '20px',
        marginBottom: '40px'
      }}>
        {insights.map((insight, idx) => (
          <div key={idx} className={`glass-panel animate-fade-in stagger-${idx + 1}`} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
              {insight.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{insight.title}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{insight.value}</div>
            </div>
          </div>
        ))}
      </div>

      {bodyWeightData.length > 1 && (
        <div className="glass-panel animate-fade-in stagger-3" style={{ marginBottom: '40px' }}>
          <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scale size={20} color="var(--primary-color)" /> Body Weight Progression (kg)
          </h3>
          <div style={{ height: '250px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bodyWeightData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--primary-color)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="var(--accent-color)" 
                  strokeWidth={3} 
                  dot={{ fill: 'var(--accent-color)', strokeWidth: 2, r: 4 }} 
                  activeDot={{ r: 6, stroke: 'var(--primary-color)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <h3 style={{ margin: 0 }}>Exercise Progress</h3>
            
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px' }}>
              <button 
                onClick={() => setMetricType('weight')}
                style={{ 
                  background: metricType === 'weight' ? 'var(--surface-color-light)' : 'transparent',
                  color: metricType === 'weight' ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
                }}
              >Raw Weight</button>
              <button 
                onClick={() => setMetricType('1rm')}
                style={{ 
                  background: metricType === '1rm' ? 'var(--surface-color-light)' : 'transparent',
                  color: metricType === '1rm' ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
                }}
              >Est. 1RM</button>
              <button 
                onClick={() => setMetricType('volume')}
                style={{ 
                  background: metricType === 'volume' ? 'var(--surface-color-light)' : 'transparent',
                  color: metricType === 'volume' ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
                }}
              >Volume</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {Object.entries(exerciseData).filter(([_, data]) => data.length > 1).map(([name, data], idx) => (
              <div key={name} className={`glass-panel animate-fade-in stagger-${(idx % 4) + 1}`}>
                <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)' }}>{name}</h4>
                <div style={{ height: '200px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                      <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                        itemStyle={{ color: 'var(--primary-color)' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey={metricType === 'weight' ? 'weight' : metricType === '1rm' ? 'oneRepMax' : 'volume'} 
                        stroke="url(#colorGradient)" 
                        strokeWidth={3} 
                        dot={{ fill: 'var(--primary-color)', strokeWidth: 2, r: 4 }} 
                        activeDot={{ r: 6, stroke: 'var(--accent-color)' }}
                      />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="5%" stopColor="var(--primary-color)" />
                          <stop offset="95%" stopColor="var(--accent-color)" />
                        </linearGradient>
                      </defs>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
          
          {Object.values(exerciseData).every(data => data.length <= 1) && (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', marginTop: '20px' }}>
              <p style={{ color: 'var(--text-muted)' }}>Log the same exercises multiple times to see your progress charts here.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
