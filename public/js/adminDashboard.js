document.addEventListener('DOMContentLoaded', loadMetrics);

async function loadMetrics() {
  const res = await fetch('/api/admin/dashboard/metrics');
  const m = await res.json();

  document.getElementById('m_total').textContent = m.total;
  document.getElementById('m_low').textContent = m.low;
  document.getElementById('m_out').textContent = m.out;
  document.getElementById('m_healthy').textContent = m.healthy;
  document.getElementById('m_value').textContent = '₱' + Number(m.value).toLocaleString();
}