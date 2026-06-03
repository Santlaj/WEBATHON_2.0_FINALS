import { map, markers, polylines, userLocation } from './map.js';

// ── Booking State ──────────────────────────────────────
let bookings = [];
let pendingDeactivateId = null;

/**
 * Generate a random lat/lng near the given coordinates.
 */
function getRandomLocationNearby(lat, lng, radiusInMeters = 100) {
  const radiusInDegrees = radiusInMeters / 111000;
  const u = Math.random(), v = Math.random();
  const w = radiusInDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  return { lat: lat + w * Math.cos(t), lng: lng + w * Math.sin(t) };
}

/**
 * Create a new booking from form data, add marker and polyline to map.
 */
export function addBooking() {
  const customerName = document.getElementById('customerName').value.trim();
  const bookingType = document.getElementById('bookingType').value;
  const address = document.getElementById('address').value.trim();

  if (!customerName || !address) {
    alert('Please fill in all fields');
    return;
  }

  const randomLoc = getRandomLocationNearby(userLocation.lat, userLocation.lng);
  const booking = {
    id: Date.now(),
    customerName,
    bookingType,
    address,
    lat: randomLoc.lat,
    lng: randomLoc.lng,
    time: new Date().toLocaleString(),
    status: 'active'
  };

  bookings.push(booking);
  
  // Create Marker
  const marker = L.marker([booking.lat, booking.lng], {
    icon: L.divIcon({
      className: 'booking-marker',
      html: `<div style="font-size: 24px;">📍</div>`,
      iconSize: [40, 40]
    })
  }).addTo(map);

  markers.push({ id: booking.id, marker });

  // Draw Line
  const polyline = L.polyline(
    [[userLocation.lat, userLocation.lng], [booking.lat, booking.lng]], 
    { color: '#1e40af', weight: 3, dashArray: '10, 10' }
  ).addTo(map);

  polylines.push({ id: booking.id, polyline });

  updateBookingsList();
  clearForm();
}

/**
 * Re-render the bookings sidebar list.
 */
export function updateBookingsList() {
  const list = document.getElementById('bookingsList');
  
  let html = `<div class="bookings-header"><span>All Bookings</span><span class="booking-count">${bookings.length}</span></div>`;
  
  bookings.slice().reverse().forEach(b => {
    html += `
      <div class="booking-item" data-booking-id="${b.id}">
        <div class="booking-name">${b.customerName}</div>
        <div class="booking-type">${b.bookingType}</div>
        <div class="booking-type">📍 ${b.address}</div>
        <button class="delete-btn" data-action="deactivate" data-id="${b.id}">Mark Inactive</button>
      </div>`;
  });
  list.innerHTML = html;
}

/**
 * Pan the map to the selected booking's location.
 */
export function focusBooking(id) {
  const b = bookings.find(x => x.id === id);
  if (b) map.setView([b.lat, b.lng], 17);
}

/**
 * Clear the booking form inputs.
 */
export function clearForm() {
  document.getElementById('customerName').value = '';
  document.getElementById('address').value = '';
}

/**
 * Handle click events on the bookings list via event delegation.
 */
export function handleBookingAction(e) {
  const btn = e.target.closest('[data-action="deactivate"]');
  if (btn) {
    e.stopPropagation();
    pendingDeactivateId = parseInt(btn.dataset.id);
    document.getElementById('popupOverlay').classList.add('active');
    return;
  }

  // Clicking on a booking item itself → focus it
  const item = e.target.closest('.booking-item');
  if (item) {
    const id = parseInt(item.dataset.bookingId);
    focusBooking(id);
  }
}

/**
 * Close the deactivate popup.
 */
export function closePopup() {
  document.getElementById('popupOverlay').classList.remove('active');
  pendingDeactivateId = null;
}

/**
 * Confirm deactivation of the pending booking.
 */
export function confirmDeactivate() {
  if (pendingDeactivateId === null) return;

  // Remove marker
  const mi = markers.findIndex(m => m.id === pendingDeactivateId);
  if (mi !== -1) {
    map.removeLayer(markers[mi].marker);
    markers.splice(mi, 1);
  }

  // Remove polyline
  const pi = polylines.findIndex(p => p.id === pendingDeactivateId);
  if (pi !== -1) {
    map.removeLayer(polylines[pi].polyline);
    polylines.splice(pi, 1);
  }

  // Remove booking
  bookings = bookings.filter(b => b.id !== pendingDeactivateId);

  updateBookingsList();
  closePopup();
}
