import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, setDoc, getDoc } from "firebase/firestore";

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

export const saveWorkout = async (dayType, exercises, workoutDate, editModeId = null) => {
  let finalDate = new Date().toISOString();
  if (workoutDate) {
    const d = new Date(workoutDate);
    finalDate = new Date(d.getTime() + Math.abs(d.getTimezoneOffset() * 60000)).toISOString();
  }

  const workoutData = {
    date: finalDate,
    dayType,
    exercises
  };

  if (editModeId) {
    const workoutRef = doc(db, "history", editModeId);
    await updateDoc(workoutRef, workoutData);
  } else {
    await addDoc(collection(db, "history"), workoutData);
  }

  // Update routine
  const routineRef = doc(db, "routines", dayType);
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
    await setDoc(routineRef, { exercises: currentRoutine });
  }
};

export const deleteWorkout = async (id) => {
  await deleteDoc(doc(db, "history", id));
};

export const getRoutine = async (dayType) => {
  const routineRef = doc(db, "routines", dayType);
  const routineSnap = await getDoc(routineRef);
  if (routineSnap.exists()) {
    return routineSnap.data().exercises || [];
  }
  return [];
};

export const getHistory = async () => {
  const historyQuery = query(collection(db, "history"), orderBy("date", "desc"));
  const querySnapshot = await getDocs(historyQuery);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
