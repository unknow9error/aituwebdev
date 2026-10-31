'use strict';

function filterItems(items, category, query) {
  const text = query.trim().toLowerCase();
  return items.filter((item) => (category === 'all' || item.category === category) &&
    (text === '' || item.name.toLowerCase().includes(text) || item.description.toLowerCase().includes(text)));
}

// REWRITE 2, menu catalogue. $('<div>', {...}) and .append() replaced createElement() with append(), .val() replaced .value,
// and .empty().append(cards) replaced replaceChildren(). Only a little shorter: the logic is the same, it just reads more compactly.
function createMenuCard(item) {
  const $article = $('<article>', { class: 'menu-entry' });

  if (item.photo !== '') {
    $('<div>', { class: item.photo, role: 'img', 'aria-label': 'Illustration of ' + item.name }).appendTo($article);
  }
  $article.append(
    $('<p>', { class: 'eyebrow mb-2', text: categoryLabels[item.category] }),
    $('<h3>', { class: 'dish-title', text: item.name }),
    $('<p>', { class: 'menu-description mb-0', text: item.description }),
    createAddButton(item)
  );

  return $('<div>', { class: 'col-12 col-md-6 col-lg-4' }).append($article);
}

function createField(labelText, $control) {
  const $label = $('<label>', { class: 'form-label', for: $control.attr('id'), text: labelText });
  return $('<div>', { class: 'col-12 col-md-5' }).append($label, $control);
}

$(function () {
  // Controls
  const $categorySelect = $('<select>', { id: 'menu-category', class: 'form-select' });
  $('<option>', { value: 'all', text: 'All dishes and drinks' }).appendTo($categorySelect);
  const categories = [...new Set(menuItems.map((item) => item.category))];
  categories.forEach((category) => {
    $('<option>', { value: category, text: categoryLabels[category] }).appendTo($categorySelect);
  });

  const $searchInput = $('<input>', { id: 'menu-search', class: 'form-control', type: 'search', placeholder: 'Salmon, latte, honey...' });
  const $resetButton = makeButton('btn btn-outline-primary w-100', 'Reset');
  const $resetColumn = $('<div>', { class: 'col-12 col-md-2' }).append($resetButton);

  const $controls = $('<div>', { class: 'row g-3 align-items-end mb-3' }).append(
    createField('Category', $categorySelect),
    createField('Search by name or ingredient', $searchInput),
    $resetColumn
  );

  // The panel can be folded away on a phone, where the filters push the dishes down the screen.
  const $filterToggle = makeButton('btn btn-outline-primary mb-3', 'Hide filters').attr('aria-expanded', 'true');
  $filterToggle.on('click', function () {
    $controls.slideToggle(300, function () {
      const isOpen = $(this).is(':visible');
      $filterToggle.text(isOpen ? 'Hide filters' : 'Show filters').attr('aria-expanded', String(isOpen));
    });
  });

  const $resultCount = $('<p>', { class: 'source-note mb-4', role: 'status' });
  const $emptyState = $('<p>', { class: 'form-note p-3 p-md-4', text: 'Nothing matches your search. Try another word or press Reset to see the whole menu.' }).hide();
  const $grid = $('<div>', { id: 'menu-grid', class: 'row g-4' });

  function renderMenu() {
    const results = filterItems(menuItems, $categorySelect.val(), $searchInput.val());
    // The cards exist nowhere in menu.html: they are built here from the menuItems array.
    $grid.empty().append(results.map(createMenuCard));
    $resultCount.text('Showing ' + results.length + ' of ' + menuItems.length + ' items.');
    $emptyState.stop(true, true);
    if (results.length === 0) {
      $emptyState.slideDown(200);
    } else {
      $emptyState.slideUp(200);
    }
  }

  $categorySelect.on('change', renderMenu);
  $searchInput.on('input', renderMenu);
  $resetButton.on('click', function () {
    $categorySelect.val('all');
    $searchInput.val('').trigger('focus');
    renderMenu();
  });

  $('#breakfasts-title').text('Breakfast and drinks');
  $('#breakfasts .row:first').before($filterToggle, $controls, $resultCount, $emptyState, $grid).remove();
  renderMenu();
});
