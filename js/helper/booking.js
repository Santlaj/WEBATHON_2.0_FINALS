import { helperState, CUSTOMERS, DISTANCES, JOBS, $ } from './state.js';
import { updateBadge, showActiveJobUI } from './badge.js';
import { openTracking } from './tracking.js';

/**
 * Show the booking popup with a random job, customer, and countdown ring.
 */
export function showBooking() {
  helperState.currentJob = JOBS[Math.floor(Math.random() * JOBS.length)];
  helperState.currentCustomer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
  helperState.currentDistance = DISTANCES[Math.floor(Math.random() * DISTANCES.length)];

  $('popupService').textContent = `${helperState.currentJob.icon} ${helperState.currentJob.type}`;
  $('popupCustomer').textContent = helperState.currentCustomer;
  $('popupDistance').textContent = `~${helperState.currentDistance}`;
  $('bookingPopup').classList.remove('hidden');

  navigator.geolocation.getCurrentPosition((pos) => {
    localStorage.setItem('custLat', pos.coords.latitude + 0.01);
    localStorage.setItem('custLng', pos.coords.longitude + 0.01);
    localStorage.setItem('custName', helperState.currentCustomer);
    localStorage.setItem('custDistance', helperState.currentDistance);
  });

  helperState.bookingSecsLeft = 15;
  renderRing(helperState.bookingSecsLeft);
  clearInterval(helperState.bookingCountdown);
  helperState.bookingCountdown = setInterval(() => {
    helperState.bookingSecsLeft--;
    renderRing(helperState.bookingSecsLeft);
    if (helperState.bookingSecsLeft <= 0) {
      clearInterval(helperState.bookingCountdown);
      autoCancelBooking();
    }
  }, 1000);
}

/**
 * Render the countdown ring animation.
 */
export function renderRing(secs) {
  const offset = 132 * (1 - (secs / 15));
  $('ringArc').style.strokeDashoffset = offset;
  $('ringNum').textContent = Math.max(0, secs);
}

/**
 * Accept the current booking — save job data and open tracking.
 */
export function acceptBooking() {
  clearInterval(helperState.bookingCountdown);
  $('bookingPopup').classList.add('hidden');
  localStorage.setItem('jobActive', 'true');
  localStorage.setItem('jobType', helperState.currentJob.type);
  localStorage.setItem('jobIcon', helperState.currentJob.icon);
  localStorage.setItem('jobStart', Date.now());
  updateBadge('active');
  showActiveJobUI(true);
  openTracking();
}

/**
 * Decline the current booking.
 */
export function rejectBooking() {
  clearInterval(helperState.bookingCountdown);
  $('bookingPopup').classList.add('hidden');
}

/**
 * Auto-cancel when the countdown expires.
 */
function autoCancelBooking() {
  $('bookingPopup').classList.add('hidden');
}
