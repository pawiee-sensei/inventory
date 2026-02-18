document.addEventListener('DOMContentLoaded', function () {

  const openBtn = document.getElementById('openProductModal');
  const closeBtn = document.getElementById('closeProductModal');
  const modal = document.getElementById('productModal');

  if (openBtn) {
    openBtn.addEventListener('click', function () {
      modal.classList.remove('hidden');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      modal.classList.add('hidden');
    });
  }

});
