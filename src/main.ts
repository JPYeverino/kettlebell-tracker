import './index.css';
import { supabase } from './lib/supabase';
import { renderAuth } from './pages/auth';
import { renderPrograms } from './pages/programs';
import { renderPlanner } from './pages/planner';
import { renderProgress } from './pages/progress';
import { renderDisplay } from './pages/display';
import type { User } from '@supabase/supabase-js';

type Page = 'programs' | 'planner' | 'progress';

let currentUser: User | null = null;
let currentPage: Page = 'programs';

const app = document.getElementById('app')!;

// Check if we're on the public display route
const isDisplayRoute = window.location.pathname.endsWith('/display');

if (isDisplayRoute) {
  // Render public display view (no auth required)
  renderDisplay(app);
} else {
  // Normal app with auth
  // Auth state management
  supabase.auth.getSession().then(({ data: { session } }) => {
    currentUser = session?.user ?? null;
    render();
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user ?? null;
    render();
  });
}

// Navigation
export function navigateTo(page: Page) {
  currentPage = page;
  renderApp();
}

export async function signOut() {
  await supabase.auth.signOut();
}

// Main render function
function render() {
  if (!currentUser) {
    renderAuth(app);
  } else {
    renderApp();
  }
}

function renderApp() {
  // Create layout
  app.innerHTML = `
    <div class="layout">
      <header class="header">
        <h1>KB Tracker</h1>
        <button id="signout-btn" class="btn-signout">Sign Out</button>
      </header>
      <nav class="nav">
        <button id="nav-programs" class="nav-btn ${currentPage === 'programs' ? 'active' : ''}">Programs</button>
        <button id="nav-planner" class="nav-btn ${currentPage === 'planner' ? 'active' : ''}">Planner</button>
        <button id="nav-progress" class="nav-btn ${currentPage === 'progress' ? 'active' : ''}">Progress</button>
      </nav>
      <main class="main" id="page-content"></main>
    </div>
  `;

  // Attach nav listeners
  document.getElementById('signout-btn')!.addEventListener('click', signOut);
  document.getElementById('nav-programs')!.addEventListener('click', () => navigateTo('programs'));
  document.getElementById('nav-planner')!.addEventListener('click', () => navigateTo('planner'));
  document.getElementById('nav-progress')!.addEventListener('click', () => navigateTo('progress'));

  // Render current page
  const content = document.getElementById('page-content')!;
  switch (currentPage) {
    case 'programs':
      renderPrograms(content);
      break;
    case 'planner':
      renderPlanner(content);
      break;
    case 'progress':
      renderProgress(content);
      break;
  }
}
