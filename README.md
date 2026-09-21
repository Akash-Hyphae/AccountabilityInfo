# accountabilityInfo

> **"Nurture Today. A Better You Tomorrow."**

**accountabilityInfo** is a production-grade full-stack personal accountability, daily planning, and behavioral growth web application. Built with a plant/nurture metaphor—viewing your brain as a plant and daily discipline, honest reflection, and habits as the water that sustains it—it helps individuals bridge the gap between intention and execution.

The core philosophy of the system:
**"Plan -> Do -> Track -> Reflect -> Improve -> Grow."**

---

## 🌿 Key Features

### 1. Daily Accountability Sheet (Primary Visual Workflow)
- **Hourly Planner (Planned vs. Actual Execution)**: Explicitly separates **"Planned Task (What you will do)"** from **"Done? (What you actually did)"** across morning, afternoon, and evening hourly slots. Add custom time blocks and mark completion with instant persistence.
- **4-Tier Priority Task Management**:
  - 🔥 **Highest Priority**: Non-negotiable Must-Do tasks for today.
  - ⭐ **Medium Priority**: Important tasks.
  - 🌿 **Least Priority**: Tasks to tackle if time permits.
  - ⚙️ **Other Tasks**: Personal routines, health, and miscellaneous errands.
- **Daily Reflection Cards**:
  - ⚠️ **What Mistakes Were Made Today?**: Honest tracking of procrastination, distractions, or dropped commitments.
  - 📈 **What to Improve Tomorrow?**: Actionable behavioral corrections to implement the next morning.
- **Quantitative Daily Analysis**:
  - Real-time task completion ratios (`__ / __`).
  - Interactive 1–10 rating scales for **Productivity**, **Focus Level**, **Distraction Friction**, and **Energy Level**.
  - **Overall, was it a good day?** toggle + free-form evening journal notes.

### 2. Google Gemini AI Productivity Intelligence
- **Daily Nurture Insight**: Analyzes today's planned vs. actual outcome, logged mistakes, and focus ratings to deliver actionable, encouraging mentorship without hallucinating metrics.
- **Deep Performance Analysis**:
  - Period filtering: Last Week (7 days), Last Month (30 days), Last 3 Months (90 days), and Last 6 Months (180 days).
  - Structured behavioral breakdown:
    1. Executive Summary
    2. What Went Well
    3. What Went Wrong
    4. Recurring Mistakes
    5. Productivity & Focus Patterns
    6. Distraction Triggers
    7. Habit Momentum
    8. Actionable Improvements & Next-Period Growth Blueprint

### 3. Analytics & Visualization (Recharts)
- **Productivity & Focus Trends**: Multi-line chart tracking mental stamina and distraction levels over 7, 30, and 90-day horizons.
- **Commitment Execution**: Bar charts contrasting total planned tasks against completed executions.
- **KPI Cards**: Average completion percentages and rating aggregates calculated from verified database records.

### 4. Long-Term Goal Tracker
- Categorized goal tracking across Career, Learning, Health, and Mindset.
- Interactive progress percentage milestones and target completion dates.

### 5. Habit Tracker & Consistency Matrix
- Weekly 7-day visual habit completion matrix.
- Active streak tracking (🔥 current streak and longest streak).
- Plant-watering metaphor reinforcing small, repeatable steps.

### 6. Pomodoro Deep Focus Sanctuary
- Configurable 25-minute Pomodoro, 5-minute short break, and 15-minute long break timers.
- Attach specific daily tasks to focus blocks.
- Real-time countdown ring and automatic focus session history logging.

### 7. Mindset Notes & Tagged Brainstorming
- Quick capture of ideas, lessons learned, and reflections with pinned notes and tag filters.

### 8. Enterprise Responsive Layout & Design System
- **Desktop**: Full sidebar navigation with daily wisdom quote (*"Small steps daily, big results eventually."*) and sticky quote card (*"Discipline waters your mind, and creates a better tomorrow."*).
- **Tablet & Mobile**: Sticky header, collapsible drawer, and bottom navigation bar for single-thumb mobile usage.
- **Light & Dark Mode**: Persistent theme switching with Tailwind CSS color tokens.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React Icons, Recharts, React Router v7, Axios
- **Backend**: Node.js, Express.js
- **AI**: `@google/genai` (Gemini 3.8 Flash model with JSON schema validation)
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` password hashing and 1-Click Instant Demo Login
- **Database**: Dual-engine persistence layer:
  - **MongoDB Atlas** with Mongoose schemas
  - **Filesystem Persistent Store (`server/data/store.json`)** automatic fallback for zero-config immediate runtime

---

## 🔑 Environment Variables

Configure these variables in your environment or `.env` file:

```env
# Google Gemini API Key (Server-side only)
GEMINI_API_KEY="your-gemini-api-key"

# MongoDB Atlas Connection URI (Optional: falls back to persistent file store if empty)
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/accountabilityInfo"

# JWT Secret for Session Authentication
JWT_SECRET="your-jwt-secret-key-at-least-32-chars"

# Node Environment
NODE_ENV="development"
PORT=3000
```

---

## 🚀 Running the Application

### 1. Start Development Server
```bash
npm run dev
```
The server will start at `http://localhost:3000` with Express handling both `/api/*` endpoints and Vite frontend assets.

### 2. Production Build & Start
```bash
npm run build
npm run start
```
Compiles client assets with Vite and bundles `server.ts` into a self-contained Node bundle at `dist/server.cjs`.

---

## 📡 API Endpoints Summary

### Authentication
- `POST /api/auth/register` — Create new user account
- `POST /api/auth/login` — Sign in with email and password
- `POST /api/auth/demo` — 1-click test drive with realistic preloaded dataset
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `POST /api/auth/logout` — End session

### Accountability & Tasks
- `GET /api/tasks?date=YYYY-MM-DD` — Retrieve tasks for a specific date
- `POST /api/tasks` — Create new task with priority tag
- `PUT /api/tasks/:id` — Update task status or title
- `DELETE /api/tasks/:id` — Remove task

### Hourly Planner
- `GET /api/planner/:date` — Retrieve hourly planned vs. actual schedule
- `POST /api/planner` — Add hourly time block
- `PUT /api/planner/:id` — Update planned task or actual outcome
- `DELETE /api/planner/:id` — Remove planner slot

### Daily Analysis & Reflection
- `GET /api/analysis/:date` — Fetch quantitative productivity metrics
- `POST /api/analysis` — Save productivity and focus ratings
- `GET /api/reflection/:date` — Fetch mistakes and improvements
- `POST /api/reflection` — Save reflection points

### AI Intelligence
- `GET /api/ai/quick-insight?date=YYYY-MM-DD` — Daily Gemini AI mentor insight
- `POST /api/ai/analyze` — Deep behavioral review across 7, 30, 90, or 180 days

---

*accountabilityInfo — "Nurture Today. A Better You Tomorrow."*
