'use strict';

// PLAIN JAVASCRIPT. Opening hours from Golden Coffee's 2GIS page, indexed like Date.getDay(): 0 is Sunday.
const openingHours = [
  { day: 'Sunday', open: '08:00', close: '23:00' },
  { day: 'Monday', open: '08:00', close: '23:00' },
  { day: 'Tuesday', open: '08:00', close: '23:00' },
  { day: 'Wednesday', open: '08:00', close: '23:00' },
  { day: 'Thursday', open: '08:00', close: '23:00' },
  { day: 'Friday', open: '08:00', close: '23:00' },
  { day: 'Saturday', open: '08:00', close: '23:00' }
];
const LAST_SEATING_MINUTES = 60; // the last table is offered one hour before closing

function toMinutes(time) {
  const parts = time.split(':');
  return Number(parts[0]) * 60 + Number(parts[1]);
}

function hoursFor(date) {
  return openingHours[date.getDay()];
}

// Used by the status line on the home and visit pages, the booking form and the order confirmation.
function getOpenStatus(date) {
  const today = hoursFor(date);
  const now = date.getHours() * 60 + date.getMinutes();
  if (now < toMinutes(today.open)) {
    return 'Closed now · opens today at ' + today.open;
  }
  if (now >= toMinutes(today.close)) {
    const tomorrow = openingHours[(date.getDay() + 1) % 7];
    return 'Closed now · opens tomorrow at ' + tomorrow.open;
  }
  return 'Open now · closes at ' + today.close;
}

// Status line next to the address on visit.html and under the introduction on index.html.
document.querySelectorAll('#visit-hours, .hero-description').forEach((anchor) => {
  const status = document.createElement('p');
  status.className = 'fw-semibold mb-1';
  status.setAttribute('role', 'status');
  status.textContent = getOpenStatus(new Date());
  anchor.after(status);
});
