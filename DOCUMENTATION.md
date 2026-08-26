# CineBooks — Full-Stack Movie Booking Mobile Application
## Lab Record & Comprehensive Documentation (Experiments 1 – 12)

---

### Executive Summary
**CineBooks** is a feature-rich, high-performance, colorful mobile movie booking application built with **React Native (TypeScript)**, **React Navigation v7**, **Redux Toolkit**, **Context API**, **AsyncStorage**, and a **Node.js / Express / MongoDB** RESTful API backend.

---

### Experiment Summary & Implementation Details

#### Experiment 1 (CO1): Core UI Screens with React Native Components
- **Welcome / Home Screen**: CineBooks branding, tagline, Get Started action.
- **Login Screen**: Profile icon, email/password fields, Login, Forgot Password, Sign Up links.
- **Home Screen**: Search bar, promotional banner, genre chips, 2-column featured movies grid.
- **Movie Detail Screen**: Movie poster, synopsis, rating, release date, language, duration, showtimes, and Book Now.
- **Bookings Screen**: Selected movie details, showtime, interactive seat picker, seat quantity, subtotal, total price calculation, payment options.

#### Experiment 2 (CO1): Responsive Layout & Professional Styling
- **Theme System**: Deep purple (`#1A1A2E`) & gold (`#FFB800`) cinema theme defined in `src/theme/colors.ts`, `src/theme/typography.ts`, and `src/theme/spacing.ts`.
- **Flexbox Layout**: Fully responsive card grids, headers, and form containers adapting across Android screen sizes.
- **FlatList Movie Explorer**: Movie Explorer screen utilizing `FlatList` for smooth list rendering with posters, ratings, genres, and synopsis.
- **Bottom Navigation Bar**: 5 equally spaced icons (Home, Genres, Bookings, Orders, Profile).

#### Experiment 3 (CO2): React Navigation (Stack, Bottom Tab, Drawer)
- **Stack Navigation**: `AuthStack` (Welcome → Login → Register) and `HomeStack` (Home → MovieDetail → Booking → ProfileEdit → Preferences).
- **Bottom Tab Navigation**: `MainTabs` providing quick access to Home, Genres, Bookings, Orders, and Profile.
- **Drawer Navigation**: `DrawerNavigator` providing access to Booking History, Wishlist, Saved Preferences, Settings, Help & Support, and Logout.

#### Experiment 4 (CO2): State Management Comparison & Implementation
- **Local Hooks (`useState`)**: Screen-specific state (search keyword, selected showtime, selected seats, form inputs).
- **Context API (`UserContext`, `BookingContext`)**: Cross-screen shared state without prop drilling for session and booking items.
- **Redux Toolkit (`userSlice`, `bookingSlice`, `wishlistSlice`)**: Global store demonstrating `configureStore`, `createSlice`, `useSelector`, and `useDispatch`.

##### State Management Comparison (For Lab Record)
| Criterion | `useState` | Context API | Redux Toolkit |
| :--- | :--- | :--- | :--- |
| **Scope** | Single component / screen | Tree-scoped cross-screen | App-wide global store |
| **Complexity** | Minimal setup | Moderate setup | Higher initial boilerplate |
| **Performance** | Ideal for local UI inputs | May trigger re-renders on context consumers | Highly optimized with selectors |
| **Best Use Case** | Text inputs, toggles, modal visibility | User authentication, current theme | Global carts, bookings, wishlists |

#### Experiment 5 (CO3) & Experiment 6 (CO3): User Interaction Forms & Validation
- **Registration Form**: Full Name, Mobile, Email, Password, Confirm Password, Gender, Date of Birth, City, Address, Terms & Conditions toggle.
- **Validation Rules**:
  - Full Name: Alphabetic characters only (`/^[a-zA-Z\s]+$/`).
  - Mobile Number: Exactly 10 digits (`/^\d{10}$/`).
  - Email: Valid format regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
  - Password: Min 8 chars, uppercase, digit, special character.
- **Simulated JWT Auth**: Generates token `jwt_<timestamp>`, persists to `AsyncStorage`, and supports auto-login session check on startup.

#### Experiment 7 (CO4) & Experiment 8 (CO4): REST API Integration & Local Data Persistence
- **Fetch API Integration**: Movie catalog and genre data fetched via `fetchMovies()` and `fetchGenres()`.
- **Axios Integration**: Profile details and promotional banners retrieved using configurable `apiClient`.
- **AsyncStorage Layer**: Write-through cache (`src/utils/storage.ts`) persisting user tokens, profiles, bookings, wishlist items, and preferences.

#### Experiment 9 (CO5), 10 (CO5), 11 (CO6), 12 (CO6): Full-Stack Node.js / Express / MongoDB Integration
- **Node.js Express Backend**: Located in `./backend` folder with configurable port (`5000`).
- **RESTful Endpoints**:
  - `GET /api/movies`, `POST /api/movies`, `PUT /api/movies/:id`, `DELETE /api/movies/:id`
  - `GET /api/genres`
  - `POST /api/auth/register`, `POST /api/auth/login` (Bcrypt + JWT)
  - `GET /api/bookings`, `POST /api/bookings`, `PUT /api/bookings/:id/cancel`
- **MongoDB Schema**: Mongoose models for `Movie`, `Genre`, `User`, and `Booking`.
- **Seeder**: `node seed.js` populates MongoDB with initial movie catalog.

---

### How to Run CineBooks in Android Studio

#### 1. Running the Mobile App (Frontend)
```bash
# In the root project directory (d:\React native\MyMobileApp):
# 1. Start Metro bundler:
npx react-native start

# 2. Run on Android Emulator (opened in Android Studio):
npx react-native run-android
```

#### 2. Running the Backend Server (Optional / Full-Stack Mode)
```bash
# Navigate to backend directory:
cd backend

# Install dependencies:
npm install

# (Optional) Seed sample data into MongoDB:
npm run seed

# Start Express server:
npm start
```
