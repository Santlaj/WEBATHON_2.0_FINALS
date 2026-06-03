// ── Map State ──────────────────────────────────────────
export let map = null;
export let markers = [];
export let polylines = [];
export let userLocation = null;

/**
 * Set the user's current location (called after geolocation resolves).
 */
export function setUserLocation(loc) {
  userLocation = loc;
}

/**
 * Initialize the Leaflet map, tile layer, and user location marker.
 */
export function initMap() {
  map = L.map('map').setView([28.7041, 77.1025], 13); // Default: Delhi

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  // Get user location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map.setView([userLocation.lat, userLocation.lng], 15);
      
      L.marker([userLocation.lat, userLocation.lng], {
        icon: L.divIcon({
          className: 'user-location-marker',
          html: '<div class="user-location-pin"></div><div class="user-location-pulse"></div>',
          iconSize: [50, 50],
          iconAnchor: [25, 50]
        })
      }).addTo(map).bindPopup('<strong>📍 Your Location</strong>');
    });
  }
}
