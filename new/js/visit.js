'use strict';

// PLAIN JAVASCRIPT. Visit request form on visit.html. Opening hours come from hours.js.

const MAX_GUESTS = 12;
const BOOKING_DAYS = 30;
const SLOT_MINUTES = 30;

// Field names in page order, so the first error found is the first one on screen.
const visitFields = ['guest-name', 'guest-email', 'guest-phone', 'guest-count', 'visit-date', 'visit-time', 'contact-method'];

function toTimeValue(minutes) {
  return String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0');
}

// Half-hour slots from opening time to the last seating of that day.
function timeSlots(dayHours) {
  const slots = [];
  for (let minutes = toMinutes(dayHours.open); minutes <= toMinutes(dayHours.close) - LAST_SEATING_MINUTES; minutes += SLOT_MINUTES) {
    slots.push(toTimeValue(minutes));
  }
  return slots;
}

function validateVisit(visit) {
  const contact = validateContact(visit.name, visit.email, visit.phone);
  const errors = { 'guest-name': contact.name, 'guest-email': contact.email, 'guest-phone': contact.phone };
  const today = addDays(0);

  if (!Number.isInteger(visit.guests) || visit.guests < 1) {
    errors['guest-count'] = 'Enter a whole number of guests, at least 1.';
  } else if (visit.guests > MAX_GUESTS) {
    errors['guest-count'] = 'For more than ' + MAX_GUESTS + ' guests, please call the cafe to arrange the tables.';
  }

  if (visit.date === '') {
    errors['visit-date'] = 'Choose a date.';
  } else if (visit.date < today) {
    errors['visit-date'] = 'The date cannot be in the past.';
  } else if (visit.date > addDays(BOOKING_DAYS)) {
    errors['visit-date'] = 'Choose a date within the next ' + BOOKING_DAYS + ' days.';
  }

  if (visit.time === '') {
    errors['visit-time'] = 'Choose a time.';
  } else if (visit.date === today && errors['visit-date'] === undefined) {
    // Date and time together: a visit today needs at least one hour's notice.
    const now = new Date();
    const earliest = toTimeValue(now.getHours() * 60 + now.getMinutes() + 60);
    if (visit.time < earliest) {
      errors['visit-time'] = 'For a visit today, choose a time at least one hour from now, or another day. ' + getOpenStatus(now) + '.';
    }
  }

  if (visit.contact === '') {
    errors['contact-method'] = 'Choose how the cafe should contact you.';
  }

  return errors;
}

function describeVisit(visit) {
  const guests = visit.guests > 0 ? visit.guests + (visit.guests === 1 ? ' guest' : ' guests') : 'number of guests not set';
  const date = visit.date !== '' ? formatDate(visit.date) : 'date not chosen';
  const time = visit.time !== '' ? visit.time : 'time not chosen';
  return visit.reason + ' · ' + guests + ' · ' + date + ' · ' + time + (visit.window ? ' · window seat' : '');
}

const visitForm = document.querySelector('#booking .practice-form');
const dateField = visitForm.elements['visit-date'];

// Time select, created here because the midterm form only had a free-text notes field for the time.
const timeSelect = createElement('select', 'form-select');
timeSelect.id = 'visit-time';
timeSelect.name = 'visit-time';
const timeLabel = createElement('label', 'form-label', 'Time');
timeLabel.htmlFor = 'visit-time';
const timeHint = createElement('span', 'form-text d-block');
const timeWrapper = createElement('p', 'mb-0');
timeWrapper.append(timeLabel, timeSelect);
const timeColumn = createElement('div', 'col-12 col-md-4');
timeColumn.append(timeWrapper, timeHint);
dateField.closest('.col-12').after(timeColumn);

// The slots follow the hours of the chosen day; the choice is kept when that time still exists.
function fillTimeSlots() {
  const day = dateField.value !== '' ? new Date(dateField.value + 'T00:00') : new Date();
  const dayHours = hoursFor(day);
  const previous = timeSelect.value;
  timeSelect.replaceChildren(new Option('Choose a time', ''));
  timeSlots(dayHours).forEach((slot) => timeSelect.append(new Option(slot, slot)));
  timeSelect.value = previous;
  if (timeSelect.value !== previous) {
    timeSelect.value = '';
  }
  timeHint.textContent = dayHours.day + ': open ' + dayHours.open + '–' + dayHours.close + ', last table at ' + toTimeValue(toMinutes(dayHours.close) - LAST_SEATING_MINUTES) + '.';
}

function readVisit() {
  return {
    name: visitForm.elements['guest-name'].value.trim(),
    email: visitForm.elements['guest-email'].value.trim(),
    phone: visitForm.elements['guest-phone'].value.trim(),
    guests: Number(visitForm.elements['guest-count'].value),
    date: dateField.value,
    time: timeSelect.value,
    reason: visitForm.elements['visit-reason'].selectedOptions[0].textContent,
    contact: visitForm.elements['contact-method'].value,
    window: visitForm.elements['window-seat'].checked,
    notes: visitForm.elements['guest-message'].value.trim()
  };
}

fillTimeSlots();
enableForm(visitForm);
dateField.min = addDays(0);
dateField.max = addDays(BOOKING_DAYS);
visitForm.elements['guest-count'].max = MAX_GUESTS;
const reportVisitErrors = setUpFieldErrors(visitForm, visitFields, () => validateVisit(readVisit()));
const visitSummary = createSummaryBox(visitForm);

// Live summary under the visit details
const liveSummary = createElement('p', 'source-note mb-0');
const liveColumn = createElement('div', 'col-12');
liveColumn.append(liveSummary);
visitForm.elements['window-seat'].closest('.col-12').after(liveColumn);

function updateLiveSummary() {
  liveSummary.textContent = 'Your visit: ' + describeVisit(readVisit());
}

dateField.addEventListener('change', fillTimeSlots);
visitForm.addEventListener('input', updateLiveSummary);
visitForm.addEventListener('change', updateLiveSummary);
visitForm.addEventListener('reset', () => setTimeout(() => {
  fillContactFields(visitForm, contactFields);
  fillTimeSlots();
  updateLiveSummary();
}, 0));

visitForm.addEventListener('submit', (event) => {
  // Without this the browser would reload visit.html with the answers in the address bar.
  event.preventDefault();
  const visit = readVisit();
  if (!reportVisitErrors(validateVisit(visit))) {
    return;
  }

  visitForm.reset();
  showSummary(visitSummary, 'Thank you, ' + visit.name + '. Your visit request is ready.', [
    ['Visit', describeVisit(visit)],
    ['Name', visit.name],
    ['Email', visit.email],
    ['Phone', visit.phone],
    ['Contact me by', visit.contact === 'phone' ? 'Phone' : 'Email'],
    ['Notes', visit.notes !== '' ? visit.notes : 'No notes']
  ], [
    'This is a demonstration request: nothing was sent to Golden Coffee and no table is reserved.',
    'To book a table, call +7 775 072 96 70 or send a WhatsApp message.'
  ]);
});

const contactFields = { name: 'guest-name', email: 'guest-email', phone: 'guest-phone' };
fillContactFields(visitForm, contactFields);
document.addEventListener('accountchange', () => {
  fillContactFields(visitForm, contactFields);
  updateLiveSummary();
});

updateLiveSummary();
