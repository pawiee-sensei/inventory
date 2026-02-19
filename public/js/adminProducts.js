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
      ${p.name}
    </td>
    <td>${p.category}</td>
    <td>${p.current_stock}</td>
    <td>₱${p.selling_price}</td>
    <td>OK</td>
  </tr>
`;

    tbody.insertAdjacentHTML('beforeend', row);
  });
}


// ===============================
// MODAL HELPERS (GLOBAL)
// ===============================
function openProductModal() {
  document.getElementById('productModal').classList.remove('hidden');
}

function closeProductModal() {
  document.getElementById('productModal').classList.add('hidden');
}


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
      // Close modal
      closeProductModal();

      // Reset form
      form.reset();

      // Reload table instantly
      await loadProducts();
    }
  });

});
