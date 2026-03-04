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
  const suppliers = await res.json();

  const body = document.getElementById("supplierBody");
  body.innerHTML = "";

  suppliers.forEach(s => {

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

}


/* ================= ADD SUPPLIER ================= */

function openAddSupplier() {

  document.getElementById("supplierModalTitle").textContent = "Add Supplier";

  document.getElementById("supplierManageForm").reset();

  document.getElementById("supplier_id").value = "";

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

  const data = {
    name: document.getElementById("supplier_name").value,
    contact_person: document.getElementById("supplier_contact").value,
    phone: document.getElementById("supplier_phone").value,
    email: document.getElementById("supplier_email").value,
    address: document.getElementById("supplier_address").value
  };

  await fetch("/api/admin/purchase/suppliers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

closeSupplierModal();

await loadSupplierTable();

if (typeof loadSuppliers === "function") {
  loadSuppliers();   // refresh PO dropdown
}

console.log(suppliers);
}