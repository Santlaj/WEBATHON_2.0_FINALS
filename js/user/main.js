import { initMap } from './map.js';
import { addBooking, handleBookingAction, closePopup, confirmDeactivate } from './bookingManager.js';

// ── Bootstrap ─────────────────────────────────────────
// Initialize map immediately
initMap();

// Bind event listeners (replacing inline onclick)
document.getElementById('btnBookTrack').addEventListener('click', addBooking);

// Event delegation for booking list (handles both focus and deactivate)
document.getElementById('bookingsList').addEventListener('click', handleBookingAction);

// Popup buttons
document.getElementById('btnPopupCancel').addEventListener('click', closePopup);
document.getElementById('confirmDeactivateBtn').addEventListener('click', confirmDeactivate);
