'use strict';

// JQUERY. Menu data, the order (cart) and the "Add to order" buttons.
// jQuery 3.7.1 is linked from a CDN in every page, before this file, because $ must exist before our code calls it.
// $(function () { ... }) is the short form of $(document).ready(): the code inside waits until the page is parsed.
// Data and helpers stay outside it, so that menu.js, drinks.js and feedback.js can use them.

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

function makeButton(className, text) {
  return $('<button>', { type: 'button', class: className, text: text });
}

// site.css has no disabled colours for the brown buttons, so a disabled button switches to Bootstrap's grey variant.
function setButtonDisabled($button, disabled, activeClass) {
  const greyClass = activeClass.replace('primary', 'secondary');
  $button.prop('disabled', disabled).toggleClass(activeClass, !disabled).toggleClass(greyClass, disabled);
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

// "Add to order" button with a short status note, used on the menu and drinks pages.
function createAddButton(item) {
  const $button = makeButton('btn btn-outline-primary add-to-order', 'Add to order · ' + formatPrice(item.price)).attr('data-id', item.id);
  const $note = $('<span>', { class: 'source-note', role: 'status', 'data-add-note': '' });
  return $('<div>', { class: 'd-flex flex-wrap align-items-center gap-3 mt-3' }).append($button, $note);
}

$(function () {
  function buildOrderButton() {
    const $button = makeButton('nav-link fw-semibold text-nowrap').attr({ 'data-bs-toggle': 'modal', 'data-bs-target': '#order-modal' });
    $('<li>', { class: 'nav-item' }).append($button).appendTo('#main-navigation .navbar-nav');
    return $button;
  }

  function buildOrderModal() {
    const $title = $('<h2>', { id: 'order-title', class: 'modal-title subheading mb-0', tabindex: -1, text: 'Your order' });
    const $close = makeButton('btn-close').attr({ 'data-bs-dismiss': 'modal', 'aria-label': 'Close' });
    const $header = $('<div>', { class: 'modal-header' }).append($title, $close);

    const $status = $('<p>', { class: 'source-note mb-2', role: 'status' });
    const $confirmation = $('<div>', { class: 'form-note p-3 mb-3', tabindex: -1 }).hide();
    // .html() and not .text(): this string is our own markup with a link in it, and .text() would print the tags.
    const $empty = $('<p>', { class: 'mb-0' }).html('Your order is empty. <a href="menu.html">Browse the menu</a> to add breakfasts or drinks.');
    const $list = $('<ul>', { id: 'order-list', class: 'list-unstyled mb-0' });
    const $totals = $('<p>', { class: 'fw-semibold mt-3 mb-0' });
    const $note = $('<p>', { class: 'source-note mt-2 mb-0', text: 'Demonstration only: no order is sent to the cafe and no payment is taken.' });
    const $body = $('<div>', { class: 'modal-body' }).append($status, $confirmation, $empty, $list, $totals, $note);

    const $clear = makeButton('btn', 'Clear order');
    const $checkout = makeButton('btn', 'Place demo order');
    const $footer = $('<div>', { class: 'modal-footer' }).append($clear, $checkout);

    const $content = $('<div>', { class: 'modal-content' }).append($header, $body, $footer);
    const $dialog = $('<div>', { class: 'modal-dialog modal-dialog-scrollable' }).append($content);
    const $modal = $('<div>', { id: 'order-modal', class: 'modal fade', tabindex: -1, 'aria-labelledby': 'order-title' }).append($dialog).appendTo('body');

    return { $modal, $title, $status, $confirmation, $empty, $list, $totals, $clear, $checkout };
  }

  const $orderButton = buildOrderButton();
  const order = buildOrderModal();

  // REWRITE 1, order list. $('<li>', {...}) replaced createElement() plus className, .attr() replaced setAttribute(),
  // and one delegated .on() replaced three addEventListener() calls per line. Clearly shorter (about a fifth fewer lines) and clearer.
  function createCartLine(line) {
    const item = findItem(line.id);
    const $row = $('<li>', { class: 'd-flex flex-wrap align-items-center gap-2 py-3 border-bottom', 'data-id': item.id });

    const $info = $('<div>', { class: 'flex-grow-1' }).append(
      $('<p>', { class: 'fw-semibold mb-0', text: item.name }),
      $('<p>', { class: 'source-note mb-0', text: formatPrice(item.price) + ' each' })
    );

    const $minus = makeButton('btn px-3 py-1', '−').attr({ 'data-action': 'minus', 'aria-label': 'Remove one ' + item.name });
    setButtonDisabled($minus, line.quantity === 1, 'btn-outline-primary');
    const $quantity = $('<span>', { class: 'px-1', text: line.quantity });
    const $plus = makeButton('btn px-3 py-1', '+').attr({ 'data-action': 'plus', 'aria-label': 'Add one more ' + item.name });
    setButtonDisabled($plus, line.quantity === MAX_QUANTITY, 'btn-outline-primary');
    const $subtotal = $('<span>', { class: 'text-nowrap ms-2', text: formatPrice(lineSubtotal(line)) });
    const $remove = makeButton('btn btn-link p-0 ms-2', 'Remove').attr({ 'data-action': 'remove', 'aria-label': 'Remove ' + item.name + ' from the order' });

    return $row.append($info, $minus, $quantity, $plus, $subtotal, $remove);
  }

  // The list is rebuilt after every change, so keyboard focus goes back to the same button.
  function restoreFocus(id, action) {
    const $target = order.$list.find('li[data-id="' + id + '"] [data-action="' + action + '"]:not(:disabled)');
    ($target.length > 0 ? $target : order.$title).trigger('focus');
  }

  function renderCart() {
    const totals = cartTotals(cart);
    const isEmpty = cart.length === 0;

    order.$list.empty().append(cart.map(createCartLine));
    order.$empty.toggleClass('d-none', !isEmpty);
    order.$totals.toggleClass('d-none', isEmpty).text(countLabel(totals.quantity) + ' · Total ' + formatPrice(totals.price));
    setButtonDisabled(order.$clear, isEmpty, 'btn-outline-primary');
    setButtonDisabled(order.$checkout, isEmpty, 'btn-primary');
    $orderButton.text('Order (' + totals.quantity + ')');

    // "Added" notes under the menu buttons would be out of date now.
    $('[data-add-note]').stop(true, true).text('');
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
    order.$confirmation.hide();
    saveCart();
    renderCart();
  }

  // Delegation: the handler sits on #order-list, which always exists, and catches clicks that bubble up from its buttons.
  // Binding directly to [data-action] would not work: .on() attaches only to elements that exist at that moment,
  // and renderCart() throws the buttons away and creates new ones after every change.
  order.$list.on('click', '[data-action]', function () {
    const $button = $(this);
    const id = $button.closest('li').attr('data-id');
    const action = $button.attr('data-action');
    const item = findItem(id);

    if (action === 'remove') {
      // The line slides away first, and only the callback rebuilds the list, otherwise nobody would see the slide.
      $button.closest('li').slideUp(200, function () {
        setQuantity(id, 0);
        order.$status.text(item.name + ' was removed from your order.');
        order.$title.trigger('focus');
      });
      return;
    }

    setQuantity(id, getQuantity(id) + (action === 'plus' ? 1 : -1));
    order.$status.text(item.name + ': ' + getQuantity(id) + '.');
    restoreFocus(id, action);
  });

  // Delegated too: on menu.html the cards are rebuilt on every filter, so the buttons come and go while <main> stays.
  $('main').on('click', '.add-to-order', function () {
    const $button = $(this);
    const id = $button.attr('data-id');
    const name = $button.closest('article').find('.dish-title').text().trim();
    const $note = $button.siblings('[data-add-note]');
    const quantity = getQuantity(id);

    if (quantity === MAX_QUANTITY) {
      $note.text('You already have the maximum of ' + MAX_QUANTITY + '.');
      return;
    }
    setQuantity(id, quantity + 1);
    $note.text('Added ' + name + '. ' + (quantity + 1) + ' in your order.').delay(2000).fadeOut(600, function () {
      $(this).text('').show();
    });
  });

  order.$clear.on('click', function () {
    cart = [];
    saveCart();
    renderCart();
    order.$status.text('Your order was cleared.');
    order.$title.trigger('focus');
  });

  order.$checkout.on('click', function () {
    const totals = cartTotals(cart);
    const summary = cart.map((line) => line.quantity + ' × ' + findItem(line.id).name).join(', ');

    order.$confirmation.empty().append(
      $('<p>', { class: 'fw-semibold mb-2', text: 'Demo order ' + makeReference() + ' is ready' }),
      $('<p>', { class: 'mb-2', text: summary + '. ' + countLabel(totals.quantity) + ', total ' + formatPrice(totals.price) + '.' }),
      $('<p>', { class: 'mb-2', text: getOpenStatus(new Date()) + '.' }),
      $('<p>', { class: 'mb-0', text: 'This is a demonstration: nothing was sent to Golden Coffee and no payment was made. To order, call +7 775 072 96 70 or ask at the counter.' })
    );

    cart = [];
    saveCart();
    renderCart();
    order.$status.text('');
    order.$confirmation.fadeIn(400, function () {
      $(this).trigger('focus');
    });
  });

  order.$modal.on('hidden.bs.modal', function () {
    order.$confirmation.hide();
    order.$status.text('');
  });

  renderCart();
});
