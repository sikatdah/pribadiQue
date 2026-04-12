export function DashboardModule(container, navigate) {
  const mount = () => {
    container.innerHTML = `
      <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          <!-- Split Bill Card -->
          <button data-route="split-bill" class="group relative flex flex-col items-center justify-center p-8 bg-white/70 backdrop-blur-lg border border-slate-200/60 shadow-sm rounded-3xl hover:shadow-xl hover:bg-white hover:-translate-y-1 transition-all duration-300 text-left w-full h-full text-slate-800 ring-1 ring-slate-900/5 cursor-pointer">
            <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-receipt"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></svg>
            </div>
            <h3 class="text-xl font-bold mb-2">Split Bill</h3>
          </button>

          <!-- Stok Rumah Card -->
          <button data-route="stok-rumah" class="group relative flex flex-col items-center justify-center p-8 bg-white/70 backdrop-blur-lg border border-slate-200/60 shadow-sm rounded-3xl hover:shadow-xl hover:bg-white hover:-translate-y-1 transition-all duration-300 text-left w-full h-full text-slate-800 ring-1 ring-slate-900/5 cursor-pointer">
            <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package-open"><path d="M12 22v-9"/><path d="M15.17 2.38a2.25 2.25 0 0 0-2.92-.01L2.2 9.08a2.5 2.5 0 0 0-.96 2.33V20a2 2 0 0 0 2 2h17.5a2 2 0 0 0 2-2v-8.4a2.5 2.5 0 0 0-.92-2.11z"/><path d="M14 8V4.5a1.5 1.5 0 0 0-3 0V8"/><path d="M21.2 9.2 12 14.5l-9.2-5.3"/></svg>
            </div>
            <h3 class="text-xl font-bold mb-2">Stok Rumah</h3>
          </button>
        </div>
      </div>
    `;

    // Attach event listeners for routing
    const buttons = container.querySelectorAll('[data-route]');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const route = e.currentTarget.getAttribute('data-route');
        navigate(route);
      });
    });
  };

  const unmount = () => {
    container.innerHTML = '';
  };

  return { mount, unmount };
}
