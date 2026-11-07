# Endterm checklist

Paths are relative to `new/`. Author of all JavaScript and jQuery: Arlan Kudabay.
References name the function or the comment to search for, so they stay correct when lines move.

## Plain JavaScript

| Requirement | Where |
| --- | --- |
| Real data in arrays and objects at the top of the file | `openingHours` in `js/hours.js`; `reviews` in `js/feedback.js`; `menuItems` in `js/main.js` (shared data) |
| Page built from data with a loop | reviews: `for...of` in `renderReviews()` (`js/feedback.js`); group drinks: `forEach` over `groupDrinks()`; time slots: `for` loop in `timeSlots()` (`js/visit.js`) |
| Own functions with parameters and a return value, called from more than one place | `getOpenStatus(date)`: home and visit status lines, visit validation, order confirmation; `validateContact()`: both forms; `estimateGroupOrder()`: live estimate and summary; `toMinutes()`, `hoursFor()`: `hours.js` and `visit.js` |
| Conditions | open or closed in `getOpenStatus()`; topic rules in `validateInquiry()` (`switch`); guest limits in `validateVisit()` |
| Calculated values | estimated total `drink.price * quantity`; review count and "would recommend" count in `reviewsSummary()`; time slots and last table from the hours |
| Event object | `event.preventDefault()` in both submit handlers; `event.target` in the form listener in `setUpFieldErrors()` (`js/forms.js`) |
| Delegated handler | one `input`/`change` listener on each form in `setUpFieldErrors()` also catches the time select and the drink select created in code |

## jQuery

| Requirement | Where |
| --- | --- |
| CDN link before our scripts, code in `$(function () { ... })` | every page; `js/main.js`, `js/menu.js`, `js/drinks.js` |
| Selectors: id, class, element, attribute | `$('#breakfasts-title')`; `$('.drink-entry')`; `$('main')`; `$('[data-add-note]')` |
| Filters | `:first` in `$('#breakfasts .row:first')`; `:not(:disabled)` in `restoreFocus()`; `:visible` in the filter toggle |
| Traversal and `$(this)` | `$button.closest('article').find('.dish-title')` and `$button.siblings('[data-add-note]')` in the "Add to order" handler; `.closest('li')` in the order list handler; `.each()` in `js/drinks.js` |
| Chains of 3+ methods | `setButtonDisabled()`; the "Added" note `.text().delay().fadeOut()`; `.before(...).remove()` in `js/menu.js` |
| Delegated handlers | `order.$list.on('click', '[data-action]', ...)`; `$('main').on('click', '.add-to-order', ...)`; `$controls.on('change', 'select', ...)` |
| Effects tied to visitor actions | `slideUp` when a line is removed; `fadeIn` for the order confirmation; `fadeOut` for the "Added" note; `slideToggle` for the filter panel; `slideDown`/`slideUp` for "Nothing matches" |
| Empty states | empty order message; "Nothing matches your search"; "No guest comments yet" |

## Form validation (plain JavaScript)

| Requirement | Where |
| --- | --- |
| Prevent default, trim, check every field | submit handlers in `js/feedback.js` and `js/visit.js`; `.trim()` in `readValues()` and `readVisit()` |
| E-mail and phone format | `EMAIL_PATTERN`, `PHONE_PATTERN` in `validateContact()` (`js/forms.js`) |
| Error beside each field | `setUpFieldErrors()` creates one `invalid-feedback` element per field |
| Error cleared once the field is fixed | the form listener in `setUpFieldErrors()` re-checks the field with `getErrors()` |
| Confirmation only when every check passes, then reset | `if (!reportErrors(...)) return;` followed by `form.reset()` and `showSummary()` |
| Browser attributes kept, server note | `required` stays in the HTML; comment above `enableForm()` |

## Technical floor

| Requirement | Status |
| --- | --- |
| No console errors | checked on all six pages |
| No horizontal overflow at 375 px | checked on all six pages |
| No `onclick` attributes | none in `new/*.html` |
| No new hand-written HTML or CSS | only `<script>` tags, one comment and one `id` hook were added to HTML; `css/` unchanged |
