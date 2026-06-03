import { 
  auth, 
  db, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  doc, 
  setDoc, 
  getDoc 
} from '../config/firebase.js';

/**
 * Register a new user with Firebase Auth and create their Firestore profile.
 */
export async function registerUser(payload) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    payload.email,
    payload.password
  );

  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: payload.email,
    role: payload.role,
    fullName: payload.fullName || null,
    location: payload.location || null,
    skills: payload.skills || [],
    experience: payload.experience || null,
    status: payload.role === "helper" ? "available" : null,
    rating: 5,
    createdAt: new Date()
  });
}

/**
 * Log in an existing user, verify their role, and redirect accordingly.
 * @param {Function} onRoleMismatch - Callback when the user's role doesn't match the intended panel.
 */
export async function loginUser(payload, onRoleMismatch) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    payload.email,
    payload.password
  );

  const user = userCredential.user;
  const docSnap = await getDoc(doc(db, "users", user.uid));

  if (!docSnap.exists()) {
    throw new Error("Profile not found");
  }

  const profile = docSnap.data();

  // If role mismatch, notify the caller instead of handling DOM directly
  if (profile.role !== payload.intendedRole) {
    if (onRoleMismatch) {
      onRoleMismatch(profile.role);
    }
    return;
  }

  // Save session
  localStorage.setItem("user", JSON.stringify(profile));

  // Redirect properly
  if (profile.role === "helper") {
    window.location.replace("helper-portal.html");
  } else {
    window.location.replace("user-portal.html");
  }
}
