# Calisthenics Trainer - Detailed Architecture

This document outlines the detailed architecture for the Calisthenics Trainer application.

## 1. Core Features

- **User Authentication:** Secure user sign-up, login, and profile management.
- **Workout Routines:** Create, customize, and save workout plans.
- **Exercise Library:** A comprehensive library of calisthenics exercises with instructions, videos, and filtering options.
- **Workout Tracker:** A real-time interface to guide users through their workouts and log their progress.
- **Progress Dashboard:** Visualizations and statistics to track user's performance and improvements over time.
- **Social Sharing:** Allow users to share their workouts and progress.

## 2. Frontend Architecture (Next.js)

### 2.1. Directory Structure

A modular and scalable directory structure will be used:

```
client/
├── src/
│   ├── app/
│   │   ├── (auth)/         # Group for auth-related pages (login, signup)
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── dashboard/      # User's progress dashboard
│   │   ├── exercises/      # Exercise library
│   │   │   └── [id]/       # Individual exercise details
│   │   ├── workouts/       # User's workout routines
│   │   │   ├── [id]/       # Page for a specific workout
│   │   │   └── new/        # Page to create a new workout
│   │   ├── track/
│   │   │   └── [workoutId]/ # Real-time workout tracking page
│   │   ├── layout.tsx
│   │   └── page.tsx        # Landing page
│   ├── components/
│   │   ├── ui/             # Reusable UI components (Button, Card, etc.)
│   │   ├── common/         # Common components (Navbar, Footer, etc.)
│   │   └── features/       # Components specific to a feature (e.g., workout-card)
│   ├── lib/
│   │   ├── api.ts          # Functions for making API requests to the backend
│   │   ├── auth.ts         # Authentication-related functions
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils.ts        # Utility functions
│   ├── styles/
│   │   └── globals.css
│   └── types/
│       └── index.ts        # TypeScript type definitions
├── public/
└── ...
```

### 2.2. Component Strategy

- **UI Components:** A set of generic, reusable components (e.g., `Button`, `Input`, `Card`) will be built in the `src/components/ui` directory. We will use **Shadcn/UI** for its excellent, accessible, and customizable components.
- **Feature Components:** Components that are specific to a feature (e.g., `WorkoutForm`, `ExerciseCard`) will be located in the `src/components/features` directory, organized by feature.

### 2.3. State Management

- **Zustand:** For global state management (e.g., user authentication status, global notifications). It's lightweight and simple to use.
- **React Query (TanStack Query):** For managing server state, including data fetching, caching, and optimistic updates. This will handle all interactions with the backend API.

### 2.4. Data Fetching

- All backend communication will be handled through the functions defined in `src/lib/api.ts`.
- `react-query` will be used to wrap these API calls, providing caching, re-fetching on window focus, and more, out of the box.

### 2.5. Styling

- **Tailwind CSS:** For utility-first CSS styling.
- **CSS Modules:** For component-level styles when needed.
- **Framer Motion:** For animations and transitions to create a more dynamic and engaging user experience.

## 3. Backend API (to be built in `/server`)

The frontend will interact with a RESTful API. Here are the anticipated API endpoints:

- **Authentication:**
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- **Exercises:**
  - `GET /api/exercises`
  - `GET /api/exercises/:id`
- **Workouts:**
  - `GET /api/workouts`
  - `POST /api/workouts`
  - `GET /api/workouts/:id`
  - `PUT /api/workouts/:id`
  - `DELETE /api/workouts/:id`
- **Progress:**
  - `POST /api/progress` (to log a completed workout)
  - `GET /api/progress` (to get progress history)

## 4. Development Workflow

1.  **Component Development:** Build out the UI and feature components.
2.  **Page Creation:** Create the pages using the defined components.
3.  **API Integration:** Connect the frontend to the backend API using `react-query`.
4.  **State Management:** Implement global state management with Zustand where needed.
5.  **Testing:** Write unit and integration tests for components and pages.
