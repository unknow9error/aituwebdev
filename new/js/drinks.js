'use strict';

// JQUERY. drinks.html shows the drinks only; dishes are on menu.html.

$(function () {
  setUpCatalogue({
    categories: ['coffee', 'tea'],
    heading: '#espresso-title',
    cardClass: 'drink-entry text-md-center',
    // On wider screens the panorama above the cards already shows the drinks.
    photoClass: 'd-md-none',
    buttonClass: 'justify-content-md-center',
    allLabel: 'All drinks',
    placeholder: 'Latte, honey, cream...'
  });
});
