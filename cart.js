// Get cart from localStorage or start empty
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Save cart to localStorage and re-render
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
    updateTotal();
    updateCartBadge();
}

// Add item to cart
// function addToCart(product) {
//     console.log("addToCart RECEIVED:", product);

//     const exists = cart.find(item => item.id === product.id);

//     if (exists) {
//         exists.qty++;
//     } else {
//   cart.push({
//     id: product.id,
//     title: product.title ?? product.name ?? "Unnamed Item",
//     price: Number(product.price),
//     image: product.image ?? product.img ?? "./images/placeholder.png",
//     qty: 1
// });


//     }

//     saveCart();
// }

// Render cart items
function renderCart() {
    const container = document.getElementById("cartItems");

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty.</p>
                <a href="shop.html" class="continue-btn">Continue Shopping</a>
            </div>
        `;
        return;
    }

    let html = "";

    cart.forEach(item => {
        html += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}" class="cart-img">

                <div class="cart-details">
                   <h3 class="cart-title">${item.name}</h3>
                    <p class="cart-price">$${Number(item.price).toFixed(2)}</p>

                    <div class="qty-controls">
                        <button onclick="decreaseQty(${item.id})">-</button>
                        <span>${item.qty}</span>
                        <button onclick="increaseQty(${item.id})">+</button>
                    </div>
                </div>

                <button class="remove-btn" onclick="removeItem(${item.id})">x</button>
            </div>
        `;
    });

    container.innerHTML = html;
}


// Increase quantity
function increaseQty(id) {
    const item = cart.find(i => i.id === id);
    if (item) item.qty++;
    saveCart();
}

// Decrease quantity
function decreaseQty(id) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    if (item.qty > 1) {
        item.qty--;
    } else {
        cart = cart.filter(i => i.id !== id);
    }
    saveCart();
}

// Remove item completely
function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
}

// Update total price
function updateTotal() {
  const DELIVERY_CHARGE = 16;

  // 1️⃣ Order price (items only)
  const orderPrice = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  // 2️⃣ Final total
  const total = orderPrice + DELIVERY_CHARGE;

  // 3️⃣ Update UI
  const orderPriceEl = document.getElementById("orderPrice");
  const totalPriceEl = document.getElementById("totalPrice");

  if (orderPriceEl) {
    orderPriceEl.textContent = `$${orderPrice.toFixed(2)}`;
  }

  if (totalPriceEl) {
    totalPriceEl.textContent = `$${total.toFixed(2)}`;
  }
}

// Update cart count badge
function updateCartBadge() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById("cartCount").textContent = count;
}

// Initial render
renderCart();
updateTotal();
updateCartBadge();
