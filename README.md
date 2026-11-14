# Golden Coffee — Endterm project (JavaScript and jQuery)

A front-end website for **Golden Coffee**, a coffee shop at 65/2 Uly Dala Avenue, Astana.
The working site is in the [`new/`](new/) folder; open [`new/index.html`](new/index.html) in a browser.

Student: Arlan Kudabay (individual submission). All JavaScript and jQuery was written by Arlan Kudabay.

## Plain JavaScript and jQuery

Each feature is written in one approach only, and the two approaches are kept in separate files.

| File | Approach | Loaded on | Feature |
| --- | --- | --- | --- |
| [`new/js/auth.js`](new/js/auth.js) | Plain JavaScript | every page | Visitor accounts: create an account, sign in, log out; fills in the forms for a signed-in visitor |
| [`new/js/hours.js`](new/js/hours.js) | Plain JavaScript | every page | Opening hours data, "Open now / Closed now" status |
| [`new/js/forms.js`](new/js/forms.js) | Plain JavaScript | every page | Shared form helpers: errors beside fields, contact checks, dates, summary box, filling in account details |
| [`new/js/feedback.js`](new/js/feedback.js) | Plain JavaScript | `feedback.html` | Guest reviews, built from the `reviews` array |
| [`new/js/visit.js`](new/js/visit.js) | Plain JavaScript | `visit.html` | Visit request form with time slots and live summary |
| [`new/js/main.js`](new/js/main.js) | jQuery | every page | Menu data, the order (cart) window and "Add to order" buttons |
| [`new/js/catalogue.js`](new/js/catalogue.js) | jQuery | `menu.html`, `drinks.html` | Catalogue built from `menuItems` with category filter, sorting and search |
| [`new/js/menu.js`](new/js/menu.js) | jQuery | `menu.html` | Shows the dishes in the catalogue |
| [`new/js/drinks.js`](new/js/drinks.js) | jQuery | `drinks.html` | Shows the drinks in the catalogue, with a Coffee / Tea filter |

jQuery 3.7.1 is linked from a CDN before our scripts, so the site needs an internet connection for its scripts to work.
The jQuery order window calls `getOpenStatus()` from `hours.js`; no feature changes the page with both approaches.

## Final quality pass

| Defect | Change |
| --- | --- |
| The header symbol `golden-coffee-mark.png` was a 1254 × 1254 px, 430 KB file shown at 44 px | Resized to 128 × 128 px (9 KB); it is still sharp on high-density screens and as the favicon |
| The "About this site" (colophon) page described how the site was made, not the cafe, and was the only page linking the 360 KB full logo | The page, its link in the navigation and the logo file were removed |
| `js/old-js-version.js` was not linked from any page | Deleted, together with the comparison comments that pointed to it |
| A debugging `console.log(response)` was left in `js/ncalayer.js` | Removed; the whole electronic-signature (ECP) sign-in was later removed, see below |
| The menu page also listed the drinks, so the same drinks appeared on two pages, while Americano and Cappuccino could not be ordered from the Drinks page | `menu.html` now shows only the dishes and `drinks.html` shows all five drinks from the same data, with a Coffee / Tea filter |
| The drinks section was titled "Popular Drinks" but now lists every drink | Renamed to "Our Drinks" |
| The drinks price table called the sea buckthorn tea "Berry Tea", while the cards and the order used "Sea Buckthorn Tea" | The table row was renamed to match |
| The feedback page had a second form under the reviews (feedback or group pre-order inquiry) that duplicated what the visit form and the phone already offer, and its reviews were never sent anywhere | The form, its link at the top of the page and its code were removed; the page now shows the reviews, photos and contacts, and its title and description say so |
| Sign-in only worked with one shared test account or with NCALayer (ECP) installed, and there was no way to register | Replaced with a clear account dialog: create an account (name, email, phone, password with confirmation, an error beside each field) or sign in; a signed-in visitor gets the feedback and visit forms filled in. The ECP script and its styles were removed |

Checked after the changes: all five pages pass the W3C validator, the console shows no errors, every image has an `alt`, every form field has a label, every control is reachable with Tab, and the visit form and the account dialog submit with Enter.

## Added at the endterm

| Feature | New in the endterm |
| --- | --- |
| Opening hours (new) | Weekly hours kept in an array; the home and visit pages show whether the cafe is open now and when it closes or opens |
| Visit form | Time slots are built from the hours of the chosen day and change when the date changes; a hint shows that day's hours and last table; an error explains the cafe's current status |
| Inquiry form | A group pre-order asked for a drink and showed an estimated total (removed at the final together with the form) |
| Form validation | Moved back to plain JavaScript in its own file; an error now disappears only when the field is really fixed, not on any keystroke |
| Guest reviews | A count above the reviews: number of comments and how many would recommend the cafe |
| Menu catalogue | Sorting by price (low to high, high to low); both selects use one delegated handler |
| Order window | The confirmation says whether the cafe is open now, so the visitor knows if they can ask for the order at the counter |

## Business rules used in the code

- Opening hours 08:00–23:00 every day (from the Visit page and 2GIS); the last table is offered at 22:00.
- Visit requests: 1–12 guests (larger groups are asked to call), a date within the next 30 days, and at least one hour's notice for a visit today.
- An order holds up to 10 of each item. Prices match the price tables on the Menu and Drinks pages.

Nothing is sent to a server. Every confirmation says it is a demonstration and that no order, booking or payment was created. The order contents and visitor accounts are kept in `localStorage`, only in the visitor's own browser; a password is stored only as a salted SHA-256 hash, and the account dialog warns not to reuse a password from another site.

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
