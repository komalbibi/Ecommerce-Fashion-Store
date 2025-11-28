/*
  promo-view-more.js (multi-button version)
  Applies loader -> navigate behavior to all matching buttons.

  Usage:
    - Buttons: <button class="view-more" data-target="shop.html" data-duration="3500">View All</button>
    - Optionally call initPromoViewMore({ selector: '.view-more', loaderId: 'promo-loader', defaultTarget: 'shop.html', defaultDuration: 3500 })
*/

(function () {
  'use strict';

  function initPromoViewMore(opts) {
    opts = opts || {};

    var selector = opts.selector || '.view-more';
    var loaderId = opts.loaderId || 'promo-loader';
    var defaultTarget = opts.defaultTarget || 'shop.html';
    var defaultDuration = typeof opts.defaultDuration === 'number' ? opts.defaultDuration : 3500;

    // find all matching buttons
    var buttons = Array.prototype.slice.call(document.querySelectorAll(selector));

    if (!buttons.length) {
      // nothing to wire up
      return;
    }

    // find or create a single loader element
    var loader = document.getElementById(loaderId);
    if (!loader) {
      loader = document.createElement('div');
      loader.id = loaderId;
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

    // Handler for a single button click
    function onClickHandler(e) {
      e.preventDefault();
      var btn = e.currentTarget;

      // read data attributes for customisation
      var target = btn.getAttribute('data-target') || btn.getAttribute('href') || defaultTarget;
      var durationAttr = btn.getAttribute('data-duration');
      var duration = durationAttr ? parseInt(durationAttr, 10) : defaultDuration;

      // clamp duration to sensible range (500ms - 10000ms)
      if (isNaN(duration) || duration < 0) duration = defaultDuration;
      duration = Math.max(500, Math.min(10000, duration));

      // Disable the clicked button to avoid double clicks
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
          console.error('Navigation failed:', err);
        }
      }, duration);
    }

    // Attach event listeners (ensure duplicates are not attached)
    buttons.forEach(function (b) {
      // remove previous listener marker if exists to prevent duplicates
      if (!b.__promoViewMoreBound) {
        b.addEventListener('click', onClickHandler, false);
        b.__promoViewMoreBound = true; // flag to avoid duplicate binding
      }
    });
  }

  // Auto init on DOMContentLoaded with default selector if any .view-more exists
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
