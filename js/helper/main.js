import { helperState, $ } from './state.js';
import { updateBadge, setWaitingText, showActiveJobUI } from './badge.js';
import { startGPS, stopGPS, clearWatch } from './gps.js';
import { showBooking, acceptBooking, rejectBooking } from './booking.js';
import { openTracking, returnToDashboard } from './tracking.js';
import { tickTimer } from './timer.js';
import { completeJob, confirmComplete, dismissComplete, cancelJob, confirmCancel, dismissCancel } from './jobActions.js';

// ── Online / Offline ──────────────────────────────────
function goOnline() {
  if (localStorage.getItem('jobActive') === 'true') {
    $('activeJobPopup').classList.remove('hidden');
    return;
  }
  if (helperState.isOnline) {
    return;
  }
  helperState.isOnline = true;
  updateBadge('online');
  setWaitingText('Waiting for a booking request…');
  startGPS();
  setTimeout(() => {
    if (helperState.isOnline) {
      showBooking();
    }
  }, 4000);
}

function goOffline() {
  if (localStorage.getItem('jobActive') === 'true') {
    $('activeJobPopup').classList.remove('hidden');
    return;
  }
  helperState.isOnline = false;
  updateBadge('offline');
  setWaitingText('You are offline');
  stopGPS();
  clearWatch();
}

// ── Bootstrap ─────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Restore active job if exists
  if (localStorage.getItem('jobActive') === 'true') {
    helperState.isOnline = true;
    updateBadge('active');
    setWaitingText('');
    showActiveJobUI(true);
    tickTimer();
  }

  // ── Bind all event listeners (replacing inline onclick) ──
  // Dashboard buttons
  $('btnGoOnline').addEventListener('click', goOnline);
  $('btnGoOffline').addEventListener('click', goOffline);

  // Active job actions
  $('btnResumeJob').addEventListener('click', openTracking);
  $('btnCancelDashboard').addEventListener('click', cancelJob);

  // Tracking view buttons
  $('btnBack').addEventListener('click', returnToDashboard);
  $('btnCompleteJob').addEventListener('click', completeJob);
  $('btnCancelTracking').addEventListener('click', cancelJob);

  // Booking popup
  $('btnAcceptBooking').addEventListener('click', acceptBooking);
  $('btnDeclineBooking').addEventListener('click', rejectBooking);

  // Cancel popup
  $('btnConfirmCancel').addEventListener('click', confirmCancel);
  $('btnDismissCancel').addEventListener('click', dismissCancel);

  // Active job popup
  $('btnGoToJob').addEventListener('click', () => {
    $('activeJobPopup').classList.add('hidden');
    openTracking();
  });
  $('btnDismissActiveJob').addEventListener('click', () => {
    $('activeJobPopup').classList.add('hidden');
  });

  // Complete popup
  $('btnConfirmComplete').addEventListener('click', confirmComplete);
  $('btnDismissComplete').addEventListener('click', dismissComplete);
});
