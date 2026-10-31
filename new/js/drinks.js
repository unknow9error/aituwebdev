'use strict';

$(function () {
  // Each drink card on the page gets an "Add to order" button for the matching menu item.
  $('.drink-entry').each(function () {
    const $article = $(this);
    const name = $article.find('.dish-title').text().trim();
    const item = menuItems.find((entry) => entry.name === name);
    if (item === undefined) {
      return;
    }
    createAddButton(item).addClass('justify-content-md-center').appendTo($article);
  });
});
