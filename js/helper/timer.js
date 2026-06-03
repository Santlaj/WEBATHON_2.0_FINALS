import { helperState, TIMER_TOTAL, $ } from './state.js';

/**
 * Update the timer display and progress bar. Called every second.
 */
export function tickTimer() {
  const start = parseInt(localStorage.getItem('jobStart') || Date.now());
  const left = Math.max(0, TIMER_TOTAL - Math.floor((Date.now() - start) / 1000));
  const m = String(Math.floor(left / 60)).padStart(2, '0');
  const s = String(left % 60).padStart(2, '0');
  
  $('timerDigits').textContent = `${m}:${s}`;
  $('timerFill').style.width = `${(left / TIMER_TOTAL) * 100}%`;
  
  if (left === 0) {
    // Import dynamically to avoid circular dependency
    localStorage.clear();
    location.reload();
  }
}

/**
 * Start the timer interval (ticks every second).
 */
export function startTimer() {
  clearInterval(helperState.timerInterval);
  helperState.timerInterval = setInterval(tickTimer, 1000);
}
