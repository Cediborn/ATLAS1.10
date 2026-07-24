// Atlas — Hash router. Hash-based on purpose: a path-based router would 404
// on hard refresh under GitHub Pages' static hosting without extra server
// config; `#/route` resolves entirely client-side, so it just works.

import { navItems } from './mock-data.js';
import { renderDashboard, renderEmptyState, renderSettings } from './views.js';
import { setActiveRoute } from './sidebar.js';
import { setPageTitle } from './topbar.js';

const DEFAULT_ROUTE = 'dashboard';

function currentRouteId() {
  return window.location.hash.replace(/^#\/?/, '') || DEFAULT_ROUTE;
}

function render(routeId) {
  const item = navItems.find((n) => n.id === routeId) || navItems.find((n) => n.id === DEFAULT_ROUTE);
  const root = document.getElementById('view-root');

  if (item.id === 'dashboard') renderDashboard(root);
  else if (item.id === 'settings') renderSettings(root);
  else renderEmptyState(root, item);

  setActiveRoute(item.id);
  setPageTitle(item.label);
  root.focus();
}

export function navigate(routeId) {
  if (currentRouteId() === routeId) {
    render(routeId); // clicking the already-active nav item still re-renders
    return;
  }
  window.location.hash = `/${routeId}`;
}

export function initRouter() {
  window.addEventListener('hashchange', () => render(currentRouteId()));
  render(currentRouteId());
}
