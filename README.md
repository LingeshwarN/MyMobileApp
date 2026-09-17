# CineBooks

A React Native movie-booking app with a Node.js/Express + MongoDB backend.

## Prerequisites

- **Node.js** >= 18 (tested with 24)
- **Java 17** (Eclipse Adoptium / OpenJDK)
- **MongoDB** running on `localhost:27017` (single-node replica set `rs0` — needed for the transactional seat swap)
- **Android Studio** with SDK 37 and an AVD (e.g. Pixel_4)
- Environment variables (set once):
  ```
  ANDROID_HOME = C:\Users\<you>\AppData\Local\Android\Sdk
  JAVA_HOME    = <your JDK 17 path>
  Path         += %ANDROID_HOME%\platform-tools
                 %ANDROID_HOME%\emulator
                 %JAVA_HOME%\bin
  ```

## Quick start

```bash
# 1. Start MongoDB as a single-node replica set (required for swap transactions)
mongod --dbpath <data-dir> --replSet rs0
#    then initiate the replica set once:
node -e "async function x(){const{MongoClient}=require('mongodb');const c=new MongoClient('mongodb://127.0.0.1:27017',{directConnection:true});await c.connect();try{await c.db('admin').command({replSetInitiate:{_id:'rs0',members:[{_id:0,host:'127.0.0.1:27017'}]}})}catch(e){console.log(e.message)}await c.close()}x()"

# 2. Seed the database (first time only)
cd backend
npm install
npm run seed
node scripts/seedShowtimes.js

# 3. Start the backend API
npm start
#   → http://localhost:5000/api/health

# 4. In a new terminal — start Metro
cd ..        # project root
npm install
npm start    # → http://localhost:8081

# 5. Build and install the debug APK
cd android
.\gradlew.bat assembleDebug
cd ..

# 6. Boot an emulator and install
emulator -avd Pixel_4 &
adb install -r android\app\build\outputs\apk\debug\app-debug.apk

# 7. Launch
adb shell am start -n com.mymobileapp/.MainActivity
```

## Demo account

| Field    | Value                 |
|----------|-----------------------|
| Email    | lingesh@cinebooks.com |
| Password | Cine@2026             |

## Tech stack

| Layer        | Technology                                      |
|-------------|-------------------------------------------------|
| Mobile      | React Native 0.87, TypeScript, Redux Toolkit    |
| Navigation  | @react-navigation (Stack, Drawer, Bottom Tabs)  |
| State       | Redux + redux-persist (AsyncStorage)             |
| Backend     | Express, Mongoose, JWT (bcrypt + jsonwebtoken)  |
| Realtime    | Socket.io (seat-swap alerts)                    |
| Database    | MongoDB                                         |
| Build       | Gradle 9.4.1, AGP 8.2.2, New Architecture      |

## Project layout

```
.
├── android/              # native Android project (com.mymobileapp)
├── backend/
│   ├── models/           # Mongoose schemas (Movie, User, Showtime, Booking, Theater, Swap)
│   ├── routes/           # REST endpoints (auth, movies, showtimes, bookings, swaps, theaters, users)
│   ├── middleware/        # JWT auth middleware
│   ├── sockets/          # Socket.io /seat-swap namespace
│   ├── utils/            # seatTagging (best-view, family, premium)
│   ├── scripts/          # seedShowtimes.js
│   └── seed.js           # seed movies/genres/demo user
├── src/
│   ├── api/              # axios client (10.0.2.2:5000)
│   ├── context/          # UserContext (real auth)
│   ├── hooks/            # useCachedFetch, useSocket
│   ├── navigation/       # AppNavigator, DrawerNavigator, MainTabs, AuthStack
│   ├── screens/          # Home, MovieDetail, Bookings, Orders, Login, Register …
│   ├── store/            # Redux slices + redux-persist
│   ├── services/         # api.ts (fetch wrapper, cache, normalize helpers)
│   └── theme/            # Colors, Typography, Spacing, Shadow, BorderRadius
└── package.json
```

## Useful commands

```bash
# TypeScript check
npm run typecheck

# Lint
npm run lint          # frontend
cd backend && npm run lint

# Tests
npm test              # frontend
cd backend && npm test

# Rebuild APK
cd android && .\gradlew.bat assembleDebug

# Re-seed (wipe + repopulate)
cd backend && npm run seed && node scripts/seedShowtimes.js
```
