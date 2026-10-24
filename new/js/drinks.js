'use strict';

// Each drink card on the page gets an "Add to order" button for the matching menu item.
document.querySelectorAll('.drink-entry').forEach((article) => {
  const name = article.querySelector('.dish-title').textContent.trim();
  const item = menuItems.find((entry) => entry.name === name);
  if (item === undefined) {
    return;
  }
  const control = createAddButton(item);
  control.classList.add('justify-content-md-center');
  article.append(control);
});
