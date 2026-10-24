'use strict';

const visitForm = document.querySelector('#booking .practice-form');
const OPENING_HOUR = 8;
const LAST_SEATING_HOUR = 22; // the cafe closes at 23:00
const MAX_GUESTS = 12;
const BOOKING_DAYS = 30;

// Field names in page order, so the first error found is the first one on screen.
const visitFields = ['guest-name', 'guest-email', 'guest-phone', 'guest-count', 'visit-date', 'visit-time', 'contact-method'];

function toTimeValue(minutes) {
  return String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0');
}

// Time select, created here because the midterm form only had a free-text notes field for the time.
function createTimeField() {
  const column = createElement('div', 'col-12 col-md-4');
  const wrapper = createElement('p', 'mb-0');
  const label = createElement('label', 'form-label', 'Time');
  label.htmlFor = 'visit-time';
  const select = createElement('select', 'form-select');
  select.id = 'visit-time';
  select.name = 'visit-time';
  select.append(new Option('Choose a time', ''));
  for (let minutes = OPENING_HOUR * 60; minutes <= LAST_SEATING_HOUR * 60; minutes += 30) {
    select.append(new Option(toTimeValue(minutes), toTimeValue(minutes)));
  }
  wrapper.append(label, select);
  column.append(wrapper);
  return column;
}

function readVisit() {
  return {
    name: visitForm.elements['guest-name'].value.trim(),
    email: visitForm.elements['guest-email'].value.trim(),
    phone: visitForm.elements['guest-phone'].value.trim(),
    guests: Number(visitForm.elements['guest-count'].value),
    date: visitForm.elements['visit-date'].value,
    time: visitForm.elements['visit-time'].value,
    reason: visitForm.elements['visit-reason'].selectedOptions[0].textContent,
    contact: visitForm.elements['contact-method'].value,
    window: visitForm.elements['window-seat'].checked,
    notes: visitForm.elements['guest-message'].value.trim()
  };
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
      errors['visit-time'] = 'For a visit today, choose a time at least one hour from now, or another day.';
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

// Setup
const dateColumn = visitForm.elements['visit-date'].closest('.col-12');
dateColumn.after(createTimeField());

enableForm(visitForm);
visitForm.elements['visit-date'].min = addDays(0);
visitForm.elements['visit-date'].max = addDays(BOOKING_DAYS);
visitForm.elements['guest-count'].max = MAX_GUESTS;
const reportVisitErrors = setUpFieldErrors(visitForm, visitFields);
const visitSummary = createSummaryBox(visitForm);

// Live summary under the visit details
const liveSummary = createElement('p', 'source-note mb-0');
const liveColumn = createElement('div', 'col-12');
liveColumn.append(liveSummary);
visitForm.elements['window-seat'].closest('.col-12').after(liveColumn);

function updateLiveSummary() {
  liveSummary.textContent = 'Your visit: ' + describeVisit(readVisit());
}

visitForm.addEventListener('input', updateLiveSummary);
visitForm.addEventListener('change', updateLiveSummary);
visitForm.addEventListener('reset', () => setTimeout(updateLiveSummary, 0));

visitForm.addEventListener('submit', (event) => {
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

updateLiveSummary();
