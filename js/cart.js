/* ===================================
   Yeoyoung Art - Cart & Shop Logic
=================================== */

const Cart = (() => {
  let items = JSON.parse(localStorage.getItem('yy-cart') || '[]');

  function save() {
    localStorage.setItem('yy-cart', JSON.stringify(items));
    updateUI();
  }

  function add(artwork) {
    const existing = items.find(i => i.id === artwork.id);
    if (existing) {
      showToast('This artwork is already in your cart.');
      return;
    }
    items.push({ ...artwork });
    save();
    showToast(`"${artwork.title}" added to cart!`);
  }

  function remove(id) {
    items = items.filter(i => i.id !== id);
    save();
  }

  function clear() {
    items = [];
    save();
  }

  function getItems() { return items; }

  function getTotal() {
    return items.reduce((sum, i) => sum + parseFloat(i.price), 0).toFixed(2);
  }

  function getCount() { return items.length; }

  function updateUI() {
    // Nav badge
    const counts = document.querySelectorAll('.cart-count');
    counts.forEach(el => {
      el.textContent = getCount();
      el.classList.toggle('hidden', getCount() === 0);
    });

    // Cart sidebar (shop page)
    const cartItemsEl = document.querySelector('.cart-items');
    const cartTotalEl = document.querySelector('.cart-total .total-price');
    const cartEmptyEl = document.querySelector('.cart-empty');
    const checkoutBtn = document.querySelector('.btn-checkout');

    if (cartItemsEl) {
      // Clear existing item elements
      document.querySelectorAll('.cart-item').forEach(el => el.remove());
      if (cartEmptyEl) cartEmptyEl.style.display = items.length === 0 ? 'block' : 'none';

      items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
          <img class="cart-item-img" src="${item.image || 'img/placeholder.jpg'}" alt="${item.title}">
          <div class="cart-item-info">
            <h5>${item.title}</h5>
            <span class="item-price">€${parseFloat(item.price).toLocaleString()}</span>
          </div>
          <button class="cart-item-remove" onclick="Cart.remove('${item.id}')" aria-label="Remove">✕</button>
        `;
        cartItemsEl.appendChild(el);
      });

      if (cartTotalEl) cartTotalEl.textContent = `€${parseFloat(getTotal()).toLocaleString()}`;
      if (checkoutBtn) checkoutBtn.disabled = items.length === 0;
    }
  }

  return { add, remove, clear, getItems, getTotal, getCount, updateUI };
})();

// Toast notification
function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 3500);
}

// Checkout modal
function openCheckout() {
  if (Cart.getCount() === 0) return;
  document.querySelector('.modal-overlay')?.classList.add('open');
}
function closeCheckout() {
  document.querySelector('.modal-overlay')?.classList.remove('open');
}

// Lightbox
function openLightbox(data) {
  const lb = document.querySelector('.lightbox');
  if (!lb) return;
  lb.querySelector('.lightbox-img img').src = data.image;
  lb.querySelector('.lightbox-img img').alt = data.title;
  lb.querySelector('h3').textContent = data.title;
  lb.querySelector('.medium').textContent = data.medium;
  lb.querySelector('p').textContent = data.description;
  lb.querySelector('.lightbox-price').textContent = data.sold ? 'SOLD' : `€${parseFloat(data.price).toLocaleString()}`;
  const addBtn = lb.querySelector('.btn-add-lightbox');
  if (addBtn) {
    addBtn.style.display = data.sold ? 'none' : 'inline-flex';
    addBtn.onclick = () => { Cart.add(data); };
  }
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.querySelector('.lightbox')?.classList.remove('open');
  document.body.style.overflow = '';
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  Cart.updateUI();

  // Sticky nav scroll effect
  const nav = document.querySelector('.site-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 30);
    });
  }

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  // Lightbox close on overlay click
  document.querySelector('.lightbox')?.addEventListener('click', function(e) {
    if (e.target === this) closeLightbox();
  });

  // Modal close on overlay click
  document.querySelector('.modal-overlay')?.addEventListener('click', function(e) {
    if (e.target === this) closeCheckout();
  });

  // Checkout form submit
  document.querySelector('.checkout-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = this.querySelector('[name="name"]')?.value;
    closeCheckout();
    Cart.clear();
    setTimeout(() => {
      showToast(`Thank you, ${name}! We'll be in touch about your order.`);
    }, 400);
  });
});
