// shop-app.js (updated: auto-expand demo products so pagination shows)
(function () {
  'use strict';

  // demo product data - replace / extend with your real product list or server data
  let products = [
    { id: 1, title: 'Cotton T-shirt', price: 35.99, category: 'men', colors: ['blue','black'], tag: 'sale', img: './images/product-item_9.jpg.jpeg' },
    { id: 2, title: 'Pleated Skirt', price: 29.99, category: 'women', colors: ['red'], tag: 'new', img: './images/product-item_11.jpg.jpeg' },
    { id: 3, title: 'Denim Shorts', price: 63.99, category: 'men', colors: ['blue'], tag: '', img: './images/product-item_10.jpg.jpeg' },
    { id: 4, title: 'Yellow Shirt', price: 47.99, category: 'men', colors: ['yellow'], tag: '', img: './images/product-item_6.jpg.jpeg' },
    { id: 5, title: 'Blue Sweater', price: 38.99, category: 'women', colors: ['blue'], tag: 'new', img: './images/product-item_8.jpg.jpeg' },
    { id: 6, title: 'Style Handbag', price: 98.99, category: 'accessories', colors: ['black'], tag: 'sale', img: './images/product-item_13.jpg.jpeg' },
    // add more real items here...
  ];

  // ====== AUTO-EXPAND DEMO PRODUCTS FOR TESTING ======
  // If you have fewer than desired, clone items to reach `demoTargetCount` so pagination is visible.
  (function expandDemoIfNeeded() {
    const demoTargetCount = 24; // choose 20, 24, 30 — whatever you want for testing
    if (products.length > 0 && products.length < demoTargetCount) {
      const base = products.slice(0); // copy
      let nextId = Math.max(...products.map(p => p.id)) + 1;
      for (let i = products.length; i < demoTargetCount; i++) {
        const src = base[i % base.length];
        const clone = Object.assign({}, src, {
          id: nextId++,
          title: src.title + ' ' + (i + 1), // make title unique so you can see different cards
        });
        products.push(clone);
      }
    }
  })();
  // ===================================================

  // simple state
  const state = {
    productsPerPage: 6, // <-- change to 6 / 8 / 9 / 12 depending on layout
    currentPage: 1,
    filters: {
      category: 'all',
      maxPrice: 200,
      colors: []
    },
    wishlist: JSON.parse(localStorage.getItem('wishlist') || '[]'),
    cart: JSON.parse(localStorage.getItem('cart') || '[]')
  };

  // DOM refs (ensure these IDs exist in your HTML)
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

  // init UI
  function init() {
    // set price max to max product price or 200 default
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

  function bindUI() {
    if (priceRange) {
      priceRange.addEventListener('input', function () {
        priceMaxLabel.textContent = '$' + this.value;
        state.filters.maxPrice = Number(this.value);
      });
    }

    if (applyBtn) {
      applyBtn.addEventListener('click', function () {
        const cat = document.querySelector('input[name="category"]:checked');
        state.filters.category = cat ? cat.value : 'all';
        const checkedColors = Array.from(document.querySelectorAll('.colors input[type="checkbox"]:checked')).map(i => i.value);
        state.filters.colors = checkedColors;
        state.currentPage = 1;
        render();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
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

    // product actions via delegation
    if (productGrid) {
      productGrid.addEventListener('click', function (e) {
        const card = e.target.closest('.product-card');
        if (!card) return;
        const pid = Number(card.dataset.id);

        if (e.target.closest('.wishlist') || e.target.closest('.btn-wishlist')) {
          toggleWishlist(pid);
          return;
        }
        if (e.target.closest('.action-cart')) {
          addToCart(pid);
          return;
        }
        if (e.target.closest('.action-quick')) {
          const url = 'single-product.html?id=' + pid;
          window.location.href = url;
          return;
        }
      });
    }
  }

  function render() {
    const filtered = products.filter(p => {
      if (state.filters.category && state.filters.category !== 'all' && p.category !== state.filters.category) return false;
      if (p.price > state.filters.maxPrice) return false;
      if (state.filters.colors.length && !state.filters.colors.some(c => p.colors.includes(c))) return false;
      return true;
    });

    const total = filtered.length;
    if (shownCountEl) shownCountEl.textContent = total;

    // pagination
    const perPage = state.productsPerPage;
    const pages = Math.max(1, Math.ceil(total / perPage));
    if (state.currentPage > pages) state.currentPage = pages;
    const start = (state.currentPage - 1) * perPage;
    const pageItems = filtered.slice(start, start + perPage);

    // render grid
    if (productGrid) productGrid.innerHTML = pageItems.map(p => renderCard(p)).join('');

    // pagination UI
    renderPagination(pages);
    refreshCardStates();
  }

  function renderCard(p) {
    const tagHtml = p.tag ? `<div class="tag ${p.tag === 'sale' ? 'sale' : 'new'}">${p.tag.toUpperCase()}</div>` : '';
    return `
      <div class="product-card" data-id="${p.id}">
        ${tagHtml}
        <div class="wishlist btn-wishlist" title="Add to wishlist"> ${isInWishlist(p.id) ? '♥' : '♡'} </div>

        <div class="product-image">
          <img src="${p.img}" alt="${escapeHtml(p.title)}">
        </div>

        <div class="product-info">
          <h3>${escapeHtml(p.title)}</h3>
          <p class="price">$${p.price.toFixed(2)}</p>
        </div>

        <div class="product-actions">
          <button class="action-quick" title="Quick view">Quick View</button>
          <button class="action-cart" title="Add to cart">Add to Cart</button>
        </div>
      </div>
    `;
  }

  function renderPagination(pages) {
    if (!paginationEl) return;
    if (pages <= 1) { paginationEl.innerHTML = ''; return; }
    let html = '';
    // show prev + numbered + next
    html += `<button class="page-btn" data-page="${Math.max(1, state.currentPage - 1)}">‹</button>`;
    for (let i = 1; i <= pages; i++) {
      html += `<button class="page-btn ${i === state.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    html += `<button class="page-btn" data-page="${Math.min(pages, state.currentPage + 1)}">›</button>`;
    paginationEl.innerHTML = html;

    Array.from(paginationEl.querySelectorAll('.page-btn')).forEach(btn => {
      btn.addEventListener('click', function () {
        state.currentPage = Number(this.dataset.page);
        render();
        window.scrollTo({ top: 200, behavior: 'smooth' });
      });
    });
  }

  // wishlist & cart helpers
  function isInWishlist(id) { return state.wishlist.indexOf(id) !== -1; }
  function isInCart(id) { return state.cart.indexOf(id) !== -1; }

  function toggleWishlist(id) {
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
    if (!isInCart(id)) {
      state.cart.push(id);
      showToast('Added to cart');
    } else {
      showToast('Item already in cart');
    }
    saveState();
    updateCounters();
    refreshCardStates();
  }

  function saveState() {
    localStorage.setItem('wishlist', JSON.stringify(state.wishlist));
    localStorage.setItem('cart', JSON.stringify(state.cart));
  }

  function updateCounters() {
    if (wishlistCountEl) wishlistCountEl.textContent = state.wishlist.length;
    if (cartCountEl) cartCountEl.textContent = state.cart.length;
  }

  function refreshCardStates() {
    if (!productGrid) return;
    Array.from(productGrid.querySelectorAll('.product-card')).forEach(card => {
      const id = Number(card.dataset.id);
      const w = card.querySelector('.wishlist');
      if (w) w.textContent = isInWishlist(id) ? '♥' : '♡';
    });
  }

  // toast
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
    return String(str).replace(/[&<>"']/g, function (m) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m];
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();


document.addEventListener("click", (e) => {
    if (e.target.classList.contains("wishlist")) {

        const card = e.target.closest(".product-card");

        const product = {
            id: card.dataset.id,
            name: card.querySelector("h3").innerText,
            price: card.querySelector(".price").innerText.replace("$", ""),
            image: card.querySelector("img").src
        };

        let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

        // prevent duplicates
        if (!wishlist.find(p => p.id === product.id)) {
            wishlist.push(product);
            localStorage.setItem("wishlist", JSON.stringify(wishlist));
        }

        updateWishlistBadge();
    }
});
