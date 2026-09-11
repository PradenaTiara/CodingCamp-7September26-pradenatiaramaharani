/* ==========================================================
   PERSONAL PRODUCTIVITY DASHBOARD — js/index.js
   ==========================================================
   Sections
   1.  Storage Service
   2.  Greeting & Clock
   3.  Theme Toggle
   4.  Focus Timer
   5.  To-Do List
   6.  Quick Links
   7.  App Init
   ========================================================== */

'use strict';

/* ----------------------------------------------------------
   1. Storage Service
   Thin wrapper around localStorage with JSON handling.
   ---------------------------------------------------------- */
const Storage = {
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? null : JSON.parse(raw);
    } catch {
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn('[Storage] Could not write to localStorage:', err);
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },
};

/* Storage keys */
const KEYS = {
  theme:    'ppd_theme',
  duration: 'ppd_pomodoro_duration',
  tasks:    'ppd_tasks',
  links:    'ppd_links',
};


/* ----------------------------------------------------------
   2. Greeting & Clock
   Updates greeting text and live clock every second.
   ---------------------------------------------------------- */
const Greeting = (() => {
  const elGreeting = document.getElementById('greeting');
  const elTime     = document.getElementById('current-time');
  const elDate     = document.getElementById('current-date');

  /** Return greeting string based on hour (0–23). */
  function getGreeting(hour) {
    if (hour >= 5  && hour < 12) return 'Good morning! ☀️';
    if (hour >= 12 && hour < 18) return 'Good afternoon! 🌤️';
    return 'Good evening! 🌙';
  }

  /** Format Date → "HH:MM:SS" */
  function formatTime(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  /** Format Date → "Wednesday, 11 September 2026" */
  function formatDate(date) {
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day:     'numeric',
      month:   'long',
      year:    'numeric',
    });
  }

  function update() {
    const now  = new Date();
    const hour = now.getHours();

    elGreeting.textContent = getGreeting(hour);
    elTime.textContent     = formatTime(now);
    elTime.setAttribute('datetime', now.toISOString());
    elDate.textContent     = formatDate(now);
  }

  function init() {
    update();
    setInterval(update, 1000);
  }

  return { init };
})();


/* ----------------------------------------------------------
   3. Theme Toggle
   Switches between dark (default) and light on the <html>
   element via data-theme attribute, persisted in Storage.
   ---------------------------------------------------------- */
const Theme = (() => {
  const html       = document.documentElement;
  const btnToggle  = document.getElementById('theme-toggle');
  const iconEl     = document.getElementById('theme-icon');

  /* SVG files in asset/ folder */
  const ICONS = {
    dark:  'asset/moon.svg',
    light: 'asset/sun.svg',
  };

  const LABELS = {
    dark:  'Switch to light mode',
    light: 'Switch to dark mode',
  };

  function apply(theme) {
    html.setAttribute('data-theme', theme);
    iconEl.src = ICONS[theme];
    iconEl.alt = LABELS[theme];
    btnToggle.setAttribute('aria-label', LABELS[theme]);
  }

  function toggle() {
    const current = html.getAttribute('data-theme') || 'dark';
    const next    = current === 'dark' ? 'light' : 'dark';
    apply(next);
    Storage.set(KEYS.theme, next);
  }

  function init() {
    const saved = Storage.get(KEYS.theme) || 'dark';
    apply(saved);
    btnToggle.addEventListener('click', toggle);
  }

  return { init };
})();


/* ----------------------------------------------------------
   4. Focus Timer
   25-min countdown (customisable 1–60 min).
   Start / Stop / Reset. Duration saved to Storage.
   ---------------------------------------------------------- */
const Timer = (() => {
  const display      = document.getElementById('timer-display');
  const btnStart     = document.getElementById('timer-start');
  const btnStop      = document.getElementById('timer-stop');
  const btnReset     = document.getElementById('timer-reset');
  const formSettings = document.getElementById('timer-settings');
  const inputDur     = document.getElementById('timer-duration');

  let totalSeconds   = 25 * 60;  // current session length
  let remaining      = totalSeconds;
  let intervalId     = null;
  let isRunning      = false;

  /* --- helpers --- */
  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function render() {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    display.textContent = `${pad(m)}:${pad(s)}`;
  }

  function setRunningState(running) {
    isRunning = running;
    btnStart.disabled = running;
    btnStop.disabled  = !running;
    inputDur.disabled = running;

    if (running) {
      display.classList.add('running');
    } else {
      display.classList.remove('running');
    }
  }

  /* --- actions --- */
  function start() {
    if (isRunning) return;
    setRunningState(true);

    intervalId = setInterval(() => {
      remaining -= 1;
      render();

      if (remaining <= 0) {
        clearInterval(intervalId);
        intervalId = null;
        setRunningState(false);
        remaining = totalSeconds;
        render();
        // Notify user
        notifyTimerDone();
      }
    }, 1000);
  }

  function stop() {
    if (!isRunning) return;
    clearInterval(intervalId);
    intervalId = null;
    setRunningState(false);
  }

  function reset() {
    stop();
    remaining = totalSeconds;
    render();
  }

  function notifyTimerDone() {
    // Browser notification (if permission granted)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro done! 🎉', {
        body: 'Time to take a break.',
        icon: 'asset/icon.png',
      });
    }
    // Visual flash on display
    display.style.color = 'var(--success)';
    setTimeout(() => {
      display.style.color = '';
    }, 3000);
  }

  function applyDuration(minutes) {
    const clamped  = Math.min(60, Math.max(1, parseInt(minutes, 10) || 25));
    totalSeconds   = clamped * 60;
    remaining      = totalSeconds;
    inputDur.value = clamped;
    Storage.set(KEYS.duration, clamped);
    render();
  }

  /* --- event listeners --- */
  btnStart.addEventListener('click', start);
  btnStop.addEventListener('click',  stop);
  btnReset.addEventListener('click', reset);

  formSettings.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!isRunning) {
      applyDuration(inputDur.value);
    }
  });

  /* Request notification permission proactively */
  function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  function init() {
    const saved = Storage.get(KEYS.duration) || 25;
    applyDuration(saved);
    requestNotificationPermission();
  }

  return { init };
})();


/* ----------------------------------------------------------
   5. To-Do List
   Add / Edit (inline) / Delete / Mark done.
   Duplicate prevention (case-insensitive).
   All tasks persisted in Storage as array of objects.
   ---------------------------------------------------------- */
const TodoList = (() => {
  const form       = document.getElementById('task-form');
  const input      = document.getElementById('task-input');
  const errorEl    = document.getElementById('task-error');
  const listEl     = document.getElementById('task-list');
  const emptyEl    = document.getElementById('tasks-empty');
  const countEl    = document.getElementById('task-count');

  /** @type {Array<{id: string, text: string, done: boolean}>} */
  let tasks = [];

  /* --- persistence --- */
  function load() {
    tasks = Storage.get(KEYS.tasks) || [];
  }

  function save() {
    Storage.set(KEYS.tasks, tasks);
  }

  /* --- helpers --- */
  function generateId() {
    return `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }

  function isDuplicate(text) {
    return tasks.some(
      (t) => t.text.trim().toLowerCase() === text.trim().toLowerCase()
    );
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden      = false;
  }

  function clearError() {
    errorEl.textContent = '';
    errorEl.hidden      = true;
  }

  function updateCount() {
    const done  = tasks.filter((t) => t.done).length;
    const total = tasks.length;
    countEl.textContent = total === 0 ? '' : `${done}/${total} done`;
  }

  /* --- render --- */
  function renderAll() {
    listEl.innerHTML = '';

    if (tasks.length === 0) {
      emptyEl.hidden = false;
      updateCount();
      return;
    }

    emptyEl.hidden = true;

    tasks.forEach((task) => {
      listEl.appendChild(createTaskEl(task));
    });

    updateCount();
  }

  function createTaskEl(task) {
    const li = document.createElement('li');
    li.dataset.id = task.id;
    if (task.done) li.classList.add('done');

    /* checkbox */
    const checkbox   = document.createElement('input');
    checkbox.type    = 'checkbox';
    checkbox.checked = task.done;
    checkbox.id      = `chk_${task.id}`;
    checkbox.setAttribute('aria-label', `Mark "${task.text}" as done`);
    checkbox.addEventListener('change', () => toggleDone(task.id));

    /* label */
    const lbl       = document.createElement('label');
    lbl.htmlFor     = `chk_${task.id}`;
    lbl.textContent = task.text;

    /* action buttons wrapper */
    const actions = document.createElement('nav');
    actions.className = 'task-actions';
    actions.setAttribute('aria-label', 'Task actions');

    const btnEdit   = document.createElement('button');
    btnEdit.textContent = '✏️';
    btnEdit.className   = 'btn-edit';
    btnEdit.setAttribute('aria-label', `Edit task: ${task.text}`);
    btnEdit.addEventListener('click', () => startEdit(task.id, li, lbl));

    const btnDelete = document.createElement('button');
    btnDelete.textContent = '🗑️';
    btnDelete.className   = 'btn-delete';
    btnDelete.setAttribute('aria-label', `Delete task: ${task.text}`);
    btnDelete.addEventListener('click', () => deleteTask(task.id));

    actions.appendChild(btnEdit);
    actions.appendChild(btnDelete);

    li.appendChild(checkbox);
    li.appendChild(lbl);
    li.appendChild(actions);

    return li;
  }

  /* --- edit mode --- */
  function startEdit(id, li, lbl) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    /* Replace label with input */
    const editInput      = document.createElement('input');
    editInput.type       = 'text';
    editInput.value      = task.text;
    editInput.className  = 'edit-input';
    editInput.setAttribute('aria-label', 'Edit task text');
    li.replaceChild(editInput, lbl);
    editInput.focus();
    editInput.select();

    /* Replace edit button with save button */
    const actions   = li.querySelector('.task-actions');
    const btnEdit   = actions.querySelector('.btn-edit');
    const btnSave   = document.createElement('button');
    btnSave.textContent = '💾';
    btnSave.className   = 'btn-save';
    btnSave.setAttribute('aria-label', 'Save task');
    actions.replaceChild(btnSave, btnEdit);

    const saveHandler = () => commitEdit(id, editInput.value.trim());
    btnSave.addEventListener('click', saveHandler);
    editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveHandler();
      if (e.key === 'Escape') renderAll(); // cancel
    });
  }

  function commitEdit(id, newText) {
    if (!newText) return;

    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    /* Duplicate check (excluding self) */
    const duplicate = tasks.some(
      (t) =>
        t.id !== id &&
        t.text.trim().toLowerCase() === newText.toLowerCase()
    );

    if (duplicate) {
      showError(`"${newText}" already exists in your list.`);
      return;
    }

    task.text = newText;
    save();
    clearError();
    renderAll();
  }

  /* --- CRUD --- */
  function addTask(text) {
    if (isDuplicate(text)) {
      showError(`"${text}" is already in your list.`);
      return false;
    }

    tasks.push({ id: generateId(), text, done: false });
    save();
    clearError();
    return true;
  }

  function toggleDone(id) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.done = !task.done;
      save();
      updateCount();
      const li = listEl.querySelector(`li[data-id="${id}"]`);
      if (li) li.classList.toggle('done', task.done);
    }
  }

  function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    save();
    renderAll();
  }

  /* --- form submit --- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    if (addTask(text)) {
      input.value = '';
      renderAll();
    }
  });

  /* Clear error when user starts typing */
  input.addEventListener('input', clearError);

  function init() {
    load();
    renderAll();
  }

  return { init };
})();


/* ----------------------------------------------------------
   6. Quick Links
   Add links (name + URL) / open in new tab / delete.
   Stored as array of {id, name, url}.
   ---------------------------------------------------------- */
const QuickLinks = (() => {
  const form      = document.getElementById('link-form');
  const nameInput = document.getElementById('link-name');
  const urlInput  = document.getElementById('link-url');
  const listEl    = document.getElementById('links-list');
  const emptyEl   = document.getElementById('links-empty');

  /** @type {Array<{id: string, name: string, url: string}>} */
  let links = [];

  /* --- persistence --- */
  function load() {
    links = Storage.get(KEYS.links) || [];
  }

  function save() {
    Storage.set(KEYS.links, links);
  }

  /* --- helpers --- */
  function generateId() {
    return `link_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }

  function normaliseUrl(raw) {
    const trimmed = raw.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }

  /* --- render --- */
  function renderAll() {
    listEl.innerHTML = '';

    if (links.length === 0) {
      emptyEl.hidden = false;
      return;
    }

    emptyEl.hidden = true;

    links.forEach((link) => {
      listEl.appendChild(createLinkEl(link));
    });
  }

  function createLinkEl(link) {
    const li = document.createElement('li');
    li.dataset.id = link.id;

    const anchor        = document.createElement('a');
    anchor.href         = link.url;
    anchor.textContent  = link.name;
    anchor.target       = '_blank';
    anchor.rel          = 'noopener noreferrer';
    anchor.setAttribute('aria-label', `Open ${link.name} in new tab`);

    const btnDel            = document.createElement('button');
    btnDel.textContent      = '×';
    btnDel.setAttribute('aria-label', `Delete link: ${link.name}`);
    btnDel.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteLink(link.id);
    });

    li.appendChild(anchor);
    li.appendChild(btnDel);

    return li;
  }

  /* --- CRUD --- */
  function addLink(name, url) {
    links.push({ id: generateId(), name, url: normaliseUrl(url) });
    save();
  }

  function deleteLink(id) {
    links = links.filter((l) => l.id !== id);
    save();
    renderAll();
  }

  /* --- form submit --- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const url  = urlInput.value.trim();
    if (!name || !url) return;

    addLink(name, url);
    nameInput.value = '';
    urlInput.value  = '';
    renderAll();
    nameInput.focus();
  });

  function init() {
    load();
    renderAll();
  }

  return { init };
})();


/* ----------------------------------------------------------
   7. App Init
   Boot all modules in order.
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  Greeting.init();
  Timer.init();
  TodoList.init();
  QuickLinks.init();
});
