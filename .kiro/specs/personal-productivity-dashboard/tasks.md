# Implementation Plan: Personal Productivity Dashboard

## Overview

A simple client-side web application built with semantic HTML, CSS (glassmorphism UI), and vanilla JavaScript. All data persists via Local Storage. No backend, no authentication, no user accounts.

## Tasks

- [ ] 1. Set up project structure and files
  - Create folder structure: `css/`, `js/`, `asset/`
  - Create empty `index.html` at root
  - Create empty `css/index.css`
  - Create empty `js/index.js`
  - _Requirements: Project structure_

- [ ] 2. Build semantic HTML structure
  - [ ] 2.1 Create HTML document with semantic elements only
    - Use `<header>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<nav>`, `<aside>`, `<form>`, `<fieldset>`, `<output>`, `<menu>` - NO `<div>` or `<span>`
    - Include greeting section with time-based message display
    - Include Pomodoro timer section with display and controls
    - Include to-do list section with form and list
    - Include quick links section with form and list
    - Include theme toggle button in header
    - Link CSS and JS files
    - _Requirements: Semantic HTML structure_

- [ ] 3. Implement CSS styling
  - [ ] 3.1 Create glassmorphism UI styles
    - Define CSS custom properties for colors, spacing, glassmorphism
    - Create animated gradient background (purple/blue theme)
    - Style glass-card components with backdrop-filter blur
    - Style all semantic elements (forms, buttons, lists, inputs)
    - _Requirements: Glassmorphism UI with gradient backgrounds_

  - [ ] 3.2 Implement light/dark mode styles
    - Add `[data-theme="light"]` and `[data-theme="dark"]` CSS variables
    - Light mode: lighter glass backgrounds, lighter gradient
    - Dark mode: darker glass backgrounds, darker gradient
    - Default to dark mode on first load
    - _Requirements: Light/Dark mode toggle_

  - [ ] 3.3 Add responsive layout
    - Use CSS Grid for main layout
    - Mobile-first approach with responsive breakpoints
    - Ensure widgets stack properly on mobile
    - _Requirements: Responsive design_

- [ ] 4. Implement JavaScript functionality
  - [ ] 4.1 Create Storage Service module
    - Local Storage abstraction with prefix
    - `get(key)`, `set(key, value)`, `remove(key)` methods
    - JSON serialization/deserialization
    - _Requirements: Local Storage persistence_

  - [ ] 4.2 Implement Greeting Module
    - Get current time and determine greeting period:
      - Morning: 5:00 AM - 11:59 AM
      - Afternoon: 12:00 PM - 5:59 PM
      - Evening: 6:00 PM - 4:59 AM
    - Display greeting with current date
    - Update greeting when date changes
    - _Requirements: Greeting with time/date_

  - [ ] 4.3 Implement Theme Toggle Module
    - Read theme from Local Storage on load (default: dark)
    - Toggle between light and dark on button click
    - Update `data-theme` attribute on `<html>` element
    - Persist theme choice to Local Storage
    - _Requirements: Light/Dark mode toggle_

  - [ ] 4.4 Implement Pomodoro Timer Module
    - Default 25-minute duration
    - Start/Stop/Reset button functionality
    - Allow customizable duration (input field)
    - Display countdown in MM:SS format
    - Play audio notification when timer completes
    - Persist timer state to Local Storage (restore on reload)
    - _Requirements: 25-minute Pomodoro timer with start/stop/reset + customizable duration_

  - [ ] 4.5 Implement To-Do List Module
    - Add new task with title (required)
    - Edit existing task (inline or modal)
    - Delete task with confirmation
    - Mark task as done (strikethrough style)
    - Prevent duplicate task titles (case-insensitive check)
    - Persist tasks to Local Storage
    - Render tasks from storage on page load
    - _Requirements: To-do list with add/edit/delete/mark-done + duplicate prevention_

  - [ ] 4.6 Implement Quick Links Module
    - Add new link with name and URL (required fields)
    - Display links as clickable buttons/cards
    - Delete link functionality
    - Empty state message when no links exist
    - Persist links to Local Storage
    - Render links from storage on page load
    - _Requirements: Quick links (user adds all, empty by default)_

- [ ] 5. Checkpoint - Verify core functionality
  - Ensure all features work correctly
  - Test Local Storage persistence across page reloads
  - Verify semantic HTML compliance (no div/span)
  - Ask the user if questions arise.

- [ ] 6. Final polish and accessibility
  - [ ] 6.1 Add accessibility enhancements
    - Add ARIA labels where needed
    - Ensure focus states are visible
    - Add `aria-live` regions for dynamic updates
    - Test keyboard navigation
    - _Requirements: Accessibility_

  - [ ] 6.2 Add animations and transitions
    - Smooth transitions for theme toggle
    - Hover effects on interactive elements
    - Timer pulse animation when running
    - Respect `prefers-reduced-motion`
    - _Requirements: Glassmorphism UI with gradient backgrounds_

- [ ] 7. Final checkpoint - Ensure all tests pass
  - Ensure all features work correctly
  - Test on different screen sizes
  - Verify Local Storage persistence
  - Ask the user if questions arise.

## Notes

- All data persists via Local Storage only - no backend required
- Semantic HTML only - no `<div>` or `<span>` elements allowed
- Default theme is dark mode
- Quick links start empty - user adds all links
- Timer defaults to 25 minutes but is customizable
- Greeting updates based on time of day (Morning: 5am-12pm, Afternoon: 12pm-6pm, Evening: 6pm-5am)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["3.1", "3.2", "3.3"] },
    { "id": 2, "tasks": ["4.1"] },
    { "id": 3, "tasks": ["4.2", "4.3", "4.4", "4.5", "4.6"] },
    { "id": 4, "tasks": ["6.1", "6.2"] }
  ]
}
```
