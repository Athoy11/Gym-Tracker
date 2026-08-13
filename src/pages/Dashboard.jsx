import React, { useState, useEffect, useMemo } from 'react';
import { getHistory, getUserProfile, getCustomExerciseMap } from '../utils/storage';
import { baseExerciseMap, findExerciseMatch, allMuscles } from '../utils/exerciseDatabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { TrendingUp, Award, Calendar, Activity, User, Scale } from 'lucide-react';

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState(null);
  const [customMap, setCustomMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metricType, setMetricType] = useState('weight');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [histData, profData, customMapData] = await Promise.all([
          getHistory(), 
          getUserProfile(),
          getCustomExerciseMap()
        ]);
        setHistory(histData);
        setProfile(profData);
        setCustomMap(customMapData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const { exerciseData, insights, bodyWeightData, muscleRadarData } = useMemo(() => {
    const exData = {};
    const generatedInsights = [];
    const bwData = [];
    
    // Muscle Engagement Aggregator
    const muscleVolumeMap = {};
    allMuscles.forEach(m => { muscleVolumeMap[m] = 0; });
    const combinedDb = { ...baseExerciseMap, ...customMap };
    
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
      // Date limits (Last 60 days for muscle radar)
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
      
      sortedHistory.forEach(session => {
        const sessionDate = new Date(session.date);
        const dateStr = sessionDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const isWithin60Days = sessionDate >= sixtyDaysAgo;
        
        session.exercises.forEach(ex => {
          if (!exData[ex.name]) {
            exData[ex.name] = [];
          }
          
          let totalVolume = 0;
          let max1RM = 0;
          let maxWeight = 0;

          if (ex.setDetails && ex.setDetails.length > 0) {
            ex.setDetails.forEach(s => {
              const sReps = parseInt(s.reps) || 0;
              const sWeight = parseFloat(s.weight) || 0;
              if (sReps > 0 && sWeight > 0) {
                totalVolume += (sReps * sWeight);
                const current1RM = sWeight * (1 + (sReps / 30));
                if (current1RM > max1RM) max1RM = current1RM;
                if (sWeight > maxWeight) maxWeight = sWeight;
              }
            });
          } else {
            // Legacy Support
            const reps = ex.reps || 1;
            const sets = ex.sets || 1;
            const weight = parseFloat(ex.weight) || 0;
            
            totalVolume = weight * sets * reps;
            max1RM = weight > 0 ? weight * (1 + (reps / 30)) : 0;
            maxWeight = weight;
          }

          if (maxWeight > 0 || max1RM > 0 || totalVolume > 0) {
            exData[ex.name].push({
              date: dateStr,
              weight: maxWeight,
              oneRepMax: Math.round(max1RM),
              volume: totalVolume
            });
          }

          // Muscle Engagement (only last 60 days)
          if (isWithin60Days) {
            const matchedKey = findExerciseMatch(ex.name, combinedDb);
            if (matchedKey) {
              const mapping = combinedDb[matchedKey];
              mapping.primary.forEach(m => {
                if (muscleVolumeMap[m] !== undefined) muscleVolumeMap[m] += totalVolume * 1.0;
              });
              if (mapping.secondary) {
                mapping.secondary.forEach(m => {
                  if (muscleVolumeMap[m] !== undefined) muscleVolumeMap[m] += totalVolume * 0.5;
                });
              }
            }
          }
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

    // Format Radar Data (only keeping muscles that have some volume or are major)
    const radarData = Object.keys(muscleVolumeMap)
      .map(muscle => ({
        muscle,
        volume: Math.round(muscleVolumeMap[muscle])
      }))
      .filter(m => m.volume > 0) // Filter out zero volume to keep the chart clean
      .sort((a, b) => b.volume - a.volume); // Sort to group large volumes if possible

    return { exerciseData: exData, insights: generatedInsights, bodyWeightData: bwData, muscleRadarData: radarData };
  }, [history, profile, customMap]);

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

      {muscleRadarData.length > 2 && (
        <div className="glass-panel animate-fade-in stagger-2" style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ margin: '0 0 20px 0', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--primary-color)" /> Muscle Engagement Overview (Last 60 Days)
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px', alignSelf: 'flex-start' }}>
            This radar chart shows which muscles received the most volume based on your exercise mapping.
          </p>
          <div style={{ height: '400px', width: '100%', maxWidth: '600px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={muscleRadarData}>
                <PolarGrid stroke="var(--border-color)" />
                <PolarAngleAxis dataKey="muscle" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                <Radar name="Volume" dataKey="volume" stroke="var(--primary-color)" fill="var(--primary-color)" fillOpacity={0.4} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--primary-color)' }}
                  formatter={(value) => [`${value.toLocaleString()} lbs`, 'Volume']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

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
