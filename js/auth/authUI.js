import { registerUser, loginUser } from './authService.js';

// ── State ──────────────────────────────────────────────
const state = { cust: 'reg', help: 'reg' };

// ── DOM References ─────────────────────────────────────
const tabCust = document.getElementById('tab-cust');
const tabHelp = document.getElementById('tab-help');
const panelCust = document.getElementById('panel-cust');
const panelHelp = document.getElementById('panel-help');

// ── Tab Toggling ───────────────────────────────────────
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

// ── Register / Login Toggle ────────────────────────────
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

// ── Loading Spinner ────────────────────────────────────
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

// ── Form Submission Handler ────────────────────────────
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
      await loginUser(payload, (actualRole) => {
        // Role mismatch — switch to the correct tab
        if (actualRole === "helper") {
          tabHelp.click();
        } else {
          tabCust.click();
        }
        alert(`You are registered as ${actualRole}. Please login from correct panel.`);
      });
    }
  } catch (err) {
    alert(err.message);
    console.error(err);
  } finally {
    toggleLoading(btn, false);
  }
}

// ── Event Listeners ────────────────────────────────────
document.getElementById('form-customer')
  .addEventListener('submit', (e) => handleForm(e, 'cust'));

document.getElementById('form-helper')
  .addEventListener('submit', (e) => handleForm(e, 'help'));

// ── Admin Modal ────────────────────────────────────────
document.getElementById('open-admin').addEventListener('click', () => {
  document.getElementById('admin-modal').style.display = 'flex';
});

document.getElementById('close-admin').addEventListener('click', () => {
  document.getElementById('admin-modal').style.display = 'none';
});
