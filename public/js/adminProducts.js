let ALL_PRODUCTS = [];
let CURRENT_PAGE = 1;
const ROWS_PER_PAGE = 5;
let FILTERED_PRODUCTS = [];

let HISTORY_ROWS = [];
let HISTORY_PAGE = 1;
const HISTORY_PER_PAGE = 5;

// ===============================
// LOAD PRODUCTS
// ===============================
async function loadProducts() {
  const res = await fetch('/api/admin/products');

  if (!res.ok) {
    console.error('Failed to load products');
    return;
  }

  try {
    ALL_PRODUCTS = await res.json();
  } catch (err) {
    console.error('Invalid JSON from server');
    return;
  }

  CURRENT_PAGE = 1;
  renderProducts(ALL_PRODUCTS);
  updateMetrics(ALL_PRODUCTS);
}

// ===============================
// RENDER PRODUCTS
// ===============================
function renderProducts(products) {

  FILTERED_PRODUCTS = products;

  const tbody = document.getElementById('productBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  const totalPages = Math.ceil(products.length / ROWS_PER_PAGE) || 1;
  if (CURRENT_PAGE > totalPages) CURRENT_PAGE = totalPages;

  const start = (CURRENT_PAGE - 1) * ROWS_PER_PAGE;
  const end = start + ROWS_PER_PAGE;

  const slice = products.slice(start, end);

  slice.forEach(p => {

    const status = getStatus(p.current_stock, p.min_stock_level);
    const badge = getStatusBadge(status);

    const row = `
      <tr>
        <td><img src="/uploads/${p.image}" class="product-img"></td>
        <td>${p.name}</td>
        <td>${p.category ?? '-'}</td>
        <td class="num">${p.current_stock}</td>
        <td class="num">₱${Number(p.selling_price).toLocaleString()}</td>
        <td>${badge}</td>
        <td>
          <button class="edit-btn" data-id="${p.id}">Edit</button>
          <button class="adjust-btn" data-id="${p.id}">Adjust</button>
          <button class="delete-btn" data-id="${p.id}">Delete</button>
        </td>
      </tr>
    `;

    tbody.insertAdjacentHTML('beforeend', row);
  });

  updateTableCount(products.length);
  renderPaginationControls();
}

// ===============================
// PAGINATION
// ===============================
function renderPaginationControls(){
  const totalPages = Math.ceil(FILTERED_PRODUCTS.length / ROWS_PER_PAGE) || 1;
  const container = document.getElementById('pageNumbers');
  if (!container) return;

  container.innerHTML = '';

  for(let i = 1; i <= totalPages; i++){
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.classList.add('page-number');

    if(i === CURRENT_PAGE){
      btn.classList.add('active');
    }

    btn.addEventListener('click', ()=>{
      CURRENT_PAGE = i;
      renderProducts(FILTERED_PRODUCTS);
    });

    container.appendChild(btn);
  }

  document.getElementById('prevPage').disabled = CURRENT_PAGE === 1;
  document.getElementById('nextPage').disabled = CURRENT_PAGE === totalPages;
}

function updateTableCount(count){
  const el = document.getElementById('tableCount');
  if(el) el.textContent = count;
}

// ===============================
// STATUS
// ===============================
function getStatus(stock, min){
  const current = Number(stock) || 0;
  const minimum = Number(min) || 0;

  if(current === 0) return 'OUT';
  if(current <= minimum) return 'LOW';
  return 'OK';
}

function getStatusBadge(status){
  if(status === 'OUT') return '<span class="status-badge status-out">OUT</span>';
  if(status === 'LOW') return '<span class="status-badge status-low">LOW</span>';
  return '<span class="status-badge status-ok">OK</span>';
}

// ===============================
// FILTER
// ===============================
function filterProducts(){
  CURRENT_PAGE = 1;

  const q = document.getElementById('searchInput').value.toLowerCase().trim();
  const cat = document.getElementById('categoryFilter').value;
  const status = document.getElementById('statusFilter').value;

  const filtered = ALL_PRODUCTS.filter(p => {
    const s = getStatus(p.current_stock, p.min_stock_level);
    return (!q || p.name.toLowerCase().includes(q)) &&
           (!cat || p.category === cat) &&
           (!status || s === status);
  });

  renderProducts(filtered);
}

// ===============================
// DELETE
// ===============================
async function deleteProduct(id){
  if(!confirm('Delete this product?')) return;
  await fetch(`/api/admin/products/${id}/delete`, { method:'POST' });
  await loadProducts();
}

// ===============================
// STOCK HISTORY WITH PAGINATION
// ===============================
async function loadStockHistory(){
  const res = await fetch('/api/admin/stock/history');
  HISTORY_ROWS = await res.json();

  HISTORY_PAGE = 1;
  renderStockHistory();
}

function renderStockHistory(){

  const tbody = document.getElementById('historyBody');
  if(!tbody) return;

  tbody.innerHTML = '';

  const totalPages = Math.ceil(HISTORY_ROWS.length / HISTORY_PER_PAGE) || 1;
  if(HISTORY_PAGE > totalPages) HISTORY_PAGE = totalPages;

  const start = (HISTORY_PAGE - 1) * HISTORY_PER_PAGE;
  const end = start + HISTORY_PER_PAGE;

  const slice = HISTORY_ROWS.slice(start, end);

  slice.forEach(r=>{
    const tr = `
      <tr>
        <td>${new Date(r.created_at).toLocaleString()}</td>
        <td>${r.product_name}</td>
        <td>${historyBadge(r.type)}</td>
        <td class="num">${r.quantity}</td>
        <td>${r.staff_name ?? '-'}</td>
        <td>${r.note ?? ''}</td>
      </tr>
    `;
    tbody.insertAdjacentHTML('beforeend', tr);
  });

  document.getElementById('historyPageInfo').textContent =
    `Page ${HISTORY_PAGE} of ${totalPages}`;

  document.getElementById('historyPrev').disabled = HISTORY_PAGE === 1;
  document.getElementById('historyNext').disabled = HISTORY_PAGE === totalPages;
}

function historyBadge(type){
  if(type === 'IN') return '<span class="status-badge status-ok">IN</span>';
  if(type === 'OUT') return '<span class="status-badge status-out">OUT</span>';
  return '<span class="status-badge status-low">ADJUST</span>';
}

// ===============================
// MODALS (SIMPLE + STABLE)
// ===============================
function openProductModal(){
  document.getElementById('productModal').classList.remove('hidden');
}

function openEditModal(product){
  document.getElementById('editModal').classList.remove('hidden');
  document.getElementById('edit_id').value = product.id ?? '';
  document.getElementById('edit_name').value = product.name ?? '';
  document.getElementById('edit_description').value = product.description ?? '';
  document.getElementById('edit_category').value = product.category ?? '';
  document.getElementById('edit_cost').value = product.cost_price ?? '';
  document.getElementById('edit_price').value = product.selling_price ?? '';
}

function openAdjustModal(product){
  document.getElementById('adjustModal').classList.remove('hidden');
  document.getElementById('adj_product_id').value = product.id;
}

// ===============================
// DOM READY
// ===============================
document.addEventListener('DOMContentLoaded', () => {

  loadProducts();
  loadStockHistory();

  const addForm = document.getElementById('productForm');
  const editForm = document.getElementById('editForm');
  const adjustForm = document.getElementById('adjustForm');

  // ===============================
  // PRODUCT PAGINATION
  // ===============================
  document.getElementById('prevPage').addEventListener('click', ()=>{
    if(CURRENT_PAGE > 1){
      CURRENT_PAGE--;
      renderProducts(FILTERED_PRODUCTS);
    }
  });

  document.getElementById('nextPage').addEventListener('click', ()=>{
    const totalPages = Math.ceil(FILTERED_PRODUCTS.length / ROWS_PER_PAGE);
    if(CURRENT_PAGE < totalPages){
      CURRENT_PAGE++;
      renderProducts(FILTERED_PRODUCTS);
    }
  });

  // ===============================
  // HISTORY PAGINATION
  // ===============================
  document.getElementById('historyPrev').addEventListener('click', ()=>{
    if(HISTORY_PAGE > 1){
      HISTORY_PAGE--;
      renderStockHistory();
    }
  });

  document.getElementById('historyNext').addEventListener('click', ()=>{
    const totalPages = Math.ceil(HISTORY_ROWS.length / HISTORY_PER_PAGE);
    if(HISTORY_PAGE < totalPages){
      HISTORY_PAGE++;
      renderStockHistory();
    }
  });

  // ===============================
  // FILTERS
  // ===============================
  document.getElementById('searchInput')
    .addEventListener('input', filterProducts);

  document.getElementById('categoryFilter')
    .addEventListener('change', filterProducts);

  document.getElementById('statusFilter')
    .addEventListener('change', filterProducts);

  // ===============================
  // REFRESH
  // ===============================
  document.getElementById('refreshTableBtn')
    .addEventListener('click', async ()=>{
      await loadProducts();
      await loadStockHistory();
    });

  // ===============================
  // OPEN ADD MODAL
  // ===============================
  document.getElementById('openProductModal')
    .addEventListener('click', openProductModal);

  // ===============================
  // CLOSE MODALS (X BUTTON)
  // ===============================
  document.querySelectorAll('.close-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      btn.closest('.modal').classList.add('hidden');
    });
  });

  // ===============================
  // CLOSE MODALS (OUTSIDE CLICK)
  // ===============================
  document.querySelectorAll('.modal').forEach(modal=>{
    modal.addEventListener('click', (e)=>{
      if(e.target === modal){
        modal.classList.add('hidden');
      }
    });
  });

  // ===============================
  // TABLE ACTIONS
  // ===============================
  document.getElementById('productBody')
  .addEventListener('click', async (e)=>{

    const id = e.target.dataset.id;
    if (!id) return;

    const product = ALL_PRODUCTS.find(p => p.id == id);
    if (!product) return;

    if(e.target.classList.contains('edit-btn')){
      openEditModal(product);
    }

    if(e.target.classList.contains('adjust-btn')){
      openAdjustModal(product);
    }

    if(e.target.classList.contains('delete-btn')){
      await deleteProduct(id);
    }

});

  // ===============================
  // ADD PRODUCT SUBMIT
  // ===============================
  addForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(addForm);

  try {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      alert('Create failed');
      return;
    }

    document.getElementById('productModal').classList.add('hidden');
    addForm.reset();

  } catch (err) {
    console.error("CREATE ERROR:", err);
    alert('Create request failed');
    return;
  }

  // 🔹 reload separately
  try {
    await loadProducts();
  } catch (err) {
    console.error("RELOAD ERROR:", err);
  }
});

  // ===============================
  // EDIT PRODUCT SUBMIT
  // ===============================
  editForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('edit_id').value;
  const formData = new FormData(editForm);

  try {
    const res = await fetch(`/api/admin/products/${id}/update`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      alert('Update failed');
      return;
    }

    // Close modal immediately (update succeeded)
    document.getElementById('editModal').classList.add('hidden');
    editForm.reset();

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    alert('Update request failed');
    return;
  }

  // 🔹 reload OUTSIDE try/catch
  try {
    await loadProducts();
  } catch (err) {
    console.error("RELOAD ERROR:", err);
  }
});

  // ===============================
  // ADJUST STOCK SUBMIT
  // ===============================
  if (adjustForm) {
    adjustForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        product_id: document.getElementById('adj_product_id').value,
        quantity: document.getElementById('adj_qty').value,
        reason: document.getElementById('adj_reason').value
      };

      try {
        const res = await fetch('/api/admin/stock/adjust', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          alert('Adjustment failed');
          return;
        }

        document.getElementById('adjustModal').classList.add('hidden');
        await loadProducts();
        await loadStockHistory();

      } catch (err) {
        console.error(err);
        alert('Server connection error');
      }
    });
  }

});