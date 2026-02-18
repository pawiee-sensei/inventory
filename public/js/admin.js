document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('openProductModal');
  const closeBtn = document.getElementById('closeProductModal');
  const modal = document.getElementById('productModal');

  console.log('Admin JS loaded'); // debug

  if (!modal) {
    console.error('Modal NOT found in DOM');
    return;
  }

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      console.log('Open clicked');
      modal.classList.remove('hidden');
    });
  } else {
    console.error('Open button NOT found');
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  } else {
    console.error('Close button NOT found');
  }
});
