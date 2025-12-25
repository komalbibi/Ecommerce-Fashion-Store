(function () {
  'use strict';

  const wishlistGrid = document.getElementById('wishlistGrid');
  const wishlistCountEl = document.getElementById('wishlistCount');
  const cartCountEl = document.getElementById('cartCount');

  /* ------------------ LOAD DATA ------------------ */
  function getWishlist() {
    return JSON.parse(localStorage.getItem('wishlist')) || [];
  }

  function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
  }

  /* ------------------ RENDER WISHLIST ------------------ */
  function renderWishlist() {
    const wishlist = getWishlist();
if (!wishlist.length) {
  wishlistGrid.innerHTML = `
    <div class="empty-wishlist">
      <p>Your wishlist is empty.</p>

      <button class="shop-now-btn" onclick="window.location.href='shop.html'">
        Shop Now
      </button>
    </div>
  `;

  updateCounters();
  return;
}


    wishlistGrid.innerHTML = wishlist.map(renderCard).join('');
    updateCounters();
  }

  function renderCard(p) {
    return `
      <div class="product-card" data-id="${p.id}">
        <div class="wishlist remove-wishlist" title="Remove"><i class="fa-solid fa-circle-xmark"></i></div>

        <div class="product-image">
          <img src="${p.image}" alt="${p.name}">
        </div>

        <div class="product-info">
          <h3>${p.name}</h3>
          <p class="price">$${p.price}</p>
        </div>

        <div class="product-actions">
          <button class="action-quick">Quick View</button>
          <button class="action-cart">Add to Cart</button>
        </div>
      </div>
    `;
  }

  /* ------------------ EVENTS (GLOBAL) ------------------ */
  document.addEventListener('click', function (e) {

    /* REMOVE FROM WISHLIST */
    const removeBtn = e.target.closest('.remove-wishlist');
    if (removeBtn) {
      const card = removeBtn.closest('.product-card');
      const id = Number(card.dataset.id);
      removeFromWishlist(id);
      return;
    }

    /* ADD TO CART */
    const cartBtn = e.target.closest('.action-cart');
    if (cartBtn) {
      const card = cartBtn.closest('.product-card');
      const id = Number(card.dataset.id);
      addToCart(id);
      return;
    }

    /* QUICK VIEW */
    const quickBtn = e.target.closest('.action-quick');
    if (quickBtn) {
      const card = quickBtn.closest('.product-card');
      const id = Number(card.dataset.id);
      window.location.href = `single-product.html?id=${id}`;
      return;
    }

  });

  /* ------------------ HELPERS ------------------ */
  function removeFromWishlist(id) {
    let wishlist = getWishlist();
    wishlist = wishlist.filter(item => item.id !== id);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    renderWishlist();
  }

 function addToCart(id) {
  const wishlist = getWishlist();
  const product = wishlist.find(p => p.id === id);
  if (!product) return;

  let cart = getCart();
  const idx = cart.findIndex(i => i.id === id);

  if (idx === -1) {
    cart.push({ ...product, qty: 1 });
  } else {
    cart[idx].qty += 1;
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCounters();
  showToast('Added to cart'); // ✅ TOAST
}

  function updateCounters() {
    wishlistCountEl.textContent = getWishlist().length;
    cartCountEl.textContent = getCart().reduce((s, i) => s + i.qty, 0);
  }

  document.addEventListener('DOMContentLoaded', renderWishlist);

})();

const toastEl = document.getElementById('toast');
let toastTimer = null;

function showToast(msg) {
  if (!toastEl) return;

  toastEl.textContent = msg;
  toastEl.style.display = 'block';  // 🔑 ADD THIS
  toastEl.style.opacity = '1';

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.style.opacity = '0';
    setTimeout(() => {
      toastEl.style.display = 'none'; // 🔑 ADD THIS
    }, 300);
  }, 1500);
}

const cartBtn = document.getElementById('cartBtn');

if (cartBtn) {
  cartBtn.addEventListener('click', function (e) {
    e.stopPropagation(); // 🔑 VERY IMPORTANT
    window.location.href = 'cart.html';
  });
}
