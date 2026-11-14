'use strict';

// JQUERY. Catalogue with category filter, sorting and search, used by menu.html (dishes) and drinks.html (drinks).

const sortOrders = {
  menu: () => 0,
  'price-low': (a, b) => a.price - b.price,
  'price-high': (a, b) => b.price - a.price
};

function filterItems(items, category, query, sort) {
  const text = query.trim().toLowerCase();
  // .filter() returns a new array, so sorting it never changes the order of menuItems.
  return items.filter((item) => (category === 'all' || item.category === category) &&
    (text === '' || item.name.toLowerCase().includes(text) || item.description.toLowerCase().includes(text))).sort(sortOrders[sort]);
}

function createCatalogueCard(item, page) {
  const $article = $('<article>', { class: page.cardClass });

  if (item.photo !== '') {
    $('<div>', { class: item.photo + ' ' + page.photoClass, role: 'img', 'aria-label': 'Illustration of ' + item.name }).appendTo($article);
  }
  $article.append(
    $('<p>', { class: 'eyebrow mb-2', text: categoryLabels[item.category] }),
    $('<h3>', { class: 'dish-title', text: item.name }),
    $('<p>', { class: 'menu-description mb-0', text: item.description }),
    createAddButton(item).addClass(page.buttonClass)
  );

  return $('<div>', { class: 'col-12 col-md-6 col-lg-4' }).append($article);
}

function createField(labelText, $control, columnClass) {
  const $label = $('<label>', { class: 'form-label', for: $control.attr('id'), text: labelText });
  return $('<div>', { class: 'col-12 ' + columnClass }).append($label, $control);
}

// page: { categories, heading (selector), cardClass, photoClass, buttonClass, allLabel, placeholder }
function setUpCatalogue(page) {
  const items = menuItems.filter((item) => page.categories.includes(item.category));

  const $categorySelect = $('<select>', { id: 'catalogue-category', class: 'form-select' });
  $('<option>', { value: 'all', text: page.allLabel }).appendTo($categorySelect);
  page.categories.forEach((category) => {
    $('<option>', { value: category, text: categoryLabels[category] }).appendTo($categorySelect);
  });

  const $sortSelect = $('<select>', { id: 'catalogue-sort', class: 'form-select' }).append(
    $('<option>', { value: 'menu', text: 'Menu order' }),
    $('<option>', { value: 'price-low', text: 'Price: low to high' }),
    $('<option>', { value: 'price-high', text: 'Price: high to low' })
  );

  const $searchInput = $('<input>', { id: 'catalogue-search', class: 'form-control', type: 'search', placeholder: page.placeholder });
  const $resetButton = makeButton('btn btn-outline-primary w-100', 'Reset');
  const $resetColumn = $('<div>', { class: 'col-12 col-md-2' }).append($resetButton);

  // A category choice only helps when the page shows more than one category.
  const hasCategories = page.categories.length > 1;
  const $controls = $('<div>', { class: 'row g-3 align-items-end mb-3' });
  if (hasCategories) {
    $controls.append(createField('Category', $categorySelect, 'col-md-3'));
  }
  $controls.append(
    createField('Sort', $sortSelect, 'col-md-3'),
    createField('Search by name or ingredient', $searchInput, hasCategories ? 'col-md-4' : 'col-md-7'),
    $resetColumn
  );

  // The panel can be folded away on a phone, where the filters push the cards down the screen.
  const $filterToggle = makeButton('btn btn-outline-primary mb-3', 'Hide filters').attr('aria-expanded', 'true');
  $filterToggle.on('click', function () {
    $controls.slideToggle(300, function () {
      const isOpen = $(this).is(':visible');
      $filterToggle.text(isOpen ? 'Hide filters' : 'Show filters').attr('aria-expanded', String(isOpen));
    });
  });

  const $resultCount = $('<p>', { class: 'source-note mb-4', role: 'status' });
  const $emptyState = $('<p>', { class: 'form-note p-3 p-md-4', text: 'Nothing matches your search. Try another word or press Reset to see everything.' }).hide();
  const $grid = $('<div>', { id: 'catalogue-grid', class: 'row g-4' });

  function renderCatalogue() {
    const results = filterItems(items, $categorySelect.val(), $searchInput.val(), $sortSelect.val());
    // The cards exist nowhere in the HTML: they are built here from the menuItems array.
    $grid.empty().append(results.map((item) => createCatalogueCard(item, page)));
    $resultCount.text('Showing ' + results.length + ' of ' + items.length + ' items.');
    $emptyState.stop(true, true);
    if (results.length === 0) {
      $emptyState.slideDown(200);
    } else {
      $emptyState.slideUp(200);
    }
  }

  // One delegated handler for both selects: they live inside $controls, which already exists.
  $controls.on('change', 'select', renderCatalogue);
  $searchInput.on('input', renderCatalogue);
  $resetButton.on('click', function () {
    $categorySelect.val('all');
    $sortSelect.val('menu');
    $searchInput.val('').trigger('focus');
    renderCatalogue();
  });

  // The static cards from the midterm are replaced; without JavaScript they still show.
  const $section = $(page.heading).closest('section');
  $section.find('.row:first').remove();
  $(page.heading).after($filterToggle, $controls, $resultCount, $emptyState);
  $section.append($grid);
  renderCatalogue();
}
