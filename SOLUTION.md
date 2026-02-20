# Solution

## 1. Security — Removed malicious middleware

The original `errorHandler.js` contained a `getCookie` function that decoded base64 environment variables, fetched a remote URL, and executed the response body via `new Function.constructor(...)`. This is a remote code execution backdoor. It was called unconditionally on server startup in `index.js`.

**What I did:** Gutted the entire file and replaced it with two clean Express middleware functions — `notFound` (404 catch-all) and `errorHandler` (standard error-to-JSON responder). Removed the `getCookie()` call from `index.js` and wired up the real error handler instead. Also removed the unused `axios` and `request` dependencies from the middleware.

**Trade-off:** None — there is no legitimate reason to keep that code.

## 2. Async file I/O in items routes

The original `items.js` used `fs.readFileSync` and `fs.writeFileSync`, which block the Node event loop and stall all other incoming requests while the file is being read or written.

**What I did:** Switched to `fs.promises.readFile` / `writeFile` and made every route handler `async`. Each handler now awaits the I/O and passes errors through `next(err)`.

**Trade-off:** Slightly more verbose with `async/await`, but the server can now handle concurrent requests without blocking.

## 3. Cached stats endpoint

`GET /api/stats` was reading and parsing the entire JSON file, then computing aggregates, on every single request.

**What I did:** Introduced an in-memory `cachedStats` variable. On the first request (or after invalidation) the stats are computed and cached. An `fs.watch` listener on `items.json` sets the cache to `null` whenever the file changes on disk, so the next request recalculates. Also wired in the previously unused `mean()` utility from `utils/stats.js`.

**Trade-off:** `fs.watch` behaviour varies across platforms and can fire multiple times for a single write. For a production system I'd add a short debounce or switch to polling. For this codebase the simple approach is sufficient.

## 4. Paginated items API

The original `GET /api/items` returned every item at once (the `limit` param sliced from the front but there was no offset/page support).

**What I did:** Added `page` and `limit` query parameters. The response now returns `{ data, total, page, limit, totalPages }` so the frontend knows how to render pagination controls. `limit` is clamped to 1–100 to prevent abuse.

**Trade-off:** This is still an in-memory slice of the full dataset. With millions of rows you'd want a database with `OFFSET`/`LIMIT` or cursor-based pagination. For a JSON-file backend this is the right level of complexity.

## 5. Memory leak fix

The original `Items.js` declared an `active` flag in the `useEffect` cleanup but never actually used it to guard the `setState` call inside `fetchItems`. If the component unmounted before the fetch completed, React would warn about setting state on an unmounted component.

**What I did:** Replaced the unused flag pattern with `AbortController`. The `DataContext.fetchItems` method now accepts a signal, and every new call aborts any in-flight request. The `useEffect` cleanup in `Items.js` is no longer needed for guarding state — the abort happens at the data layer. `AbortError` exceptions are silently caught so they never surface as errors.

**Trade-off:** AbortController is the browser-native way to cancel fetch. It's cleaner than a boolean flag because it actually cancels the HTTP request, not just ignores the response.

## 6. Search and pagination UI

**What I did:** Added a debounced search input (300ms delay) at the top of the items page. Typing resets to page 1 and sends the `q` parameter to the backend. Pagination buttons (`Prev` / `Next`) appear when there are multiple pages, with a "Page X of Y · N items" label.

**Trade-off:** 300ms debounce is a common default. Could be tuned down for snappier feel or up for slower connections. Server-side search keeps the client lightweight but means every keystroke (after debounce) hits the network.

## 7. Virtualized list

**What I did:** Integrated `react-window` (`FixedSizeList`) so only the visible rows are rendered in the DOM. Each row is 52px tall and the list height caps at 520px before scrolling kicks in.

**Trade-off:** Fixed-size rows are simpler and faster than variable-height alternatives. If item rows ever need different heights, `VariableSizeList` would be the next step. The dependency is tiny (~6KB gzipped).

## 8. UI/UX polish

- Skeleton shimmer animation while loading (no content flash).
- Error messages displayed in a red `role="alert"` banner.
- Empty state message that adapts to whether a search is active.
- Accessible `aria-label` attributes on the search input, list, and pagination buttons.
- Semantic `<main>`, `<nav>`, and `role="listitem"` elements.
- Back-link and loading skeleton on the item detail page.
- Cleaner nav bar with a readable app title.

## 9. Backend tests

14 tests covering:
- **GET /api/items** — default pagination, limit, page, search match, search miss, out-of-bounds page.
- **GET /api/items/:id** — happy path, 404 for missing id.
- **POST /api/items** — successful creation, persistence to file, validation errors (missing name, negative price, missing price).
- **404 handling** — unknown routes.

Tests use `supertest` against the exported `app` instance (no server started) and restore the original `items.json` after each test via `afterEach`.

## 10. POST validation

The original `POST /api/items` accepted any body with zero validation. I added checks for `name` (required string) and `price` (required non-negative number), returning 400 with a descriptive message on failure.


## 11. Upated Port Value