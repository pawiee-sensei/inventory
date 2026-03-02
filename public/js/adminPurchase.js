document.addEventListener('DOMContentLoaded', () => {
  loadPO();
  loadSuppliers();

  // ===== TABLE BUTTON EVENTS (CSP SAFE) =====
  document.getElementById('poBody').addEventListener('click', async (e) => {

    // OPEN ITEMS MODAL
    if (e.target.classList.contains('items-btn')) {
      const id = e.target.dataset.id;
      openItems(id);
    }

    // RECEIVE PURCHASE ORDER
    if (e.target.classList.contains('receive-btn')) {
      const id = e.target.dataset.id;
      receivePO(id);
    }

  });

  // OPEN MODALS
  document.getElementById('openSupplierModal')
    .addEventListener('click', () => {
      document.getElementById('supplierModal').classList.remove('hidden');
    });

  document.getElementById('openPOModal')
    .addEventListener('click', () => {
      document.getElementById('poModal').classList.remove('hidden');
    });

  // CLOSE SUPPLIER MODAL
  document.getElementById('closeSupplierModal').addEventListener('click', () => {
    document.getElementById('supplierModal').classList.add('hidden');
  });

  document.getElementById('supplierModal').addEventListener('click', (e) => {
    if (e.target.id === 'supplierModal') e.target.classList.add('hidden');
  });

  // CLOSE PO MODAL
  document.getElementById('closePOModal').addEventListener('click', () => {
    document.getElementById('poModal').classList.add('hidden');
  });

  document.getElementById('poModal').addEventListener('click', (e) => {
    if (e.target.id === 'poModal') e.target.classList.add('hidden');
  });

  // CREATE SUPPLIER
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

  // CREATE PO
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

  // ADD ITEM TO PO
  document.getElementById('itemForm').addEventListener('submit', async (e)=>{
    e.preventDefault();

    const data = {
      po_id: document.getElementById('po_id').value,
      product_id: document.getElementById('productSelect').value,
      quantity: document.getElementById('qtyInput').value,
      cost_price: document.getElementById('costInput').value
    };

    await fetch('/api/admin/purchase/add-item',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(data)
    });

    loadPOItems(data.po_id);
    loadPO();
  });

  // CLOSE ITEMS MODAL
  document.getElementById('closeItemsModal').addEventListener('click', ()=>{
    document.getElementById('itemsModal').classList.add('hidden');
  });

  document.getElementById('itemsModal').addEventListener('click', (e)=>{
    if(e.target.id === 'itemsModal'){
      e.target.classList.add('hidden');
    }
  });
});


// ================= RECEIVE PURCHASE ORDER =================
async function receivePO(id){
  if(!confirm('Receive this order and add stock to inventory?')) return;

  await fetch(`/api/admin/purchase/${id}/receive`, {
    method:'POST'
  });

  alert('Stock successfully added to inventory!');
  loadPO();
}


// ================= LOAD PURCHASE ORDERS =================
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
        ? `<button class="items-btn secondary-btn" data-id="${r.id}">View</button>`
        : `
            <button class="items-btn secondary-btn" data-id="${r.id}">Items</button>
            <button class="receive-btn primary-btn" data-id="${r.id}">Receive</button>
          `;

    body.insertAdjacentHTML('beforeend',`
      <tr>
        <td>#${r.id}</td>
        <td>${r.supplier_name ?? '—'}</td>
        <td>${
          r.item_count > 0
            ? `<span class="badge">${r.item_count} ${r.item_count === 1 ? 'item' : 'items'}</span>`
            : `<span class="muted">—</span>`}
        </td>
        <td class="num">${ r.total_qty > 0 ? r.total_qty : `<span class="muted">—</span>` }</td>
        <td>${statusBadge}</td>
        <td class="num">${ r.total_cost > 0 ? `₱${Number(r.total_cost).toLocaleString()}` : `<span class="muted">—</span>` }</td>
        <td>${new Date(r.created_at).toLocaleDateString()}</td>
        <td>${actions}</td>
      </tr>
    `);
  });
}


// ================= LOAD SUPPLIERS =================
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


// ================= OPEN ITEMS MODAL =================
async function openItems(poId){
  document.getElementById('itemsModal').classList.remove('hidden');
  document.getElementById('po_id').value = poId;

  loadProductsForPO();
  loadPOItems(poId);
}


// LOAD PRODUCTS FOR DROPDOWN
async function loadProductsForPO(){
  const res = await fetch('/api/admin/purchase/products');
  const rows = await res.json();

  const select = document.getElementById('productSelect');
  select.innerHTML='';

  rows.forEach(p=>{
    select.insertAdjacentHTML('beforeend',
      `<option value="${p.id}">${p.name}</option>`
    );
  });
}


// LOAD PO ITEMS
async function loadPOItems(poId){
  const res = await fetch(`/api/admin/purchase/${poId}/items`);
  const rows = await res.json();

  const tbody = document.getElementById('poItemsList');
  tbody.innerHTML='';

  rows.forEach(r=>{
    tbody.insertAdjacentHTML('beforeend', `
      <tr>
        <td>${r.product_name}</td>
        <td>${r.quantity}</td>
        <td>₱${Number(r.cost_price).toLocaleString()}</td>
      </tr>
    `);
  });
}