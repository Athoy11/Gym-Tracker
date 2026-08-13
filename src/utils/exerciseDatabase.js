// src/utils/exerciseDatabase.js
export const baseExerciseMap = {
  // PUSH DAY
  "Bench Press": { primary: ["Chest (Pectoralis Major)"], secondary: ["Front Deltoids", "Triceps Brachii"] },
  "Incline Bench Press": { primary: ["Upper Chest (Clavicular Head)"], secondary: ["Front Deltoids", "Triceps Brachii"] },
  "Decline Bench Press": { primary: ["Lower Chest (Sternal/Costal Head)"], secondary: ["Triceps Brachii", "Front Deltoids"] },
  "Dumbbell Press": { primary: ["Chest (Pectoralis Major)"], secondary: ["Front Deltoids", "Triceps Brachii"] },
  "Incline Dumbbell Press": { primary: ["Upper Chest (Clavicular Head)"], secondary: ["Front Deltoids", "Triceps Brachii"] },
  "Incline Chest Press": { primary: ["Upper Chest (Clavicular Head)"], secondary: ["Front Deltoids", "Triceps Brachii"] },
  "Overhead Press": { primary: ["Front Deltoids", "Side Deltoids"], secondary: ["Triceps Brachii", "Upper Chest", "Trapezius"] },
  "Arnold Press": { primary: ["Front Deltoids", "Side Deltoids"], secondary: ["Triceps Brachii", "Trapezius"] },
  "Standing Dumbbell Arnold Press": { primary: ["Front Deltoids", "Side Deltoids"], secondary: ["Triceps Brachii", "Trapezius", "Core"] },
  "Lateral Raises": { primary: ["Side Deltoids (Lateral Head)"], secondary: ["Front Deltoids", "Trapezius"] },
  "Tricep Pushdowns": { primary: ["Triceps Brachii (Lateral & Medial Heads)"], secondary: ["Triceps Brachii (Long Head)"] },
  "Triceps Extension Cable": { primary: ["Triceps Brachii (Long Head)"], secondary: ["Triceps Brachii (Lateral & Medial Heads)"] },
  "Triceps Extension": { primary: ["Triceps Brachii (Long Head)"], secondary: ["Triceps Brachii (Lateral & Medial Heads)"] },
  "Skull Crushers": { primary: ["Triceps Brachii"], secondary: ["Forearms"] },
  "Dips": { primary: ["Chest (Pectoralis Major)", "Triceps Brachii"], secondary: ["Front Deltoids"] },
  "Chest Flyes": { primary: ["Chest (Pectoralis Major)"], secondary: ["Front Deltoids"] },
  "Knee Diamond Push-Up": { primary: ["Triceps Brachii", "Chest (Pectoralis Major)"], secondary: ["Front Deltoids", "Core"] },
  "Diamond Push-Up": { primary: ["Triceps Brachii", "Chest (Pectoralis Major)"], secondary: ["Front Deltoids", "Core"] },
  
  // PULL DAY
  "Deadlift": { primary: ["Hamstrings", "Gluteus Maximus", "Erector Spinae"], secondary: ["Lats", "Trapezius", "Forearms", "Core", "Quads"] },
  "Pull Ups": { primary: ["Latissimus Dorsi"], secondary: ["Biceps Brachii", "Rhomboids", "Middle/Lower Trapezius", "Rear Deltoids"] },
  "Chin Ups": { primary: ["Latissimus Dorsi", "Biceps Brachii"], secondary: ["Rhomboids", "Rear Deltoids", "Core"] },
  "Lat Pulldown": { primary: ["Latissimus Dorsi"], secondary: ["Biceps Brachii", "Rhomboids", "Rear Deltoids"] },
  "Plate Loaded Lat Pulldown": { primary: ["Latissimus Dorsi"], secondary: ["Biceps Brachii", "Rhomboids", "Middle Trapezius"] },
  "Barbell Row": { primary: ["Latissimus Dorsi", "Rhomboids", "Middle Trapezius"], secondary: ["Biceps Brachii", "Rear Deltoids", "Erector Spinae"] },
  "Dumbbell Row": { primary: ["Latissimus Dorsi", "Rhomboids"], secondary: ["Biceps Brachii", "Rear Deltoids", "Middle Trapezius"] },
  "Low Row": { primary: ["Latissimus Dorsi", "Lower Rhomboids"], secondary: ["Biceps Brachii", "Middle Trapezius"] },
  "Cable Row": { primary: ["Middle Trapezius", "Rhomboids", "Latissimus Dorsi"], secondary: ["Biceps Brachii", "Rear Deltoids"] },
  "Seated Cable Row": { primary: ["Middle Trapezius", "Rhomboids", "Latissimus Dorsi"], secondary: ["Biceps Brachii", "Rear Deltoids", "Erector Spinae"] },
  "Dumbbell Pullover": { primary: ["Latissimus Dorsi", "Chest (Pectoralis Major)"], secondary: ["Triceps Brachii (Long Head)", "Serratus Anterior"] },
  "Face Pulls": { primary: ["Rear Deltoids", "Infraspinatus", "Teres Minor"], secondary: ["Middle/Upper Trapezius", "Rhomboids"] },
  "Bicep Curls": { primary: ["Biceps Brachii"], secondary: ["Brachialis", "Brachioradialis"] },
  "Hammer Curls": { primary: ["Brachialis", "Brachioradialis"], secondary: ["Biceps Brachii"] },
  "Shrugs": { primary: ["Upper Trapezius"], secondary: ["Levator Scapulae", "Forearms"] },
  
  // LEG DAY
  "Squat": { primary: ["Quadriceps", "Gluteus Maximus"], secondary: ["Hamstrings", "Adductors", "Erector Spinae", "Core"] },
  "Front Squat": { primary: ["Quadriceps"], secondary: ["Gluteus Maximus", "Upper Back", "Core"] },
  "Smith Squats": { primary: ["Quadriceps", "Gluteus Maximus"], secondary: ["Hamstrings", "Adductors"] },
  "Leg Press": { primary: ["Quadriceps"], secondary: ["Gluteus Maximus", "Hamstrings"] },
  "Lunges": { primary: ["Quadriceps", "Gluteus Maximus"], secondary: ["Hamstrings", "Adductors", "Calves"] },
  "Bulgarian Split Squat": { primary: ["Quadriceps", "Gluteus Maximus"], secondary: ["Hamstrings", "Adductors"] },
  "Leg Extensions": { primary: ["Quadriceps (Rectus Femoris & Vastii)"], secondary: [] },
  "Leg Curls": { primary: ["Hamstrings"], secondary: ["Calves (Gastrocnemius)"] },
  "Romanian Deadlift": { primary: ["Hamstrings", "Gluteus Maximus"], secondary: ["Erector Spinae", "Adductor Magnus", "Forearms"] },
  "Calf Raises": { primary: ["Gastrocnemius", "Soleus"], secondary: [] },
  "Standing Calf Raise": { primary: ["Gastrocnemius"], secondary: ["Soleus"] },
  "Seated Calf Raises": { primary: ["Soleus"], secondary: ["Gastrocnemius"] }
};

export const musclesByDay = {
  Push: ["Chest", "Upper Chest", "Lower Chest", "Front Delts", "Side Delts", "Triceps", "Trapezius", "Forearms", "Core"],
  Pull: ["Lats", "Biceps", "Brachialis", "Brachioradialis", "Rhomboids", "Middle Trapezius", "Upper Trapezius", "Rear Delts", "Infraspinatus", "Teres Minor", "Erector Spinae", "Hamstrings", "Glutes", "Chest", "Triceps", "Serratus Anterior", "Levator Scapulae", "Forearms", "Core", "Quads"],
  Leg: ["Quads", "Hamstrings", "Glutes", "Adductors", "Gastrocnemius", "Soleus", "Erector Spinae", "Upper Back", "Forearms", "Core"]
};

// All known muscles for radar chart plotting
export const allMuscles = Array.from(new Set([
  ...musclesByDay.Push,
  ...musclesByDay.Pull,
  ...musclesByDay.Leg
]));

/**
 * Normalizes a string for comparison by removing text in parentheses/brackets 
 * (e.g., "(Machine)", "[Dumbbell]") and stripping special characters.
 */
const normalize = (str) => {
  return str
    .toLowerCase()
    .replace(/\(.*?\)/g, '') // Remove (Machine), etc
    .replace(/\[.*?\]/g, '') // Remove [Smith], etc
    .replace(/[^a-z0-9]/g, '');
};

/**
 * Calculates Levenshtein distance between two strings
 */
const levenshtein = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1  // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

/**
 * Attempts to find a matching exercise using normalization and fuzzy matching
 * Returns the matched key from the database, or null if no confident match.
 */
export const findExerciseMatch = (searchStr, db) => {
  if (!searchStr) return null;
  const normSearch = normalize(searchStr);
  if (normSearch.length < 3) return null;

  const keys = Object.keys(db);
  
  // 1. Exact normalized match
  for (let key of keys) {
    if (normalize(key) === normSearch) return key;
  }

  // 2. Fuzzy match (allow max distance based on string length, e.g., 2 typos for medium strings)
  let bestMatch = null;
  let minDistance = Infinity;

  for (let key of keys) {
    const normKey = normalize(key);
    const dist = levenshtein(normSearch, normKey);
    // Allowable distance: up to 2, or 3 for very long strings
    const threshold = Math.max(1, Math.floor(normKey.length / 4));
    
    if (dist <= threshold && dist < minDistance) {
      minDistance = dist;
      bestMatch = key;
    }
  }

  return bestMatch;
};
