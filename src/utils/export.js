export const exportHistoryToCSV = (historyData) => {
  if (!historyData || historyData.length === 0) {
    alert("No data available to export.");
    return;
  }
  
  let csvContent = "Date,Day Type,Body Weight (kg),Exercise,Set Number,Reps,Weight,Unit\n";
  
  // Sort history by date descending
  const sortedHistory = [...historyData].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  sortedHistory.forEach(entry => {
    const date = entry.date;
    const dayType = entry.dayType;
    const bw = entry.bodyWeight || '';
    
    entry.exercises.forEach(ex => {
      const name = `"${ex.name.replace(/"/g, '""')}"`;
      const unit = ex.unit || 'Kgs';
      
      if (ex.setDetails && ex.setDetails.length > 0) {
        ex.setDetails.forEach((set, idx) => {
          csvContent += `${date},${dayType},${bw},${name},${idx + 1},${set.reps},${set.weight},${unit}\n`;
        });
      } else {
        csvContent += `${date},${dayType},${bw},${name},1,${ex.reps || ''},${ex.weight || ''},${unit}\n`;
      }
    });
  });
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `gym_tracker_history_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportDashboardToCSV = (exerciseData, bodyWeightData, muscleRadarData) => {
  let csvContent = "";

  // 1. Muscle Engagement
  if (muscleRadarData && muscleRadarData.length > 0) {
    csvContent += "--- MUSCLE ENGAGEMENT OVERVIEW ---\n";
    csvContent += "Muscle,Volume (kg)\n";
    muscleRadarData.forEach(item => {
      csvContent += `"${item.muscle}",${item.volume}\n`;
    });
    csvContent += "\n\n";
  }

  // 2. Body Weight
  if (bodyWeightData && bodyWeightData.length > 0) {
    csvContent += "--- BODY WEIGHT PROGRESSION ---\n";
    csvContent += "Date,Weight (kg)\n";
    bodyWeightData.forEach(item => {
      csvContent += `"${item.date}",${item.weight}\n`;
    });
    csvContent += "\n\n";
  }

  // 3. Exercise Progress
  if (exerciseData && Object.keys(exerciseData).length > 0) {
    csvContent += "--- EXERCISE PROGRESS ---\n";
    csvContent += "Exercise,Date,Max Weight,Est 1RM,Volume\n";
    
    Object.entries(exerciseData).forEach(([name, data]) => {
      const safeName = `"${name.replace(/"/g, '""')}"`;
      data.forEach(entry => {
        csvContent += `${safeName},"${entry.date}",${entry.weight},${entry.oneRepMax},${entry.volume}\n`;
      });
    });
  }

  if (!csvContent.trim()) {
    alert("No dashboard data available to export.");
    return;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `gym_tracker_dashboard_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
