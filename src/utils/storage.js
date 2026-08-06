import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, setDoc, getDoc, where } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCBR4HRYh2sgjSFuWsOZX5kIu-51X_u9QY",
  authDomain: "gym-tracker-19107.firebaseapp.com",
  projectId: "gym-tracker-19107",
  storageBucket: "gym-tracker-19107.firebasestorage.app",
  messagingSenderId: "409906165392",
  appId: "1:409906165392:web:889edc47337b877be38a15"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// Helper to check auth
const requireAuth = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be logged in to access the database.");
  return user.uid;
};

export const saveWorkout = async (dayType, exercises, workoutDate, editModeId = null, bodyWeight = null) => {
  const uid = requireAuth();
  
  let finalDate = new Date().toISOString();
  if (workoutDate) {
    const d = new Date(workoutDate);
    finalDate = new Date(d.getTime() + Math.abs(d.getTimezoneOffset() * 60000)).toISOString();
  }

  const workoutData = {
    userId: uid,
    date: finalDate,
    dayType,
    exercises
  };

  if (bodyWeight) {
    workoutData.bodyWeight = parseFloat(bodyWeight);
  }

  if (editModeId) {
    const workoutRef = doc(db, "history", editModeId);
    await updateDoc(workoutRef, workoutData);
  } else {
    await addDoc(collection(db, "history"), workoutData);
  }

  // Update routine, scoping by userId
  const routineRef = doc(db, "routines", `${uid}_${dayType}`);
  const routineSnap = await getDoc(routineRef);
  let currentRoutine = [];
  if (routineSnap.exists()) {
    currentRoutine = routineSnap.data().exercises || [];
  }

  let updated = false;
  exercises.forEach(ex => {
    if (!currentRoutine.includes(ex.name)) {
      currentRoutine.push(ex.name);
      updated = true;
    }
  });

  if (updated) {
    await setDoc(routineRef, { userId: uid, exercises: currentRoutine });
  }
};

export const deleteWorkout = async (id) => {
  requireAuth(); // Ensure logged in
  await deleteDoc(doc(db, "history", id));
};

export const getRoutine = async (dayType) => {
  const uid = requireAuth();
  const routineRef = doc(db, "routines", `${uid}_${dayType}`);
  const routineSnap = await getDoc(routineRef);
  if (routineSnap.exists()) {
    return routineSnap.data().exercises || [];
  }
  return [];
};

export const getHistory = async () => {
  const uid = requireAuth();
  
  // Single equality filter to avoid composite index requirements
  const historyQuery = query(collection(db, "history"), where("userId", "==", uid));
  const querySnapshot = await getDocs(historyQuery);
  
  const history = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Client-side sort (newest first)
  return history.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const getLastWorkout = async (dayType) => {
  const uid = requireAuth();
  
  // Fetch only this user's workouts for this specific dayType
  const historyQuery = query(
    collection(db, "history"), 
    where("userId", "==", uid),
    where("dayType", "==", dayType)
  );
  
  const querySnapshot = await getDocs(historyQuery);
  
  if (querySnapshot.empty) return null;
  
  const history = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  // Sort client-side and return the most recent one
  history.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return history[0];
};

export const getUserProfile = async () => {
  const uid = requireAuth();
  const profileRef = doc(db, "users", uid);
  const profileSnap = await getDoc(profileRef);
  if (profileSnap.exists()) {
    return profileSnap.data();
  }
  return null;
};

export const saveUserProfile = async (profileData) => {
  const uid = requireAuth();
  const profileRef = doc(db, "users", uid);
  await setDoc(profileRef, { ...profileData, updatedAt: new Date().toISOString() }, { merge: true });
};
