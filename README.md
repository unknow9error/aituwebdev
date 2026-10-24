# Golden Coffee — Assignment 4–5 (JavaScript)

A front-end website for **Golden Coffee**, a coffee shop at 65/2 Uly Dala Avenue, Astana.
The working site is in the [`new/`](new/) folder; open [`new/index.html`](new/index.html) in a browser.

Student: Arlan Kudabay (individual submission).

## What JavaScript adds

| File | Loaded on | Purpose |
| --- | --- | --- |
| [`new/js/main.js`](new/js/main.js) | every page | Menu data, shared helpers, the order (cart) and form validation helpers |
| [`new/js/menu.js`](new/js/menu.js) | `menu.html` | Menu catalogue with category filter and search |
| [`new/js/drinks.js`](new/js/drinks.js) | `drinks.html` | "Add to order" buttons on the drink cards |
| [`new/js/feedback.js`](new/js/feedback.js) | `feedback.html` | Guest review cards and the inquiry form flow |
| [`new/js/visit.js`](new/js/visit.js) | `visit.html` | Visit request (booking) flow with live summary |

All scripts use `'use strict'` and are loaded with `defer`. No libraries besides the Bootstrap bundle from the midterm.

## Functionality Plan

| Page | Visitor goal | Planned function | Expected result | Responsible |
| --- | --- | --- | --- | --- |
| All pages (shared) | Put together an order before coming to the cafe | Order button in the header and an order window (Bootstrap modal) | Add, increase, decrease, remove and clear items; totals update after every change; empty state; checkout disabled when empty; demo reference number on checkout | Arlan Kudabay |
| `menu.html` | Find a dish or drink quickly | Catalogue rendered from the `menuItems` array with category filter and search | Matching cards, "Showing X of 8 items", a no-results message and a Reset button; each card has "Add to order" | Arlan Kudabay |
| `drinks.html` | Order a featured drink | "Add to order" on the three drink cards | The drink is added to the shared order with a short confirmation | Arlan Kudabay |
| `feedback.html` | Read guest comments and leave one | Review cards from the `reviews` array; new reviews use the same function | Name, text, recommendation and automatic date/time; character counter on the message | Arlan Kudabay |
| `feedback.html` | Send feedback or a group pre-order request | Inquiry form validation | Errors beside fields, focus on the first invalid field, topic-specific rules, summary of choices | Arlan Kudabay |
| `visit.html` | Plan a visit for a date, time and group size | Visit request flow with a time selector and live summary | Rejects past dates, impossible group sizes and times less than one hour away; demo request summary | Arlan Kudabay |

## Business rules used in the code

- Opening hours 08:00–23:00 (from the Visit page); the last seating time offered is 22:00.
- Visit requests: 1–12 guests (larger groups are asked to call), a date within the next 30 days, and at least one hour's notice for a visit today.
- Group pre-orders: at least 5 cups or guests and at least one day's notice.
- Reviews and complaints need a message of at least 20 characters (800 maximum).
- An order holds up to 10 of each item. Prices match the price tables on the Menu and Drinks pages.

Nothing is sent to a server. Every confirmation says it is a demonstration and that no order, booking or payment was created. Only the order contents are kept in `localStorage`, so the order survives moving between pages; no personal data or passwords are stored.

## HTML/CSS freeze

- HTML files changed only by adding `<script>` tags.
- No CSS rules were added. New elements use Bootstrap classes and classes from the midterm `site.css` (`menu-entry`, `dish-title`, `form-note`, `review-quote`, `source-note`, …).
- Visual states use `classList`: `d-none` (hidden), `is-invalid` (error), `d-block` (shown error), `btn-primary` / `btn-secondary` (active / disabled button).
- JavaScript replaces some midterm content at runtime: the three static breakfast cards are replaced by the rendered catalogue (and the heading becomes "Breakfast and drinks"); the static review is rendered from the `reviews` array; the disabled midterm submit buttons are enabled because validation now runs in JavaScript. Without JavaScript, the midterm content is still shown.
- Midterm corrections: none.

## Documentation

- [JavaScript checklist](JS-CHECKLIST.md) — requirements with exact files and line numbers
- [AI log](AI-LOG.md)
- [Evidence](evidence/) — screenshots of each flow, including a 375 px phone view

## Running locally

Open `new/index.html` directly, or serve the folder (for example with the VS Code Live Server extension) and open `/new/`.
