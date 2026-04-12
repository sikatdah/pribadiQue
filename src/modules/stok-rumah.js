import { store } from '../store.js';

export function StokRumahModule(container, navigate) {
  let state = store.get('stok-rumah', {
    items: []
  });

  const saveState = () => {
    store.set('stok-rumah', state);
  };

  const render = () => {
    container.innerHTML = `
      <div class="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white shadow-xl ring-1 ring-slate-900/5 sm:rounded-3xl p-6 sm:p-10 mb-8 max-w-4xl mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 class="text-2xl font-bold text-slate-900">Stok Rumah</h2>
            <p class="text-sm text-slate-500">Pantau dan kelola inventaris rumah tangga.</p>
          </div>
          <button id="btn-back" class="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-full transition-colors self-start sm:self-auto">
            &larr; Kembali
          </button>
        </div>

        <!-- Add Item Form -->
        <div class="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100 mb-8 flex flex-col md:flex-row gap-4 items-end">
          <div class="flex-1 w-full space-y-2">
            <label class="block text-sm font-medium text-slate-700">Nama Barang</label>
            <input type="text" id="input-name" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm" placeholder="Contoh: Sabun Mandi, Beras">
          </div>
          <div class="w-full md:w-32 space-y-2">
            <label class="block text-sm font-medium text-slate-700">Stok (Segel)</label>
            <input type="number" id="input-stock" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm" placeholder="0" min="0">
          </div>
          <div class="w-full md:w-32 space-y-2">
            <label class="block text-sm font-medium text-slate-700">Dibuka</label>
            <input type="number" id="input-open" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm" placeholder="0" min="0">
          </div>
          <button id="btn-add-item" class="w-full md:w-auto bg-emerald-600 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
            Tambah Barang
          </button>
        </div>

        <!-- List/Grid of Items -->
        <div class="space-y-4" id="items-list">
          ${renderItems()}
        </div>
      </div>
    `;

    attachEvents();
  };

  const renderItems = () => {
    if (state.items.length === 0) {
      return `
        <div class="text-center py-12 px-4 rounded-2xl border-2 border-slate-100 border-dashed bg-slate-50">
          <div class="w-16 h-16 mx-auto bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
          </div>
          <h3 class="text-slate-700 font-medium text-lg">Belum ada barang</h3>
          <p class="text-slate-500 text-sm mt-1">Tambahkan barang ke inventaris Anda di atas.</p>
        </div>
      `;
    }

    return state.items.map((item, index) => {
      // Visual Logic: "KRITIS" if stok == 0 AND dibuka < 2
      // WAJIB memberikan Highlight Background Merah pada baris/kartu barang jika jumlah_stok == 0.
      const isStok0 = parseInt(item.stok) === 0;
      const isDibukaKurangDari2 = parseInt(item.dibuka) < 2;
      const isKritis = isStok0 && isDibukaKurangDari2;

      const bgClass = isStok0 
        ? 'bg-red-50 border-red-200 ring-1 ring-red-500/10' 
        : 'bg-white border-slate-200 focus-within:ring-1 focus-within:ring-slate-300';
      
      const titleClass = isStok0 ? 'text-red-900' : 'text-slate-900';

      return `
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all ${bgClass}">
          <div class="flex-1 mb-4 sm:mb-0">
            <div class="flex items-center gap-3">
              <h3 class="font-bold text-lg ${titleClass}">${item.nama}</h3>
              ${isKritis ? `<span class="bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm animate-pulse">Kritis</span>` : ''}
              ${isStok0 && !isKritis ? `<span class="bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold uppercase py-1 px-2 rounded-md">Habis</span>` : ''}
            </div>
            <p class="text-xs text-slate-500 mt-1">Lacak pembaruan via tombol cepat</p>
          </div>
          
          <div class="flex flex-wrap sm:flex-nowrap items-center gap-6 w-full sm:w-auto">
            <!-- Stok (Segel) Controls -->
            <div class="flex flex-col items-center">
              <span class="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wide">Segel</span>
              <div class="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                <button class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white text-slate-600 hover:text-slate-900 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 btn-update" data-index="${index}" data-field="stok" data-val="-1">
                  &minus;
                </button>
                <span class="w-10 text-center font-bold text-slate-700">${item.stok}</span>
                <button class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white text-slate-600 hover:text-slate-900 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 btn-update" data-index="${index}" data-field="stok" data-val="1">
                  &plus;
                </button>
              </div>
            </div>

            <!-- Dibuka Controls -->
            <div class="flex flex-col items-center">
              <span class="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wide">Dibuka</span>
              <div class="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                <button class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white text-slate-600 hover:text-slate-900 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 btn-update" data-index="${index}" data-field="dibuka" data-val="-1">
                  &minus;
                </button>
                <span class="w-10 text-center font-bold text-slate-700">${item.dibuka}</span>
                <button class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white text-slate-600 hover:text-slate-900 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 btn-update" data-index="${index}" data-field="dibuka" data-val="1">
                  &plus;
                </button>
              </div>
            </div>

            <button class="btn-delete p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto sm:ml-2" data-index="${index}" title="Hapus Barang">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
  };

  const attachEvents = () => {
    const elId = (id) => container.querySelector(`#${id}`);

    elId('btn-back').addEventListener('click', () => navigate('dashboard'));

    elId('btn-add-item').addEventListener('click', () => {
      const name = elId('input-name').value.trim();
      const stok = parseInt(elId('input-stock').value) || 0;
      const dibuka = parseInt(elId('input-open').value) || 0;

      if (!name) {
        alert('Nama barang wajib diisi!');
        return;
      }

      state.items.push({ nama: name, stok, dibuka });
      saveState();
      render(); // re-render entirely to reflect new state
    });

    // Delegate events for dynamically rendered items
    const listEl = elId('items-list');

    listEl.addEventListener('click', (e) => {
      // Update Button
      const updateBtn = e.target.closest('.btn-update');
      if (updateBtn) {
        const index = parseInt(updateBtn.getAttribute('data-index'));
        const field = updateBtn.getAttribute('data-field');
        const val = parseInt(updateBtn.getAttribute('data-val'));

        let newVal = parseInt(state.items[index][field]) + val;
        if (newVal < 0) newVal = 0; // Prevent negative stock

        state.items[index][field] = newVal;
        saveState();
        
        // Optimize: we can just replace innerHTML of items-list avoiding removing listeners if we delegate
        elId('items-list').innerHTML = renderItems();
      }

      // Delete Button
      const deleteBtn = e.target.closest('.btn-delete');
      if (deleteBtn) {
        if(confirm('Yakin ingin menghapus barang ini?')) {
          const index = parseInt(deleteBtn.getAttribute('data-index'));
          state.items.splice(index, 1);
          saveState();
          elId('items-list').innerHTML = renderItems();
        }
      }
    });
  };

  const mount = () => {
    render();
  };

  const unmount = () => {
    container.innerHTML = '';
  };

  return { mount, unmount };
}
