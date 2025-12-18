document.addEventListener("DOMContentLoaded", () => {
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    const wishlistGrid = document.getElementById("wishlistGrid");

    if (wishlist.length === 0) {
        wishlistGrid.innerHTML = `
            <p class="empty">Your wishlist is empty 😔</p>
            
          `;
        return;
    }

    // Render items using SAME DESIGN from shop page
    wishlistGrid.innerHTML = wishlist.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <span class="quick-view">Quick View</span>
            </div>

            <div class="product-details">
                <h4>${product.name}</h4>
                <p class="price">$${product.price}</p>

                <div class="product-actions">
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                    <button class="remove-wishlist" data-id="${product.id}">Remove</button>
                </div>
            </div>
        </div>
    `).join("");

    // remove from wishlist
    wishlistGrid.addEventListener("click", e => {
        if (e.target.classList.contains("remove-wishlist")) {
            const id = e.target.dataset.id;

            wishlist = wishlist.filter(p => p.id != id);
            localStorage.setItem("wishlist", JSON.stringify(wishlist));
            location.reload();
        }
    });
});
