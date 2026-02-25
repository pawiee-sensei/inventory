let ALL_PRODUCTS = [];

// ===============================
// LOAD PRODUCTS FROM API
// ===============================
async function loadProducts() {
  const res = await fetch('/api/admin/products');
  ALL_PRODUCTS = await res.json();

  renderProducts(ALL_PRODUCTS);
  updateMetrics(ALL_PRODUCTS);
}

// ===============================
// RENDER TABLE
// ===============================
function renderProducts(products) {
  const tbody = document.getElementById('productBody');
  if (!tbody) return;

  // 🔢 Update toolbar counter
  const countEl = document.getElementById('tableCount');
  if (countEl) {
    countEl.textContent = products.length;
  }

  tbody.innerHTML = '';

  products.forEach(p => {
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
          <button class="edit-btn" data-product='${JSON.stringify(p)}'>Edit</button>
          <button class="delete-btn" data-id="${p.id}">Delete</button>
        </td>
      </tr>
    `;

    tbody.insertAdjacentHTML('beforeend', row);
  });
}

// ===============================
// STATUS LOGIC
// ===============================
function getStatus(stock, min) {
  if (stock === 0) return 'OUT';
  if (stock <= min) return 'LOW';
  return 'OK';
}

function getStatusBadge(status) {
  if (status === 'OUT') return '<span class="status-badge status-out">OUT</span>';
  if (status === 'LOW') return '<span class="status-badge status-low">LOW</span>';
  return '<span class="status-badge status-ok">OK</span>';
}

// ===============================
// METRICS CARDS
// ===============================
function updateMetrics(products) {
  let low = 0, out = 0, healthy = 0;

  products.forEach(p => {
    const s = getStatus(p.current_stock, p.min_stock_level);
    if (s === 'LOW') low++;
    else if (s === 'OUT') out++;
    else healthy++;
  });

  document.getElementById('m_total').textContent = products.length;
  document.getElementById('m_low').textContent = low;
  document.getElementById('m_out').textContent = out;
  document.getElementById('m_healthy').textContent = healthy;
}

// ===============================
// SEARCH + FILTER
// ===============================
function filterProducts() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const cat = document.getElementById('categoryFilter').value;

  const filtered = ALL_PRODUCTS.filter(p => {
    const matchName = p.name.toLowerCase().includes(q);
    const matchCat = !cat || p.category === cat;
    return matchName && matchCat;
  });

  renderProducts(filtered);
}

// ===============================
// DELETE PRODUCT
// ===============================
async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;

  await fetch(`/api/admin/products/${id}/delete`, { method: 'POST' });
  await loadProducts();

}

// ===============================
// MODAL HELPERS
// ===============================
function openProductModal() {
  document.getElementById('productModal').classList.remove('hidden');
}

function closeProductModal() {
  document.getElementById('productModal').classList.add('hidden');
}

// ===============================
// EDIT PRODUCT MODAL
// ===============================
function openEditModal(product) {
  document.getElementById('editModal').classList.remove('hidden');

  document.getElementById('edit_id').value = product.id;
  document.getElementById('edit_name').value = product.name || '';
  document.getElementById('edit_description').value = product.description || '';
  document.getElementById('edit_category').value = product.category || '';
  document.getElementById('edit_unit').value = product.unit || '';
  document.getElementById('edit_cost').value = product.cost_price || '';
  document.getElementById('edit_price').value = product.selling_price || '';
}

// ===============================
// PAGE INIT
// ===============================
document.addEventListener('DOMContentLoaded', () => {

  const addForm = document.getElementById('productForm');
  const editForm = document.getElementById('editForm');

  loadProducts();
  loadStockHistory();

  document.getElementById('openProductModal').addEventListener('click', openProductModal);
  document.getElementById('closeProductModal').addEventListener('click', closeProductModal);

  document.getElementById('closeEditModal').addEventListener('click', () =>
    document.getElementById('editModal').classList.add('hidden')
  );

  document.getElementById('searchInput').addEventListener('input', filterProducts);
  document.getElementById('categoryFilter').addEventListener('change', filterProducts);

  // ADD PRODUCT
  addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(addForm);

    const res = await fetch('/api/admin/products', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (data.success) {
      closeProductModal();
      addForm.reset();
      await loadProducts();
    }
  });

  // EDIT PRODUCT
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('edit_id').value;
    const formData = new FormData(editForm);

    await fetch(`/api/admin/products/${id}/update`, {
      method: 'POST',
      body: formData
    });

    document.getElementById('editModal').classList.add('hidden');
    await loadProducts();
  });

  // TABLE BUTTON EVENTS
  document.getElementById('productBody').addEventListener('click', async (e) => {
    if (e.target.classList.contains('edit-btn')) {
      openEditModal(JSON.parse(e.target.dataset.product));
    }
    if (e.target.classList.contains('delete-btn')) {
      await deleteProduct(e.target.dataset.id);
    }
  });

  // CLOSE MODAL OUTSIDE CLICK
  ['productModal', 'editModal'].forEach(id => {
    document.getElementById(id).addEventListener('click', e => {
      if (e.target.id === id) e.target.classList.add('hidden');
    });
  });

});

// ===============================
// LOAD STOCK MOVEMENT HISTORY
// ===============================
async function loadStockHistory() {
  const res = await fetch('/api/admin/stock/history');
  const rows = await res.json();

  const tbody = document.getElementById('historyBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  rows.slice(0, 10).forEach(r => {
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
}

function historyBadge(type) {
  if (type === 'IN') return '<span class="status-badge status-ok">IN</span>';
  if (type === 'OUT') return '<span class="status-badge status-out">OUT</span>';
  return '<span class="status-badge status-low">ADJUST</span>';
}