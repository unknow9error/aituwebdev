# Endterm checklist

Paths are relative to `new/`. Author of all JavaScript and jQuery: Arlan Kudabay.
References name the function or the comment to search for, so they stay correct when lines move.

## Plain JavaScript

| Requirement | Where |
| --- | --- |
| Real data in arrays and objects at the top of the file | `openingHours` in `js/hours.js`; `reviews` in `js/feedback.js`; `menuItems` in `js/main.js` (shared data) |
| Page built from data with a loop | reviews: `for...of` loop in `js/feedback.js`; catalogue cards: `.map()` over `menuItems` in `renderCatalogue()` (jQuery); time slots: `for` loop in `timeSlots()` (`js/visit.js`) |
| Own functions with parameters and a return value, called from more than one place | `getOpenStatus(date)`: home and visit status lines, visit validation, order confirmation; `validateContact()`: visit form and account registration; `fillContactFields()`: on page load, after sign-in and after a reset; `toMinutes()`, `hoursFor()`: `hours.js` and `visit.js` |
| Conditions | open or closed in `getOpenStatus()`; `switch` in `recommendLabel()`; guest limits in `validateVisit()` |
| Calculated values | order totals in `cartTotals()` (`js/main.js`); review count and "would recommend" count in `reviewsSummary()`; time slots and last table from the hours |
| Event object | `event.preventDefault()` in the visit and account submit handlers; `event.target` in the form listener in `setUpFieldErrors()` (`js/forms.js`) |
| Delegated handler | one `input`/`change` listener on the visit form in `setUpFieldErrors()` also catches the time select created in code |

## jQuery

| Requirement | Where |
| --- | --- |
| CDN link before our scripts, code in `$(function () { ... })` | every page; `js/main.js`, `js/catalogue.js`, `js/menu.js`, `js/drinks.js` |
| Selectors: id, class, element, attribute | `$(page.heading)` with `'#breakfasts-title'` or `'#espresso-title'` (`js/catalogue.js`); `$section.find('.row:first')`; `$('main')`; `$('[data-add-note]')` |
| Filters | `:first` in `$section.find('.row:first')` (`js/catalogue.js`); `:not(:disabled)` in `restoreFocus()`; `:visible` in the filter toggle |
| Traversal and `$(this)` | `$button.closest('article').find('.dish-title')` and `$button.siblings('[data-add-note]')` in the "Add to order" handler; `.closest('li')` in the order list handler; `.closest('section')` in `setUpCatalogue()` |
| Chains of 3+ methods | `setButtonDisabled()`; the "Added" note `.text().delay().fadeOut()`; `$('<li>').append($button).appendTo(...)` in `buildOrderButton()` |
| Delegated handlers | `order.$list.on('click', '[data-action]', ...)`; `$('main').on('click', '.add-to-order', ...)`; `$controls.on('change', 'select', ...)` |
| Effects tied to visitor actions | `slideUp` when a line is removed; `fadeIn` for the order confirmation; `fadeOut` for the "Added" note; `slideToggle` for the filter panel; `slideDown`/`slideUp` for "Nothing matches" |
| Empty states | empty order message; "Nothing matches your search"; "No guest comments yet" |

## Form validation (plain JavaScript)

| Requirement | Where |
| --- | --- |
| Prevent default, trim, check every field | submit handler in `js/visit.js` and the register handler in `js/auth.js`; `.trim()` in `readVisit()` and `readRegistration()` |
| E-mail and phone format | `EMAIL_PATTERN`, `PHONE_PATTERN` in `validateContact()` (`js/forms.js`) |
| Error beside each field | `setUpFieldErrors()` creates one `invalid-feedback` element per field |
| Error cleared once the field is fixed | the form listener in `setUpFieldErrors()` re-checks the field with `getErrors()` |
| Confirmation only when every check passes, then reset | `if (!reportErrors(...)) return;` followed by `form.reset()` and `showSummary()` |
| Browser attributes kept, server note | `required` stays in the HTML; comment above `enableForm()` |

## Technical floor

| Requirement | Status |
| --- | --- |
| No console errors | checked on all five pages |
| No horizontal overflow at 375 px | checked on all five pages |
| No `onclick` attributes | none in `new/*.html` |
| No new hand-written HTML or CSS | only `<script>` tags, one comment and one `id` hook were added to HTML; `css/` unchanged |
