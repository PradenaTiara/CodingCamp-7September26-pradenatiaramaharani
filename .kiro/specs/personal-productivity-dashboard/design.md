# Design Document: Personal Productivity Dashboard

## Overview

The Personal Productivity Dashboard is a client-side web application built with semantic HTML, CSS (glassmorphism UI), and vanilla JavaScript. Data persistence is handled entirely through Local Storage, with no backend dependencies.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Environment                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Presentation Layer                      │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────────────┐ │   │
│  │  │  index.   │ │  styles.  │ │   JavaScript      │ │   │
│  │  │   html    │ │   css     │ │   Modules         │ │   │
│  │  └───────────┘ └───────────┘ └───────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Application Layer                       │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │   │
│  │  │  Task    │ │  Habit   │ │  Focus   │ │Analytics│ │   │
│  │  │  Module  │ │  Module  │ │  Module  │ │ Module  │ │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Data Layer                              │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │         Storage Service (Local Storage)       │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### TaskManager

Responsible for all CRUD operations on tasks. Exposes: `create(data)`, `update(id, updates)`, `delete(id)`, `complete(id)`, `uncomplete(id)`, `getAll()`, `getByStatus(completed)`, `getById(id)`.

### HabitManager

Responsible for habit creation, completion, and streak tracking. Exposes: `create(data)`, `complete(id)`, `delete(id)`, `getAll()`, `updateStreaks()`, `isCompletedToday(habit)`, `shouldResetStreak(habit)`, `isMilestone(streak)`.

### FocusManager

Manages countdown timer and focus session recording. Exposes: `start(duration, onTick, onComplete)`, `stop(reason)`, `getAllSessions()`, `getSessionsInRange(start, end)`, `isActive()`.

### AnalyticsManager

Aggregates data from the other managers to compute productivity metrics. Exposes: `getTaskCompletionRate(start, end)`, `getDailyTaskCompletion(days)`, `getAverageDailyFocusTime(days)`, `getHabitConsistencyScore()`, `getSummary()`.

### StorageService

Abstraction layer over `localStorage`. Exposes: `get(key)`, `set(key, value)`, `remove(key)`, `clear()`.

### NotificationsModule

Wraps the Browser Notifications API. Provides task due-date reminders and focus session completion alerts.

---

## Data Models

### Task

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (e.g. `task_<timestamp>_<random>`) |
| `title` | `string` | Task title (required) |
| `description` | `string` | Optional description |
| `dueDate` | `string \| null` | ISO 8601 datetime string |
| `priority` | `'low' \| 'medium' \| 'high'` | Priority level |
| `completed` | `boolean` | Completion status |
| `completedAt` | `string \| null` | ISO 8601 datetime of completion |
| `createdAt` | `string` | ISO 8601 datetime of creation |

### Habit

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `name` | `string` | Habit name (required) |
| `frequency` | `'daily' \| 'weekly'` | Completion frequency |
| `streak` | `number` | Current consecutive completion count |
| `lastCompleted` | `string \| null` | ISO 8601 date of last completion |
| `createdAt` | `string` | ISO 8601 datetime of creation |

### FocusSession

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `plannedDuration` | `number` | Planned duration in minutes |
| `actualDuration` | `number` | Actual elapsed duration in seconds |
| `startedAt` | `string` | ISO 8601 datetime of start |
| `endedAt` | `string \| null` | ISO 8601 datetime of end |
| `status` | `'completed' \| 'stopped'` | Session outcome |
| `stopReason` | `string \| null` | Reason if stopped early |

### WidgetLayout

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Widget identifier (`tasks`, `habits`, `focus`, `analytics`) |
| `order` | `number` | Display order index |
| `size` | `'small' \| 'medium' \| 'large'` | Rendered size |

### Settings

| Field | Type | Description |
|---|---|---|
| `notificationsEnabled` | `boolean` | Browser notifications toggle |
| `defaultFocusDuration` | `number` | Default focus session length in minutes |

### Local Storage Key Map

| Key (prefixed `ppd_`) | Model | Description |
|---|---|---|
| `ppd_tasks` | `Task[]` | All tasks |
| `ppd_habits` | `Habit[]` | All habits |
| `ppd_focus_sessions` | `FocusSession[]` | All focus sessions |
| `ppd_layout` | `WidgetLayout[]` | Dashboard layout config |
| `ppd_settings` | `Settings` | User settings |

---

## Component Structure

### Semantic HTML Structure

The dashboard uses only semantic HTML elements. No `<div>` or `<span>` elements are permitted.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Personal Productivity Dashboard</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Productivity Dashboard</h1>
        <nav>
            <ul>
                <li><a href="#tasks">Tasks</a></li>
                <li><a href="#habits">Habits</a></li>
                <li><a href="#focus">Focus</a></li>
                <li><a href="#analytics">Analytics</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section id="tasks" aria-label="Task Management">
            <article class="widget glass-card">
                <header>
                    <h2>Tasks</h2>
                </header>
                <form id="task-form">
                    <fieldset>
                        <legend>Add New Task</legend>
                        <label for="task-title">Title</label>
                        <input type="text" id="task-title" required>
                        
                        <label for="task-description">Description</label>
                        <textarea id="task-description"></textarea>
                        
                        <label for="task-due-date">Due Date</label>
                        <input type="datetime-local" id="task-due-date">
                        
                        <label for="task-priority">Priority</label>
                        <select id="task-priority">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                        
                        <button type="submit">Add Task</button>
                    </fieldset>
                </form>
                <ul id="task-list" aria-label="Task List">
                    <!-- Tasks rendered here -->
                </ul>
            </article>
        </section>
        
        <section id="habits" aria-label="Habit Tracking">
            <article class="widget glass-card">
                <header>
                    <h2>Habits</h2>
                </header>
                <form id="habit-form">
                    <fieldset>
                        <legend>Add New Habit</legend>
                        <label for="habit-name">Habit Name</label>
                        <input type="text" id="habit-name" required>
                        
                        <label for="habit-frequency">Frequency</label>
                        <select id="habit-frequency">
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                        </select>
                        
                        <button type="submit">Add Habit</button>
                    </fieldset>
                </form>
                <ul id="habit-list" aria-label="Habit List">
                    <!-- Habits rendered here -->
                </ul>
            </article>
        </section>
        
        <section id="focus" aria-label="Focus Session Timer">
            <article class="widget glass-card">
                <header>
                    <h2>Focus Timer</h2>
                </header>
                <output id="timer-display" aria-live="polite">00:00</output>
                <form id="focus-form">
                    <fieldset>
                        <legend>Configure Session</legend>
                        <label for="focus-duration">Duration (minutes)</label>
                        <input type="number" id="focus-duration" 
                               min="5" max="120" value="25">
                    </fieldset>
                </form>
                <menu type="toolbar">
                    <button id="start-focus">Start</button>
                    <button id="stop-focus">Stop</button>
                </menu>
            </article>
        </section>
        
        <section id="analytics" aria-label="Productivity Analytics">
            <article class="widget glass-card">
                <header>
                    <h2>Analytics</h2>
                </header>
                <figure id="completion-chart">
                    <figcaption>Task Completion (Last 7 Days)</figcaption>
                    <canvas id="completion-canvas"></canvas>
                </figure>
                <dl>
                    <dt>Average Daily Focus Time</dt>
                    <dd id="avg-focus-time">0 minutes</dd>
                    
                    <dt>Habit Consistency Score</dt>
                    <dd id="habit-consistency">0%</dd>
                </dl>
            </article>
        </section>
    </main>
    
    <footer>
        <p>Personal Productivity Dashboard</p>
        <button id="clear-data">Clear All Data</button>
    </footer>
    
    <aside id="notifications" aria-label="Notifications" hidden>
        <!-- Notification area for alerts -->
    </aside>
    
    <script type="module" src="app.js"></script>
</body>
</html>
```

### CSS Architecture

The CSS follows a modular approach with glassmorphism styling:

```css
/* styles.css - Architecture Overview */

/* ================================
   1. CSS Custom Properties (Variables)
   ================================ */
:root {
    /* Color Palette */
    --color-primary: #6366f1;
    --color-secondary: #8b5cf6;
    --color-accent: #06b6d4;
    --color-success: #10b981;
    --color-warning: #f59e0b;
    --color-danger: #ef4444;
    
    /* Glassmorphism Properties */
    --glass-background: rgba(255, 255, 255, 0.1);
    --glass-border: rgba(255, 255, 255, 0.2);
    --glass-blur: 20px;
    --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    
    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    
    /* Typography */
    --font-family: system-ui, -apple-system, sans-serif;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    
    /* Transitions */
    --transition-fast: 150ms ease;
    --transition-normal: 300ms ease;
}

/* ================================
   2. Base Styles & Gradient Background
   ================================ */
body {
    font-family: var(--font-family);
    font-size: var(--font-size-base);
    line-height: 1.6;
    color: white;
    min-height: 100vh;
    margin: 0;
    padding: var(--spacing-lg);
    
    /* Animated gradient background */
    background: linear-gradient(
        135deg,
        #667eea 0%,
        #764ba2 25%,
        #6B8DD6 50%,
        #8E37D7 75%,
        #667eea 100%
    );
    background-size: 400% 400%;
    animation: gradient-shift 15s ease infinite;
}

@keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

/* ================================
   3. Glassmorphism Card Styles
   ================================ */
.glass-card {
    background: var(--glass-background);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border-radius: var(--spacing-lg);
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);
    padding: var(--spacing-lg);
    transition: transform var(--transition-normal),
                box-shadow var(--transition-normal);
}

.glass-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* ================================
   4. Semantic Element Styles
   ================================ */

/* Header & Navigation */
header {
    text-align: center;
    margin-bottom: var(--spacing-xl);
}

nav ul {
    display: flex;
    justify-content: center;
    gap: var(--spacing-lg);
    list-style: none;
    padding: 0;
}

nav a {
    color: white;
    text-decoration: none;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--spacing-sm);
    transition: background-color var(--transition-fast);
}

nav a:hover,
nav a:focus {
    background-color: rgba(255, 255, 255, 0.2);
}

/* Forms */
fieldset {
    border: 1px solid var(--glass-border);
    border-radius: var(--spacing-md);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
}

legend {
    font-weight: 600;
    padding: 0 var(--spacing-sm);
}

label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-weight: 500;
}

input, select, textarea {
    width: 100%;
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid var(--glass-border);
    border-radius: var(--spacing-sm);
    color: white;
    font-family: inherit;
}

input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.3);
}

button {
    padding: var(--spacing-sm) var(--spacing-lg);
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--spacing-sm);
    cursor: pointer;
    font-family: inherit;
    font-weight: 600;
    transition: background-color var(--transition-fast),
                transform var(--transition-fast);
}

button:hover {
    background: var(--color-secondary);
}

button:active {
    transform: scale(0.98);
}

/* Lists */
ul, ol {
    list-style: none;
    padding: 0;
}

li {
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--spacing-sm);
}

/* Timer Display */
output {
    display: block;
    font-size: 3rem;
    font-weight: 700;
    text-align: center;
    font-variant-numeric: tabular-nums;
}

/* ================================
   5. Widget Layout (Grid-based)
   ================================ */
main {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-lg);
}

/* ================================
   6. State Indicators
   ================================ */
.task-complete {
    text-decoration: line-through;
    opacity: 0.6;
}

.priority-high {
    border-left: 4px solid var(--color-danger);
}

.priority-medium {
    border-left: 4px solid var(--color-warning);
}

.priority-low {
    border-left: 4px solid var(--color-success);
}

.streak-milestone {
    position: relative;
}

.streak-milestone::after {
    content: "🎉";
    margin-left: var(--spacing-sm);
}

/* ================================
   7. Accessibility
   ================================ */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}

[hidden] {
    display: none !important;
}

:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
}
```

## JavaScript Module Architecture

### Module Structure

```
js/
├── app.js              # Main entry point
├── modules/
│   ├── storage.js      # Local Storage abstraction
│   ├── tasks.js        # Task management
│   ├── habits.js       # Habit tracking
│   ├── focus.js        # Focus session timer
│   ├── analytics.js    # Analytics calculations
│   └── notifications.js # Browser notifications
└── utils/
    └── date.js         # Date utilities
```

### Storage Service Module

```javascript
// js/modules/storage.js

/**
 * Storage Service - Abstraction layer for Local Storage
 * Provides type-safe serialization and deserialization
 */
export class StorageService {
    constructor(prefix = 'ppd_') {
        this.prefix = prefix;
    }
    
    /**
     * Generate storage key with prefix
     * @param {string} key - Base key name
     * @returns {string} Prefixed key
     */
    _key(key) {
        return `${this.prefix}${key}`;
    }
    
    /**
     * Retrieve and deserialize data from Local Storage
     * @param {string} key - Storage key
     * @returns {*} Parsed value or null if not found
     */
    get(key) {
        const value = localStorage.getItem(this._key(key));
        if (value === null) return null;
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }
    
    /**
     * Serialize and store data in Local Storage
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     */
    set(key, value) {
        localStorage.setItem(this._key(key), JSON.stringify(value));
    }
    
    /**
     * Remove item from Local Storage
     * @param {string} key - Storage key
     */
    remove(key) {
        localStorage.removeItem(this._key(key));
    }
    
    /**
     * Clear all app data from Local Storage
     */
    clear() {
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .forEach(key => localStorage.removeItem(key));
    }
}

// Singleton instance
export const storage = new StorageService();
```

### Data Models

```javascript
// js/modules/models.js

/**
 * Task Model
 * @typedef {Object} Task
 * @property {string} id - Unique identifier (UUID)
 * @property {string} title - Task title
 * @property {string} description - Optional description
 * @property {string} dueDate - ISO 8601 datetime string
 * @property {'low'|'medium'|'high'} priority - Priority level
 * @property {boolean} completed - Completion status
 * @property {string|null} completedAt - ISO 8601 datetime of completion
 * @property {string} createdAt - ISO 8601 datetime of creation
 */

/**
 * Habit Model
 * @typedef {Object} Habit
 * @property {string} id - Unique identifier
 * @property {string} name - Habit name
 * @property {'daily'|'weekly'} frequency - Completion frequency
 * @property {number} streak - Current streak count
 * @property {string} lastCompleted - ISO 8601 date of last completion
 * @property {string} createdAt - ISO 8601 datetime of creation
 */

/**
 * Focus Session Model
 * @typedef {Object} FocusSession
 * @property {string} id - Unique identifier
 * @property {number} plannedDuration - Planned duration in minutes
 * @property {number} actualDuration - Actual duration in seconds
 * @property {string} startedAt - ISO 8601 datetime of start
 * @property {string|null} endedAt - ISO 8601 datetime of end
 * @property {'completed'|'stopped'} status - Session status
 * @property {string|null} stopReason - Reason if stopped early
 */

/**
 * Dashboard Layout Model
 * @typedef {Object} WidgetLayout
 * @property {string} id - Widget identifier
 * @property {number} order - Display order
 * @property {string} size - 'small'|'medium'|'large'
 */

/**
 * Settings Model
 * @typedef {Object} Settings
 * @property {boolean} notificationsEnabled - Browser notifications toggle
 * @property {number} defaultFocusDuration - Default focus session length
 */

// Default settings
export const DEFAULT_SETTINGS = {
    notificationsEnabled: true,
    defaultFocusDuration: 25
};

// Default widget layout
export const DEFAULT_LAYOUT = [
    { id: 'tasks', order: 0, size: 'medium' },
    { id: 'habits', order: 1, size: 'medium' },
    { id: 'focus', order: 2, size: 'small' },
    { id: 'analytics', order: 3, size: 'large' }
];
```

### Task Module

```javascript
// js/modules/tasks.js
import { storage } from './storage.js';

const STORAGE_KEY = 'tasks';

/**
 * Task Management Module
 * Handles CRUD operations for tasks with Local Storage persistence
 */
export class TaskManager {
    constructor() {
        this.tasks = this._loadTasks();
    }
    
    /**
     * Load tasks from storage
     * @private
     * @returns {Task[]}
     */
    _loadTasks() {
        return storage.get(STORAGE_KEY) || [];
    }
    
    /**
     * Persist tasks to storage
     * @private
     */
    _save() {
        storage.set(STORAGE_KEY, this.tasks);
    }
    
    /**
     * Generate unique ID
     * @private
     * @returns {string}
     */
    _generateId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Create a new task
     * @param {Object} data - Task data
     * @param {string} data.title - Task title
     * @param {string} [data.description] - Task description
     * @param {string} [data.dueDate] - Due date (ISO 8601)
     * @param {string} [data.priority='medium'] - Priority level
     * @returns {Task} Created task
     */
    create(data) {
        const task = {
            id: this._generateId(),
            title: data.title,
            description: data.description || '',
            dueDate: data.dueDate || null,
            priority: data.priority || 'medium',
            completed: false,
            completedAt: null,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.push(task);
        this._save();
        return task;
    }
    
    /**
     * Update an existing task
     * @param {string} id - Task ID
     * @param {Object} updates - Fields to update
     * @returns {Task|null} Updated task or null if not found
     */
    update(id, updates) {
        const index = this.tasks.findIndex(t => t.id === id);
        if (index === -1) return null;
        
        this.tasks[index] = {
            ...this.tasks[index],
            ...updates
        };
        
        this._save();
        return this.tasks[index];
    }
    
    /**
     * Delete a task
     * @param {string} id - Task ID
     * @returns {boolean} True if deleted, false if not found
     */
    delete(id) {
        const index = this.tasks.findIndex(t => t.id === id);
        if (index === -1) return false;
        
        this.tasks.splice(index, 1);
        this._save();
        return true;
    }
    
    /**
     * Mark a task as completed
     * @param {string} id - Task ID
     * @returns {Task|null} Updated task or null if not found
     */
    complete(id) {
        return this.update(id, {
            completed: true,
            completedAt: new Date().toISOString()
        });
    }
    
    /**
     * Mark a task as incomplete
     * @param {string} id - Task ID
     * @returns {Task|null} Updated task or null if not found
     */
    uncomplete(id) {
        return this.update(id, {
            completed: false,
            completedAt: null
        });
    }
    
    /**
     * Get all tasks
     * @returns {Task[]}
     */
    getAll() {
        return [...this.tasks];
    }
    
    /**
     * Get tasks by completion status
     * @param {boolean} completed - Completion status
     * @returns {Task[]}
     */
    getByStatus(completed) {
        return this.tasks.filter(t => t.completed === completed);
    }
    
    /**
     * Get task by ID
     * @param {string} id - Task ID
     * @returns {Task|null}
     */
    getById(id) {
        return this.tasks.find(t => t.id === id) || null;
    }
}
```

### Habit Module

```javascript
// js/modules/habits.js
import { storage } from './storage.js';

const STORAGE_KEY = 'habits';

/**
 * Habit Tracking Module
 * Manages habit creation, completion, and streak calculation
 */
export class HabitManager {
    constructor() {
        this.habits = this._loadHabits();
    }
    
    /**
     * Load habits from storage
     * @private
     * @returns {Habit[]}
     */
    _loadHabits() {
        return storage.get(STORAGE_KEY) || [];
    }
    
    /**
     * Persist habits to storage
     * @private
     */
    _save() {
        storage.set(STORAGE_KEY, this.habits);
    }
    
    /**
     * Generate unique ID
     * @private
     * @returns {string}
     */
    _generateId() {
        return `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Check if two dates are the same calendar day
     * @private
     * @param {string} date1 - ISO date string
     * @param {string} date2 - ISO date string
     * @returns {boolean}
     */
    _isSameDay(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return d1.toDateString() === d2.toDateString();
    }
    
    /**
     * Check if habit was completed today
     * @param {Habit} habit - Habit to check
     * @returns {boolean}
     */
    isCompletedToday(habit) {
        if (!habit.lastCompleted) return false;
        return this._isSameDay(habit.lastCompleted, new Date().toISOString());
    }
    
    /**
     * Check if streak should be reset
     * @param {Habit} habit - Habit to check
     * @returns {boolean}
     */
    shouldResetStreak(habit) {
        if (!habit.lastCompleted || habit.streak === 0) return false;
        
        const lastDate = new Date(habit.lastCompleted);
        const today = new Date();
        const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
        
        if (habit.frequency === 'daily') {
            return diffDays > 1;
        } else if (habit.frequency === 'weekly') {
            return diffDays > 7;
        }
        return false;
    }
    
    /**
     * Create a new habit
     * @param {Object} data - Habit data
     * @param {string} data.name - Habit name
     * @param {string} [data.frequency='daily'] - Frequency
     * @returns {Habit} Created habit
     */
    create(data) {
        const habit = {
            id: this._generateId(),
            name: data.name,
            frequency: data.frequency || 'daily',
            streak: 0,
            lastCompleted: null,
            createdAt: new Date().toISOString()
        };
        
        this.habits.push(habit);
        this._save();
        return habit;
    }
    
    /**
     * Mark habit as complete for today
     * @param {string} id - Habit ID
     * @returns {Habit|null} Updated habit or null
     */
    complete(id) {
        const habit = this.habits.find(h => h.id === id);
        if (!habit) return null;
        
        // Don't increment if already completed today
        if (this.isCompletedToday(habit)) return habit;
        
        // Check if streak should be reset before incrementing
        if (this.shouldResetStreak(habit)) {
            habit.streak = 0;
        }
        
        habit.streak += 1;
        habit.lastCompleted = new Date().toISOString();
        
        this._save();
        return habit;
    }
    
    /**
     * Update all streaks based on current date
     * Called on app initialization
     */
    updateStreaks() {
        let updated = false;
        
        for (const habit of this.habits) {
            if (this.shouldResetStreak(habit)) {
                habit.streak = 0;
                updated = true;
            }
        }
        
        if (updated) this._save();
    }
    
    /**
     * Delete a habit
     * @param {string} id - Habit ID
     * @returns {boolean} True if deleted
     */
    delete(id) {
        const index = this.habits.findIndex(h => h.id === id);
        if (index === -1) return false;
        
        this.habits.splice(index, 1);
        this._save();
        return true;
    }
    
    /**
     * Get all habits
     * @returns {Habit[]}
     */
    getAll() {
        return [...this.habits];
    }
    
    /**
     * Check if streak is a milestone (7, 14, 30 days)
     * @param {number} streak - Current streak
     * @returns {boolean}
     */
    isMilestone(streak) {
        return [7, 14, 30].includes(streak);
    }
}
```

### Focus Module

```javascript
// js/modules/focus.js
import { storage } from './storage.js';

const STORAGE_KEY = 'focus_sessions';

/**
 * Focus Session Timer Module
 * Manages focus sessions with countdown timer
 */
export class FocusManager {
    constructor() {
        this.sessions = this._loadSessions();
        this.activeSession = null;
        this.timerInterval = null;
    }
    
    /**
     * Load sessions from storage
     * @private
     * @returns {FocusSession[]}
     */
    _loadSessions() {
        return storage.get(STORAGE_KEY) || [];
    }
    
    /**
     * Persist sessions to storage
     * @private
     */
    _save() {
        storage.set(STORAGE_KEY, this.sessions);
    }
    
    /**
     * Generate unique ID
     * @private
     * @returns {string}
     */
    _generateId() {
        return `focus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Start a new focus session
     * @param {number} duration - Duration in minutes (5-120)
     * @param {Function} onTick - Callback for each second tick
     * @param {Function} onComplete - Callback when timer completes
     * @returns {FocusSession|null} Created session or null if invalid
     */
    start(duration, onTick, onComplete) {
        // Validate duration
        if (duration < 5 || duration > 120) return null;
        
        // Stop any active session
        if (this.activeSession) {
            this.stop('Started new session');
        }
        
        const session = {
            id: this._generateId(),
            plannedDuration: duration,
            actualDuration: 0,
            startedAt: new Date().toISOString(),
            endedAt: null,
            status: 'active',
            stopReason: null
        };
        
        this.activeSession = session;
        
        let remainingSeconds = duration * 60;
        
        this.timerInterval = setInterval(() => {
            remainingSeconds -= 1;
            session.actualDuration = (duration * 60) - remainingSeconds;
            
            if (onTick) onTick(remainingSeconds);
            
            if (remainingSeconds <= 0) {
                this._complete(onComplete);
            }
        }, 1000);
        
        return session;
    }
    
    /**
     * Complete the active session
     * @private
     * @param {Function} onComplete - Completion callback
     */
    _complete(onComplete) {
        if (!this.activeSession) return;
        
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        
        this.activeSession.status = 'completed';
        this.activeSession.endedAt = new Date().toISOString();
        
        this.sessions.push(this.activeSession);
        this._save();
        
        if (onComplete) onComplete(this.activeSession);
        
        this.activeSession = null;
    }
    
    /**
     * Stop the active session early
     * @param {string} reason - Reason for stopping
     * @returns {FocusSession|null} Stopped session or null
     */
    stop(reason = 'User stopped') {
        if (!this.activeSession) return null;
        
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        
        this.activeSession.status = 'stopped';
        this.activeSession.endedAt = new Date().toISOString();
        this.activeSession.stopReason = reason;
        
        this.sessions.push(this.activeSession);
        this._save();
        
        const session = this.activeSession;
        this.activeSession = null;
        
        return session;
    }
    
    /**
     * Get all completed sessions
     * @returns {FocusSession[]}
     */
    getAllSessions() {
        return [...this.sessions];
    }
    
    /**
     * Get sessions within a date range
     * @param {Date} start - Start date
     * @param {Date} end - End date
     * @returns {FocusSession[]}
     */
    getSessionsInRange(start, end) {
        return this.sessions.filter(s => {
            const sessionDate = new Date(s.startedAt);
            return sessionDate >= start && sessionDate <= end;
        });
    }
    
    /**
     * Check if session is currently active
     * @returns {boolean}
     */
    isActive() {
        return this.activeSession !== null;
    }
}
```

### Analytics Module

```javascript
// js/modules/analytics.js

/**
 * Analytics Module
 * Calculates productivity metrics from tasks, habits, and focus sessions
 */
export class AnalyticsManager {
    /**
     * @param {TaskManager} taskManager - Task manager instance
     * @param {HabitManager} habitManager - Habit manager instance
     * @param {FocusManager} focusManager - Focus manager instance
     */
    constructor(taskManager, habitManager, focusManager) {
        this.taskManager = taskManager;
        this.habitManager = habitManager;
        this.focusManager = focusManager;
    }
    
    /**
     * Get task completion rate for a date range
     * @param {Date} start - Start date
     * @param {Date} end - End date
     * @returns {Object} Completion stats
     */
    getTaskCompletionRate(start, end) {
        const tasks = this.taskManager.getAll();
        
        const tasksInPeriod = tasks.filter(t => {
            const createdDate = new Date(t.createdAt);
            return createdDate >= start && createdDate <= end;
        });
        
        const completed = tasksInPeriod.filter(t => t.completed).length;
        const total = tasksInPeriod.length;
        
        return {
            completed,
            total,
            rate: total > 0 ? (completed / total) * 100 : 0
        };
    }
    
    /**
     * Get daily task completion for the past N days
     * @param {number} days - Number of days
     * @returns {Array<{date: string, completed: number, total: number}>}
     */
    getDailyTaskCompletion(days = 7) {
        const result = [];
        const tasks = this.taskManager.getAll();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            
            const dayTasks = tasks.filter(t => {
                const createdDate = new Date(t.createdAt);
                return createdDate >= date && createdDate < nextDate;
            });
            
            const completed = dayTasks.filter(t => t.completed).length;
            
            result.push({
                date: date.toISOString().split('T')[0],
                completed,
                total: dayTasks.length
            });
        }
        
        return result;
    }
    
    /**
     * Calculate average daily focus time in minutes
     * @param {number} days - Number of days to analyze
     * @returns {number} Average minutes per day
     */
    getAverageDailyFocusTime(days = 7) {
        const sessions = this.focusManager.getAllSessions();
        const completedSessions = sessions.filter(s => s.status === 'completed');
        
        let totalMinutes = 0;
        let daysWithSessions = new Set();
        
        for (const session of completedSessions) {
            totalMinutes += session.actualDuration / 60;
            daysWithSessions.add(new Date(session.startedAt).toDateString());
        }
        
        const daysCount = Math.min(days, daysWithSessions.size);
        return daysCount > 0 ? totalMinutes / daysCount : 0;
    }
    
    /**
     * Calculate habit consistency score
     * @returns {number} Percentage of completed habits vs scheduled
     */
    getHabitConsistencyScore() {
        const habits = this.habitManager.getAll();
        
        if (habits.length === 0) return 0;
        
        let totalPossibleStreak = 0;
        let currentStreak = 0;
        
        for (const habit of habits) {
            const daysSinceCreation = Math.floor(
                (Date.now() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24)
            ) + 1;
            
            totalPossibleStreak += daysSinceCreation;
            currentStreak += habit.streak;
        }
        
        return totalPossibleStreak > 0 
            ? (currentStreak / totalPossibleStreak) * 100 
            : 0;
    }
    
    /**
     * Get comprehensive analytics summary
     * @returns {Object} Analytics summary
     */
    getSummary() {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        
        return {
            taskCompletion: this.getTaskCompletionRate(last7Days, new Date()),
            dailyCompletion: this.getDailyTaskCompletion(7),
            averageFocusTime: this.getAverageDailyFocusTime(7),
            habitConsistency: this.getHabitConsistencyScore()
        };
    }
}
```

## Error Handling

### Error Handling Strategy

```javascript
// js/modules/errors.js

/**
 * Application Error Types
 */
export class AppError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'AppError';
        this.code = code;
    }
}

export class StorageError extends AppError {
    constructor(message) {
        super(message, 'STORAGE_ERROR');
        this.name = 'StorageError';
    }
}

export class ValidationError extends AppError {
    constructor(message, field) {
        super(message, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
        this.field = field;
    }
}

/**
 * Error Handler
 */
export function handleError(error, userFacing = true) {
    console.error('[App Error]', error);
    
    // Create user-facing notification
    if (userFacing) {
        const aside = document.querySelector('aside#notifications');
        if (aside) {
            const article = document.createElement('article');
            article.className = 'error-notification';
            article.setAttribute('role', 'alert');
            
            const header = document.createElement('header');
            const title = document.createElement('h3');
            title.textContent = 'Error';
            header.appendChild(title);
            
            const message = document.createElement('p');
            message.textContent = error.message || 'An unexpected error occurred';
            
            const button = document.createElement('button');
            button.textContent = 'Dismiss';
            button.onclick = () => article.remove();
            
            article.appendChild(header);
            article.appendChild(message);
            article.appendChild(button);
            aside.appendChild(article);
            aside.hidden = false;
            
            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                article.remove();
                if (aside.children.length === 0) {
                    aside.hidden = true;
                }
            }, 5000);
        }
    }
}

/**
 * Safe storage wrapper with error handling
 */
export function safeStorageOperation(operation) {
    try {
        return operation();
    } catch (error) {
        if (error instanceof DOMException && 
            error.name === 'QuotaExceededError') {
            throw new StorageError('Storage quota exceeded. Please clear some data.');
        }
        throw new StorageError('Failed to access local storage');
    }
}
```

## Testing Strategy

### Unit Tests

Unit tests will verify:
- Individual module methods (CRUD operations)
- Data serialization/deserialization
- Streak calculation logic
- Focus timer state transitions
- Analytics calculations

### Property-Based Tests

Property-based tests will verify universal properties across all inputs:
- Task round-trip through storage
- Habit streak increment/reset logic
- Focus session duration validation
- Analytics calculation correctness

### Test Configuration

- **Unit Tests**: Example-based tests for specific scenarios
- **Property Tests**: Minimum 100 iterations using fast-check or similar library
- **Coverage Target**: 80% code coverage for modules

## Performance Considerations

### Rendering Optimization

1. **Batch Updates**: Group DOM updates when rendering lists
2. **Debounced Input**: Debounce search/filter inputs (300ms)
3. **Lazy Loading**: Load analytics only when section is visible

### Storage Optimization

1. **Data Limits**: Warn users when approaching Local Storage limits (5MB)
2. **Cleanup**: Archive/delete old completed tasks (>30 days old)
3. **Compression**: Consider compressing large data sets

## Accessibility

### WCAG 2.1 AA Compliance

1. **Semantic HTML**: All elements use appropriate semantic tags
2. **ARIA Labels**: Form fields and interactive elements have labels
3. **Keyboard Navigation**: All features accessible via keyboard
4. **Focus Indicators**: Visible focus states for all interactive elements
5. **Color Contrast**: Minimum 4.5:1 contrast ratio
6. **Reduced Motion**: Respects `prefers-reduced-motion`

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Features used:
- Local Storage API
- Notification API
- CSS backdrop-filter
- CSS Grid
- ES6 Modules

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Task Round-Trip Persistence

*For any* valid task with title, description, due date, and priority, creating the task, then retrieving it from storage, SHALL produce an equivalent task object with all fields preserved.

**Validates: Requirements 2.1**

### Property 2: Task Update Persistence

*For any* existing task and *any* valid update payload, updating the task then retrieving it SHALL reflect all updated values while preserving unmodified fields.

**Validates: Requirements 2.2**

### Property 3: Task Deletion Consistency

*For any* task that has been deleted, subsequent queries for that task SHALL return null/undefined and the task SHALL NOT appear in any task list.

**Validates: Requirements 2.3**

### Property 4: Task Completion State Transition

*For any* incomplete task, marking it as completed SHALL set `completed` to `true`, record a valid `completedAt` timestamp, and the task SHALL appear in completed task queries.

**Validates: Requirements 2.5**

### Property 5: Habit Round-Trip Persistence

*For any* valid habit with name and frequency, creating the habit, then retrieving it from storage, SHALL produce an equivalent habit object with streak initialized to 0.

**Validates: Requirements 3.1**

### Property 6: Habit Streak Increment

*For any* habit with an active streak, completing the habit for the current day SHALL increment the streak by exactly 1, provided the habit was not already completed today.

**Validates: Requirements 3.2**

### Property 7: Habit Streak Reset

*For any* daily habit where the last completion was more than 1 day ago, or *any* weekly habit where the last completion was more than 7 days ago, the streak SHALL be reset to 0.

**Validates: Requirements 3.3**

### Property 8: Focus Session Duration Validation

*For any* requested focus duration, the system SHALL accept values between 5 and 120 minutes (inclusive) and reject all other values.

**Validates: Requirements 4.5**

### Property 9: Focus Session Duration Logging

*For any* focus session that ends (either by completion or manual stop), the logged `actualDuration` SHALL equal the elapsed time from start to end.

**Validates: Requirements 4.2, 4.4**

### Property 10: Analytics Calculation Correctness

*For any* set of tasks and *any* date range, the task completion rate SHALL equal `(completed tasks in range) / (total tasks in range) * 100`.

**Validates: Requirements 5.1, 5.2**

### Property 11: Average Focus Time Calculation

*For any* collection of completed focus sessions, the average daily focus time SHALL equal `sum of all actual durations / number of unique days with sessions`.

**Validates: Requirements 5.3**

### Property 12: Habit Consistency Score Calculation

*For any* collection of habits, the consistency score SHALL equal `(sum of all current streaks) / (sum of all possible maximum streaks based on creation dates) * 100`.

**Validates: Requirements 5.4**

### Property 13: Layout Configuration Round-Trip

*For any* valid widget layout configuration, saving then loading the layout SHALL produce an equivalent configuration with all widget positions and sizes preserved.

**Validates: Requirements 6.1, 6.2, 6.5**

### Property 14: Layout Reset Idempotence

*For any* current layout state, resetting to default SHALL always produce the same default layout configuration, regardless of prior modifications.

**Validates: Requirements 6.4**
