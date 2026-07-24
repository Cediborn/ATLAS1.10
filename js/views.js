// Atlas — View renderers. Each export is a pure-ish function that fills a
// container with markup; this 1:1 mapping is what becomes a React component
// per view once Atlas moves to Next.js (Foundation §4, roadmap Phase 1+).

import { icon } from './icons.js';
import { dashboardData, currentUser, workspaces } from './mock-data.js';
import { getState } from './store.js';
import { setTheme } from './theme.js';

export function renderDashboard(container) {
  const d = dashboardData;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = currentUser.name.split(' ')[0];

  container.innerHTML = `
    <div class="dashboard">
      <div class="dashboard__greeting">
        <h2>${greeting}, ${firstName}.</h2>
        <p>Here's what's happening today.</p>
      </div>

      <div class="dashboard__stats">
        ${d.stats
          .map(
            (s) => `
          <div class="stat-card">
            <span class="stat-card__value">${s.value}</span>
            <span class="stat-card__label">${s.label}</span>
          </div>`
          )
          .join('')}
      </div>

      <div class="dashboard__grid">
        <div>
          <div class="panel">
            <div class="panel__header"><h3>Today</h3><a href="#/projects">View all</a></div>
            <div class="panel__body">
              ${d.tasks
                .map(
                  (t) => `
                <div class="task-row${t.done ? ' is-done' : ''}" data-id="${t.id}" role="button" tabindex="0">
                  <span class="task-row__check">${icon('check', { size: 11 })}</span>
                  <span class="task-row__body">
                    <span class="task-row__title">${t.title}</span>
                    <span class="task-row__meta">${t.meta}</span>
                  </span>
                </div>`
                )
                .join('')}
            </div>
          </div>

          <div class="panel">
            <div class="panel__header"><h3>Recent notes</h3><a href="#/notes">View all</a></div>
            <div class="panel__body">
              ${d.notes
                .map(
                  (n) => `
                <div class="note-row">
                  ${icon('fileText', { size: 17 })}
                  <span class="note-row__body">
                    <span class="note-row__title">${n.title}</span>
                    <span class="note-row__meta">${n.meta}</span>
                  </span>
                </div>`
                )
                .join('')}
            </div>
          </div>
        </div>

        <div>
          <div class="panel">
            <div class="panel__header"><h3>Upcoming</h3><a href="#/calendar">View all</a></div>
            <div class="panel__body">
              ${d.events
                .map(
                  (e) => `
                <div class="event-row">
                  <span class="event-row__time">${e.time}</span>
                  <span class="event-row__title">${e.title}</span>
                </div>`
                )
                .join('')}
            </div>
          </div>

          <div class="panel">
            <div class="panel__header"><h3>Habits</h3><a href="#/habits">View all</a></div>
            <div class="panel__body">
              ${d.habits
                .map(
                  (h) => `
                <div class="habit-row">
                  <span class="habit-row__icon">${icon('flame', { size: 17 })}</span>
                  <span class="task-row__body">
                    <span class="task-row__title">${h.name}</span>
                    <span class="habit-row__meta">${h.streak}</span>
                  </span>
                </div>`
                )
                .join('')}
            </div>
          </div>

          <div class="panel">
            <div class="panel__header"><h3>Continue learning</h3><a href="#/learning">View all</a></div>
            <div class="learning-card">
              <span class="learning-card__title">${d.learning.title}</span>
              <div class="progress"><div class="progress__fill" style="width:${d.learning.progress}%"></div></div>
              <div class="learning-card__row"><span>${d.learning.meta}</span><span>${d.learning.progress}%</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('.task-row').forEach((row) => {
    const toggle = () => {
      row.classList.toggle('is-done');
      const task = d.tasks.find((t) => String(t.id) === row.dataset.id);
      if (task) task.done = row.classList.contains('is-done');
    };
    row.addEventListener('click', toggle);
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });
}

export function renderEmptyState(container, { label, icon: iconName, phase }) {
  container.innerHTML = `
    <div class="empty-state">
      <span class="empty-state__icon">${icon(iconName, { size: 26 })}</span>
      <h2>${label}</h2>
      <p>${
        phase
          ? `${label} is scoped for Phase ${phase} of the roadmap — the shell and navigation are ready, the feature itself isn't built yet.`
          : `${label} doesn't have a scheduled phase yet — it's on the list, just not built.`
      }</p>
      ${phase ? `<span class="badge badge--accent">Phase ${phase}</span>` : `<span class="badge">Coming soon</span>`}
    </div>
  `;
}

export function renderSettings(container) {
  const theme = getState().theme;
  const activeWorkspaceId = getState().workspaceId;

  container.innerHTML = `
    <div class="settings-page">
      <section class="card settings-section">
        <h3>Profile</h3>
        <div class="field"><label for="set-name">Name</label><input id="set-name" type="text" value="${currentUser.name}"></div>
        <div class="field"><label for="set-email">Email</label><input id="set-email" type="email" value="${currentUser.email}"></div>
      </section>

      <section class="card settings-section">
        <h3>Appearance</h3>
        <div class="switch-group" role="group" aria-label="Theme">
          ${['light', 'dark', 'system']
            .map(
              (t) => `
            <button type="button" class="switch-group__option" data-theme-option="${t}" aria-pressed="${t === theme}">
              ${icon(t === 'light' ? 'sun' : t === 'dark' ? 'moon' : 'monitor', { size: 16 })}
              <span>${t[0].toUpperCase() + t.slice(1)}</span>
            </button>`
            )
            .join('')}
        </div>
      </section>

      <section class="card settings-section">
        <h3>Workspaces</h3>
        ${workspaces
          .map(
            (w) => `
          <div class="settings-row">
            <span class="workspace-switcher__badge">${w.badge}</span>
            <span class="settings-row__body">${w.name}</span>
            ${w.id === activeWorkspaceId ? '<span class="badge badge--accent">Active</span>' : ''}
          </div>`
          )
          .join('')}
      </section>

      <section class="card">
        <h3>Keyboard shortcuts</h3>
        <div class="settings-row"><span class="settings-row__body">Open command palette</span><kbd>Ctrl / ⌘</kbd><kbd>K</kbd></div>
        <div class="settings-row"><span class="settings-row__body">Navigate results</span><kbd>↑</kbd><kbd>↓</kbd></div>
        <div class="settings-row"><span class="settings-row__body">Close any overlay</span><kbd>Esc</kbd></div>
      </section>
    </div>
  `;

  container.querySelectorAll('[data-theme-option]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setTheme(btn.dataset.themeOption);
      container
        .querySelectorAll('[data-theme-option]')
        .forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    });
  });
}
