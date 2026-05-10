import { store } from '../store.js';

export function StokRumahModule(container, navigate) {
  // ─── State ───────────────────────────────────────────────────────────────
  let state = store.get('stok-rumah', { items: [] });
  let activeTab = 'laporan'; // 'laporan' | 'belanja' | 'konsumsi'

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
    belanja: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
    konsumsi: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>`,
    search: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
    box: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
    plus: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
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
          ${renderActiveTab()}
        </div>

        <!-- Bottom Tab Bar -->
        <nav class="sr-bottom-nav" id="sr-bottom-nav">
          <button class="sr-tab-btn ${activeTab === 'laporan' ? 'active' : ''}" data-tab="laporan">
            <span class="sr-tab-icon">${icons.laporan}</span>
            <span class="sr-tab-label">Laporan</span>
          </button>
          <button class="sr-tab-btn ${activeTab === 'belanja' ? 'active' : ''}" data-tab="belanja">
            <span class="sr-tab-icon">${icons.belanja}</span>
            <span class="sr-tab-label">Belanja</span>
          </button>
          <button class="sr-tab-btn ${activeTab === 'konsumsi' ? 'active' : ''}" data-tab="konsumsi">
            <span class="sr-tab-icon">${icons.konsumsi}</span>
            <span class="sr-tab-label">Konsumsi</span>
          </button>
        </nav>
      </div>
    `;
    attachEvents();
  };

  const renderActiveTab = () => {
    if (activeTab === 'laporan') return renderLaporan();
    if (activeTab === 'belanja') return renderBelanja();
    if (activeTab === 'konsumsi') return renderKonsumsi();
    return '';
  };

  const refreshContent = () => {
    const contentEl = container.querySelector('#sr-content');
    if (contentEl) {
      contentEl.innerHTML = renderActiveTab();
      contentEl.classList.remove('sr-fade-in');
      void contentEl.offsetWidth; // reflow
      contentEl.classList.add('sr-fade-in');
    }
    // Update tab active states
    container.querySelectorAll('.sr-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === activeTab);
    });
    attachContentEvents();
  };

  // ─── Render: Laporan ──────────────────────────────────────────────────────
  const renderLaporan = () => {
    if (state.items.length === 0) {
      return `
        <div class="sr-empty">
          <div class="sr-empty-icon">${icons.box}</div>
          <h3>Belum ada barang</h3>
          <p>Tambahkan barang via tab <strong>Belanja</strong>.</p>
        </div>
      `;
    }

    const rows = state.items.map(item => {
      const perBulan = calcPerBulan(item);
      const isStok0 = parseInt(item.stok) === 0;
      const isKritis = isStok0 && parseInt(item.dibuka) < 2;

      let badge = '';
      if (isKritis) badge = `<span class="badge badge-kritis">Kritis</span>`;
      else if (isStok0) badge = `<span class="badge badge-habis">Habis</span>`;

      return `
        <div class="sr-laporan-card ${isStok0 ? 'is-kritis' : ''}">
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
    }).join('');

    return `
      <div class="sr-section-title">
        <span>Inventaris</span>
        <span class="sr-count">${state.items.length} barang</span>
      </div>
      <div class="sr-laporan-list">${rows}</div>
    `;
  };

  // ─── Render: Belanja ──────────────────────────────────────────────────────
  const renderBelanja = () => {
    return `
      <div class="sr-section-title">
        <span>Belanja</span>
      </div>

      <!-- Search -->
      <div class="sr-search-wrap">
        <span class="sr-search-icon">${icons.search}</span>
        <input type="text" id="belanja-search" class="sr-search-input" placeholder="Cari nama barang..." autocomplete="off">
      </div>

      <!-- Search Results / Register -->
      <div id="belanja-result" class="sr-result-area"></div>

      <!-- Register New Form (hidden by default) -->
      <div id="belanja-register" class="sr-card" style="display:none;">
        <h3 class="sr-card-title">${icons.plus} Daftarkan Barang Baru</h3>
        <div class="sr-form-group">
          <label>Nama Barang <span class="required">*</span></label>
          <input type="text" id="reg-nama" class="sr-input" placeholder="Contoh: Sabun Mandi">
        </div>
        <div class="sr-form-row">
          <div class="sr-form-group">
            <label>Stok (Segel)</label>
            <input type="number" id="reg-stok" class="sr-input" value="0" min="0">
          </div>
          <div class="sr-form-group">
            <label>Dibuka</label>
            <input type="number" id="reg-dibuka" class="sr-input" value="0" min="0">
          </div>
        </div>
        <button id="btn-register" class="sr-btn sr-btn-primary">Daftarkan Barang</button>
      </div>
    `;
  };

  // ─── Render: Konsumsi ─────────────────────────────────────────────────────
  const renderKonsumsi = () => {
    return `
      <div class="sr-section-title">
        <span>Konsumsi Hari Ini</span>
        <span class="sr-count">${todayStr()}</span>
      </div>

      <!-- Search -->
      <div class="sr-search-wrap">
        <span class="sr-search-icon">${icons.search}</span>
        <input type="text" id="konsumsi-search" class="sr-search-input" placeholder="Cari nama barang..." autocomplete="off">
      </div>

      <!-- Result -->
      <div id="konsumsi-result" class="sr-result-area"></div>
    `;
  };

  // ─── Attach Events ────────────────────────────────────────────────────────
  const attachEvents = () => {
    container.querySelector('#btn-back').addEventListener('click', () => navigate('dashboard'));

    container.querySelectorAll('.sr-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        refreshContent();
      });
    });

    attachContentEvents();
  };

  const attachContentEvents = () => {
    // ── Laporan events ──
    container.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Yakin ingin menghapus barang ini?')) {
          state.items = state.items.filter(it => it.id !== btn.dataset.id);
          saveState();
          refreshContent();
        }
      });
    });

    // ── Belanja events ──
    const belanjaSearch = container.querySelector('#belanja-search');
    if (belanjaSearch) {
      belanjaSearch.addEventListener('input', handleBelanjaSearch);
    }
    const btnRegister = container.querySelector('#btn-register');
    if (btnRegister) {
      btnRegister.addEventListener('click', handleRegisterItem);
    }

    // ── Konsumsi events ──
    const konsumsiSearch = container.querySelector('#konsumsi-search');
    if (konsumsiSearch) {
      konsumsiSearch.addEventListener('input', handleKonsumsiSearch);
    }
  };

  // ─── Belanja Logic ────────────────────────────────────────────────────────
  const handleBelanjaSearch = (e) => {
    const query = e.target.value.trim().toLowerCase();
    const resultEl = container.querySelector('#belanja-result');
    const registerEl = container.querySelector('#belanja-register');

    if (!query) {
      resultEl.innerHTML = '';
      registerEl.style.display = 'none';
      return;
    }

    const matches = state.items.filter(it => it.nama.toLowerCase().includes(query));

    if (matches.length > 0) {
      registerEl.style.display = 'none';
      resultEl.innerHTML = matches.map(item => `
        <div class="sr-card sr-product-card" id="belanja-card-${item.id}">
          <div class="sr-product-header">
            <span class="sr-product-name">${item.nama}</span>
            <span class="sr-product-stok">Stok: <strong>${item.stok}</strong></span>
          </div>
          <div class="sr-form-row">
            <div class="sr-form-group flex-1">
              <label>Jumlah Dibeli</label>
              <input type="number" class="sr-input belanja-qty" data-id="${item.id}" value="1" min="1">
            </div>
            <div class="sr-form-group" style="align-self:flex-end;">
              <button class="sr-btn sr-btn-primary btn-tambah-stok" data-id="${item.id}">+ Tambah Stok</button>
            </div>
          </div>
        </div>
      `).join('');

      // Attach buy buttons
      resultEl.querySelectorAll('.btn-tambah-stok').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const qtyInput = resultEl.querySelector(`.belanja-qty[data-id="${id}"]`);
          const qty = parseInt(qtyInput?.value) || 1;
          const item = findItem(id);
          if (!item) return;

          item.stok += qty;
          item.belanjaLog.push({ date: todayStr(), qty });
          saveState();

          // Flash feedback
          const card = resultEl.querySelector(`#belanja-card-${id}`);
          if (card) {
            card.classList.add('sr-flash-success');
            setTimeout(() => card.classList.remove('sr-flash-success'), 800);
          }
          // Update stok display
          const stokSpan = card?.querySelector('.sr-product-stok strong');
          if (stokSpan) stokSpan.textContent = item.stok;
        });
      });

    } else {
      // No match: offer to register
      resultEl.innerHTML = `
        <div class="sr-no-result">
          <span>Barang "<strong>${escHtml(e.target.value.trim())}</strong>" belum terdaftar.</span>
        </div>
      `;
      registerEl.style.display = 'flex';
      // Pre-fill name
      const regNama = container.querySelector('#reg-nama');
      if (regNama) regNama.value = e.target.value.trim();
    }
  };

  const handleRegisterItem = () => {
    const nama = (container.querySelector('#reg-nama')?.value || '').trim();
    const stok = parseInt(container.querySelector('#reg-stok')?.value) || 0;
    const dibuka = parseInt(container.querySelector('#reg-dibuka')?.value) || 0;

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

    showToast(`"${nama}" berhasil didaftarkan!`, 'success');
    container.querySelector('#belanja-search').value = '';
    container.querySelector('#belanja-result').innerHTML = '';
    container.querySelector('#belanja-register').style.display = 'none';
    container.querySelector('#reg-stok').value = '0';
    container.querySelector('#reg-dibuka').value = '0';
  };

  // ─── Konsumsi Logic ───────────────────────────────────────────────────────
  const handleKonsumsiSearch = (e) => {
    const query = e.target.value.trim().toLowerCase();
    const resultEl = container.querySelector('#konsumsi-result');

    if (!query) {
      resultEl.innerHTML = '';
      return;
    }

    const matches = state.items.filter(it => it.nama.toLowerCase().includes(query));

    if (matches.length > 0) {
      resultEl.innerHTML = matches.map(item => {
        const perBulan = calcPerBulan(item);
        return `
          <div class="sr-card sr-product-card" id="konsumsi-card-${item.id}">
            <div class="sr-product-header">
              <span class="sr-product-name">${item.nama}</span>
              <span class="sr-product-stok">Dibuka: <strong>${item.dibuka}</strong></span>
            </div>
            <div class="sr-stat-row">
              <div class="sr-mini-stat">
                <span>${item.stok}</span>
                <label>Stok Segel</label>
              </div>
              <div class="sr-mini-stat">
                <span>${perBulan}</span>
                <label>Per Bulan</label>
              </div>
            </div>
            <div class="sr-form-row">
              <div class="sr-form-group flex-1">
                <label>Jumlah Dikonsumsi</label>
                <input type="number" class="sr-input konsumsi-qty" data-id="${item.id}" value="1" min="1">
              </div>
              <div class="sr-form-group" style="align-self:flex-end;">
                <button class="sr-btn sr-btn-emerald btn-catat-konsumsi" data-id="${item.id}">Catat</button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      resultEl.querySelectorAll('.btn-catat-konsumsi').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const qtyInput = resultEl.querySelector(`.konsumsi-qty[data-id="${id}"]`);
          const qty = parseInt(qtyInput?.value) || 1;
          const item = findItem(id);
          if (!item) return;

          // Update dibuka; ensure doesn't go negative
          item.dibuka = Math.max(0, (item.dibuka || 0) - qty);
          // If dibuka ran to 0 and we have sealed stock, open one
          if (item.dibuka === 0 && item.stok > 0) {
            item.stok -= 1;
            item.dibuka = 1;
          }

          item.konsumsiLog.push({ date: todayStr(), qty });
          saveState();

          // Refresh card stats inline
          const card = resultEl.querySelector(`#konsumsi-card-${id}`);
          if (card) {
            const newPerBulan = calcPerBulan(item);
            card.querySelector('.sr-product-stok strong').textContent = item.dibuka;
            const miniStats = card.querySelectorAll('.sr-mini-stat span');
            if (miniStats[0]) miniStats[0].textContent = item.stok;
            if (miniStats[1]) miniStats[1].textContent = newPerBulan;
            card.classList.add('sr-flash-success');
            setTimeout(() => card.classList.remove('sr-flash-success'), 800);
          }

          showToast('Konsumsi dicatat!', 'success');
        });
      });

    } else {
      resultEl.innerHTML = `
        <div class="sr-no-result">
          <span>Barang "<strong>${escHtml(e.target.value.trim())}</strong>" tidak ditemukan. Daftarkan dulu via <strong>Belanja</strong>.</span>
        </div>
      `;
    }
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
    const toast = document.getElementById('sr-toast');
    if (toast) toast.remove();
  };

  return { mount, unmount };
}
