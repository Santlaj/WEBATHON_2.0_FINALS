import { helperState } from './state.js';

/**
 * Start polling GPS position every 5 seconds and store in localStorage.
 */
export function startGPS() {
  helperState.gpsInterval = setInterval(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      localStorage.setItem('helperLat', pos.coords.latitude);
      localStorage.setItem('helperLng', pos.coords.longitude);
    });
  }, 5000);
}

/**
 * Stop the GPS polling interval.
 */
export function stopGPS() {
  clearInterval(helperState.gpsInterval);
}

/**
 * Clear the geolocation watchPosition watcher.
 */
export function clearWatch() {
  if (helperState.watchId !== null) {
    navigator.geolocation.clearWatch(helperState.watchId);
    helperState.watchId = null;
  }
}

/**
 * Begin live-tracking the helper's position on the map.
 */
export function beginWatch(custPos) {
  clearWatch();
  helperState.watchId = navigator.geolocation.watchPosition((pos) => {
    const hp = [pos.coords.latitude, pos.coords.longitude];
    helperState.helperMarker.setLatLng(hp);
    helperState.routeLine.setLatLngs([custPos, hp]);
    helperState.map.panTo(hp);
  });
}
