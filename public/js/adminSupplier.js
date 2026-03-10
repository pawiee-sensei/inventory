let SUP_ALL = [];
let SUP_PAGE = 1;
const SUP_LIMIT = 5;

document.addEventListener("DOMContentLoaded", () => {

  loadSupplierTable();

  document
    .getElementById("openAddSupplierModal")
    .addEventListener("click", openAddSupplier);

  document
    .getElementById("closeSupplierModal")
    .addEventListener("click", closeSupplierModal);

  document
    .getElementById("supplierManageForm")
    .addEventListener("submit", submitSupplier);

});


/* ================= LOAD SUPPLIERS ================= */

async function loadSupplierTable() {

  const res = await fetch("/api/admin/purchase/suppliers");

  SUP_ALL = await res.json();

  SUP_PAGE = 1;

  renderSuppliers();

}


/* ================= RENDER SUPPLIERS ================= */

function renderSuppliers(){

  const start = (SUP_PAGE - 1) * SUP_LIMIT;
  const end = start + SUP_LIMIT;

  const rows = SUP_ALL.slice(start, end);

  const body = document.getElementById("supplierBody");

  body.innerHTML = "";

  rows.forEach(s => {

    const row = `
      <tr>

        <td>${s.name}</td>
        <td>${s.contact_person ?? "-"}</td>
        <td>${s.phone ?? "-"}</td>
        <td>${s.email ?? "-"}</td>
        <td>${Number(s.total_po || 0)}</td>

        <td>
          <button class="edit-supplier-btn" data-supplier='${JSON.stringify(s)}'>
            Edit
          </button>

          <button class="delete-supplier-btn" data-id="${s.id}">
            Delete
          </button>
        </td>

      </tr>
    `;

    body.insertAdjacentHTML("beforeend", row);

  });

  renderSupplierPagination();

}


/* ================= SUPPLIER PAGINATION ================= */

function renderSupplierPagination(){

  const totalPages = Math.ceil(SUP_ALL.length / SUP_LIMIT);

  const container = document.getElementById("supplierPageNumbers");

  if(!container) return;

  container.innerHTML = "";

  for(let i = 1; i <= totalPages; i++){

    const active = i === SUP_PAGE ? "active-page" : "";

    container.insertAdjacentHTML("beforeend", `
      <button class="page-btn ${active}" data-sup-page="${i}">
        ${i}
      </button>
    `);

  }

}


/* ================= PAGINATION EVENTS ================= */

document.addEventListener("click",(e)=>{

  /* ===== EDIT SUPPLIER BUTTON ===== */

  if(e.target.classList.contains("edit-supplier-btn")){

    const supplier = JSON.parse(e.target.dataset.supplier);

    openEditSupplier(supplier);

  }

    /* ===== DELETE SUPPLIER BUTTON ===== */

  if(e.target.classList.contains("delete-supplier-btn")){

    const id = e.target.dataset.id;

    if(!confirm("Delete this supplier?")) return;

    deleteSupplier(id);

  }

  if(e.target.dataset.supPage){

    SUP_PAGE = Number(e.target.dataset.supPage);

    renderSuppliers();

  }

  if(e.target.id === "supplierPrev"){

    if(SUP_PAGE > 1){

      SUP_PAGE--;

      renderSuppliers();

    }

  }

  if(e.target.id === "supplierNext"){

    const max = Math.ceil(SUP_ALL.length / SUP_LIMIT);

    if(SUP_PAGE < max){

      SUP_PAGE++;

      renderSuppliers();

    }

  }

});

/* ================= ADD SUPPLIER ================= */

function openAddSupplier() {

  document.getElementById("supplierModalTitle").textContent = "Add Supplier";

  document.getElementById("supplierManageForm").reset();

  document.getElementById("supplier_id").value = "";

  document
    .getElementById("supplierManageModal")
    .classList.remove("hidden");

}

function openEditSupplier(s){

  document.getElementById("supplierModalTitle").textContent = "Edit Supplier";

  document.getElementById("supplier_id").value = s.id;

  document.getElementById("supplier_name").value = s.name || "";
  document.getElementById("supplier_contact").value = s.contact_person || "";
  document.getElementById("supplier_phone").value = s.phone || "";
  document.getElementById("supplier_email").value = s.email || "";
  document.getElementById("supplier_address").value = s.address || "";

  document
    .getElementById("supplierManageModal")
    .classList.remove("hidden");

}


function closeSupplierModal() {

  document
    .getElementById("supplierManageModal")
    .classList.add("hidden");

}


/* ================= SUBMIT SUPPLIER ================= */

async function submitSupplier(e) {

  e.preventDefault();

  const supplierId = document.getElementById("supplier_id").value;

  const data = {
    name: document.getElementById("supplier_name").value,
    contact_person: document.getElementById("supplier_contact").value,
    phone: document.getElementById("supplier_phone").value,
    email: document.getElementById("supplier_email").value,
    address: document.getElementById("supplier_address").value
  };

  let url = "/api/admin/purchase/suppliers";
  let method = "POST";

  if(supplierId){
    url = `/api/admin/purchase/suppliers/${supplierId}`;
    method = "PUT";
  }

  await fetch(url,{
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  closeSupplierModal();

  await loadSupplierTable();

  if (typeof loadSuppliers === "function") {
    loadSuppliers();   // refresh PO dropdown
  }

}

/* ================= DELETE SUPPLIER ================= */

async function deleteSupplier(id){

  try{

    const res = await fetch(`/api/admin/purchase/suppliers/${id}`,{
      method:"DELETE"
    });

    const data = await res.json();

    if(!data.success){
      alert("Delete failed");
      return;
    }

    await loadSupplierTable();

    if(typeof loadSuppliers === "function"){
      loadSuppliers(); // refresh PO dropdown
    }

  }catch(err){
    console.error(err);
    alert("Server error");
  }

}