'use strict';

// JQUERY. menu.html shows the dishes only; drinks are on drinks.html.

$(function () {
  setUpCatalogue({
    categories: ['breakfast'],
    heading: '#breakfasts-title',
    cardClass: 'menu-entry',
    photoClass: '',
    buttonClass: '',
    allLabel: 'All dishes',
    placeholder: 'Salmon, eggs, dates...'
  });
});
