import { $ } from './state.js';

/**
 * Update the status badge (offline / online / active-job).
 */
export function updateBadge(state) {
  const el = $('statusBadge');
  const states = {
    offline: ['badge offline', 'Offline'],
    online: ['badge online', 'Online'],
    active: ['badge active-job', 'Active Job'],
  };
  const [cls, lbl] = states[state];
  el.className = cls;
  el.innerHTML = `<span class="badge-dot"></span> ${lbl}`;
}

/**
 * Set the waiting/status text below action buttons.
 */
export function setWaitingText(txt) {
  $('waitingText').textContent = txt;
}

/**
 * Show or hide the active job strip and action buttons.
 */
export function showActiveJobUI(show) {
  if (show) {
    $('activeStrip').classList.remove('hidden');
    $('activeActions').classList.remove('hidden');
    $('waitingText').textContent = '';
    $('stripJobType').textContent = 
      (localStorage.getItem('custName') || '') + ' · ~' + (localStorage.getItem('custDistance') || '');
    $('stripTag').textContent = 
      (localStorage.getItem('jobIcon') || '🔧') + ' ' + (localStorage.getItem('jobType') || 'Plumbing');
  } else {
    $('activeStrip').classList.add('hidden');
    $('activeActions').classList.add('hidden');
  }
}
