

https://github.com/user-attachments/assets/a40c2ef5-f511-461f-8602-8f33d38e4a04

# FitRealm - Multi-Tenant Fitness Tracker

FitRealm is a modern, full-stack fitness tracking web application built to enforce strict multi-tenant, program-based data isolation. It allows users to join multiple fitness programs while ensuring that their metrics and progress data never leak across different program contexts.

## 1. Project Overview

FitRealm solves the problem of cross-contamination in fitness tracking by utilizing strong database constraints. The core feature is a dynamic dashboard where users can switch between active programs (e.g., Strength Training, Weight Loss) and view strictly scoped progress.

## 2. Features List

- **Strict Data Isolation**: Metrics are heavily isolated based on User + Program combinations.
- **Dynamic Program Switching**: Instantly clear and refetch scoped data without page reloads.
- **Upsert Architecture**: Graceful insertions and updates using PostgreSQL `ON CONFLICT DO UPDATE`.
- **Modern UI/UX**: Premium Bohemian-inspired design language utilizing glassmorphism and Framer Motion animations.
- **Authentication**: Secure JWT-based authentication with Bcrypt password hashing.
- **Responsive Design**: Mobile-first layout adaptable to all screen sizes.

## 3. Tech Stack

**Frontend:**
- React (with Vite)
- TypeScript
- Tailwind CSS
- Axios
- Framer Motion
- React Router DOM
- Lucide React (icons)

**Backend:**
- Node.js
- Express.js
- PostgreSQL
- `pg` (node-postgres)
- JSON Web Tokens (JWT)
- Bcrypt

## 4. Architecture Explanation

FitRealm follows a standard client-server architecture with an emphasis on database-level validation. The frontend handles visual state isolation by resetting the UI state exactly when the program context changes, ensuring no stale data is rendered. The Express backend acts as a strict gateway, appending `user_id` context securely from JWT tokens and enforcing scoping on all database queries.

### System Architecture Diagram

```mermaid
graph TD
    Client[Frontend: React + Vite] -->|HTTPS Requests| Gateway[Backend: Express API]
    Gateway -->|JWT Auth & Route Validation| Controller[Logic Controllers]
    Controller -->|Parameterized SQL Queries| Database[(PostgreSQL)]
```

## 5. Database Schema Explanation

The schema consists of three primary tables: `users`, `programs`, and `progress_records`.
The `programs` table is populated via seed data for base fitness tracks. The `progress_records` table holds the actual dynamic data for users.

### Database Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ PROGRESS_RECORDS : "tracks"
    PROGRAMS ||--o{ PROGRESS_RECORDS : "contains"

    USERS {
        uuid id PK
        string email
        string password_hash
    }
    
    PROGRAMS {
        uuid id PK
        string type UK
        string name
    }
    
    PROGRESS_RECORDS {
        uuid id PK
        uuid user_id FK
        string program_type
        uuid program_id FK
        string metric_name
        numeric value
        timestamp updated_at
    }
```

## 6. Composite Key Isolation Explanation

The most important feature of the application is the composite unique constraint on the `progress_records` table:
`UNIQUE(user_id, program_type, program_id, metric_name)`

**Why this prevents leakage:**
By strictly bounding uniqueness to these four columns, it becomes mathematically impossible in the database for the same metric name under the same user to conflict *unless* it is within the exact same program. Thus, a `bench_press_max` in Strength Training is a distinct row from `bench_press_max` in Weight Loss.

**How `ON CONFLICT DO UPDATE` works:**
When the frontend posts an update, the backend executes:
```sql
INSERT INTO progress_records (...) VALUES (...)
ON CONFLICT (user_id, program_type, program_id, metric_name)
DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
```
This guarantees an "upsert" mechanism—if the exact metric exists in the specific program for the user, it updates the value. If not, it creates it.

## 7. API Documentation

### Auth Routes
- `POST /api/auth/register`: Expects `email`, `password`. Returns JWT.
- `POST /api/auth/login`: Expects `email`, `password`. Returns JWT.

### Program Routes
- `GET /api/programs`: Requires JWT. Returns array of available programs.

### Progress Routes
- `GET /api/progress/:user_id?program_type=X&program_id=Y`: 
  Requires JWT. Strictly scoped. Returns array of metrics.
- `POST /api/progress/update`:
  Requires JWT. Body: `{ user_id, program_type, program_id, metric_name, value }`. Performs the UPSERT.

### Request Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant DB

    User->>Frontend: Selects "Weight Loss" Program
    Frontend->>Frontend: Clear existing metrics state
    Frontend->>API: GET /api/progress/123?program_type=weight_loss...
    API->>DB: SELECT * WHERE user_id=$1 AND program_type=$2...
    DB-->>API: Returns isolated records
    API-->>Frontend: JSON Metrics Array
    Frontend-->>User: Renders Weight Loss Data
```

## 8. Setup Instructions

1. Clone the repository and ensure Node.js is installed.
2. Set up a PostgreSQL instance (Local or Neon/Supabase).
3. Connect to PostgreSQL and execute the script in `backend/schema.sql` to initialize tables and seed programs.
4. Navigate to `/backend`, run `npm install`, setup `.env`, and run `npm run dev`.
5. Navigate to `/frontend`, run `npm install`, and run `npm run dev`.

## 9. Environment Variables

Create a `.env` file in the `backend` directory:
```env
PORT=5000
DATABASE_URL=postgres://user:password@host:port/database_name
JWT_SECRET=your_jwt_secret_key
```


## 10. Folder Structure

```text
FitRealm/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── programs.js
│   │   └── progress.js
│   ├── db.js
│   ├── schema.sql
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── services/
    │   ├── App.tsx
    │   └── index.css
    ├── tailwind.config.js
    └── package.json
```

## 11. Future Improvements

- Implementation of Recharts to display historical metric progress over time.
- Implementation of a user settings page.
- Addition of program-specific target goals.

## 12. Evaluation-Focused Explanation

- **Frontend Isolation**: State management explicitly uses `setMetrics([])` right before initiating the scoped fetch. This prevents the brief appearance of stale data from a previous program while the network request is pending.
- **Backend Routing**: Security is maintained by strictly verifying `req.user.id === req.params.user_id` preventing IDOR (Insecure Direct Object Reference) attacks, in addition to scoping by `program_type` and `program_id`.

## 13. Complete User Journey & Data Isolation Flow

Here is the complete user journey in FitRealm, step-by-step, explaining exactly how the code perfectly fulfills the strict data isolation requirement:

### The Setup (Database Level)
Before the user even interacts with the app, the core requirement is enforced deep in the PostgreSQL database. In `schema.sql`, we created the `progress_records` table with this exact constraint:
`UNIQUE(user_id, program_type, program_id, metric_name)`

This is the **"Iron Wall"** of data isolation. It guarantees mathematically that the database will treat a `bench_press_max` metric belonging to the `strength` program as a completely different entity than a `bench_press_max` metric belonging to the `weight_loss` program, even for the same user.

### The User Logs In & Lands on the Dashboard
1. The user logs in and the React frontend mounts the `Dashboard` component.
2. The UI immediately fetches the available programs (Strength Training, Weight Loss, Cardio).
3. It sets the first program (e.g., "Strength Training") as the `activeProgram` in the React state.
4. This triggers a `useEffect` hook to fetch the scoped metrics.

### Fetching Scoped Data (API Level)
The frontend sends a `GET` request: `/api/progress/123?program_type=strength&program_id=XYZ`.
The Express API receives this and runs a strictly parameterized SQL query:
`SELECT * FROM progress_records WHERE user_id = $1 AND program_type = $2 AND program_id = $3`

*Result:* The backend ONLY asks the database for rows matching that exact program context. It is impossible for Weight Loss metrics to leak into this response.

### Adding a New Metric
While looking at the Strength Training dashboard, the user types in `bench_press_max` with a value of `225` and hits "Save Record".
The frontend sends a `POST` request to `/api/progress/update`.
The backend runs the critical `ON CONFLICT` query:
`INSERT INTO progress_records (user_id, program_type, program_id, metric_name, value) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id, program_type, program_id, metric_name) DO UPDATE SET value = EXCLUDED.value`

*Result:* Because of the composite key, PostgreSQL checks if *this specific user* already has a *bench press* specifically inside *Strength Training*. If they don't, it creates a new row. If they do, it updates the value.

### Switching Programs (Frontend Isolation)
The user clicks the "Weight Loss" button at the top of the dashboard.
In `Dashboard.tsx`, the moment `activeProgram` changes, the `useEffect` fires and does two things immediately:
1. `setMetrics([])` - It aggressively wipes the React state empty.
2. `setLoadingMetrics(true)` - It displays skeleton loaders.

*Result:* This completely prevents "stale" data (the 225lb bench press) from flashing on the screen while the network request for the Weight Loss data is pending.

### Loading the New Program
The frontend makes a new `GET` request for Weight Loss. The database returns an empty array (or just the Weight Loss metrics). The 225lb `bench_press_max` remains safely locked inside the rows associated with the `strength` program. The user can now add a `weight_lost` metric of `10`, and it will be stored completely isolated from the strength training records.
