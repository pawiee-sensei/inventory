document.addEventListener('DOMContentLoaded', () => {
  loadPO();
  loadSuppliers();

  document.getElementById('openSupplierModal')
    .addEventListener('click', () => {
      document.getElementById('supplierModal').classList.remove('hidden');
    });

  document.getElementById('openPOModal')
    .addEventListener('click', () => {
      document.getElementById('poModal').classList.remove('hidden');
    });
  // ===== CLOSE SUPPLIER MODAL (X BUTTON) =====
  document.getElementById('closeSupplierModal').addEventListener('click', () => {
    document.getElementById('supplierModal').classList.add('hidden');
  });

  // ===== CLOSE MODAL WHEN CLICK OUTSIDE =====
  const supplierModal = document.getElementById('supplierModal');
  supplierModal.addEventListener('click', (e) => {
    if (e.target === supplierModal) {
      supplierModal.classList.add('hidden');
    }
  });

  // ===== CLOSE PO MODAL (X BUTTON) =====
document.getElementById('closePOModal').addEventListener('click', () => {
  document.getElementById('poModal').classList.add('hidden');
});

// ===== CLOSE PO MODAL WHEN CLICK OUTSIDE =====
const poModal = document.getElementById('poModal');
poModal.addEventListener('click', (e) => {
  if (e.target === poModal) {
    poModal.classList.add('hidden');
  }
});

  document.getElementById('supplierForm')
    .addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      await fetch('/api/admin/purchase/suppliers', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(data)
      });
      e.target.reset();
      document.getElementById('supplierModal').classList.add('hidden');
      loadSuppliers();
    });

  document.getElementById('poForm')
    .addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      await fetch('/api/admin/purchase/create', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(data)
      });
      document.getElementById('poModal').classList.add('hidden');
      loadPO();
    });
});

async function loadPO(){
  const res = await fetch('/api/admin/purchase');
  const rows = await res.json();

  const body = document.getElementById('poBody');
  body.innerHTML='';

  rows.forEach(r=>{

    const statusBadge =
      r.status === 'RECEIVED'
        ? '<span class="status-badge status-ok">RECEIVED</span>'
        : '<span class="status-badge status-low">PENDING</span>';

    const actions =
      r.status === 'RECEIVED'
        ? `<button onclick="openItems(${r.id})" class="secondary-btn">View</button>`
        : `
            <button onclick="openItems(${r.id})" class="secondary-btn">Items</button>
            <button onclick="receivePO(${r.id})" class="primary-btn">Receive</button>
          `;

    body.insertAdjacentHTML('beforeend',`
      <tr>
        <td>#${r.id}</td>
        <td>${r.supplier_name ?? '—'}</td>
        <td>
  ${
    r.item_count > 0
      ? `<span class="badge">${r.item_count}</span>`
      : `<span class="muted">—</span>`
  }
</td>
        <td>${statusBadge}</td>
        <td class="num">
  ${
    r.total_cost > 0
      ? `₱${Number(r.total_cost).toLocaleString()}`
      : `<span class="muted">—</span>`
  }
</td>
        <td>${new Date(r.created_at).toLocaleDateString()}</td>
        <td>${actions}</td>
      </tr>
    `);
  });
}

async function loadSuppliers(){
  const res = await fetch('/api/admin/purchase/suppliers');
  const rows = await res.json();

  const select = document.getElementById('supplierSelect');
  select.innerHTML='';

  rows.forEach(s=>{
    select.insertAdjacentHTML('beforeend',
      `<option value="${s.id}">${s.name}</option>`
    );
  });
}