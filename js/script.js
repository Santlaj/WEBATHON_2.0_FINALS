
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
createUserWithEmailAndPassword, 
signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
     getDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


const firebaseConfig = {
apiKey: "AIzaSyDN7IYjTiwxYHanyRqXNlIvF3kEj5-mFN8",
authDomain: "hack-11e58.firebaseapp.com",
projectId: "hack-11e58",
storageBucket: "hack-11e58.firebasestorage.app",
messagingSenderId: "199897526947",
appId: "1:199897526947:web:8b878c57bfa52148eb0516",
measurementId: "G-VS496BDVEY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);




const state = { cust: 'reg', help: 'reg' };

const tabCust = document.getElementById('tab-cust');
const tabHelp = document.getElementById('tab-help');
const panelCust = document.getElementById('panel-cust');
const panelHelp = document.getElementById('panel-help');

tabCust.onclick = () => {
  tabCust.classList.add('active-customer');
  tabHelp.classList.remove('active-helper');
  panelCust.classList.add('active');
  panelHelp.classList.remove('active');
};

tabHelp.onclick = () => {
  tabHelp.classList.add('active-helper');
  tabCust.classList.remove('active-customer');
  panelHelp.classList.add('active');
  panelCust.classList.remove('active');
};

function toggleUI(role) {
  state[role] = state[role] === 'reg' ? 'login' : 'reg';
  const isReg = state[role] === 'reg';

  const fields = document.querySelectorAll(`.${role}-reg-field`);
  fields.forEach(f => f.classList.toggle('hidden', !isReg));

  document.getElementById(`${role}-title`).innerText =
    isReg ? (role === 'cust' ? 'Create Account' : 'Become a Helper') : 'Welcome Back';

  document.getElementById(`${role}-btn-text`).innerText =
    isReg ? (role === 'cust' ? 'Get Started' : 'Register as Helper') : 'Login';

  const switcher = document.getElementById(`${role}-switcher`);
  switcher.childNodes[0].nodeValue =
    isReg ? 'Already have an account? ' : 'New here? ';
  switcher.querySelector('span').innerText =
    isReg ? 'Login' : 'Create Account';
}

document.getElementById('cust-switcher').onclick = () => toggleUI('cust');
document.getElementById('help-switcher').onclick = () => toggleUI('help');



async function registerUser(payload) {

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

// login 
async function loginUser(payload) {

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

  // 🔍 If role mismatch, automatically switch tab instead of throwing error
  if (profile.role !== payload.intendedRole) {

    if (profile.role === "helper") {
      tabHelp.click();
    } else {
      tabCust.click();
    }

    alert(`You are registered as ${profile.role}. Please login from correct panel.`);
    return;
  }

  // Save session
  localStorage.setItem("user", JSON.stringify(profile));

  // Redirect properly
  if (profile.role === "helper") {
    window.location.replace("helper.html");
  } else {
    window.location.replace("user-dashboard.html");
  }
}



// form
async function handleForm(e, role) {
  e.preventDefault();
  
  const form = e.target;
  const btn = form.querySelector('button');
  const isRegistering = state[role] === 'reg';

  toggleLoading(btn, true);

  const formData = new FormData(form);

  let payload = {
    email: role === "cust"
      ? formData.get("contact")
      : formData.get("email"),
    password: formData.get("pass"),
    intendedRole: role === "cust" ? "user" : "helper"
  };

  if (isRegistering) {

    if (payload.password !== formData.get("confirm")) {
      alert("Passwords do not match");
      toggleLoading(btn, false);
      return;
    }

    if (role === "cust") {
      payload.role = "user";
      payload.fullName = formData.get("name");
      payload.location = formData.get("location");
    } else {
      payload.role = "helper";
      payload.fullName = formData.get("name");
      payload.skills = [formData.get("skills")];
      payload.experience = formData.get("exp");
    }
  }

  try {
    if (isRegistering) {
      await registerUser(payload);
      alert("Account created successfully. Please login.");
      toggleUI(role);
    } else {
      await loginUser(payload);
    }

  } catch (err) {
    alert(err.message);
    console.error(err);
  } finally {
    toggleLoading(btn, false);
  }
}

function toggleLoading(btn, isLoading) {
  const text = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.spinner');

  if (isLoading) {
    text.classList.add('hidden');
    spinner.style.display = 'block';
  } else {
    text.classList.remove('hidden');
    spinner.style.display = 'none';
  }
}

document.getElementById('form-customer')
  .addEventListener('submit', (e) => handleForm(e, 'cust'));

document.getElementById('form-helper')
  .addEventListener('submit', (e) => handleForm(e, 'help'));

