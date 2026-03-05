

  let PO_ALL = [];
  let PO_PAGE = 1;
  const PO_LIMIT = 5;


  document.addEventListener('DOMContentLoaded', () => {
    loadPO();
    loadSuppliers();

    // ===== TABLE BUTTON EVENTS (CSP SAFE) =====
    document.getElementById('poBody').addEventListener('click', async (e) => {

      if (e.target.classList.contains('items-btn')) {
        const id = e.target.dataset.id;
        openItems(id);
      }

      if (e.target.classList.contains('receive-btn')) {
        const id = e.target.dataset.id;
        receivePO(id);
      }

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


  // ================= PO STATUS BADGE =================
  function getPOBadge(status){
    if(status === 'PENDING'){
      return '<span class="po-badge pending">PENDING</span>';
    }
    return '<span class="po-badge received">RECEIVED</span>';
  }


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
  // ================= LOAD PURCHASE ORDERS =================
  async function loadPO(){

    const res = await fetch('/api/admin/purchase');
    PO_ALL = await res.json();

    PO_PAGE = 1;

    renderPO();

  }


  // ================= RENDER PURCHASE ORDERS =================
  function renderPO(){

    const start = (PO_PAGE - 1) * PO_LIMIT;
    const end = start + PO_LIMIT;

    const rows = PO_ALL.slice(start, end);

    const body = document.getElementById('poBody');
    body.innerHTML='';

    rows.forEach(r=>{

      const statusBadge = getPOBadge(r.status);

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

    renderPOPagination();

  }


  // ================= RENDER PAGINATION =================
  function renderPOPagination(){

    const totalPages = Math.ceil(PO_ALL.length / PO_LIMIT);

    const container = document.getElementById('poPageNumbers');

    if(!container) return;

    container.innerHTML = '';

    for(let i=1;i<=totalPages;i++){

      const active = i === PO_PAGE ? 'active-page' : '';

      container.insertAdjacentHTML('beforeend',`
        <button class="page-btn ${active}" data-page="${i}">
          ${i}
        </button>
      `);

    }

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

    const res = await fetch(`/api/admin/purchase/${poId}/details`);
    const data = await res.json();

    const po = data.po;
    const items = data.items;

    document.getElementById('poSupplier').textContent = po.supplier_name;
    document.getElementById('poStatus').innerHTML = getPOBadge(po.status);
    document.getElementById('poDate').textContent =
      new Date(po.created_at).toLocaleDateString();

    const form = document.getElementById('itemForm');
    if(po.status === 'RECEIVED'){
      form.style.display = 'none';
    } else {
      form.style.display = 'block';
      loadProductsForPO();
    }

    const tbody = document.getElementById('poItemsList');
    tbody.innerHTML = '';

    items.forEach(i=>{
      tbody.insertAdjacentHTML('beforeend',`
        <tr>
          <td>${i.name}</td>
          <td>${i.quantity}</td>
          <td>₱${Number(i.cost_price).toLocaleString()}</td>
          <td>₱${Number(i.subtotal).toLocaleString()}</td>
        </tr>
      `);
    });

  const totalSection = document.getElementById('poTotalSection');

  // Always reset first
  totalSection.classList.add('hidden');

  const status = (po.status || '').toUpperCase().trim();

  // Show total ONLY when fully received
  if(status === 'RECEIVED'){
    document.getElementById('poTotal').textContent =
      Number(po.total_cost || 0).toLocaleString();

    totalSection.classList.remove('hidden');
  }
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

  // ================= PO PAGINATION EVENTS =================
document.addEventListener('click',(e)=>{

  if(e.target.dataset.page){
    PO_PAGE = Number(e.target.dataset.page);
    renderPO();
  }

  if(e.target.id === 'poPrev'){
    if(PO_PAGE > 1){
      PO_PAGE--;
      renderPO();
    }
  }

  if(e.target.id === 'poNext'){
    const max = Math.ceil(PO_ALL.length / PO_LIMIT);

    if(PO_PAGE < max){
      PO_PAGE++;
      renderPO();
    }
  }

});