// ===============================
// LOAD PRODUCTS INTO TABLE
// ===============================
async function loadProducts() {
  const res = await fetch('/api/admin/products');
  const products = await res.json();

  const tbody = document.getElementById('productBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  products.forEach(p => {
    const row = `
      <tr>
       <td>
  <img src="/uploads/${p.image}" class="product-img">
</td>
<td>${p.name}</td>
<td>${p.category ?? '-'}</td>
<td>${p.current_stock}</td>
<td>₱${p.selling_price}</td>
<td>${getStatus(p.current_stock, p.min_stock_level)}</td>
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
// STATUS HELPER
// ===============================
function getStatus(stock, min) {
  if (stock === 0) return 'OUT';
  if (stock <= min) return 'LOW';
  return 'OK';
}


// ===============================
// DELETE PRODUCT
// ===============================
async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;

  await fetch(`/api/admin/products/${id}/delete`, {
    method: 'POST'
  });

  await loadProducts();
}


// ===============================
// MODAL HELPERS (ADD PRODUCT)
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
  const modal = document.getElementById('editModal');
  modal.classList.remove('hidden');

  document.getElementById('edit_id').value = product.id;
  document.getElementById('edit_name').value = product.name || '';
  document.getElementById('edit_description').value = product.description || '';
  document.getElementById('edit_category').value = product.category || '';
  document.getElementById('edit_unit').value = product.unit || '';
  document.getElementById('edit_cost').value = product.cost_price || '';
  document.getElementById('edit_price').value = product.selling_price || '';
  document.getElementById('edit_min_stock').value = product.min_stock_level || '';
}


document.getElementById('closeEditModal').onclick = () => {
  document.getElementById('editModal').classList.add('hidden');
};

document.getElementById('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('edit_id').value;
  const formData = new FormData(document.getElementById('editForm'));

  await fetch(`/api/admin/products/${id}/update`, {
    method: 'POST',
    body: formData
  });

  document.getElementById('editModal').classList.add('hidden');
  await loadProducts();
});



// ===============================
// PAGE INIT
// ===============================
document.addEventListener('DOMContentLoaded', () => {

  console.log("Admin Products JS Ready");

  const form = document.getElementById('productForm');

  // Load products when page opens
  loadProducts();

  if (!form) return;

  // Submit product form via AJAX
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const res = await fetch('/api/admin/products', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      closeProductModal();
      form.reset();
      await loadProducts();
    }
  });
// ===============================
// TABLE BUTTON EVENTS (CSP SAFE)
// ===============================
document.getElementById('productBody').addEventListener('click', async (e) => {

  // EDIT BUTTON
  if (e.target.classList.contains('edit-btn')) {
    const product = JSON.parse(e.target.dataset.product);
    openEditModal(product);
  }

  // DELETE BUTTON
  if (e.target.classList.contains('delete-btn')) {
    const id = e.target.dataset.id;
    await deleteProduct(id);
  }

});

});
