import './style.css';
import { DashboardModule } from './modules/dashboard.js';
import { SplitBillModule } from './modules/split-bill.js';
import { StokRumahModule } from './modules/stok-rumah.js';

const appContainer = document.getElementById('app');

// Simple Router implementation
let currentModule = null;

const routes = {
  'dashboard': DashboardModule,
  'split-bill': SplitBillModule,
  'stok-rumah': StokRumahModule,
};

function navigate(route) {
  if (!routes[route]) return;

  // Unmount current module if exists
  if (currentModule && currentModule.unmount) {
    currentModule.unmount();
  }

  // Clear container just in case
  appContainer.innerHTML = '';

  // Instantiate new module
  currentModule = routes[route](appContainer, navigate);
  
  // Mount new module
  if (currentModule.mount) {
    currentModule.mount();
  }

  // Update URL hash for simple history (optional but good practice)
  window.history.pushState({}, '', `#${route}`);
}

// Handle browser back button
window.addEventListener('popstate', () => {
  const hash = window.location.hash.substring(1);
  if (routes[hash]) {
    navigate(hash);
  } else {
    navigate('dashboard');
  }
});

// Setup global navigation links (if any outside the primary app container)
document.addEventListener('click', (e) => {
  if (e.target.matches('[data-route]')) {
    e.preventDefault(); // In case it's an <a> tag
    const route = e.target.getAttribute('data-route');
    navigate(route);
  }
});
document.getElementById('nav-brand').addEventListener('click', () => navigate('dashboard'));

// Initial Load
const initialRoute = window.location.hash.substring(1);
if (routes[initialRoute]) {
  navigate(initialRoute);
} else {
  navigate('dashboard');
}
