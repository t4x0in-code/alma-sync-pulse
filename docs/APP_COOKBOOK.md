# AlmaLatina Live Sync — App Cookbook

This document provides a comprehensive overview of the current state of implementation across the AlmaLatina Live Sync app. It breaks down the application by **User Roles** and lists all the available actions they can perform via the Web Frontend, Telegram Bot, and REST API.

---

## 1. Student / Public User (Web)
*The standard user accessing the web application at the root route (`/`).*

### Implemented Actions:
- **View Schedule & Classes:** Users can see the list of open classes, including instructors, schedules, and capacity.
- **View Enrollments & Pairs:** Users can see who is currently enrolled (Leaders/Followers) and view proposed/confirmed pairs.
- **Self-Enrollment:** Users can submit an application via the web form.
  - **Endpoint:** `POST /api/enroll`
  - **Data Collected:** Name, Gender (L/F), Age, Email, Phone, Photo, Comment, and "Looking For" (preferred partner).

---

## 2. Student / Public User (Telegram Bot)
*Any user interacting with the Telegram Bot directly. (Note: These commands were recently made public and no longer require the user to be in the `ADMIN_CHAT_IDS` list).*

### Implemented Actions:
- **`start`** — Starts the bot interaction and displays available commands and the user's Chat ID.
- **`/lang`** — Prompts an inline keyboard to switch the bot's interface language (supports EN, DE, RU, UK, FR, TR, IT, ES).
- **`/status`** — Returns an overview of all active classes, showing the balance of Leaders (L) and Followers (F).
- **`/list [classId]`** — Returns a detailed list of "who's coming" for a specific class (or prompts for class selection if omitted).
- **`/add` & `/addwizard`** — Launches an interactive self-enrollment wizard directly in Telegram:
  1. Select Class (Inline Keyboard)
  2. Select Gender (L/F) (Inline Keyboard)
  3. Enter Name (Text input)
  4. Select Avatar/Photo (Inline Keyboard or Text Input)
  5. Enter Age (Text input)

---

## 3. Instructor / Admin ("Tony" via Web Cockpit)
*The administrator accessing the secure dashboard at the `/tony-admin` route.*

### Authentication:
- Requires entering the `ADMIN_TOKEN` (default: `change-me`) to receive a JWT session token.
- **Endpoints:** `POST /api/auth/request` and `GET /api/auth/poll/:id`

### Implemented Actions:
- **Class Management:**
  - **Create:** `POST /api/admin/classes`
  - **Update:** `PATCH /api/admin/classes/:id`
  - **Delete:** `DELETE /api/admin/classes/:id`
- **Enrollment Management:**
  - **Create (Manual Add):** `POST /api/admin/enrollments`
  - **Update:** `PATCH /api/admin/enrollments/:id` (e.g., correcting names, fixing genders).
  - **Delete (Kick):** `DELETE /api/admin/enrollments/:id`
- **Pair Management (Matchmaking):**
  - **Create Pair:** `POST /api/admin/pairs` (Assigns a Leader to a Follower).
  - **Update Pair Status:** `PATCH /api/admin/pairs/:id` (e.g., moving from 'proposed' to 'confirmed').
  - **Delete Pair:** `DELETE /api/admin/pairs/:id` (Breaks a pair).
- **Reserved Pairs Management:**
  - **Add Reserved Pair:** `POST /api/admin/reserved` (Binds two two-letter nicknames together permanently for recurring classes).
  - **Delete Reserved Pair:** `DELETE /api/admin/reserved/:id`
- **Database Utilities:**
  - **Load Mock Data:** `POST /api/admin/classes/mock` (Populates DB with dummy data for testing).
  - **Clear Data:** `POST /api/admin/classes/clear` (Wipes the database).

---

## Technical Stack Overview
- **Frontend:** React, Vite, TanStack Router (`/` and `/tony-admin`), TailwindCSS.
- **Backend API:** Node.js, Express.js.
- **Database:** SQLite (`better-sqlite3`) utilizing WAL mode.
- **Telegram Integration:** `node-telegram-bot-api` (Polling mode).
- **State Management:** In-memory maps for Wizard State (`addWizardState`) and Pending Auth (`pendingAuth`).
