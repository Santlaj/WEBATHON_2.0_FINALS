import { helperState, $ } from './state.js';
import { beginWatch } from './gps.js';
import { startTimer } from './timer.js';

/**
 * Open the tracking view with the Leaflet map and start the timer.
 */
export function openTracking() {
  $('dashboardView').classList.add('hidden');
  $('trackingView').classList.remove('hidden');
  startTimer();

  const custPos = [
    parseFloat(localStorage.getItem('custLat')),
    parseFloat(localStorage.getItem('custLng'))
  ];
  
  setTimeout(() => {
    if (!helperState.map) {
      helperState.map = L.map('map').setView(custPos, 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(helperState.map);
      helperState.customerMarker = L.marker(custPos).addTo(helperState.map).bindPopup('Customer').openPopup();
      helperState.helperMarker = L.marker(custPos).addTo(helperState.map);
      helperState.routeLine = L.polyline([custPos, custPos], { 
        color: '#4f6ef7', 
        weight: 3, 
        dashArray: '7 5' 
      }).addTo(helperState.map);
    } else {
      helperState.map.invalidateSize();
    }
    beginWatch(custPos);
  }, 200);
}

/**
 * Return from tracking view back to the dashboard.
 */
export function returnToDashboard() {
  $('trackingView').classList.add('hidden');
  $('dashboardView').classList.remove('hidden');
}
