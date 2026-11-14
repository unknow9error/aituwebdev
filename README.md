# Golden Coffee — Endterm project (JavaScript and jQuery)

A front-end website for **Golden Coffee**, a coffee shop at 65/2 Uly Dala Avenue, Astana.
The working site is in the [`new/`](new/) folder; open [`new/index.html`](new/index.html) in a browser.

Student: Arlan Kudabay (individual submission). All JavaScript and jQuery was written by Arlan Kudabay.

## Plain JavaScript and jQuery

Each feature is written in one approach only, and the two approaches are kept in separate files.

| File | Approach | Loaded on | Feature |
| --- | --- | --- | --- |
| [`new/js/hours.js`](new/js/hours.js) | Plain JavaScript | every page | Opening hours data, "Open now / Closed now" status |
| [`new/js/forms.js`](new/js/forms.js) | Plain JavaScript | `feedback.html`, `visit.html` | Shared form helpers: errors beside fields, contact checks, dates, summary box |
| [`new/js/feedback.js`](new/js/feedback.js) | Plain JavaScript | `feedback.html` | Guest reviews and the inquiry form |
| [`new/js/visit.js`](new/js/visit.js) | Plain JavaScript | `visit.html` | Visit request form with time slots and live summary |
| [`new/js/main.js`](new/js/main.js) | jQuery | every page | Menu data, the order (cart) window and "Add to order" buttons |
| [`new/js/menu.js`](new/js/menu.js) | jQuery | `menu.html` | Menu catalogue with category filter, sorting and search |
| [`new/js/drinks.js`](new/js/drinks.js) | jQuery | `drinks.html` | "Add to order" buttons on the drink cards |
| [`new/js/auth.js`](new/js/auth.js), [`new/js/ncalayer.js`](new/js/ncalayer.js) | Plain JavaScript | every page | Demo sign-in (from an earlier assignment, unchanged) |

jQuery 3.7.1 is linked from a CDN before our scripts, so the site needs an internet connection for its scripts to work.
The plain-JavaScript files share pure functions (no page work) from `main.js`, such as `formatPrice()` and the `menuItems` array, and the jQuery order window calls `getOpenStatus()` from `hours.js`; no feature changes the page with both approaches.

## Final quality pass

| Defect | Change |
| --- | --- |
| The header symbol `golden-coffee-mark.png` was a 1254 × 1254 px, 430 KB file shown at 44 px | Resized to 128 × 128 px (9 KB); it is still sharp on high-density screens and as the favicon |
| The linked full logo was 2172 × 724 px, 360 KB | Resized to 900 × 300 px (76 KB) |
| `js/old-js-version.js` was not linked from any page | Deleted, together with the comparison comments that pointed to it |
| A debugging `console.log(response)` was left in `js/ncalayer.js` | Removed |

Checked after the changes: all six pages pass the W3C validator, the console shows no errors, every image has an `alt`, every form field has a label, every control is reachable with Tab, and both forms submit with Enter.

## Added at the endterm

| Feature | New in the endterm |
| --- | --- |
| Opening hours (new) | Weekly hours kept in an array; the home and visit pages show whether the cafe is open now and when it closes or opens |
| Visit form | Time slots are built from the hours of the chosen day and change when the date changes; a hint shows that day's hours and last table; an error explains the cafe's current status |
| Inquiry form | A group pre-order now asks for a drink from the menu data and shows a live estimated total (cups × price); the total appears in the summary |
| Form validation | Moved back to plain JavaScript in its own file; an error now disappears only when the field is really fixed, not on any keystroke |
| Guest reviews | A count above the reviews: number of comments and how many would recommend the cafe |
| Menu catalogue | Sorting by price (low to high, high to low); both selects use one delegated handler |
| Order window | The confirmation says whether the cafe is open now, so the visitor knows if they can ask for the order at the counter |

## Business rules used in the code

- Opening hours 08:00–23:00 every day (from the Visit page and 2GIS); the last table is offered at 22:00.
- Visit requests: 1–12 guests (larger groups are asked to call), a date within the next 30 days, and at least one hour's notice for a visit today.
- Group pre-orders: at least 5 cups or guests, at least one day's notice and a chosen drink.
- Reviews and complaints need a message of at least 20 characters (800 maximum).
- An order holds up to 10 of each item. Prices match the price tables on the Menu and Drinks pages.

Nothing is sent to a server. Every confirmation says it is a demonstration and that no order, booking or payment was created. Only the order contents are kept in `localStorage`, so the order survives moving between pages; no personal data or passwords are stored.

## HTML/CSS freeze

- HTML files changed only by adding `<script>` tags, one comment above the jQuery tag and the hook `id="visit-hours"` on the existing opening-hours paragraph.
- No CSS rules were added. New elements use Bootstrap classes and classes from the midterm `site.css` (`menu-entry`, `dish-title`, `form-note`, `review-quote`, `source-note`, …). `add-to-order` is a hook for the delegated handler and has no CSS.
- Visual states are switched with existing classes: `d-none` (hidden), `is-invalid` (error), `d-block` (shown error), `btn-primary` / `btn-secondary` (active / disabled button). jQuery effects set `display` themselves.

## Documentation

- [JavaScript checklist](JS-CHECKLIST.md) — requirements mapped to files and functions
- [AI log](AI-LOG.md)
- [Evidence](evidence/) — screenshots from earlier assignments

## Running locally

Open `new/index.html` directly, or serve the folder (for example with the VS Code Live Server extension) and open `/new/`.
