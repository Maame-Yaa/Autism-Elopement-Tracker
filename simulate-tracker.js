/**
 * Tracker Simulator
 * Run this while your tracker app is running to simulate a device moving on the map.
 * 
 * Usage: node simulate-tracker.js
 * 
 * It will send GPS coordinates to your backend every 2 seconds,
 * simulating a person walking around Richmond, VA.
 * The path starts INSIDE a geofence area and then moves OUTSIDE it,
 * so you can demo the geofence alert feature.
 */

const http = require('http');

// Starting point: center of Accra, Ghana
const START_LAT = 5.5593;
const START_LNG = -0.1974;

// How much to move each step (roughly a city block per step)
const STEP_SIZE = 0.002;

// Time between updates in milliseconds
const INTERVAL_MS = 2000;

// Total number of steps before it loops back
const TOTAL_STEPS = 10;

let step = 0;

function sendLocation(lat, lng) {
  const data = JSON.stringify({
    device_id: 'simulator-001',
    latitude: lat,
    longitude: lng
  });

  const options = {
    hostname: 'localhost',
    port: 2000,
    path: '/api/receiveTrackerData',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    // silently consume response
    res.on('data', () => {});
  });

  req.on('error', (err) => {
    console.error('Error sending location. Is the backend running on port 2000?', err.message);
  });

  req.write(data);
  req.end();
}

function getCoordinates(stepNum) {
  // Phase 1 (steps 0-15): Walk around inside the geofence area
  // Phase 2 (steps 16-30): Gradually move outside the geofence (north-east)
  // Phase 3 (steps 31-40): Continue outside, then loop back

  if (stepNum <= 5) {
    // Small movements inside the geofence center
    const angle = (stepNum / 5) * Math.PI * 2;
    const radius = 0.005; // small circle, stays well inside
    return {
      lat: START_LAT + Math.sin(angle) * radius,
      lng: START_LNG + Math.cos(angle) * radius
    };
  } else if (stepNum <= 8) {
    // Moving outward — north-east, clearly exiting the geofence
    const progress = (stepNum - 5) / 3;
    return {
      lat: START_LAT + progress * 0.06,   // moving north past the boundary
      lng: START_LNG + progress * 0.08    // moving east past the boundary
    };
  } else {
    // Heading back toward center
    const progress = (stepNum - 8) / 2;
    return {
      lat: START_LAT + 0.06 * (1 - progress),
      lng: START_LNG + 0.08 * (1 - progress)
    };
  }
}

console.log('=== Tracker Simulator ===');
console.log(`Sending GPS updates every ${INTERVAL_MS / 1000} seconds...`);
console.log(`Starting at: ${START_LAT}, ${START_LNG} (Accra, Ghana)`);
console.log('Press Ctrl+C to stop.\n');

const timer = setInterval(() => {
  const coords = getCoordinates(step);
  const lat = parseFloat(coords.lat.toFixed(6));
  const lng = parseFloat(coords.lng.toFixed(6));

  console.log(`Step ${step + 1}/${TOTAL_STEPS} | Lat: ${lat}, Lng: ${lng}${step > 5 ? ' ⚠️  OUTSIDE GEOFENCE' : ' ✅ Inside geofence'}`);

  sendLocation(lat, lng);

  step++;
  if (step >= TOTAL_STEPS) {
    console.log('\n🔄 Loop complete! Starting over...\n');
    step = 0;
  }
}, INTERVAL_MS);

// Clean exit
process.on('SIGINT', () => {
  clearInterval(timer);
  console.log('\nSimulator stopped.');
  process.exit();
});