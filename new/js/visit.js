'use strict';

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
  const $label = $('<label>', { class: 'form-label', for: 'visit-time', text: 'Time' });
  const $select = $('<select>', { id: 'visit-time', name: 'visit-time', class: 'form-select' });
  $('<option>', { value: '', text: 'Choose a time' }).appendTo($select);
  for (let minutes = OPENING_HOUR * 60; minutes <= LAST_SEATING_HOUR * 60; minutes += 30) {
    $('<option>', { value: toTimeValue(minutes), text: toTimeValue(minutes) }).appendTo($select);
  }
  const $wrapper = $('<p>', { class: 'mb-0' }).append($label, $select);
  return $('<div>', { class: 'col-12 col-md-4' }).append($wrapper);
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

$(function () {
  const $visitForm = $('#booking .practice-form');

  function readVisit() {
    return {
      name: $('#guest-name').val().trim(),
      email: $('#guest-email').val().trim(),
      phone: $('#guest-phone').val().trim(),
      guests: Number($('#guest-count').val()),
      date: $('#visit-date').val(),
      time: $('#visit-time').val(),
      reason: $('#visit-reason option:selected').text(),
      contact: $visitForm.find('input[name="contact-method"]:checked').val() || '',
      window: $('#window-seat').prop('checked'),
      notes: $('#guest-message').val().trim()
    };
  }

  // Setup
  $('#visit-date').closest('.col-12').after(createTimeField());

  enableForm($visitForm);
  $('#visit-date').attr({ min: addDays(0), max: addDays(BOOKING_DAYS) });
  $('#guest-count').attr('max', MAX_GUESTS);
  const reportVisitErrors = setUpFieldErrors($visitForm, visitFields, () => validateVisit(readVisit()));
  const $visitSummary = createSummaryBox($visitForm);

  // Live summary under the visit details
  const $liveSummary = $('<p>', { class: 'source-note mb-0' });
  $('<div>', { class: 'col-12' }).append($liveSummary).insertAfter($('#window-seat').closest('.col-12'));

  function updateLiveSummary() {
    $liveSummary.text('Your visit: ' + describeVisit(readVisit()));
  }

  $visitForm.on('input change', updateLiveSummary);
  $visitForm.on('reset', function () {
    setTimeout(updateLiveSummary, 0);
  });

  $visitForm.on('submit', function (event) {
    event.preventDefault();
    const visit = readVisit();
    if (!reportVisitErrors(validateVisit(visit))) {
      return;
    }

    $visitForm.trigger('reset');
    showSummary($visitSummary, 'Thank you, ' + visit.name + '. Your visit request is ready.', [
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
});
