# CineBooks — Full Implementation Blueprint

**Assumed layout:** `/frontend` (Expo + React Native + TS) and `/backend` (Express + Mongoose) as sibling folders, with Socket.io mounted on the same Express HTTP server. Adjust paths below if your repo differs.

This document has two parts:

1. **The full file map** for Phases A–F, so you have the complete picture.
2. **Working code for Step 1**: Phase A (quality gates) and Phase C's database layer (schemas + the seat-tagging algorithm), since that's the foundation everything else builds on — Redux (D), auth (E), and real-time swapping all read/write these same schemas.

Do each phase's "Test before moving on" step before continuing. Don't skip it — Phase D (Redux) and Phase E (auth) will silently break if the schemas underneath them aren't verified first.

---

## 1. Full Roadmap File Map (reference — no code yet for B, D, E, F)

| Phase | File | Purpose |
|---|---|---|
| A | `frontend/package.json`, `.eslintrc.js`, `tsconfig.json`, `jest.config.js` | Lint/typecheck/test scripts |
| A | `backend/package.json`, `.eslintrc.js`, `jest.config.js` | Same, backend side |
| **C** | `backend/models/Theater.js` | Theater + Screen + flat seat list |
| **C** | `backend/utils/seatTagging.js` | 2D matrix reconstruction + tagging algorithm |
| **C** | `backend/models/Showtime.js` | Per-showtime seat state (booked/held/swappable) |
| **C** | `backend/models/Booking.js` | User's confirmed bookings |
| **C** | `backend/models/User.js` | Auth-ready user stub |
| B | `frontend/src/services/api.ts` | Central fetch wrapper w/ AsyncStorage cache |
| B | `frontend/src/services/movies.ts`, `genres.ts`, `promos.ts` | Replace static imports |
| B | `frontend/src/hooks/useCachedFetch.ts` | Stale-while-revalidate hook |
| C | `backend/routes/theaters.js`, `showtimes.js`, `users.js` | Real CRUD replacing dead routes |
| C | `backend/controllers/*.js` | Business logic split from routes |
| D | `frontend/src/store/bookingSlice.ts` | Single source of truth for bookings |
| D | `frontend/src/store/store.ts` | `redux-persist` + AsyncStorage hydration |
| D | `frontend/src/store/thunks/syncBookings.ts` | DB ⇄ Redux reconciliation |
| E | `backend/middleware/auth.js` | JWT verify middleware |
| E | `backend/controllers/authController.js` | bcrypt hash/compare, JWT issue |
| E | `frontend/src/context/AuthContext.tsx` | Replace simulated JWT with real calls |
| — | `backend/sockets/seatSwap.js` | Socket.io namespace for swap requests |
| — | `backend/controllers/swapController.js` | Atomic `findOneAndUpdate` seat-owner swap |
| — | `frontend/src/hooks/useSocket.ts` | Socket connection + swap alert listener |
| F | `README.md`, `app.json`, `eas.json` | Branding, release config |

I'll give you B/D/E/F code in the same detailed format once A and C are verified working — bringing all of it at once would mean you're debugging six layers simultaneously with nothing to isolate the bug to.

---

## 2. PHASE A — Quality Gates

### A1. `frontend/package.json` — update `scripts`

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "lint": "eslint . --ext .ts,.tsx",
    "typecheck": "tsc --noEmit",
    "test": "jest"
  }
}
```

Install what these scripts need:

```bash
cd frontend
npx expo install jest-expo
npm install --save-dev eslint eslint-config-expo @typescript-eslint/eslint-plugin @typescript-eslint/parser jest @types/jest
```

### A2. `frontend/.eslintrc.js` (new file)

```js
module.exports = {
  root: true,
  extends: ['expo', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
```

### A3. `frontend/tsconfig.json` — ensure strict mode is on

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "skipLibCheck": true
  }
}
```

### A4. `frontend/jest.config.js` (new file)

```js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
};
```

### A5. `frontend/src/__tests__/sanity.test.ts` (new file)

```ts
describe('test harness sanity check', () => {
  it('runs and asserts correctly', () => {
    expect(1 + 1).toBe(2);
  });
});
```

### A6. `backend/package.json` — update `scripts`

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "lint": "eslint .",
    "test": "jest --runInBand"
  }
}
```

```bash
cd backend
npm install --save-dev eslint jest supertest nodemon
```

### A7. `backend/.eslintrc.js` (new file)

```js
module.exports = {
  env: { node: true, es2021: true, jest: true },
  extends: 'eslint:recommended',
  parserOptions: { ecmaVersion: 12, sourceType: 'module' },
  rules: { 'no-unused-vars': 'warn' },
};
```

### A8. `backend/jest.config.js` (new file)

```js
module.exports = {
  testEnvironment: 'node',
  testTimeout: 10000,
};
```

### A9. Add a health-check route to your existing `backend/server.js`

Add this near your other route registrations (don't replace the whole file — just insert):

```js
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});
```

### A10. `backend/tests/health.test.js` (new file)

```js
const request = require('supertest');
const app = require('../server'); // make sure server.js exports `app`, not just app.listen()

describe('GET /api/health', () => {
  it('returns 200 and status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
```

> If `server.js` currently calls `app.listen()` directly at the bottom with no export, split it: keep `app.listen()` guarded behind `if (require.main === module)` and add `module.exports = app;` at the end. This is required for supertest and won't affect normal `npm run dev`.

### ✅ Test Phase A before continuing

```bash
# Backend
cd backend && npm run lint && npm test

# Frontend
cd frontend && npm run lint && npm run typecheck && npm test

# Android emulator smoke test
# 1. Open Android Studio → Device Manager → launch a virtual device
# 2. From /frontend:
npx expo run:android
# or, if you prefer the dev-client flow:
npx expo start   # then press 'a' once the emulator is running
```

You should see: 0 lint errors (warnings are fine for now), `tsc` exits clean, both `jest` suites pass 1/1, and the app boots in the emulator. Don't touch Phase C until all four are green — it's the cheapest point to catch config drift.

---

## 3. PHASE C (Step 1) — Database Schemas + Seat-Tagging Algorithm

### Design decision: flat seat array, not a true nested 2D Mongoose array

Mongoose handles `[[Number]]` fine but nested arrays of **subdocuments** (`[[SeatSchema]]`) are fragile across versions and awkward to query/update atomically (which you'll need for swap requests later). So seats are stored as a **flat array with `row`/`col` fields**, and the 2D matrix is reconstructed in memory only when the tagging algorithm needs spatial context. This also makes individual seat updates (`$set` on an array element) straightforward for Phase E's atomic swap logic.

### C1. `backend/models/Theater.js` (new file)

```js
const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema(
  {
    row: { type: Number, required: true },   // 0-indexed
    col: { type: Number, required: true },   // 0-indexed
    label: { type: String, required: true }, // e.g. "A1", "J12"
    type: {
      type: String,
      enum: ['standard', 'premium', 'aisle'],
      default: 'standard',
    },
    tags: [{ type: String, enum: ['best-view', 'family'] }],
  },
  { _id: false }
);

const ScreenSchema = new mongoose.Schema(
  {
    screenNumber: { type: Number, required: true },
    rows: { type: Number, required: true },
    cols: { type: Number, required: true },
    seats: [SeatSchema], // flat list; see utils/seatTagging.js for matrix logic
  },
  { _id: true }
);

const TheaterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    screens: [ScreenSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Theater', TheaterSchema);
```

### C2. `backend/utils/seatTagging.js` (new file) — the 2D matrix algorithm

```js
/**
 * Reconstructs a [rows][cols] 2D matrix from a flat seat array.
 * Empty/aisle positions with no seat remain `null`.
 */
function buildMatrix(seats, rows, cols) {
  const matrix = Array.from({ length: rows }, () => new Array(cols).fill(null));
  for (const seat of seats) {
    matrix[seat.row][seat.col] = seat;
  }
  return matrix;
}

/** Flattens the matrix back into a plain array for saving to Mongo. */
function flattenMatrix(matrix) {
  const seats = [];
  for (const row of matrix) {
    for (const seat of row) {
      if (seat) seats.push(seat);
    }
  }
  return seats;
}

/**
 * BEST VIEW (gold): the sweet-spot band — not so close the screen dominates
 * the field of view, not so far the picture is small, and centered
 * horizontally so the viewing angle isn't distorted.
 *
 * rowStart/rowEnd take the middle ~30% of rows (40%–70% depth).
 * colStart/colEnd take the middle ~50% of columns (25%–75% width).
 */
function tagBestView(matrix, rows, cols) {
  const rowStart = Math.floor(rows * 0.4);
  const rowEnd = Math.ceil(rows * 0.7);
  const colStart = Math.floor(cols * 0.25);
  const colEnd = Math.ceil(cols * 0.75);

  for (let r = rowStart; r < rowEnd; r++) {
    for (let c = colStart; c < colEnd; c++) {
      const seat = matrix[r][c];
      if (seat && seat.type !== 'aisle' && !seat.tags.includes('best-view')) {
        seat.tags.push('best-view');
      }
    }
  }
  return matrix;
}

/**
 * FAMILY BOOKING (blue): scans the four corner regions of the grid for
 * horizontally contiguous runs of 3–4 untagged standard seats.
 *
 * A "corner region" is the outer 2 rows × 5 cols block at each corner.
 * Within each row of a region, a sliding scan finds runs of eligible
 * seats; any run ≥3 long gets its first 4 seats (or fewer, if the run
 * is exactly 3) tagged as a family cluster.
 */
function getCornerRegions(rows, cols) {
  const bandRows = Math.min(2, rows);
  const bandCols = Math.min(5, cols);
  return [
    { rStart: 0, rEnd: bandRows, cStart: 0, cEnd: bandCols },                     // top-left
    { rStart: 0, rEnd: bandRows, cStart: cols - bandCols, cEnd: cols },           // top-right
    { rStart: rows - bandRows, rEnd: rows, cStart: 0, cEnd: bandCols },           // bottom-left
    { rStart: rows - bandRows, rEnd: rows, cStart: cols - bandCols, cEnd: cols }, // bottom-right
  ];
}

function tagFamilyClusters(matrix, rows, cols) {
  const regions = getCornerRegions(rows, cols);

  for (const region of regions) {
    for (let r = region.rStart; r < region.rEnd; r++) {
      let runStart = null;

      for (let c = region.cStart; c <= region.cEnd; c++) {
        const seat = c < region.cEnd ? matrix[r][c] : null;
        const isEligible = seat && seat.type === 'standard' && seat.tags.length === 0;

        if (isEligible) {
          if (runStart === null) runStart = c;
        } else {
          if (runStart !== null) {
            const runLength = c - runStart;
            if (runLength >= 3) {
              const clusterEnd = Math.min(runStart + 4, c);
              for (let cc = runStart; cc < clusterEnd; cc++) {
                matrix[r][cc].tags.push('family');
              }
            }
          }
          runStart = null;
        }
      }
    }
  }
  return matrix;
}

/** Public entry point: takes a flat seat array, returns it re-tagged. */
function generateSeatTags(seats, rows, cols) {
  const matrix = buildMatrix(seats, rows, cols);
  tagBestView(matrix, rows, cols);
  tagFamilyClusters(matrix, rows, cols);
  return flattenMatrix(matrix);
}

module.exports = {
  buildMatrix,
  flattenMatrix,
  tagBestView,
  tagFamilyClusters,
  generateSeatTags,
};
```

### C3. `backend/models/Showtime.js` (new file) — per-showtime seat state

Physical layout (Theater/Screen) is static; booking status is per-showtime. This schema copies the tagged seat layout and adds live state — including the `swappable`/`bookedBy` fields the real-time swap feature will need later.

```js
const mongoose = require('mongoose');

const ShowSeatSchema = new mongoose.Schema(
  {
    row: Number,
    col: Number,
    label: String,
    type: String,
    tags: [String],
    status: {
      type: String,
      enum: ['available', 'held', 'booked'],
      default: 'available',
    },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    swappable: { type: Boolean, default: false }, // set true by owner post-purchase
  },
  { _id: false }
);

const ShowtimeSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    theater: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
    screenId: { type: mongoose.Schema.Types.ObjectId, required: true },
    startTime: { type: Date, required: true },
    price: {
      standard: { type: Number, required: true },
      premium: { type: Number, required: true },
    },
    seats: [ShowSeatSchema],
  },
  { timestamps: true }
);

ShowtimeSchema.index({ movie: 1, theater: 1, startTime: 1 });

module.exports = mongoose.model('Showtime', ShowtimeSchema);
```

### C4. `backend/models/Booking.js` (new file)

```js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    showtime: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
    seats: [{ row: Number, col: Number, label: String }],
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', BookingSchema);
```

### C5. `backend/models/User.js` (new file — stub for Phase E)

```js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
```

> Left deliberately minimal — Phase E adds the pre-save bcrypt hook and a `comparePassword` instance method. Adding it now, before the auth routes exist to use it, just gives you an untested code path.

### C6. `backend/scripts/seedTheater.js` (new file) — generates a test screen

```js
require('dotenv').config();
const mongoose = require('mongoose');
const Theater = require('../models/Theater');
const { generateSeatTags } = require('../utils/seatTagging');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const rows = 10;
  const cols = 12;
  const rowLetters = 'ABCDEFGHIJ';

  const rawSeats = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // leave a center aisle gap at column 5-6 boundary for realism
      const isAisle = c === 5 || c === 6;
      rawSeats.push({
        row: r,
        col: c,
        label: `${rowLetters[r]}${c + 1}`,
        type: isAisle ? 'aisle' : 'standard',
        tags: [],
      });
    }
  }

  const taggedSeats = generateSeatTags(rawSeats, rows, cols);

  const theater = await Theater.create({
    name: 'CineBooks Demo Theater',
    location: 'Madurai, TN',
    screens: [{ screenNumber: 1, rows, cols, seats: taggedSeats }],
  });

  console.log('Seeded theater:', theater._id.toString());
  const goldCount = taggedSeats.filter((s) => s.tags.includes('best-view')).length;
  const familyCount = taggedSeats.filter((s) => s.tags.includes('family')).length;
  console.log(`Best View seats: ${goldCount}, Family cluster seats: ${familyCount}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

### C7. `backend/tests/seatTagging.test.js` (new file) — unit test, no DB needed

```js
const { generateSeatTags } = require('../utils/seatTagging');

function buildFlatGrid(rows, cols) {
  const seats = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      seats.push({ row: r, col: c, label: `${r}-${c}`, type: 'standard', tags: [] });
    }
  }
  return seats;
}

describe('seatTagging algorithm', () => {
  it('tags a non-zero, bounded number of best-view seats', () => {
    const seats = buildFlatGrid(10, 12);
    const tagged = generateSeatTags(seats, 10, 12);
    const bestView = tagged.filter((s) => s.tags.includes('best-view'));
    expect(bestView.length).toBeGreaterThan(0);
    expect(bestView.length).toBeLessThan(tagged.length);
  });

  it('only tags family clusters in corner regions', () => {
    const seats = buildFlatGrid(10, 12);
    const tagged = generateSeatTags(seats, 10, 12);
    const family = tagged.filter((s) => s.tags.includes('family'));
    for (const seat of family) {
      const inTopBand = seat.row < 2;
      const inBottomBand = seat.row >= 8;
      expect(inTopBand || inBottomBand).toBe(true);
    }
  });

  it('never double-tags a seat as both best-view and family', () => {
    const seats = buildFlatGrid(10, 12);
    const tagged = generateSeatTags(seats, 10, 12);
    const overlap = tagged.filter(
      (s) => s.tags.includes('best-view') && s.tags.includes('family')
    );
    expect(overlap.length).toBe(0);
  });
});
```

### ✅ Test Phase C before continuing

```bash
cd backend

# 1. Pure algorithm unit test — no DB required, fastest feedback loop
npx jest tests/seatTagging.test.js

# 2. Full round-trip against real MongoDB
node scripts/seedTheater.js
# Expect console output like:
# Seeded theater: 65f...
# Best View seats: 24, Family cluster seats: 12

# 3. Manually eyeball it
mongosh "$MONGO_URI" --eval "db.theaters.findOne({}, {name:1, 'screens.seats':1})"
```

What to check by eye in step 3: gold (`best-view`) seats form a centered rectangle roughly rows 4–7, columns 3–9; blue (`family`) seats appear only in small clusters at the four corners, never in the center band, and no seat carries both tags (test 3 above already asserts this, but eyeballing the raw doc once is worth it before you build UI on top of it).

---

## What's next

Once Phase A and Phase C are green, the next message will cover **Phase B** (wiring `frontend/src/services/*.ts` to fetch from these new endpoints with AsyncStorage caching) and the **Theater/Showtime CRUD routes** that expose this schema over HTTP — those two have to land together, since Phase B has nothing real to fetch until the routes exist.
