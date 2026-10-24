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
  const figure = createElement('figure', 'review-quote mb-4');
  const quote = createElement('blockquote', 'blockquote mb-3');
  quote.append(createElement('p', '', review.text));

  const caption = createElement('figcaption', 'source-note');
  const parts = [review.name, recommendLabel(review.recommend)].filter((part) => part !== '');
  caption.append(parts.join(' · ') + ' · ' + (review.source !== '' ? review.source + ', accessed ' : 'Added '));

  // Reviews from other sites have only a date; reviews written here also show the time.
  const options = review.source !== ''
    ? { day: 'numeric', month: 'long', year: 'numeric' }
    : { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  const time = createElement('time', '', review.date.toLocaleString('en-GB', options));
  time.dateTime = review.date.toISOString();
  caption.append(time, '.');

  figure.append(quote, caption);
  return figure;
}

const reviewsList = createElement('div', '');
document.querySelector('#reviews .review-quote').replaceWith(reviewsList);

function renderReviews() {
  reviewsList.replaceChildren(...reviews.map(createReviewCard));
  if (reviews.length === 0) {
    reviewsList.append(createElement('p', 'source-note', 'No guest comments yet.'));
  }
}

renderReviews();

// ---------- Inquiry form ----------

const form = document.querySelector('.practice-form');
const messageField = document.getElementById('client-comment');
const MIN_MESSAGE = 20;

// Field names in page order, so the first error found is the first one on screen.
const checkedFields = ['client-name', 'client-email', 'client-tel', 'item-quantity', 'order-date', 'recommend', 'client-comment'];

function readValues() {
  return {
    name: form.elements['client-name'].value.trim(),
    email: form.elements['client-email'].value.trim(),
    phone: form.elements['client-tel'].value.trim(),
    quantity: Number(form.elements['item-quantity'].value),
    date: form.elements['order-date'].value,
    topic: form.elements['inquiry-type'].value,
    topicLabel: form.elements['inquiry-type'].selectedOptions[0].textContent,
    recommend: form.elements.recommend.value,
    message: messageField.value.trim(),
    newsletter: form.elements.newsletter.checked
  };
}

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

enableForm(form);
form.elements['order-date'].min = addDays(0);
const reportErrors = setUpFieldErrors(form, checkedFields);
const summary = createSummaryBox(form);

// Character counter for the message
const counter = createElement('span', 'form-text d-block');
counter.id = 'client-comment-counter';
document.getElementById('client-comment-error').after(counter);
messageField.setAttribute('aria-describedby', 'client-comment-error client-comment-counter');

function updateCounter() {
  counter.textContent = messageField.value.length + ' / ' + messageField.maxLength + ' characters';
}

form.addEventListener('submit', (event) => {
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

  form.reset();
  showSummary(summary, 'Thank you, ' + values.name + '. Your inquiry is ready.', [
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

messageField.addEventListener('input', updateCounter);
// The browser empties the fields after the reset event, so update the counter on the next tick.
form.addEventListener('reset', () => setTimeout(updateCounter, 0));

updateCounter();
