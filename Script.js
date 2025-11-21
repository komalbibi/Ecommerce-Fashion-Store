
/*
  promo-view-more.js
  Standalone script to show loader for a configurable duration, then navigate.
  Usage:
    - Button: <button id="view-more-btn" data-target="shop.html" data-duration="3500">View All Collections</button>
    - Loader overlay must exist with id "promo-loader"
    - Default target: 'shop.html'
    - Default duration: 3500 ms
*/

(function () {
  'use strict';

  function initPromoViewMore(opts) {
    var btn = document.getElementById(opts.buttonId || 'view-more-btn');
    var loader = document.getElementById(opts.loaderId || 'promo-loader');

    if (!btn) {
      // nothing to wire up
      return;
    }
    // fallback if loader not present: create a simple fullscreen loader
    if (!loader) {
      loader = document.createElement('div');
      loader.id = opts.loaderId || 'promo-loader';
      loader.className = 'promo-loader';
      loader.setAttribute('aria-hidden', 'true');
      loader.innerHTML = '<div class="spinner" role="status" aria-label="Loading"></div><div class="loader-text">Loading...</div>';
      document.body.appendChild(loader);
    }

    function showLoader() {
      loader.classList.add('active');
      loader.setAttribute('aria-hidden', 'false');
    }
    function hideLoader() {
      loader.classList.remove('active');
      loader.setAttribute('aria-hidden', 'true');
    }

    btn.addEventListener('click', function (e) {
      e.preventDefault();

      // read data attributes for customisation
      var target = btn.getAttribute('data-target') || btn.getAttribute('href') || opts.defaultTarget || 'shop.html';
      var durationAttr = btn.getAttribute('data-duration');
      var duration = durationAttr ? parseInt(durationAttr, 10) : (opts.defaultDuration || 3500);

      // clamp duration to sensible range (500ms - 10000ms)
      if (isNaN(duration) || duration < 0) duration = opts.defaultDuration || 3500;
      duration = Math.max(500, Math.min(10000, duration));

      // Disable button to avoid double clicks
      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');

      // show loader
      showLoader();

      // set a timeout and then navigate
      setTimeout(function () {
        // hide loader in case navigation is prevented
        hideLoader();
        btn.disabled = false;
        btn.removeAttribute('aria-disabled');

        // perform navigation
        try {
          window.location.href = target;
        } catch (err) {
          // fallback: if location fails, remove loader and restore button
          console.error('Navigation failed:', err);
        }
      }, duration);
    }, false);
  }

  // Auto init on DOMContentLoaded with default IDs
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initPromoViewMore({});
    });
  } else {
    initPromoViewMore({});
  }

  // Expose initializer for manual setup if needed:
  window.initPromoViewMore = initPromoViewMore;

})();


