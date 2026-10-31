'use strict';

// ---------- Guest reviews ----------

const reviews = [
  { name: 'Aigerim', text: 'The atmosphere is quiet enough to study, and their Spanish latte is consistently great.', recommend: '', date: new Date(2026, 8, 14), source: '2GIS Astana' }
];

function recommendLabel(answer) {
  switch (answer) {
    case 'yes':
      return 'Would recommend';
    case 'no':
      return 'Not sure yet';
    default:
      return '';
  }
}

function createReviewCard(review) {
  const $quote = $('<blockquote>', { class: 'blockquote mb-3' }).append($('<p>', { text: review.text }));

  const parts = [review.name, recommendLabel(review.recommend)].filter((part) => part !== '');
  // text: is .text(), so a review with <b> in it is shown as plain characters. .html() would run it as markup.
  const $intro = $('<span>', { text: parts.join(' · ') + ' · ' + (review.source !== '' ? review.source + ', accessed ' : 'Added ') });

  // Reviews from other sites have only a date; reviews written here also show the time.
  const options = review.source !== ''
    ? { day: 'numeric', month: 'long', year: 'numeric' }
    : { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  const $time = $('<time>', { datetime: review.date.toISOString(), text: review.date.toLocaleString('en-GB', options) });
  const $caption = $('<figcaption>', { class: 'source-note' }).append($intro, $time, '.');

  return $('<figure>', { class: 'review-quote mb-4' }).append($quote, $caption);
}

const MIN_MESSAGE = 20;

// Field names in page order, so the first error found is the first one on screen.
const checkedFields = ['client-name', 'client-email', 'client-tel', 'item-quantity', 'order-date', 'recommend', 'client-comment'];

function validateInquiry(values) {
  const contact = validateContact(values.name, values.email, values.phone);
  const errors = { 'client-name': contact.name, 'client-email': contact.email, 'client-tel': contact.phone };
  const today = addDays(0);

  if (!Number.isInteger(values.quantity) || values.quantity < 1 || values.quantity > 50) {
    errors['item-quantity'] = 'Enter a whole number from 1 to 50.';
  }

  if (values.date === '') {
    errors['order-date'] = 'Choose a date.';
  } else if (values.date < today) {
    errors['order-date'] = 'The date cannot be in the past.';
  } else if (values.date > addDays(60)) {
    errors['order-date'] = 'Choose a date within the next 60 days.';
  }

  if (values.recommend === '') {
    errors.recommend = 'Choose one answer.';
  }

  // Rules that depend on the chosen topic.
  switch (values.topic) {
    case 'preorder':
      if (errors['item-quantity'] === undefined && values.quantity < 5) {
        errors['item-quantity'] = 'Group pre-orders start from 5 cups or guests.';
      }
      if (errors['order-date'] === undefined && values.date === today) {
        errors['order-date'] = 'The cafe needs one day to prepare a group order. Choose tomorrow or later.';
      }
      break;
    case 'review':
    case 'complaint':
      if (values.message.length < MIN_MESSAGE) {
        errors['client-comment'] = 'Write at least ' + MIN_MESSAGE + ' characters so the team understands your experience.';
      }
      break;
  }

  return errors;
}

$(function () {
  const $reviewsList = $('<div>');
  $('#reviews .review-quote').replaceWith($reviewsList);

  function renderReviews() {
    $reviewsList.empty().append(reviews.map(createReviewCard));
    if (reviews.length === 0) {
      $('<p>', { class: 'source-note', text: 'No guest comments yet.' }).appendTo($reviewsList);
    }
  }

  renderReviews();

  // ---------- Inquiry form ----------

  const $form = $('.practice-form');
  const $messageField = $('#client-comment');

  function readValues() {
    return {
      name: $('#client-name').val().trim(),
      email: $('#client-email').val().trim(),
      phone: $('#client-tel').val().trim(),
      quantity: Number($('#item-quantity').val()),
      date: $('#order-date').val(),
      topic: $('#inquiry-type').val(),
      topicLabel: $('#inquiry-type option:selected').text(),
      recommend: $form.find('input[name="recommend"]:checked').val() || '',
      message: $messageField.val().trim(),
      // .prop('checked') is the current state of the box; .attr('checked') only says what the HTML said at page load.
      newsletter: $('#newsletter').prop('checked')
    };
  }

  enableForm($form);
  $('#order-date').attr('min', addDays(0));
  const reportErrors = setUpFieldErrors($form, checkedFields, () => validateInquiry(readValues()));
  const $summary = createSummaryBox($form);

  // Character counter for the message
  const $counter = $('<span>', { id: 'client-comment-counter', class: 'form-text d-block' });
  $('#client-comment-error').after($counter);
  $messageField.attr('aria-describedby', 'client-comment-error client-comment-counter');

  function updateCounter() {
    $counter.text($messageField.val().length + ' / ' + $messageField.attr('maxlength') + ' characters');
  }

  $form.on('submit', function (event) {
    // Without this the browser would send the form and reload the page, and the error messages would be lost.
    event.preventDefault();
    const values = readValues();
    if (!reportErrors(validateInquiry(values))) {
      return;
    }

    if (values.topic === 'review') {
      reviews.unshift({ name: values.name, text: values.message, recommend: values.recommend, date: new Date(), source: '' });
      renderReviews();
    }

    const notes = ['This is a demonstration: nothing was sent to Golden Coffee and no booking or order was created. To reach the cafe, call +7 775 072 96 70.'];
    if (values.topic === 'review') {
      notes.unshift('Your comment now appears under Recent Guest Comments on this page until you reload it.');
    }

    $form.trigger('reset');
    showSummary($summary, 'Thank you, ' + values.name + '. Your inquiry is ready.', [
      ['Name', values.name],
      ['Email', values.email],
      ['Phone', values.phone],
      ['Cups or guests', String(values.quantity)],
      ['Date', formatDate(values.date)],
      ['Topic', values.topicLabel],
      ['Would recommend', recommendLabel(values.recommend)],
      ['Message', values.message !== '' ? values.message : 'No message'],
      ['Seasonal menu emails', values.newsletter ? 'Yes' : 'No']
    ], notes);
  });

  $messageField.on('input', updateCounter);
  // The browser empties the fields after the reset event, so update the counter on the next tick.
  $form.on('reset', function () {
    setTimeout(updateCounter, 0);
  });

  updateCounter();
});
