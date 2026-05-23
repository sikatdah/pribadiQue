import { store } from '../store.js';

export function StokRumahModule(container, navigate) {
  // ─── State ───────────────────────────────────────────────────────────────
  let state = store.get('stok-rumah', { items: [] });

  // Migrate old items that lack id / logs
  state.items = state.items.map((item, i) => ({
    id: item.id || String(Date.now() + i),
    nama: item.nama || '',
    stok: item.stok ?? 0,
    dibuka: item.dibuka ?? 0,
    konsumsiLog: item.konsumsiLog || [],
    belanjaLog: item.belanjaLog || [],
  }));

  const saveState = () => store.set('stok-rumah', state);

  // ─── Helpers ─────────────────────────────────────────────────────────────

  /** Auto-calculate "per bulan" from konsumsiLog entries in last 30 days */
  const calcPerBulan = (item) => {
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    return item.konsumsiLog
      .filter(l => now - new Date(l.date).getTime() <= thirtyDaysMs)
      .reduce((sum, l) => sum + (l.qty || 0), 0);
  };

  const todayStr = () => new Date().toISOString().slice(0, 10);

  /** Find item by id */
  const findItem = (id) => state.items.find(it => it.id === id);

  // ─── SVG Icons ────────────────────────────────────────────────────────────
  const icons = {
    laporan: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
    search: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
    box: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
    plus: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
    close: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  };

  // ─── Render: Shell ────────────────────────────────────────────────────────
  const render = () => {
    container.innerHTML = `
      <div id="sr-shell" class="sr-shell">
        <!-- Top Header -->
        <header class="sr-header">
          <button id="btn-back" class="sr-back-btn" aria-label="Kembali">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div>
            <h2 class="sr-title">Stok Rumah</h2>
          </div>
          <div class="w-9"></div><!-- spacer -->
        </header>

        <!-- Tab Content -->
        <div id="sr-content" class="sr-content">
          ${renderLaporan()}
        </div>

        <!-- Modal overlay -->
        <div id="sr-modal-overlay" class="sr-modal-overlay" style="display:none;" aria-modal="true" role="dialog">
          <div class="sr-modal" id="sr-modal">
            <div class="sr-modal-header">
              <span class="sr-modal-title" id="sr-modal-item-name"></span>
              <button id="sr-modal-close" class="sr-modal-close-btn" aria-label="Tutup">${icons.close}</button>
            </div>

            <!-- Toggle: Belanja / Konsumsi -->
            <div class="sr-toggle-group">
              <button class="sr-toggle-btn active" id="toggle-belanja" data-mode="belanja">Belanja</button>
              <button class="sr-toggle-btn" id="toggle-konsumsi" data-mode="konsumsi">Konsumsi</button>
            </div>

            <!-- Mode hint -->
            <p class="sr-modal-hint" id="sr-modal-hint">Tambah stok berdasarkan jumlah yang dibeli.</p>

            <!-- Fields -->
            <div class="sr-form-row">
              <div class="sr-form-group flex-1">
                <label for="modal-stok">Stok</label>
                <input type="number" id="modal-stok" class="sr-input" min="0" placeholder="0">
              </div>
              <div class="sr-form-group flex-1">
                <label for="modal-dibuka">Dibuka</label>
                <input type="number" id="modal-dibuka" class="sr-input" min="0" placeholder="0">
              </div>
            </div>

            <button id="sr-modal-submit" class="sr-btn sr-btn-primary sr-btn-full">Submit</button>
          </div>
        </div>
      </div>
    `;
    attachEvents();
  };

  const refreshContent = () => {
    const contentEl = container.querySelector('#sr-content');
    if (contentEl) {
      contentEl.innerHTML = renderLaporan();
      contentEl.classList.remove('sr-fade-in');
      void contentEl.offsetWidth; // reflow
      contentEl.classList.add('sr-fade-in');
    }
    attachContentEvents();
  };

  // ─── Render: Laporan ──────────────────────────────────────────────────────
  const renderLaporan = () => {
    const listContent = state.items.length === 0
      ? `
        <div class="sr-empty">
          <div class="sr-empty-icon">${icons.box}</div>
          <h3>Belum ada barang</h3>
          <p>Ketuk tombol <strong>+</strong> untuk menambahkan barang baru.</p>
        </div>
      `
      : `<div class="sr-laporan-list">${
          state.items.map(item => {
            const perBulan = calcPerBulan(item);
            const isStok0 = parseInt(item.stok) === 0;
            const isKritis = isStok0 && parseInt(item.dibuka) < 2;

            let badge = '';
            if (isKritis) badge = `<span class="badge badge-kritis">Kritis</span>`;
            else if (isStok0) badge = `<span class="badge badge-habis">Habis</span>`;

            return `
              <div class="sr-laporan-card ${isStok0 ? 'is-kritis' : ''} sr-laporan-card-clickable" data-id="${item.id}" role="button" tabindex="0" aria-label="Edit ${item.nama}">
                <div class="sr-laporan-name">
                  <span class="sr-laporan-nama">${item.nama}</span>
                  ${badge}
                </div>
                <div class="sr-laporan-stats">
                  <div class="sr-stat">
                    <span class="sr-stat-val ${isStok0 ? 'text-red' : ''}">${item.stok}</span>
                    <span class="sr-stat-lbl">Stok</span>
                  </div>
                  <div class="sr-stat-divider"></div>
                  <div class="sr-stat">
                    <span class="sr-stat-val">${item.dibuka}</span>
                    <span class="sr-stat-lbl">Dibuka</span>
                  </div>
                  <div class="sr-stat-divider"></div>
                  <div class="sr-stat">
                    <span class="sr-stat-val">${perBulan}</span>
                    <span class="sr-stat-lbl">Per Bulan</span>
                  </div>
                  <button class="sr-delete-btn btn-delete-item" data-id="${item.id}" title="Hapus">${icons.trash}</button>
                </div>
              </div>
            `;
          }).join('')
        }</div>`;

    return `
      <div class="sr-laporan-header">
        <div class="sr-section-title">
          <span>Inventaris</span>
          <span class="sr-count">${state.items.length} barang</span>
        </div>
        <button id="btn-add-item" class="sr-fab-inline" title="Tambah barang">${icons.plus}</button>
      </div>
      
      ${listContent}

      <!-- Add New Item Form (hidden by default) -->
      <div id="add-item-form" class="sr-card" style="display:none; margin-top:12px;">
        <h3 class="sr-card-title">${icons.plus} Tambah Barang Baru</h3>
        <div class="sr-form-group">
          <label>Nama Barang <span class="required">*</span></label>
          <input type="text" id="new-nama" class="sr-input" placeholder="Contoh: Sabun Mandi">
        </div>
        <div class="sr-form-row">
          <div class="sr-form-group flex-1">
            <label>Stok (Segel)</label>
            <input type="number" id="new-stok" class="sr-input" value="0" min="0">
          </div>
          <div class="sr-form-group flex-1">
            <label>Dibuka</label>
            <input type="number" id="new-dibuka" class="sr-input" value="0" min="0">
          </div>
        </div>
        <button id="btn-save-new-item" class="sr-btn sr-btn-primary sr-btn-full">Simpan Barang</button>
      </div>
    `;
  };

  // ─── Attach Events ────────────────────────────────────────────────────────
  const attachEvents = () => {
    container.querySelector('#btn-back').addEventListener('click', () => navigate('dashboard'));
    attachContentEvents();
    attachModalEvents();
  };

  const attachContentEvents = () => {
    // Delete buttons
    container.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // don't open modal
        if (confirm('Yakin ingin menghapus barang ini?')) {
          state.items = state.items.filter(it => it.id !== btn.dataset.id);
          saveState();
          refreshContent();
        }
      });
    });

    // Click on card → open modal
    container.querySelectorAll('.sr-laporan-card-clickable').forEach(card => {
      card.addEventListener('click', () => openModal(card.dataset.id));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') openModal(card.dataset.id);
      });
    });

    // Add item toggle
    const btnAdd = container.querySelector('#btn-add-item');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        const form = container.querySelector('#add-item-form');
        form.style.display = form.style.display === 'none' ? 'flex' : 'none';
      });
    }

    // Save new item
    const btnSave = container.querySelector('#btn-save-new-item');
    if (btnSave) {
      btnSave.addEventListener('click', handleAddNewItem);
    }
  };

  const handleAddNewItem = () => {
    const nama = (container.querySelector('#new-nama')?.value || '').trim();
    const stok = parseInt(container.querySelector('#new-stok')?.value) || 0;
    const dibuka = parseInt(container.querySelector('#new-dibuka')?.value) || 0;

    if (!nama) {
      showToast('Nama barang wajib diisi!', 'error');
      return;
    }

    const newItem = {
      id: String(Date.now()),
      nama,
      stok,
      dibuka,
      konsumsiLog: [],
      belanjaLog: [{ date: todayStr(), qty: stok }],
    };
    state.items.push(newItem);
    saveState();

    showToast(`"${nama}" berhasil ditambahkan!`, 'success');
    refreshContent();
  };

  // ─── Modal ────────────────────────────────────────────────────────────────
  let modalMode = 'belanja'; // 'belanja' | 'konsumsi'
  let modalItemId = null;

  const hints = {
    belanja: 'Tambah stok berdasarkan jumlah yang dibeli.',
    konsumsi: 'Kurangi stok berdasarkan jumlah yang dikonsumsi.',
  };

  const openModal = (itemId) => {
    const item = findItem(itemId);
    if (!item) return;

    modalItemId = itemId;
    modalMode = 'belanja';

    const overlay = container.querySelector('#sr-modal-overlay');
    container.querySelector('#sr-modal-item-name').textContent = item.nama;
    container.querySelector('#modal-stok').value = '';
    container.querySelector('#modal-dibuka').value = '';
    container.querySelector('#sr-modal-hint').textContent = hints.belanja;

    // Reset toggle
    container.querySelector('#toggle-belanja').classList.add('active');
    container.querySelector('#toggle-konsumsi').classList.remove('active');

    // Update submit button colour
    updateSubmitBtn();

    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('sr-modal-visible'));
    container.querySelector('#modal-stok').focus();
  };

  const closeModal = () => {
    const overlay = container.querySelector('#sr-modal-overlay');
    overlay.classList.remove('sr-modal-visible');
    setTimeout(() => { overlay.style.display = 'none'; }, 250);
    modalItemId = null;
  };

  const updateSubmitBtn = () => {
    const btn = container.querySelector('#sr-modal-submit');
    if (!btn) return;
    if (modalMode === 'belanja') {
      btn.className = 'sr-btn sr-btn-primary sr-btn-full';
      btn.textContent = 'Tambah Stok';
    } else {
      btn.className = 'sr-btn sr-btn-emerald sr-btn-full';
      btn.textContent = 'Catat Konsumsi';
    }
  };

  const attachModalEvents = () => {
    // Close button
    container.querySelector('#sr-modal-close').addEventListener('click', closeModal);

    // Overlay backdrop click
    container.querySelector('#sr-modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal();
    });

    // Toggle buttons
    container.querySelectorAll('.sr-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modalMode = btn.dataset.mode;
        container.querySelectorAll('.sr-toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        container.querySelector('#sr-modal-hint').textContent = hints[modalMode];
        updateSubmitBtn();
      });
    });

    // Submit
    container.querySelector('#sr-modal-submit').addEventListener('click', handleModalSubmit);

    // ESC key
    document.addEventListener('keydown', handleEscKey);
  };

  const handleEscKey = (e) => {
    if (e.key === 'Escape') closeModal();
  };

  const handleModalSubmit = () => {
    const item = findItem(modalItemId);
    if (!item) return;

    const stokVal = parseInt(container.querySelector('#modal-stok').value) || 0;
    const dibukaVal = parseInt(container.querySelector('#modal-dibuka').value) || 0;

    if (stokVal === 0 && dibukaVal === 0) {
      showToast('Masukkan jumlah Stok atau Dibuka!', 'error');
      return;
    }

    if (modalMode === 'belanja') {
      // Add to stok & dibuka
      item.stok += stokVal;
      item.dibuka += dibukaVal;
      if (stokVal > 0 || dibukaVal > 0) {
        item.belanjaLog.push({ date: todayStr(), qty: stokVal + dibukaVal });
      }
      showToast(`Stok "${item.nama}" ditambahkan!`, 'success');
    } else {
      // Deduct from stok & dibuka (don't go below 0)
      item.stok = Math.max(0, item.stok - stokVal);
      item.dibuka = Math.max(0, item.dibuka - dibukaVal);
      if (stokVal > 0 || dibukaVal > 0) {
        item.konsumsiLog.push({ date: todayStr(), qty: stokVal + dibukaVal });
      }
      showToast(`Konsumsi "${item.nama}" dicatat!`, 'success');
    }

    saveState();
    closeModal();
    refreshContent();
  };

  // ─── Utilities ────────────────────────────────────────────────────────────
  const escHtml = (str) => str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  let toastTimer = null;
  const showToast = (msg, type = 'success') => {
    let toast = document.getElementById('sr-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'sr-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = `sr-toast sr-toast-${type} sr-toast-show`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('sr-toast-show'), 2500);
  };

  // ─── Lifecycle ────────────────────────────────────────────────────────────
  const mount = () => render();
  const unmount = () => {
    container.innerHTML = '';
    document.removeEventListener('keydown', handleEscKey);
    const toast = document.getElementById('sr-toast');
    if (toast) toast.remove();
  };

  return { mount, unmount };
}
