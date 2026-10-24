'use strict';

// Golden Coffee menu. Prices in KZT match the price tables on menu.html and drinks.html.
const menuItems = [
  { id: 'golden-breakfast', name: 'Golden Breakfast', category: 'breakfast', price: 2400, description: 'French baguette with eggs, salmon and salad mix.', photo: 'dish-photo dish-photo-0' },
  { id: 'chefs-breakfast', name: "Chef's Breakfast", category: 'breakfast', price: 2800, description: 'Toast, eggs and salmon with avocado, herbs, salad and kurt.', photo: 'dish-photo dish-photo-1' },
  { id: 'paradise-porridge', name: 'Paradise Porridge', category: 'breakfast', price: 1800, description: 'Oatmeal with milk, dates, raisins and pistachios.', photo: 'dish-photo dish-photo-2' },
  { id: 'americano', name: 'Americano', category: 'coffee', price: 1100, description: 'Espresso topped up with hot water, 250 ml.', photo: '' },
  { id: 'cappuccino', name: 'Cappuccino', category: 'coffee', price: 1400, description: 'Espresso with steamed milk and thick foam, 300 ml.', photo: '' },
  { id: 'spanish-latte', name: 'Spanish Latte', category: 'coffee', price: 1800, description: 'Double espresso with steamed and condensed milk, 350 ml. Hot or iced.', photo: 'drink-photo drink-photo-0' },
  { id: 'raf-coffee', name: 'Raf Coffee', category: 'coffee', price: 1700, description: 'Espresso whipped with cream and vanilla sugar into a thick foam.', photo: 'drink-photo drink-photo-1' },
  { id: 'sea-buckthorn-tea', name: 'Sea Buckthorn Tea', category: 'tea', price: 1900, description: 'A 600 ml teapot of sea buckthorn, honey and orange slices.', photo: 'drink-photo drink-photo-2' }
];

const categoryLabels = { breakfast: 'Breakfast', coffee: 'Coffee', tea: 'Tea' };
const CART_KEY = 'golden-coffee-order';
const MAX_QUANTITY = 10;

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

// site.css has no disabled colours for the brown buttons, so a disabled button switches to Bootstrap's grey variant.
function setButtonDisabled(button, disabled, activeClass) {
  const greyClass = activeClass.replace('primary', 'secondary');
  button.disabled = disabled;
  button.classList.toggle(activeClass, !disabled);
  button.classList.toggle(greyClass, disabled);
}

function formatPrice(amount) {
  return amount.toLocaleString('ru-RU') + ' KZT';
}

function countLabel(count) {
  return count + (count === 1 ? ' item' : ' items');
}

function findItem(id) {
  return menuItems.find((item) => item.id === id);
}

// ---------- Order (cart) ----------

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY));
    if (!Array.isArray(saved)) {
      return [];
    }
    // Skip lines that are broken or no longer on the menu.
    return saved.filter((line) => findItem(line.id) !== undefined && Number.isInteger(line.quantity) && line.quantity > 0 && line.quantity <= MAX_QUANTITY);
  } catch (error) {
    return [];
  }
}

let cart = loadCart();

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    // Storage is blocked: the order still works until the page is closed.
  }
}

function lineSubtotal(line) {
  return findItem(line.id).price * line.quantity;
}

function cartTotals(lines) {
  return lines.reduce((totals, line) => ({
    quantity: totals.quantity + line.quantity,
    price: totals.price + lineSubtotal(line)
  }), { quantity: 0, price: 0 });
}

function getQuantity(id) {
  const line = cart.find((entry) => entry.id === id);
  return line ? line.quantity : 0;
}

function makeReference() {
  return 'GC-' + Math.floor(1000 + Math.random() * 9000);
}

function buildOrderButton() {
  const nav = document.querySelector('#main-navigation .navbar-nav');
  const item = createElement('li', 'nav-item');
  const button = createButton('nav-link fw-semibold text-nowrap');
  button.setAttribute('data-bs-toggle', 'modal');
  button.setAttribute('data-bs-target', '#order-modal');
  item.append(button);
  nav.append(item);
  return button;
}

function buildOrderModal() {
  const modal = createElement('div', 'modal fade');
  modal.id = 'order-modal';
  modal.tabIndex = -1;
  modal.setAttribute('aria-labelledby', 'order-title');

  const dialog = createElement('div', 'modal-dialog modal-dialog-scrollable');
  const content = createElement('div', 'modal-content');

  const header = createElement('div', 'modal-header');
  const title = createElement('h2', 'modal-title subheading mb-0', 'Your order');
  title.id = 'order-title';
  title.tabIndex = -1;
  const close = createButton('btn-close');
  close.setAttribute('data-bs-dismiss', 'modal');
  close.setAttribute('aria-label', 'Close');
  header.append(title, close);

  const body = createElement('div', 'modal-body');
  const status = createElement('p', 'source-note mb-2');
  status.setAttribute('role', 'status');
  const confirmation = createElement('div', 'form-note p-3 mb-3 d-none');
  confirmation.tabIndex = -1;
  const empty = createElement('p', 'mb-0', 'Your order is empty. ');
  const menuLink = createElement('a', '', 'Browse the menu');
  menuLink.href = 'menu.html';
  empty.append(menuLink, ' to add breakfasts or drinks.');
  const list = createElement('ul', 'list-unstyled mb-0');
  const totals = createElement('p', 'fw-semibold mt-3 mb-0');
  const note = createElement('p', 'source-note mt-2 mb-0', 'Demonstration only: no order is sent to the cafe and no payment is taken.');
  body.append(status, confirmation, empty, list, totals, note);

  const footer = createElement('div', 'modal-footer');
  const clear = createButton('btn', 'Clear order');
  const checkout = createButton('btn', 'Place demo order');
  footer.append(clear, checkout);

  content.append(header, body, footer);
  dialog.append(content);
  modal.append(dialog);
  document.body.append(modal);

  return { modal, title, status, confirmation, empty, list, totals, clear, checkout };
}

const orderButton = buildOrderButton();
const order = buildOrderModal();

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

function setQuantity(id, quantity) {
  const line = cart.find((entry) => entry.id === id);
  if (quantity <= 0) {
    cart = cart.filter((entry) => entry.id !== id);
  } else if (line) {
    line.quantity = Math.min(quantity, MAX_QUANTITY);
  } else {
    cart.push({ id: id, quantity: Math.min(quantity, MAX_QUANTITY) });
  }
  order.confirmation.classList.add('d-none');
  saveCart();
  renderCart();
}

// "Add to order" button with a short status note, used on the menu and drinks pages.
function createAddButton(item) {
  const wrapper = createElement('div', 'd-flex flex-wrap align-items-center gap-3 mt-3');
  const button = createButton('btn btn-outline-primary', 'Add to order · ' + formatPrice(item.price));
  const note = createElement('span', 'source-note');
  note.setAttribute('role', 'status');
  note.dataset.addNote = '';

  button.addEventListener('click', () => {
    const quantity = getQuantity(item.id);
    if (quantity === MAX_QUANTITY) {
      note.textContent = 'You already have the maximum of ' + MAX_QUANTITY + '.';
      return;
    }
    setQuantity(item.id, quantity + 1);
    note.textContent = 'Added. ' + (quantity + 1) + ' in your order.';
  });

  wrapper.append(button, note);
  return wrapper;
}

order.clear.addEventListener('click', () => {
  cart = [];
  saveCart();
  renderCart();
  order.status.textContent = 'Your order was cleared.';
  order.title.focus();
});

order.checkout.addEventListener('click', () => {
  const totals = cartTotals(cart);
  const summary = cart.map((line) => line.quantity + ' × ' + findItem(line.id).name).join(', ');

  order.confirmation.replaceChildren(
    createElement('p', 'fw-semibold mb-2', 'Demo order ' + makeReference() + ' is ready'),
    createElement('p', 'mb-2', summary + '. ' + countLabel(totals.quantity) + ', total ' + formatPrice(totals.price) + '.'),
    createElement('p', 'mb-0', 'This is a demonstration: nothing was sent to Golden Coffee and no payment was made. To order, call +7 775 072 96 70 or ask at the counter.')
  );

  cart = [];
  saveCart();
  renderCart();
  order.status.textContent = '';
  order.confirmation.classList.remove('d-none');
  order.confirmation.focus();
});

order.modal.addEventListener('hidden.bs.modal', () => {
  order.confirmation.classList.add('d-none');
  order.status.textContent = '';
});

renderCart();

// ---------- Form helpers (feedback and visit forms) ----------

const NAME_PATTERN = /^[\p{L}][\p{L}\s'-]*$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^(\+7|8)\d{10}$/;

// Date as "YYYY-MM-DD" in local time, the same format as <input type="date">.
function toDateValue(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return date.getFullYear() + '-' + month + '-' + day;
}

function addDays(days) {
  const today = new Date();
  return toDateValue(new Date(today.getFullYear(), today.getMonth(), today.getDate() + days));
}

function formatDate(value) {
  return new Date(value + 'T00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
}

// Name, email and phone rules shared by both forms. Returns an object: field key → error message.
function validateContact(name, email, phone) {
  const errors = {};
  if (name.length < 2) {
    errors.name = 'Enter your name, at least 2 letters.';
  } else if (!NAME_PATTERN.test(name)) {
    errors.name = 'Use letters, spaces, hyphens or apostrophes only.';
  }
  if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter an email address like name@example.kz.';
  }
  if (!PHONE_PATTERN.test(phone.replace(/[\s()-]/g, ''))) {
    errors.phone = 'Enter a Kazakhstan number: +7 or 8 followed by 10 digits.';
  }
  return errors;
}

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
