# Calispro Architecture

## 1. System Overview
Calispro is a full-stack calisthenics training platform with two applications:
- `client/`: Next.js 16 (App Router) + React 19 + TypeScript + React Query + Tailwind/shadcn.
- `server/`: Express 5 + TypeScript + MongoDB (Mongoose) + JWT auth.

Primary outcomes:
- Personalized onboarding and account-based experience.
- User-scoped workouts/plans/history (no cross-user data bleed).
- Structured training flow: plan -> execute -> log -> review.

## 2. High-Level Architecture

```text
Browser (Next.js Client)
  -> Axios API Client (Bearer JWT)
    -> Express API (/api/*)
      -> Controllers
        -> Mongoose Models
          -> MongoDB
```

Supporting runtime behavior:
- Auth token persisted in `localStorage` and mirrored in cookie for middleware/proxy behavior.
- React Query manages server-state cache and invalidation.
- Planner board persisted client-side in user-scoped localStorage key.

## 3. Frontend Architecture (`client/`)

### 3.1 Composition
- App root and providers: `client/src/app/providers.tsx`
- Auth context: `client/src/context/AuthContext.tsx`
- API client: `client/src/lib/api/client.ts`
- Data hooks: `client/src/lib/hooks/useApi.ts`, `client/src/lib/hooks/useAuth.ts`
- Domain types: `client/src/types/index.ts`

### 3.2 State Model
- UI State (component-local): form values, dialogs, picker selections.
- Server State (React Query): profile, skills, exercises, workouts, logs, streaks.
- Session/Auth State: token + authenticated user in `AuthContext`.
- Planner State (client persistence): daily plan board in `client/src/lib/planner.ts`.

### 3.3 Route Structure
- Marketing/Landing: `client/src/app/page.tsx`
- Auth: `client/src/app/(auth)/login`, `client/src/app/(auth)/signup`
- Onboarding: `client/src/app/onboarding/page.tsx`
- Dashboard modules:
  - Home: `dashboard/page.tsx`
  - Planning: `dashboard/planning/page.tsx`
  - Workouts: `dashboard/workouts/*`
  - Skills: `dashboard/skills/[id]`
  - Exercises: `dashboard/exercises/*`
  - Tracker: `dashboard/track/[workoutId]`
  - History: `dashboard/history/page.tsx`
  - Profile/Roadmap as supporting modules

### 3.4 Client-Side Security and Access Behavior
- Requests attach JWT through Axios interceptor.
- `AuthContext` fetches `/auth/me` when token exists.
- On auth failure, context clears token and redirects to login.
- Middleware/proxy checks route eligibility (e.g., plan-based route gating where configured).

## 4. Backend Architecture (`server/`)

### 4.1 Entry and Middleware
- Entry: `server/src/index.ts`
- Core middleware:
  - `cors()`
  - `express.json()`
  - `authenticate` JWT middleware in `server/src/middleware/auth.ts`

### 4.2 API Route Modules
- `/api/auth` -> signup, login, me, profile update
- `/api/skills` -> skill catalog + user mastery progress
- `/api/exercises` -> exercise catalog and detail
- `/api/workouts` -> list/detail/create (authenticated)
- `/api/logs` -> create log, history, streaks, delete single, delete all

### 4.3 Data Model (MongoDB)
- `User`: identity, auth hash, plan, onboarding fields.
- `Skill`: mastery levels and unlock progression metadata.
- `Exercise`: movement catalog, cues, progressions.
- `Workout`: workout template/protocol; includes ownership (`creatorId`, `isGlobal`).
- `WorkoutLog`: completed session history, XP, per-exercise performance.
- `UserMastery`: user-specific skill points/level progression.

### 4.4 Ownership and Multi-User Isolation
- Workouts:
  - Query returns global workouts + workouts where `creatorId == req.user.id`.
  - Private workout read requires owner match.
  - Created workouts are tagged with `creatorId`.
- History:
  - All log reads/deletes are filtered by `userId == req.user.id`.
- Client cache and storage:
  - React Query keys for user-sensitive resources include auth scope where implemented.
  - Planner localStorage key is user-scoped by JWT payload id.

## 5. API Surface (Current)

### 5.1 Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me` (auth)
- `PATCH /api/auth/profile` (auth)

### 5.2 Skills & Exercises
- `GET /api/skills`
- `GET /api/skills/:id`
- `GET /api/skills/user/progress` (auth)
- `POST /api/skills/user/progress` (auth)
- `GET /api/exercises`
- `GET /api/exercises/:id`

### 5.3 Workouts
- `GET /api/workouts` (auth)
- `GET /api/workouts/:id` (auth)
- `POST /api/workouts` (auth)

### 5.4 Logs / History
- `POST /api/logs` (auth)
- `GET /api/logs/history?limit=n` (auth)
- `DELETE /api/logs/history/:id` (auth)
- `DELETE /api/logs/history` (auth)
- `GET /api/logs/streaks` (auth)

## 6. Detailed User Flow (End-to-End)

### 6.1 Visitor -> Account Creation
1. User lands on marketing page.
2. Clicks `Get started` -> signup form.
3. Client validates form (zod/react-hook-form).
4. `POST /api/auth/signup` creates account.
5. User is redirected to login (signup does not auto-login).

### 6.2 Login -> Authenticated Session
1. User submits credentials on login page.
2. `POST /api/auth/login` returns JWT + lightweight user payload.
3. Client stores token in `localStorage` and cookie.
4. `AuthContext` invalidates/fetches profile via `GET /api/auth/me`.
5. On success, route transitions to dashboard (or callback route).

### 6.3 Onboarding Gate
1. If user profile lacks onboarding fields (`level`, `goals`), UI routes to onboarding.
2. User selects training level and goals.
3. `PATCH /api/auth/profile` persists onboarding metadata.
4. Dashboard experience unlocks with personalized starting context.

### 6.4 Planning Flow (User-Specific)
1. User opens planning board.
2. Board loads from user-scoped localStorage key.
3. User can:
   - apply prebuilt template, or
   - create custom day plans (workout/skill/exercise items + priority).
4. User pushes an active plan for dashboard execution flow.
5. Changes persist instantly to localStorage (scoped to logged-in user).

### 6.5 Workout Creation and Ownership
1. User opens workout builder dialog.
2. Selects metadata + exercises + sets/reps/duration targets.
3. `POST /api/workouts` stores workout with `creatorId` and `isGlobal=false`.
4. Workout list refreshes; user sees global + own workouts only.
5. Access checks block non-owners from private workout detail.

### 6.6 Session Tracking and Logging
1. User starts a session (workout/skill/exercise mode).
2. Tracker enforces step progression and captures completed sets.
3. On finish, client sends `POST /api/logs` with performance payload.
4. Server writes `WorkoutLog` and updates mastery progression where applicable.
5. Client invalidates relevant queries (`history`, `streaks`, `profile`, `mastery`).

### 6.7 History Management
1. History page fetches recent entries via `GET /api/logs/history`.
2. User can delete one entry using `DELETE /api/logs/history/:id`.
3. User can clear all own entries using `DELETE /api/logs/history`.
4. UI refreshes totals and list after query invalidation.

### 6.8 Logout
1. User clicks logout.
2. Client clears auth token + cookie and resets query cache.
3. User is redirected to login; protected data is no longer accessible.

## 7. Core Runtime Sequences

### 7.1 Login Sequence
```text
Login Page -> POST /api/auth/login -> JWT
  -> store token (localStorage+cookie)
  -> invalidate ['profile']
  -> GET /api/auth/me
  -> Authenticated dashboard render
```

### 7.2 Plan-to-Train Sequence
```text
Planning Page -> localStorage(user-scoped plan)
  -> Dashboard reads active day
  -> User opens tracker
  -> POST /api/logs
  -> refresh history/streak/mastery/profile
```

### 7.3 Workout Visibility Sequence
```text
GET /api/workouts (auth)
  -> server query: isGlobal=true OR creatorId=req.user.id
  -> client renders combined list
  -> detail endpoint enforces owner check for private workouts
```

## 8. Non-Functional Notes

### 8.1 Scalability and Performance
- Query caching reduces repeat fetches.
- Domain-separated hooks simplify invalidation and maintenance.
- MongoDB document model supports iterative feature growth.

### 8.2 Security
- JWT-based auth for protected endpoints.
- Server-side ownership checks for user-scoped resources.
- Token removal and query cache clear on logout.

### 8.3 Current Tradeoffs
- Planner currently persists in client localStorage (not server-synced across devices).
- Some route-level plan gating exists in frontend middleware and should be mirrored server-side for strict enforcement if needed.

## 9. Suggested Next Architecture Steps
1. Move planner persistence to backend for multi-device sync and conflict handling.
2. Add server-side audit fields (createdBy/updatedBy) across mutable entities.
3. Introduce structured API error envelopes for consistent UX messaging.
4. Add automated integration tests for auth, ownership, and history deletion flows.
5. Add request logging/observability (latency, errors, endpoint metrics).
