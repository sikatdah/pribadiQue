import { store } from '../store.js';
import html2canvas from 'html2canvas';

export function SplitBillModule(container, navigate) {
  let state = store.get('split-bill', {
    total: 0,
    taxPercent: 0,
    servicePercent: 0,
    friends: []
  });

  const saveState = () => {
    store.set('split-bill', state);
  };

  const calculate = () => {
    const total = parseFloat(state.total) || 0;
    const tax = parseFloat(state.taxPercent) || 0;
    const service = parseFloat(state.servicePercent) || 0;
    
    // Tax and service apply to base total. Alternatively compound. Usually compound or sum of percentages. Let's do simple sum of percentages onto total
    const totalWithModifiers = total + (total * (tax / 100)) + (total * (service / 100));
    
    const friendCount = state.friends.length;
    if (friendCount === 0) return { totalWithModifiers, perPerson: 0 };
    
    return { totalWithModifiers, perPerson: totalWithModifiers / friendCount };
  };

  const render = () => {
    const { totalWithModifiers, perPerson } = calculate();

    container.innerHTML = `
      <div class="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white shadow-xl ring-1 ring-slate-900/5 sm:rounded-3xl p-6 sm:p-10 mb-8 max-w-2xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl font-bold text-slate-900">Split Bill</h2>
            <p class="text-sm text-slate-500">Kalkulasi patungan adil dengan teman.</p>
          </div>
          <button id="btn-back" class="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-full transition-colors">
            &larr; Kembali
          </button>
        </div>

        <div class="space-y-8">
          <!-- Inputs -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-slate-700">Total Tagihan (Rp)</label>
              <input type="number" id="input-total" value="${state.total || ''}" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" placeholder="0">
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-slate-700">PPN (%)</label>
              <input type="number" id="input-tax" value="${state.taxPercent || ''}" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" placeholder="0">
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-slate-700">Service Charge (%)</label>
              <input type="number" id="input-service" value="${state.servicePercent || ''}" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" placeholder="0">
            </div>
          </div>

          <div class="h-px bg-slate-100"></div>

          <!-- Friends List -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-slate-900">Daftar Teman</h3>
              <div class="flex gap-2">
                <input type="text" id="input-friend" class="px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="Nama teman">
                <button id="btn-add-friend" class="bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors text-sm font-medium">Tambah</button>
              </div>
            </div>
            
            <ul class="space-y-2" id="friends-list">
              ${state.friends.map((friend, index) => `
                <li class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span class="font-medium text-slate-700">${friend}</span>
                  <button class="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors btn-remove-friend" data-index="${index}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </li>
              `).join('')}
              ${state.friends.length === 0 ? '<li class="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-xl border border-slate-100 border-dashed">Belum ada teman yang ditambahkan.</li>' : ''}
            </ul>
          </div>
        </div>
      </div>

      <!-- Result Card for html2canvas -->
      <div id="receipt-capture" class="bg-white p-6 sm:p-10 rounded-3xl shadow-lg ring-1 ring-slate-900/5 max-w-2xl mx-auto mb-8 bg-gradient-to-br from-white to-blue-50/50">
        <div class="text-center mb-6">
          <h3 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Rincian Tagihan</h3>
          <p class="text-xs text-slate-500 mt-1">Digenerate oleh pribadiQue</p>
        </div>
        
        <div class="space-y-4 text-sm text-slate-600">
          <div class="flex justify-between">
            <span>Base Tagihan</span>
            <span class="font-medium">Rp ${parseFloat(state.total || 0).toLocaleString('id-ID')}</span>
          </div>
          <div class="flex justify-between">
            <span>PPN (${state.taxPercent || 0}%)</span>
            <span class="font-medium">Rp ${((parseFloat(state.total || 0) * (parseFloat(state.taxPercent || 0) / 100))).toLocaleString('id-ID')}</span>
          </div>
          <div class="flex justify-between">
            <span>Service Charge (${state.servicePercent || 0}%)</span>
            <span class="font-medium">Rp ${((parseFloat(state.total || 0) * (parseFloat(state.servicePercent || 0) / 100))).toLocaleString('id-ID')}</span>
          </div>
          <div class="h-px bg-slate-200 my-2"></div>
          <div class="flex justify-between text-base">
            <span class="font-semibold text-slate-900">Grand Total</span>
            <span class="font-bold text-blue-600">Rp ${totalWithModifiers.toLocaleString('id-ID')}</span>
          </div>
          
          <div class="mt-6 pt-6 border-t border-slate-200 border-dashed">
            <h4 class="font-semibold text-slate-900 mb-3 text-center">Pembagian (${state.friends.length} orang)</h4>
            <div class="space-y-2">
              ${state.friends.map(friend => `
                <div class="flex justify-between p-2 rounded-lg bg-white/50 backdrop-blur-sm border border-white">
                  <span class="text-slate-800 font-medium">${friend}</span>
                  <span class="font-semibold text-slate-900">Rp ${Math.ceil(perPerson).toLocaleString('id-ID')}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
      
      <div class="max-w-2xl mx-auto flex justify-center pb-12">
        <button id="btn-download" class="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:opacity-90 transition-opacity font-semibold shadow-lg shadow-blue-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          Download Gambar Struk
        </button>
      </div>
    `;

    attachEvents();
  };

  const attachEvents = () => {
    const elId = (id) => container.querySelector(`#${id}`);

    elId('btn-back').addEventListener('click', () => navigate('dashboard'));

    const updateInput = (id, key) => {
      const el = elId(id);
      if (el) {
        el.addEventListener('input', (e) => {
          state[key] = e.target.value;
          saveState();
          // We can re-render immediately or debounce. For simplicity, re-render to update the receipt.
          // Wait, re-rendering entirely on input loses focus. Let's not re-render the whole thing, just update DOM natively or save state and re-render only the receipt if we want to be fancy.
          // For simplicity, let's just save. We'll re-render on blur or on change.
        });
        el.addEventListener('change', () => {
          render();
        });
      }
    };

    updateInput('input-total', 'total');
    updateInput('input-tax', 'taxPercent');
    updateInput('input-service', 'servicePercent');

    const addFriend = () => {
      const val = elId('input-friend').value.trim();
      if (val) {
        state.friends.push(val);
        saveState();
        render();
        // Since we re-rendered, focus is lost, so we'd have to find a way to maintain it if we were writing a complex framework, but for vanilla we're fine.
      }
    };

    elId('btn-add-friend').addEventListener('click', addFriend);
    elId('input-friend').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addFriend();
    });

    container.querySelectorAll('.btn-remove-friend').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-index'));
        state.friends.splice(index, 1);
        saveState();
        render();
      });
    });

    elId('btn-download').addEventListener('click', async () => {
      const receiptEl = elId('receipt-capture');
      try {
        const canvas = await html2canvas(receiptEl, {
          scale: 2,
          backgroundColor: '#ffffff'
        });
        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.download = `pribadiQue-SplitBill-${Date.now()}.png`;
        link.href = image;
        link.click();
      } catch (err) {
        console.error('Failed to capture receipt', err);
        alert('Gagal mendownload gambar strukt.');
      }
    });

    // Restore focus if needed? Not necessary for MVP
  };

  const mount = () => {
    render();
  };

  const unmount = () => {
    container.innerHTML = '';
  };

  return { mount, unmount };
}
