// shop-app.js (cleaned & fixed)
(function () {
  'use strict';

  // Demo products (replace with your own)
  const products = [
    { id: 1, name: "Ladies cross body bag", price: 50, image: "./shop-images/product-item_1.jpg.jpeg" },
    { id: 2, name: "Product 2", price: 60, image: "./shop-images/product-item_2.jpg.jpeg" },
    { id: 3, name: "Product 3", price: 70, image: "./shop-images/product-item_3.jpg.jpeg" },
    { id: 4, name: "Product 4", price: 55, image: "./shop-images/product-item_4.jpg.jpeg" },
    { id: 5, name: "Product 5", price: 65, image: "./shop-images/product-item_5.jpg.jpeg" },
    { id: 6, name: "Product 6", price: 45, image: "./shop-images/product-item_6.jpg.jpeg" },
    { id: 7, name: "Product 7", price: 80, image: "./shop-images/product-item_7.jpg.jpeg" },
    { id: 8, name: "Product 8", price: 75, image: "./shop-images/product-item_8.jpg.jpeg" },
    { id: 9, name: "Product 9", price: 40, image: "./shop-images/product-item_9.jpg.jpeg" },
    { id: 10, name: "Product 10", price: 95, image: "./shop-images/product-item_10.jpg.jpeg" },
    { id: 11, name: "Product 11", price: 85, image: "./shop-images/product-item_11.jpg.jpeg" },
    { id: 12, name: "Product 12", price: 90, image: "./shop-images/product-item_12.jpg.jpeg" }
  ];

  // Auto-expand demo products if needed
  (function expandDemoIfNeeded() {
    const demoTargetCount = 24;
    if (products.length > 0 && products.length < demoTargetCount) {
      const base = products.slice(0);
      let nextId = Math.max(...products.map(p => p.id)) + 1;
      for (let i = products.length; i < demoTargetCount; i++) {
        const src = base[i % base.length];
        const clone = { ...src, id: nextId++, name: src.name + ' ' + (i + 1) };
        products.push(clone);
      }
    }
  })();

  // State
  const state = {
    productsPerPage: 6,
    currentPage: 1,
    filters: { category: 'all', maxPrice: 200, colors: [] },
    wishlist: JSON.parse(localStorage.getItem('wishlist') || '[]').map(x => Number(x.id) || x),
    cart: JSON.parse(localStorage.getItem('cart') || '[]').map(x => Number(x.id) || x)
  };

  // DOM refs
  const productGrid = document.getElementById('productGrid');
  const paginationEl = document.getElementById('pagination');
  const shownCountEl = document.getElementById('shownCount');
  const wishlistCountEl = document.getElementById('wishlistCount');
  const cartCountEl = document.getElementById('cartCount');
  const priceRange = document.getElementById('priceRange');
  const priceMinLabel = document.getElementById('priceMinLabel');
  const priceMaxLabel = document.getElementById('priceMaxLabel');
  const applyBtn = document.getElementById('applyFilters');
  const resetBtn = document.getElementById('resetFilters');
  const toastEl = document.getElementById('toast');

  // Initialize
  function init() {
    const maxPrice = Math.max(...products.map(p => p.price), 200);
    if (priceRange) {
      priceRange.max = Math.ceil(maxPrice);
      priceRange.value = Math.ceil(maxPrice);
      state.filters.maxPrice = Math.ceil(maxPrice);
      priceMaxLabel.textContent = '$' + Math.ceil(maxPrice);
      priceMinLabel.textContent = '$0';
    }

    bindUI();
    render();
    updateCounters();
  }

  // Bind UI events
  function bindUI() {
    if (priceRange) {
      priceRange.addEventListener('input', () => {
        priceMaxLabel.textContent = '$' + priceRange.value;
        state.filters.maxPrice = Number(priceRange.value);
      });
    }

    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const cat = document.querySelector('input[name="category"]:checked');
        state.filters.category = cat ? cat.value : 'all';
        const checkedColors = Array.from(document.querySelectorAll('.colors input[type="checkbox"]:checked')).map(i => i.value);
        state.filters.colors = checkedColors;
        state.currentPage = 1;
        render();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const allCat = document.querySelector('input[name="category"][value="all"]');
        if (allCat) allCat.checked = true;
        Array.from(document.querySelectorAll('.colors input[type="checkbox"]')).forEach(i => i.checked = false);
        if (priceRange) {
          priceRange.value = priceRange.max;
          priceMaxLabel.textContent = '$' + priceRange.value;
        }
        state.filters = { category: 'all', maxPrice: Number(priceRange ? priceRange.value : 200), colors: [] };
        state.currentPage = 1;
        render();
      });
    }

    // Delegate product clicks
    if (productGrid) {
      productGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        if (!card) return;
        const pid = Number(card.dataset.id);

        if (e.target.closest('.btn-wishlist') || e.target.closest('.wishlist')) {
          toggleWishlist(pid);
          return;
        }

        if (e.target.closest('.action-cart')) {
          addToCart(pid);
          return;
        }

        if (e.target.closest('.action-quick')) {
          window.location.href = 'single-product.html?id=' + pid;
          return;
        }
      });
    }
  }

  // Render product grid
  function render() {
    const filtered = products.filter(p => {
      if (state.filters.category !== 'all' && p.category !== state.filters.category) return false;
      if (p.price > state.filters.maxPrice) return false;
      if (state.filters.colors.length && (!p.colors || !state.filters.colors.some(c => p.colors.includes(c)))) return false;
      return true;
    });

    const total = filtered.length;
    if (shownCountEl) shownCountEl.textContent = total;

    const perPage = state.productsPerPage;
    const pages = Math.max(1, Math.ceil(total / perPage));
    if (state.currentPage > pages) state.currentPage = pages;

    const start = (state.currentPage - 1) * perPage;
    const pageItems = filtered.slice(start, start + perPage);

    if (productGrid) productGrid.innerHTML = pageItems.map(renderCard).join('');
    renderPagination(pages);
    refreshCardStates();
  }

  function renderCard(p) {
    const tagHtml = p.tag ? `<div class="tag ${p.tag === 'sale' ? 'sale' : 'new'}">${String(p.tag).toUpperCase()}</div>` : '';
    return `
      <div class="product-card" data-id="${p.id}">
        ${tagHtml}
        <div class="wishlist btn-wishlist" title="Add to wishlist">${isInWishlist(p.id) ? '♥' : '♡'}</div>
        <div class="product-image">
          <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}">
        </div>
        <div class="product-info">
          <h3>${escapeHtml(p.name)}</h3>
          <p class="price">$${Number(p.price).toFixed(2)}</p>
        </div>
        <div class="product-actions">
          <button class="action-quick" title="Quick view">Quick View</button>
          <button class="action-cart" title="Add to cart">Add to Cart</button>
        </div>
      </div>
    `;
  }

  // Pagination
  function renderPagination(pages) {
    if (!paginationEl) return;
    if (pages <= 1) { paginationEl.innerHTML = ''; return; }
    let html = `<button class="page-btn" data-page="${Math.max(1, state.currentPage - 1)}">‹</button>`;
    for (let i = 1; i <= pages; i++) {
      html += `<button class="page-btn ${i === state.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    html += `<button class="page-btn" data-page="${Math.min(pages, state.currentPage + 1)}">›</button>`;
    paginationEl.innerHTML = html;

    Array.from(paginationEl.querySelectorAll('.page-btn')).forEach(btn => {
      btn.addEventListener('click', () => {
        state.currentPage = Number(btn.dataset.page);
        render();
        window.scrollTo({ top: 200, behavior: 'smooth' });
      });
    });
  }

  // Wishlist & cart helpers
  function isInWishlist(id) { return state.wishlist.includes(Number(id)); }
  function isInCart(id) { return state.cart.includes(Number(id)); }

  function toggleWishlist(id) {
    id = Number(id);
    if (isInWishlist(id)) {
      state.wishlist = state.wishlist.filter(x => x !== id);
      showToast('Removed from wishlist');
    } else {
      state.wishlist.push(id);
      showToast('Added to wishlist');
    }
    saveState();
    updateCounters();
    refreshCardStates();
  }

  function addToCart(id) {
    id = Number(id);
    const product = products.find(p => p.id === id);
    if (!product) return;

    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const idx = cartItems.findIndex(i => Number(i.id) === id);
    if (idx === -1) {
      cartItems.push({ ...product, qty: 1 });
    } else {
      cartItems[idx].qty = (cartItems[idx].qty || 1) + 1;
    }

    localStorage.setItem('cart', JSON.stringify(cartItems));
    state.cart = cartItems.map(x => Number(x.id));
    updateCounters();
    showToast('Added to cart');
  }

  function saveState() {
    localStorage.setItem('wishlist', JSON.stringify(state.wishlist.map(id => ({ id }))));
    localStorage.setItem('cart', JSON.stringify(JSON.parse(localStorage.getItem('cart') || '[]')));
  }

  function updateCounters() {
    const wishlistItems = JSON.parse(localStorage.getItem('wishlist')) || [];
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    if (wishlistCountEl) wishlistCountEl.textContent = wishlistItems.length;
    if (cartCountEl) cartCountEl.textContent = cartItems.reduce((s, i) => s + (i.qty || 1), 0);
  }

  function refreshCardStates() {
    if (!productGrid) return;
    Array.from(productGrid.querySelectorAll('.product-card')).forEach(card => {
      const id = Number(card.dataset.id);
      const w = card.querySelector('.wishlist');
      if (w) w.textContent = isInWishlist(id) ? '♥' : '♡';
    });
  }

  // Toast
  let toastTimer = null;
  function showToast(msg, ms = 1600) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.style.display = 'block';
    toastEl.style.opacity = '1';
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.style.opacity = '0';
      setTimeout(() => toastEl.style.display = 'none', 250);
    }, ms);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]);
  }

  document.addEventListener('DOMContentLoaded', init);

})();
