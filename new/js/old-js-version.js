'use strict';

// OLD PLAIN-JAVASCRIPT VERSIONS, kept only for comparison with the jQuery rewrite.
// This file is NOT linked from any page. The current code is in main.js, menu.js, feedback.js and visit.js.

// ---------- Shared helpers the old versions used ----------

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

function createButton(className, text) {
  const button = createElement('button', className, text);
  button.type = 'button';
  return button;
}

// ---------- Feature 1: order list (from main.js) ----------

function createCartLine(line) {
  const item = findItem(line.id);
  const row = createElement('li', 'd-flex flex-wrap align-items-center gap-2 py-3 border-bottom');

  const info = createElement('div', 'flex-grow-1');
  info.append(
    createElement('p', 'fw-semibold mb-0', item.name),
    createElement('p', 'source-note mb-0', formatPrice(item.price) + ' each')
  );

  const minus = createButton('btn px-3 py-1', '−');
  minus.setAttribute('aria-label', 'Remove one ' + item.name);
  setButtonDisabled(minus, line.quantity === 1, 'btn-outline-primary');
  const quantity = createElement('span', 'px-1', String(line.quantity));
  const plus = createButton('btn px-3 py-1', '+');
  plus.setAttribute('aria-label', 'Add one more ' + item.name);
  setButtonDisabled(plus, line.quantity === MAX_QUANTITY, 'btn-outline-primary');
  const subtotal = createElement('span', 'text-nowrap ms-2', formatPrice(lineSubtotal(line)));
  const remove = createButton('btn btn-link p-0 ms-2', 'Remove');
  remove.setAttribute('aria-label', 'Remove ' + item.name + ' from the order');

  minus.dataset.action = 'minus';
  plus.dataset.action = 'plus';
  [minus, plus].forEach((button) => {
    button.dataset.id = item.id;
  });

  minus.addEventListener('click', () => {
    setQuantity(item.id, line.quantity - 1);
    order.status.textContent = item.name + ': ' + getQuantity(item.id) + '.';
    restoreFocus(item.id, 'minus');
  });
  plus.addEventListener('click', () => {
    setQuantity(item.id, line.quantity + 1);
    order.status.textContent = item.name + ': ' + getQuantity(item.id) + '.';
    restoreFocus(item.id, 'plus');
  });
  remove.addEventListener('click', () => {
    setQuantity(item.id, 0);
    order.status.textContent = item.name + ' was removed from your order.';
    order.title.focus();
  });

  row.append(info, minus, quantity, plus, subtotal, remove);
  return row;
}

// The list is rebuilt after every change, so keyboard focus goes back to the same button.
function restoreFocus(id, action) {
  const target = order.list.querySelector('[data-id="' + id + '"][data-action="' + action + '"]');
  if (target && !target.disabled) {
    target.focus();
  } else {
    order.title.focus();
  }
}

function renderCart() {
  const totals = cartTotals(cart);
  const isEmpty = cart.length === 0;

  order.list.replaceChildren(...cart.map(createCartLine));
  order.empty.classList.toggle('d-none', !isEmpty);
  order.totals.classList.toggle('d-none', isEmpty);
  order.totals.textContent = countLabel(totals.quantity) + ' · Total ' + formatPrice(totals.price);
  setButtonDisabled(order.clear, isEmpty, 'btn-outline-primary');
  setButtonDisabled(order.checkout, isEmpty, 'btn-primary');
  orderButton.textContent = 'Order (' + totals.quantity + ')';

  // "Added" notes under the menu buttons would be out of date now.
  document.querySelectorAll('[data-add-note]').forEach((note) => {
    note.textContent = '';
  });
}

// ---------- Feature 2: menu catalogue and filter (from menu.js) ----------

const breakfastsSection = document.getElementById('breakfasts');
const staticCards = breakfastsSection.querySelector('.row');

function filterItems(items, category, query) {
  const text = query.trim().toLowerCase();
  return items.filter((item) => (category === 'all' || item.category === category) &&
    (text === '' || item.name.toLowerCase().includes(text) || item.description.toLowerCase().includes(text)));
}

function createMenuCard(item) {
  const column = createElement('div', 'col-12 col-md-6 col-lg-4');
  const article = createElement('article', 'menu-entry');

  if (item.photo !== '') {
    const photo = createElement('div', item.photo);
    photo.setAttribute('role', 'img');
    photo.setAttribute('aria-label', 'Illustration of ' + item.name);
    article.append(photo);
  }
  article.append(
    createElement('p', 'eyebrow mb-2', categoryLabels[item.category]),
    createElement('h3', 'dish-title', item.name),
    createElement('p', 'menu-description mb-0', item.description),
    createAddButton(item)
  );

  column.append(article);
  return column;
}

function createField(labelText, control) {
  const column = createElement('div', 'col-12 col-md-5');
  const label = createElement('label', 'form-label', labelText);
  label.htmlFor = control.id;
  column.append(label, control);
  return column;
}

// Controls
const categorySelect = createElement('select', 'form-select');
categorySelect.id = 'menu-category';
categorySelect.append(new Option('All dishes and drinks', 'all'));
const categories = [...new Set(menuItems.map((item) => item.category))];
categories.forEach((category) => {
  categorySelect.append(new Option(categoryLabels[category], category));
});

const searchInput = createElement('input', 'form-control');
searchInput.id = 'menu-search';
searchInput.type = 'search';
searchInput.placeholder = 'Salmon, latte, honey...';

const resetButton = createButton('btn btn-outline-primary w-100', 'Reset');
const resetColumn = createElement('div', 'col-12 col-md-2');
resetColumn.append(resetButton);

const controls = createElement('div', 'row g-3 align-items-end mb-3');
controls.append(createField('Category', categorySelect), createField('Search by name or ingredient', searchInput), resetColumn);

const resultCount = createElement('p', 'source-note mb-4');
resultCount.setAttribute('role', 'status');
const emptyState = createElement('p', 'form-note p-3 p-md-4 d-none', 'Nothing matches your search. Try another word or press Reset to see the whole menu.');
const grid = createElement('div', 'row g-4');

function renderMenu() {
  const results = filterItems(menuItems, categorySelect.value, searchInput.value);
  grid.replaceChildren(...results.map(createMenuCard));
  resultCount.textContent = 'Showing ' + results.length + ' of ' + menuItems.length + ' items.';
  emptyState.classList.toggle('d-none', results.length !== 0);
}

categorySelect.addEventListener('change', renderMenu);
searchInput.addEventListener('input', renderMenu);
resetButton.addEventListener('click', () => {
  categorySelect.value = 'all';
  searchInput.value = '';
  renderMenu();
  searchInput.focus();
});

document.getElementById('breakfasts-title').textContent = 'Breakfast and drinks';
staticCards.replaceWith(controls, resultCount, emptyState, grid);
renderMenu();

// ---------- Feature 3: form validation (from main.js) ----------

// The midterm forms had a disabled submit button; JavaScript validation now replaces the browser's.
function enableForm(form) {
  const submitButton = form.querySelector('button[type="submit"]');
  form.noValidate = true;
  submitButton.disabled = false;
  submitButton.classList.replace('btn-secondary', 'btn-primary');
}

// Adds an error message under each listed field and returns the function that reports errors.
function setUpFieldErrors(form, names) {
  const errorElements = {};

  function controlsOf(name) {
    const control = form.elements[name];
    return control instanceof RadioNodeList ? Array.from(control) : [control];
  }

  function showError(name, message) {
    controlsOf(name).forEach((control) => {
      control.classList.add('is-invalid');
      control.setAttribute('aria-invalid', 'true');
    });
    errorElements[name].textContent = message;
    errorElements[name].classList.add('d-block');
  }

  function clearError(name) {
    controlsOf(name).forEach((control) => {
      control.classList.remove('is-invalid');
      control.removeAttribute('aria-invalid');
    });
    errorElements[name].textContent = '';
    errorElements[name].classList.remove('d-block');
  }

  // For radio buttons the message goes under the last option.
  names.forEach((name) => {
    const controls = controlsOf(name);
    const last = controls[controls.length - 1];
    const error = createElement('span', 'invalid-feedback');
    error.id = name + '-error';
    (last.type === 'radio' ? last.parentElement : last).after(error);
    controls.forEach((control) => control.setAttribute('aria-describedby', error.id));
    errorElements[name] = error;
  });

  // Clear an outdated error as soon as the visitor changes that field.
  ['input', 'change'].forEach((type) => {
    form.addEventListener(type, (event) => {
      if (errorElements[event.target.name] !== undefined) {
        clearError(event.target.name);
      }
    });
  });
  form.addEventListener('reset', () => names.forEach(clearError));

  // Shows the errors in page order, focuses the first invalid field and returns true when there are none.
  return function report(errors) {
    names.forEach(clearError);
    const invalid = names.filter((name) => errors[name] !== undefined);
    invalid.forEach((name) => showError(name, errors[name]));
    if (invalid.length > 0) {
      controlsOf(invalid[0])[0].focus();
    }
    return invalid.length === 0;
  };
}

function createSummaryBox(form) {
  const summary = createElement('div', 'form-note p-3 p-md-4 mt-4 d-none');
  summary.tabIndex = -1;
  summary.setAttribute('role', 'status');
  form.after(summary);
  form.addEventListener('reset', () => summary.classList.add('d-none'));
  return summary;
}

function showSummary(summary, title, rows, notes) {
  const list = createElement('dl', 'row mb-3');
  rows.forEach((row) => {
    list.append(createElement('dt', 'col-sm-4 fw-semibold', row[0]), createElement('dd', 'col-sm-8 mb-2', row[1]));
  });
  summary.replaceChildren(createElement('h3', 'subheading', title), list);
  notes.forEach((note) => summary.append(createElement('p', '', note)));
  summary.lastElementChild.classList.add('mb-0');
  summary.classList.remove('d-none');
  summary.focus();
}

// ---------- Feature 3: inquiry form submit (from feedback.js) ----------

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
