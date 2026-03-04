let gpsInterval = null;
let watchId = null;
let isOnline = false;
let map = null;
let helperMarker = null;
let customerMarker = null;
let routeLine = null;
let timerInterval = null;

const TIMER_TOTAL = 15 * 60;
const CUSTOMERS = ['Rahul M.', 'Priya S.', 'Amit K.', 'Neha R.', 'Suresh P.', 'Kavita D.'];
const DISTANCES = ['0.4 km', '0.8 km', '1.1 km', '1.5 km', '1.9 km'];
const JOBS = [
  { type: 'Plumbing', icon: '🔧' },
  { type: 'Appliance Repair', icon: '🔌' },
  { type: 'House Help', icon: '🏠' },
  { type: 'Electronics', icon: '📺' }
];

let currentJob = JOBS[0];
let currentCustomer = CUSTOMERS[0];
let currentDistance = DISTANCES[0];

const $ = (id) => document.getElementById(id);

window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('jobActive') === 'true') {
    isOnline = true;
    updateBadge('active');
    setWaitingText('');
    showActiveJobUI(true);
    tickTimer();
  }
});

function goOnline() {
  if (localStorage.getItem('jobActive') === 'true') {
    $('activeJobPopup').classList.remove('hidden');
    return;
  }
  if (isOnline) {
    return;
  }
  isOnline = true;
  updateBadge('online');
  setWaitingText('Waiting for a booking request…');
  startGPS();
  setTimeout(() => {
    if (isOnline) {
      showBooking();
    }
  }, 4000);
}

function goOffline() {
  if (localStorage.getItem('jobActive') === 'true') {
    $('activeJobPopup').classList.remove('hidden');
    return;
  }
  isOnline = false;
  updateBadge('offline');
  setWaitingText('You are offline');
  stopGPS();
  clearWatch();
}

function updateBadge(state) {
  const el = $('statusBadge');
  const states = {
    offline: ['badge offline', 'Offline'],
    online: ['badge online', 'Online'],
    active: ['badge active-job', 'Active Job'],
  };
  const [cls, lbl] = states[state];
  el.className = cls;
  el.innerHTML = `<span class="badge-dot"></span> ${lbl}`;
}

function setWaitingText(txt) {
  $('waitingText').textContent = txt;
}

function showActiveJobUI(show) {
  if (show) {
    $('activeStrip').classList.remove('hidden');
    $('activeActions').classList.remove('hidden');
    $('waitingText').textContent = '';
    $('stripJobType').textContent = (localStorage.getItem('custName') || '') + ' · ~' + (localStorage.getItem('custDistance') || '');
    $('stripTag').textContent = (localStorage.getItem('jobIcon') || '🔧') + ' ' + (localStorage.getItem('jobType') || 'Plumbing');
  } else {
    $('activeStrip').classList.add('hidden');
    $('activeActions').classList.add('hidden');
  }
}

function startGPS() {
  gpsInterval = setInterval(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      localStorage.setItem('helperLat', pos.coords.latitude);
      localStorage.setItem('helperLng', pos.coords.longitude);
    });
  }, 5000);
}

function stopGPS() {
  clearInterval(gpsInterval);
}

function clearWatch() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}

let bookingCountdown = null;
let bookingSecsLeft = 15;

function showBooking() {
  currentJob = JOBS[Math.floor(Math.random() * JOBS.length)];
  currentCustomer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
  currentDistance = DISTANCES[Math.floor(Math.random() * DISTANCES.length)];

  $('popupService').textContent = `${currentJob.icon} ${currentJob.type}`;
  $('popupCustomer').textContent = currentCustomer;
  $('popupDistance').textContent = `~${currentDistance}`;
  $('bookingPopup').classList.remove('hidden');

  navigator.geolocation.getCurrentPosition((pos) => {
    localStorage.setItem('custLat', pos.coords.latitude + 0.01);
    localStorage.setItem('custLng', pos.coords.longitude + 0.01);
    localStorage.setItem('custName', currentCustomer);
    localStorage.setItem('custDistance', currentDistance);
  });

  bookingSecsLeft = 15;
  renderRing(bookingSecsLeft);
  clearInterval(bookingCountdown);
  bookingCountdown = setInterval(() => {
    bookingSecsLeft--;
    renderRing(bookingSecsLeft);
    if (bookingSecsLeft <= 0) {
      clearInterval(bookingCountdown);
      autoCancelBooking();
    }
  }, 1000);
}

function renderRing(secs) {
  const offset = 132 * (1 - (secs / 15));
  $('ringArc').style.strokeDashoffset = offset;
  $('ringNum').textContent = Math.max(0, secs);
}

function acceptBooking() {
  clearInterval(bookingCountdown);
  $('bookingPopup').classList.add('hidden');
  localStorage.setItem('jobActive', 'true');
  localStorage.setItem('jobType', currentJob.type);
  localStorage.setItem('jobIcon', currentJob.icon);
  localStorage.setItem('jobStart', Date.now());
  updateBadge('active');
  showActiveJobUI(true);
  openTracking();
}

function openTracking() {
  $('dashboardView').classList.add('hidden');
  $('trackingView').classList.remove('hidden');
  startTimer();
  const custPos = [
    parseFloat(localStorage.getItem('custLat')),
    parseFloat(localStorage.getItem('custLng'))
  ];
  
  setTimeout(() => {
    if (!map) {
      map = L.map('map').setView(custPos, 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      customerMarker = L.marker(custPos).addTo(map).bindPopup('Customer').openPopup();
      helperMarker = L.marker(custPos).addTo(map);
      routeLine = L.polyline([custPos, custPos], { 
        color: '#4f6ef7', 
        weight: 3, 
        dashArray: '7 5' 
      }).addTo(map);
    } else {
      map.invalidateSize();
    }
    beginWatch(custPos);
  }, 200);
}

function beginWatch(custPos) {
  clearWatch();
  watchId = navigator.geolocation.watchPosition((pos) => {
    const hp = [pos.coords.latitude, pos.coords.longitude];
    helperMarker.setLatLng(hp);
    routeLine.setLatLngs([custPos, hp]);
    map.panTo(hp);
  });
}

function tickTimer() {
  const start = parseInt(localStorage.getItem('jobStart') || Date.now());
  const left = Math.max(0, TIMER_TOTAL - Math.floor((Date.now() - start) / 1000));
  const m = String(Math.floor(left / 60)).padStart(2, '0');
  const s = String(left % 60).padStart(2, '0');
  
  $('timerDigits').textContent = `${m}:${s}`;
  $('timerFill').style.width = `${(left / TIMER_TOTAL) * 100}%`;
  
  if (left === 0) {
    confirmCancel();
  }
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(tickTimer, 1000);
}

function completeJob() {
  $('completePopup').classList.remove('hidden');
}

function confirmComplete() {
  localStorage.clear();
  location.reload();
}

function cancelJob() {
  $('cancelPopup').classList.remove('hidden');
}

function confirmCancel() {
  localStorage.clear();
  location.reload();
}

function dismissCancel() {
  $('cancelPopup').classList.add('hidden');
}

function dismissComplete() {
  $('completePopup').classList.add('hidden');
}

function returnToDashboard() {
  $('trackingView').classList.add('hidden');
  $('dashboardView').classList.remove('hidden');
}