# JavaScript Checklist

Paths are relative to `new/`. Author of all JavaScript: Arlan Kudabay.

## Setup

| Requirement | File:line |
| --- | --- |
| `js` folder, shared `main.js`, page files | `js/main.js`, `js/menu.js`, `js/drinks.js`, `js/feedback.js`, `js/visit.js` |
| Scripts loaded with `defer` | `index.html:117`; `menu.html:176-177`; `drinks.html:184-185`; `feedback.html:222-223`; `visit.html:212-213`; `colophon.html:116` |
| `'use strict'` | `js/main.js:1`; `js/menu.js:1`; `js/drinks.js:1`; `js/feedback.js:1`; `js/visit.js:1` |
| `const` by default, `let` only for changing values | `let cart` `js/main.js:71`; loop counter `js/visit.js:26` |
| No `var`, `==`, `!=`, inline events, `document.write()`, `innerHTML`, `element.style` | all files (checked with a search) |

## Assignment 4 — data and logic

| Requirement | File:line |
| --- | --- |
| Array of 8 objects with 6 properties each (`id`, `name`, `category`, `price`, `description`, `photo`) | `js/main.js:4-13` |
| Second data array (reviews) | `js/feedback.js:5-7` |
| Filter | `js/menu.js:8` (menu search and category); `js/main.js:238` (remove an order line) |
| Find | `js/main.js:53` (`findItem`); `js/main.js:93`; `js/drinks.js:6` |
| Transform (map) | `js/main.js:221` (order lines); `js/main.js:281` (order summary text); `js/menu.js:45`, `js/menu.js:69` |
| Total (reduce) | `js/main.js:86-89` (`cartTotals`) |
| Loops | `for` `js/visit.js:26`; `forEach` `js/main.js:183`, `js/main.js:422`, `js/menu.js:46` |
| Reusable functions with parameters and return values | `formatPrice` `js/main.js:44`; `findItem` `js/main.js:52`; `lineSubtotal` `js/main.js:81`; `cartTotals` `js/main.js:85`; `validateContact` `js/main.js:327`; `filterItems` `js/menu.js:6`; `validateInquiry` `js/feedback.js:77`; `validateVisit` `js/visit.js:49`; `describeVisit` `js/visit.js:86` |
| A function that calls another | `cartTotals` calls `lineSubtotal` `js/main.js:88`; `validateVisit` calls `validateContact` `js/visit.js:50`; `validateInquiry` calls `validateContact` `js/feedback.js:78` |
| Arithmetic | `js/main.js:82` (price × quantity); `js/main.js:87-88` (totals); `js/visit.js:13` (minutes → time); `js/visit.js:73` (now + 60 min) |
| `if/else` | `js/main.js:237-243`; `js/feedback.js:86-92`; `js/visit.js:54-58` |
| `switch` | `js/feedback.js:10` (`recommendLabel`); `js/feedback.js:99` (topic rules) |
| Logical operators `&&`, `||`, `!` | `js/menu.js:8-9`; `js/main.js:65`; `js/main.js:210`; `js/visit.js:54`; `js/feedback.js:82` |
| `===` and `!==` in project logic | `js/main.js:53`, `js/main.js:219`, `js/main.js:238`, `js/menu.js:16`, `js/menu.js:71`, `js/feedback.js:104` |
| `Math.random()` | `js/main.js:98` — demo order reference `GC-xxxx`, shown as a demonstration only |

## Assignment 5 — DOM, events, validation

| Requirement | File:line |
| --- | --- |
| One reusable function renders repeated items | menu cards `js/menu.js:12` (`createMenuCard`); order lines `js/main.js:160` (`createCartLine`); reviews `js/feedback.js:20` (`createReviewCard`) |
| Create elements with DOM methods | `js/main.js:19-28` (`createElement` helper); order modal `js/main.js:112-155`; time field `js/visit.js:17-32` |
| Remove / replace elements | `js/main.js:221` (`replaceChildren`); `js/menu.js:69`; `js/menu.js:84` (`replaceWith`); `js/feedback.js:42` |
| Attributes | `js/main.js:105-106` (`data-bs-*`); `js/main.js:171` (`aria-label`); `js/feedback.js:120` (`min`); `js/visit.js:98-100` (`min`, `max`) |
| `classList` states: hidden, active/disabled, error, success | hidden `js/main.js:222-223`, `js/menu.js:71`; disabled `js/main.js:40-41`; error `js/main.js:362`, `js/main.js:366`; success summary `js/main.js:428` |
| `textContent` for user text | `js/main.js:25` (every element made with `createElement`); summary rows `js/main.js:423`; review text `js/feedback.js:23` |
| `addEventListener` — `submit` | `js/feedback.js:134`; `js/visit.js:118` |
| `addEventListener` — `click` | `js/main.js:187`, `js/main.js:192`, `js/main.js:197`, `js/main.js:257`, `js/main.js:271`, `js/main.js:279`; `js/menu.js:76` |
| `addEventListener` — `input` / `change` | `js/menu.js:74-75`; `js/main.js:390-396`; `js/feedback.js:165`; `js/visit.js:114-115` |
| Other events | `reset` `js/main.js:397`, `js/visit.js:116`; Bootstrap `hidden.bs.modal` `js/main.js:297` |
| Search/filter with count, no-results state and reset | `js/menu.js:67-81` |
| Calculation flow (order totals) | `js/main.js:81-90`, `js/main.js:217-233` |
| Empty state for every generated list | order `js/main.js:135`, `js/main.js:222`; menu `js/menu.js:64`, `js/menu.js:71`; reviews `js/feedback.js:46-48` |
| Checkout disabled when empty | `js/main.js:226` |

## Form validation

| Requirement | File:line |
| --- | --- |
| Trimmed required text | `js/main.js:329-333` (name); used by both forms |
| Email / phone (regular expressions) | patterns `js/main.js:306-308`; checks `js/main.js:334-339` |
| Number rule | `js/feedback.js:82`; `js/visit.js:54-58` |
| Date rule (no past dates, limited range) | `js/feedback.js:86-92`; `js/visit.js:60-66` |
| Selection rule | recommend `js/feedback.js:94`; time `js/visit.js:68`; contact method `js/visit.js:79` |
| Rule combining fields | topic + quantity/date `js/feedback.js:99-107`; topic + message length `js/feedback.js:108-113`; date + time `js/visit.js:70-77` |
| Error beside each field | `js/main.js:379-388` |
| Focus first invalid field | `js/main.js:404-406` |
| Clear outdated errors | `js/main.js:390-397`, `js/main.js:401` |
| Summary of choices + "no data sent" statement | `js/feedback.js:146-163`; `js/visit.js:126-137`; `js/main.js:420-430` |
| Character counter | `js/feedback.js:125-132` |
| Live booking summary | `js/visit.js:86-91`, `js/visit.js:105-116` |

## Accessibility

| Requirement | File:line |
| --- | --- |
| Real `<button>` elements for actions | `js/main.js:30-34` (`createButton`) |
| Labels for generated controls | `js/menu.js:33-39`; `js/visit.js:20-21` |
| Screen-reader status messages (`role="status"`) | `js/main.js:132`; `js/main.js:254`; `js/menu.js:63`; `js/main.js:414` |
| Errors linked to fields (`aria-describedby`, `aria-invalid`) | `js/main.js:363`, `js/main.js:385` |
| Keyboard focus kept after the order list re-renders | `js/main.js:207-215` |
| Messages use text, not colour alone | every error and confirmation is written text |
