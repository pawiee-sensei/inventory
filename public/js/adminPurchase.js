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
    body.insertAdjacentHTML('beforeend',`
      <tr>
        <td>#${r.id}</td>
        <td>${r.supplier_name}</td>
        <td>${r.status}</td>
        <td>₱${Number(r.total_cost).toLocaleString()}</td>
        <td>${new Date(r.created_at).toLocaleDateString()}</td>
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