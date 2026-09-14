# Modulus17 To-Do

A full-stack To-Do application built for the Modulus17 Full Stack Developer (React Native) assignment: a React Native CLI (TypeScript) Android app backed by a NestJS + MongoDB API, with email/password authentication and complete task management.

## Overview

- **`backend/`** — NestJS + TypeScript REST API. JWT authentication, MongoDB (via Mongoose) for persistence, per-user task ownership enforced server-side.
- **`mobile/`** — React Native CLI (TypeScript) Android app. Redux Toolkit + RTK Query for state/data, React Navigation, React Hook Form + Zod for validated forms, tokens stored via the Android Keystore (`react-native-keychain`).

Each app is independent (own `package.json`, own dependencies) — this is a plain two-folder layout, not an npm/yarn workspace, deliberately avoiding Metro's known friction with symlinked workspace packages.

## Features

- Register / log in with email + password (bcrypt-hashed passwords, JWT access tokens)
- Session persisted securely on-device (Android Keystore) and re-validated against the server on app start
- Create, view, edit, and delete tasks — title, description, scheduled date/time, deadline, priority, category
- Mark tasks complete / incomplete
- Filter by status (all / pending / completed) and priority (all / low / medium / high)
- Sort by newest, deadline, or priority
- Every task request is scoped server-side to the authenticated user — accessing another user's task by id returns `404`, not `403`, so its existence can't even be inferred
- Loading, empty, and error states on the task list; confirmation dialog before delete
- Global, consistent API error shape; client-side validation mirrors the server's rules so bad input is caught before a request is even sent

## Tech stack

| Layer | Choice |
|---|---|
| Backend framework | NestJS 11 (Express), TypeScript |
| Database | MongoDB via Mongoose (MongoDB Atlas recommended) |
| Auth | Custom JWT (`@nestjs/jwt` + `passport-jwt`), bcrypt password hashing |
| Validation | `class-validator` / `class-transformer` (backend), Zod (mobile) |
| API docs | Swagger / OpenAPI at `/api/docs` |
| Backend testing | Jest (unit) + Jest/Supertest e2e against an in-memory MongoDB (`mongodb-memory-server`) |
| Mobile framework | React Native CLI 0.87 (not Expo), TypeScript |
| Navigation | React Navigation (native-stack) |
| State/data | Redux Toolkit + RTK Query |
| Forms | React Hook Form + Zod |
| Secure token storage | `react-native-keychain` (Android Keystore-backed) |

## Folder structure

```
Modulus17/
├── backend/                        NestJS API
│   ├── src/
│   │   ├── auth/                    register/login/me, JWT strategy + guard, DTOs
│   │   ├── users/                    User schema + service
│   │   ├── tasks/                     Task schema, DTOs, service, controller
│   │   ├── common/                    exception filter, ObjectId pipe, @CurrentUser decorator
│   │   ├── config/                    env loading + startup validation
│   │   └── app.module.ts / main.ts
│   ├── test/                        e2e specs (run against an in-memory MongoDB)
│   ├── .env.example
│   └── README.md                    backend-specific setup detail (Atlas walkthrough, curl examples)
│
├── mobile/                         React Native CLI app
│   ├── android/                     native Android project (gradlew lives here)
│   ├── src/
│   │   ├── api/                      RTK Query base (apiSlice), backend base URL config
│   │   ├── app/                      Redux store
│   │   ├── components/               shared UI (form field, buttons, badges, filter chips)
│   │   ├── features/
│   │   │   ├── auth/                  screens, authApi, authSlice, AuthBootstrap
│   │   │   └── tasks/                 screens, tasksApi, task form/card components
│   │   ├── navigation/                RootNavigator (Auth stack ↔ App stack)
│   │   ├── theme/                     color tokens
│   │   ├── types/                     shared User/Task types (mirrors backend schemas)
│   │   └── utils/                     date formatting, API error mapping, secure storage
│   └── README.md                    RN CLI default README (kept for reference)
│
└── _17_...Assignment.pdf           the assignment brief
```

## Backend setup

```bash
cd backend
npm install
cp .env.example .env      # then fill in MONGODB_URI — see below
npm run start:dev         # http://localhost:3000, Swagger at /api/docs
```

Full walkthrough (Atlas cluster creation, connection string format, verification steps) is in [`backend/README.md`](backend/README.md). Short version below.

### MongoDB configuration

`MONGODB_URI` accepts any standard MongoDB connection string — local or Atlas, no code differs either way.

- **MongoDB Atlas (recommended)** — no local install:
  1. Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
  2. **Database Access** → add a database user (let Atlas autogenerate the password).
  3. **Network Access** → allow your current IP (or `0.0.0.0/0` only for a disposable dev cluster — not for anything real).
  4. **Connect → Drivers → Node.js**, copy the connection string, substitute the real password, and insert `modulus17` as the database name:
     ```
     MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/modulus17?retryWrites=true&w=majority
     ```
- **Local MongoDB via Docker** instead:
  ```bash
  docker run -d -p 27017:27017 --name modulus17-mongo mongo:7
  ```
  then leave `MONGODB_URI` as the default `mongodb://127.0.0.1:27017/modulus17`.

Neither is needed to run the backend's test suite — tests spin up their own in-memory MongoDB automatically.

### Required environment variables (`backend/.env`)

| Variable | Meaning |
|---|---|
| `PORT` | HTTP port (default `3000`) |
| `MONGODB_URI` | MongoDB connection string (see above) |
| `JWT_SECRET` | Long random string. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Access token lifetime, e.g. `7d` |

Validated at startup — the app refuses to boot with a clear error if any are missing or malformed. `.env` is git-ignored; only `.env.example` (no real values) is committed.

## Mobile setup

```bash
cd mobile
npm install
```

The backend base URL is set in [`mobile/src/api/config.ts`](mobile/src/api/config.ts) — see **Known limitations** below for exactly what it needs to be set to for your setup.

### Running on Android

**Prerequisites:** Android SDK Platform 37, Build-Tools 37.0.0, Platform-Tools, and the NDK (`27.1.12297006` — required because this React Native version has the New Architecture mandatory on Android; there's no way to opt out of it) — install via `sdkmanager`, or via Android Studio's SDK Manager. `ANDROID_HOME` must point at the SDK, with `platform-tools` on `PATH`.

```bash
# Terminal 1 — Metro (JS bundler)
cd mobile
npm start

# Terminal 2 — build + install + launch on a connected device/emulator
cd mobile
npm run android
```

`npm run android` builds a debug APK, installs it via `adb`, and launches it, connecting to the Metro instance from Terminal 1. To build the APK without installing it (e.g. to hand someone the file directly):

```bash
cd mobile/android
./gradlew assembleDebug
# APK produced at: mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

To install that APK manually on a connected device:
```bash
adb install -r mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

## API overview

All bodies are JSON. Protected routes require `Authorization: Bearer <accessToken>`. Full schemas are served live at `/api/docs` (Swagger) once the backend is running.

**Auth**

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/auth/register` | — | `{ email, password }` → password: min 8 chars, 1 letter + 1 digit |
| POST | `/auth/login` | — | `{ email, password }` → generic 401 on any invalid credential |
| GET | `/auth/me` | ✅ | returns the current user, never the password hash |

**Tasks** (all protected, always scoped to the caller)

| Method | Path | Notes |
|---|---|---|
| GET | `/tasks` | `?status=all\|pending\|completed&priority=low\|medium\|high&sort=createdAt\|deadline\|priority` |
| POST | `/tasks` | `{ title, description?, scheduledAt?, deadline?, priority?, category? }` |
| GET | `/tasks/:id` | 404 if missing **or** owned by another user |
| PATCH | `/tasks/:id` | partial update, including `{ isCompleted }` to toggle status |
| DELETE | `/tasks/:id` | 404 if missing **or** owned by another user |

Every error response is normalized to `{ statusCode, message, error, path, timestamp }` by a single global exception filter.

## Testing and validation commands

**Backend**
```bash
cd backend
npm run build      # TypeScript compile check
npm run lint       # ESLint
npm test           # unit tests (Jest)
npm run test:e2e   # e2e tests — spins up an in-memory MongoDB automatically, no setup needed
```

**Mobile**
```bash
cd mobile
npx tsc --noEmit                              # TypeScript compile check
npm run lint                                  # ESLint
npm test                                      # Jest
npx react-native bundle --platform android --dev false \
  --entry-file index.js --bundle-output /tmp/bundle.js \
  --assets-dest /tmp/bundle-assets            # confirms the JS bundle builds cleanly, no device needed
cd android && ./gradlew assembleDebug          # full native Android build (needs the Android SDK + NDK)
```

## Known limitations

- **The phone demo requires the backend running locally and `adb reverse`.** The mobile app's base URL ([`src/api/config.ts`](mobile/src/api/config.ts)) is currently set to `http://127.0.0.1:3000`, reached from a physical Android device over USB via:
  ```bash
  adb reverse tcp:3000 tcp:3000
  ```
  This tunnels the *device's* `127.0.0.1:3000` to the *development machine's* `127.0.0.1:3000` over the USB/adb connection — it must be re-run after every device reconnect or `adb` server restart, and the backend must be running on the same machine adb is talking to. There is no deployed/public backend for this submission — evaluating the mobile app end-to-end requires running the backend locally alongside it. An Android emulator would instead use `http://10.0.2.2:3000` (see the comment in `config.ts`); this hasn't been exercised, only the physical-device path has.
- **iOS is untouched.** The RN CLI scaffolds an `ios/` project by default; it's present but was never built or tested — this assignment targets Android only.
- **No deep-linking**, so the moderate-severity transitive npm advisory in `@react-navigation/core`'s (unused) deep-link URL parser has no real exposure here; noted rather than worked around, since a fix would need a breaking React Navigation downgrade.
- **Bonus features not implemented**: task categories/tags exist in the schema and form but aren't used for filtering yet; the assignment's optional "priority + deadline mix sort algorithm" isn't implemented — only the three individual sort modes (newest / deadline / priority) are.
- **Debug build only.** `app-debug.apk` is unminified, includes all four CPU architectures (~150MB), and is signed with the standard shared RN debug key — not a release build.
