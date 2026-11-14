'use strict';

// PLAIN JAVASCRIPT. Guest reviews and the inquiry form on feedback.html.

const reviews = [
  { name: 'Aigerim', text: 'The atmosphere is quiet enough to study, and their Spanish latte is consistently great.', recommend: '', date: new Date(2026, 8, 14), source: '2GIS Astana' }
];
const MIN_MESSAGE = 20;
const MIN_GROUP = 5;

// Field names in page order, so the first error found is the first one on screen.
const checkedFields = ['client-name', 'client-email', 'client-tel', 'item-quantity', 'order-date', 'group-drink', 'recommend', 'client-comment'];

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

// Count line above the reviews, e.g. "2 comments · 1 would recommend Golden Coffee".
function reviewsSummary(list) {
  const recommending = list.filter((review) => review.recommend === 'yes').length;
  const comments = list.length + (list.length === 1 ? ' comment' : ' comments');
  return recommending > 0 ? comments + ' · ' + recommending + ' would recommend Golden Coffee' : comments;
}

// Drinks offered for a group pre-order, taken from the shared menu data.
function groupDrinks() {
  return menuItems.filter((item) => item.category !== 'breakfast');
}

function estimateGroupOrder(drinkId, quantity) {
  const drink = groupDrinks().find((item) => item.id === drinkId);
  if (drink === undefined || !Number.isInteger(quantity) || quantity < 1) {
    return '';
  }
  return quantity + ' × ' + drink.name + ' = ' + formatPrice(drink.price * quantity);
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
      if (errors['item-quantity'] === undefined && values.quantity < MIN_GROUP) {
        errors['item-quantity'] = 'Group pre-orders start from ' + MIN_GROUP + ' cups or guests.';
      }
      if (errors['order-date'] === undefined && values.date === today) {
        errors['order-date'] = 'The cafe needs one day to prepare a group order. Choose tomorrow or later.';
      }
      if (values.drink === '') {
        errors['group-drink'] = 'Choose the drink for your group.';
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

// ---------- Reviews ----------

const reviewsCount = createElement('p', 'source-note');
const reviewsList = createElement('div', '');
document.querySelector('#reviews .review-quote').replaceWith(reviewsCount, reviewsList);

function renderReviews() {
  reviewsList.replaceChildren();
  for (const review of reviews) {
    reviewsList.append(createReviewCard(review));
  }
  if (reviews.length === 0) {
    reviewsList.append(createElement('p', 'source-note', 'No guest comments yet.'));
  }
  reviewsCount.textContent = reviewsSummary(reviews);
}

renderReviews();

// ---------- Inquiry form ----------

const form = document.querySelector('.practice-form');
const messageField = document.getElementById('client-comment');
const topicField = document.getElementById('inquiry-type');

// Drink choice for group pre-orders, created here and shown only for that topic.
const drinkSelect = createElement('select', 'form-select');
drinkSelect.id = 'group-drink';
drinkSelect.name = 'group-drink';
drinkSelect.append(new Option('Choose a drink', ''));
groupDrinks().forEach((item) => {
  drinkSelect.append(new Option(item.name + ' · ' + formatPrice(item.price), item.id));
});
const drinkLabel = createElement('label', 'form-label', 'Drink for the group');
drinkLabel.htmlFor = 'group-drink';
const estimate = createElement('span', 'form-text d-block');
estimate.setAttribute('role', 'status');
const drinkColumn = createElement('div', 'col-12 col-md-4 d-none');
drinkColumn.append(drinkLabel, drinkSelect, estimate);
topicField.closest('.col-12').after(drinkColumn);

function readValues() {
  return {
    name: form.elements['client-name'].value.trim(),
    email: form.elements['client-email'].value.trim(),
    phone: form.elements['client-tel'].value.trim(),
    quantity: Number(form.elements['item-quantity'].value),
    date: form.elements['order-date'].value,
    topic: topicField.value,
    topicLabel: topicField.selectedOptions[0].textContent,
    drink: drinkSelect.value,
    recommend: form.elements.recommend.value,
    message: messageField.value.trim(),
    newsletter: form.elements.newsletter.checked
  };
}

function updateGroupOrder() {
  const values = readValues();
  drinkColumn.classList.toggle('d-none', values.topic !== 'preorder');
  estimate.textContent = estimateGroupOrder(values.drink, values.quantity);
}

enableForm(form);
form.elements['order-date'].min = addDays(0);
const reportErrors = setUpFieldErrors(form, checkedFields, () => validateInquiry(readValues()));
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

  const rows = [
    ['Name', values.name],
    ['Email', values.email],
    ['Phone', values.phone],
    ['Cups or guests', String(values.quantity)],
    ['Date', formatDate(values.date)],
    ['Topic', values.topicLabel]
  ];
  if (values.topic === 'preorder') {
    rows.push(['Estimated total', estimateGroupOrder(values.drink, values.quantity)]);
  }
  rows.push(
    ['Would recommend', recommendLabel(values.recommend)],
    ['Message', values.message !== '' ? values.message : 'No message'],
    ['Seasonal menu emails', values.newsletter ? 'Yes' : 'No']
  );

  form.reset();
  showSummary(summary, 'Thank you, ' + values.name + '. Your inquiry is ready.', rows, notes);
});

form.addEventListener('input', updateGroupOrder);
form.addEventListener('change', updateGroupOrder);
messageField.addEventListener('input', updateCounter);
// The browser empties the fields after the reset event, so update on the next tick.
form.addEventListener('reset', () => setTimeout(() => {
  fillContactFields(form, contactFields);
  updateCounter();
  updateGroupOrder();
}, 0));

const contactFields = { name: 'client-name', email: 'client-email', phone: 'client-tel' };
fillContactFields(form, contactFields);
document.addEventListener('accountchange', () => fillContactFields(form, contactFields));

updateCounter();
updateGroupOrder();
