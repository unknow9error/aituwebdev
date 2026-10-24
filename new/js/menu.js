'use strict';

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
