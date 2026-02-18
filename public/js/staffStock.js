const list = document.getElementById('productList');

async function loadProducts() {
  const res = await fetch('/api/admin/products');
  const products = await res.json();

  list.innerHTML = '';

  products.forEach(p => {
    const li = document.createElement('li');

    li.innerHTML = `
      <b>${p.name}</b> (Stock: ${p.current_stock})
      <br>
      Qty: <input type="number" id="qty-${p.id}" value="1" min="1">
      <button onclick="stockIn(${p.id})">Stock IN</button>
      <button onclick="stockOut(${p.id})">Stock OUT</button>
      <hr>
    `;

    list.appendChild(li);
  });
}

async function stockIn(productId) {
  const qty = document.getElementById(`qty-${productId}`).value;

  await fetch('/api/staff/stock/in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: productId,
      quantity: Number(qty),
      note: 'Manual stock in'
    })
  });

  loadProducts();
}

async function stockOut(productId) {
  const qty = document.getElementById(`qty-${productId}`).value;

  await fetch('/api/staff/stock/out', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: productId,
      quantity: Number(qty),
      note: 'Manual stock out'
    })
  });

  loadProducts();
}
