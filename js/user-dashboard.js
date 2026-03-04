// Initialize map
let map = L.map('map').setView([28.7041, 77.1025], 13); // Default- Delhi
let markers = [];
let polylines = [];
let bookings = [];
let userLocation = null;

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
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

// Nearby location generator
function getRandomLocationNearby(lat, lng, radiusInMeters = 100) {
    const radiusInDegrees = radiusInMeters / 111000;
    const u = Math.random(), v = Math.random();
    const w = radiusInDegrees * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    return { lat: lat + w * Math.cos(t), lng: lng + w * Math.sin(t) };
}

// Add booking
function addBooking() {
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
    const polyline = L.polyline([[userLocation.lat, userLocation.lng], [booking.lat, booking.lng]], {
        color: '#1e40af', weight: 3, dashArray: '10, 10'
    }).addTo(map);

    polylines.push({ id: booking.id, polyline });

    updateBookingsList();
    clearForm();
}

function updateBookingsList() {
    const list = document.getElementById('bookingsList');
    const count = document.getElementById('bookingCount');
    
    let html = `<div class="bookings-header"><span>All Bookings</span><span class="booking-count">${bookings.length}</span></div>`;
    
    bookings.slice().reverse().forEach(b => {
        html += `
            <div class="booking-item" onclick="focusBooking(${b.id})">
                <div class="booking-name">${b.customerName}</div>
                <div class="booking-type">${b.bookingType}</div>
                <div class="booking-type">📍 ${b.address}</div>
                <button class="delete-btn" onclick="handleBookingAction(event, ${b.id})">Mark Inactive</button>
            </div>`;
    });
    list.innerHTML = html;
}

function focusBooking(id) {
    const b = bookings.find(x => x.id === id);
    if (b) map.setView([b.lat, b.lng], 17);
}

function clearForm() {
    document.getElementById('customerName').value = '';
    document.getElementById('address').value = '';
}