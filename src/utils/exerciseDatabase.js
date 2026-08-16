// src/utils/exerciseDatabase.js
export const baseExerciseMap = {
  // PUSH DAY
  "Bench Press": { primary: ["Chest"], secondary: ["Front Delts", "Triceps"] },
  "Incline Bench Press": { primary: ["Upper Chest"], secondary: ["Front Delts", "Triceps"] },
  "Decline Bench Press": { primary: ["Lower Chest"], secondary: ["Triceps", "Front Delts"] },
  "Dumbbell Press": { primary: ["Chest"], secondary: ["Front Delts", "Triceps"] },
  "Incline Dumbbell Press": { primary: ["Upper Chest"], secondary: ["Front Delts", "Triceps"] },
  "Incline Chest Press": { primary: ["Upper Chest"], secondary: ["Front Delts", "Triceps"] },
  "Overhead Press": { primary: ["Front Delts", "Side Delts"], secondary: ["Triceps", "Upper Chest", "Trapezius"] },
  "Arnold Press": { primary: ["Front Delts", "Side Delts"], secondary: ["Triceps", "Trapezius"] },
  "Standing Dumbbell Arnold Press": { primary: ["Front Delts", "Side Delts"], secondary: ["Triceps", "Trapezius", "Core"] },
  "Lateral Raises": { primary: ["Side Delts"], secondary: ["Front Delts", "Trapezius"] },
  "Tricep Pushdowns": { primary: ["Triceps"], secondary: [] },
  "Triceps Extension Cable": { primary: ["Triceps"], secondary: [] },
  "Triceps Extension": { primary: ["Triceps"], secondary: [] },
  "Skull Crushers": { primary: ["Triceps"], secondary: ["Forearms"] },
  "Dips": { primary: ["Chest", "Triceps"], secondary: ["Front Delts"] },
  "Chest Flyes": { primary: ["Chest"], secondary: ["Front Delts"] },
  "Knee Diamond Push-Up": { primary: ["Triceps", "Chest"], secondary: ["Front Delts", "Core"] },
  "Diamond Push-Up": { primary: ["Triceps", "Chest"], secondary: ["Front Delts", "Core"] },
  
  // PULL DAY
  "Deadlift": { primary: ["Hamstrings", "Glutes", "Erector Spinae"], secondary: ["Lats", "Trapezius", "Forearms", "Core", "Quads"] },
  "Pull Ups": { primary: ["Lats"], secondary: ["Biceps", "Rhomboids", "Middle Trapezius", "Rear Delts"] },
  "Chin Ups": { primary: ["Lats", "Biceps"], secondary: ["Rhomboids", "Rear Delts", "Core"] },
  "Lat Pulldown": { primary: ["Lats"], secondary: ["Biceps", "Rhomboids", "Rear Delts"] },
  "Plate Loaded Lat Pulldown": { primary: ["Lats"], secondary: ["Biceps", "Rhomboids", "Middle Trapezius"] },
  "Barbell Row": { primary: ["Lats", "Rhomboids", "Middle Trapezius"], secondary: ["Biceps", "Rear Delts", "Erector Spinae"] },
  "Dumbbell Row": { primary: ["Lats", "Rhomboids"], secondary: ["Biceps", "Rear Delts", "Middle Trapezius"] },
  "Low Row": { primary: ["Lats"], secondary: ["Biceps", "Middle Trapezius"] },
  "Cable Row": { primary: ["Middle Trapezius", "Rhomboids", "Lats"], secondary: ["Biceps", "Rear Delts"] },
  "Seated Cable Row": { primary: ["Middle Trapezius", "Rhomboids", "Lats"], secondary: ["Biceps", "Rear Delts", "Erector Spinae"] },
  "Dumbbell Pullover": { primary: ["Lats", "Chest"], secondary: ["Triceps", "Serratus Anterior"] },
  "Face Pulls": { primary: ["Rear Delts", "Infraspinatus", "Teres Minor"], secondary: ["Upper Trapezius", "Rhomboids"] },
  "Bicep Curls": { primary: ["Biceps"], secondary: ["Brachialis", "Brachioradialis"] },
  "Hammer Curls": { primary: ["Brachialis", "Brachioradialis"], secondary: ["Biceps"] },
  "Shrugs": { primary: ["Upper Trapezius"], secondary: ["Levator Scapulae", "Forearms"] },
  
  // LEG DAY
  "Squat": { primary: ["Quads", "Glutes"], secondary: ["Hamstrings", "Adductors", "Erector Spinae", "Core"] },
  "Front Squat": { primary: ["Quads"], secondary: ["Glutes", "Upper Back", "Core"] },
  "Smith Squats": { primary: ["Quads", "Glutes"], secondary: ["Hamstrings", "Adductors"] },
  "Leg Press": { primary: ["Quads"], secondary: ["Glutes", "Hamstrings"] },
  "Lunges": { primary: ["Quads", "Glutes"], secondary: ["Hamstrings", "Adductors", "Gastrocnemius"] },
  "Bulgarian Split Squat": { primary: ["Quads", "Glutes"], secondary: ["Hamstrings", "Adductors"] },
  "Leg Extensions": { primary: ["Quads"], secondary: [] },
  "Leg Curls": { primary: ["Hamstrings"], secondary: ["Gastrocnemius"] },
  "Romanian Deadlift": { primary: ["Hamstrings", "Glutes"], secondary: ["Erector Spinae", "Forearms"] },
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
