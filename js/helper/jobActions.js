import { $ } from './state.js';

/**
 * Show the "Complete Job?" confirmation popup.
 */
export function completeJob() {
  $('completePopup').classList.remove('hidden');
}

/**
 * Confirm job completion — clear state and reload.
 */
export function confirmComplete() {
  localStorage.clear();
  location.reload();
}

/**
 * Dismiss the complete popup.
 */
export function dismissComplete() {
  $('completePopup').classList.add('hidden');
}

/**
 * Show the "Cancel Job?" confirmation popup.
 */
export function cancelJob() {
  $('cancelPopup').classList.remove('hidden');
}

/**
 * Confirm job cancellation — clear state and reload.
 */
export function confirmCancel() {
  localStorage.clear();
  location.reload();
}

/**
 * Dismiss the cancel popup.
 */
export function dismissCancel() {
  $('cancelPopup').classList.add('hidden');
}
