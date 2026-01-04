const API = "http://localhost:4000/api"; 

let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let productsCache = [];
let currentCategory = 'all';

async function loadProducts() {
    try {
        const res = await fetch(`${API}/products`);
        if (!res.ok) throw new Error(`Server Error: ${res.status}`);
        productsCache = await res.json();
        renderUI();
    } catch (err) {
        console.error("Failed to load products:", err);
        document.getElementById("products").innerHTML = `<p style="color:red; text-align:center;">Connection failed.</p>`;
    }
}

window.filterProducts = function (category) {
    currentCategory = category;
    document.querySelectorAll('.cat-btn').forEach(btn => {
        const text = btn.innerText.trim().toLowerCase();
        btn.classList.toggle('active', text === category.toLowerCase() || (category === 'all' && text === 'all'));
    });
    renderUI();
};

function renderUI() {
    const itemsToDisplay = currentCategory === 'all'
        ? productsCache
        : productsCache.filter(p => p.category === currentCategory);
    renderProductList(itemsToDisplay);
    updateCartDisplay();
}

function renderProductList(items) {
    const container = document.getElementById("products");
    if (!container) return;
    
    if (items.length === 0) {
        container.innerHTML = `<p style="padding:20px; text-align:center;">No products found.</p>`;
        return;
    }

    container.innerHTML = items.map(p => {
        const cartItem = cart.find(item => item.productId === p._id);
        const qty = cartItem ? cartItem.quantity : 0;
        const available = p.isAvailable !== false; 

        return `
            <div class="product-card ${!available ? 'unavailable' : ''}">
                <div class="product-row">
                    <div class="product-main">
                        <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/80?text=No+Image'">
                        <div class="product-info">
                            <h3>${p.name}</h3>
                            <p>${p.description || ''}</p>
                        </div>
                    </div>
                    <div class="product-action">
                        <span class="price">₹${p.price}</span>
                        ${!available ? 
                            `<div class="sold-out-btn">Sold Out</div>` : 
                            (qty > 0 ? `
                                <div class="qty-group">
                                    <button class="qty-btn" onclick="window.updateQuantity('${p._id}', -1)">-</button>
                                    <span style="font-weight:bold;">${qty}</span>
                                    <button class="qty-btn" onclick="window.updateQuantity('${p._id}', 1)">+</button>
                                </div>
                            ` : `<button class="add-btn" onclick="window.updateQuantity('${p._id}', 1)">Add</button>`)
                        }
                    </div>
                </div>
            </div>`;
    }).join("");
}

window.updateQuantity = function (id, change) {
    // Check if product is available before allowing add
    const product = productsCache.find(p => p._id === id);
    if (product && product.isAvailable === false && change > 0) return;

    const index = cart.findIndex(item => item.productId === id);
    if (index > -1) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) cart.splice(index, 1);
    } else if (change > 0) {
        cart.push({ productId: id, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    renderUI();
};

window.removeFromCart = function(id) {
    cart = cart.filter(item => item.productId !== id);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderUI();
};

function updateCartDisplay() {
    const itemsEl = document.getElementById("cart-items");
    const countEl = document.getElementById("cart-count");
    const totalEl = document.getElementById("cart-total");
    
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (countEl) countEl.innerText = totalQty;

    let grandTotal = 0;
    if (itemsEl) {
        if (cart.length === 0) {
            itemsEl.innerHTML = `<p style="color:#888; text-align:center; margin-top:20px;">Your basket is empty</p>`;
        } else {
            itemsEl.innerHTML = cart.map(item => {
                const p = productsCache.find(x => x._id === item.productId);
                if (!p) return "";
                grandTotal += p.price * item.quantity;
                return `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <div style="flex:1;">
                            <div style="font-weight:600; font-size:14px;">${p.name}</div>
                            <div style="font-size:12px; color:#666;">₹${p.price} x ${item.quantity}</div>
                        </div>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <div style="font-weight:700;">₹${p.price * item.quantity}</div>
                            <button onclick="window.removeFromCart('${p._id}')" style="background:none; border:none; color:red; cursor:pointer; font-size:18px;">&times;</button>
                        </div>
                    </div>`;
            }).join("");
        }
    }
    if (totalEl) totalEl.innerText = grandTotal;
}

window.handleSearch = function(query) {
    const term = query.toLowerCase();
    const filtered = productsCache.filter(p => p.name.toLowerCase().includes(term));
    renderProductList(filtered);
};

window.toggleCart = function () {
    document.getElementById("cart-panel").classList.toggle("active");
    document.body.classList.toggle("cart-open");
};

window.placeOrder = async function () {
    const name = document.getElementById("input-name").value;
    const phone = document.getElementById("input-mobile").value;
    const address = document.getElementById("input-address").value;

    if (!name || !phone || !address || cart.length === 0) return alert("Please complete form and add items.");

    try {
        const res = await fetch(`${API}/orders/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customerName: name, phone, address, items: cart })
        });
        if ((await res.json()).success) {
            alert("Order Success!");
            cart = []; localStorage.removeItem("cart"); window.location.reload();
        }
    } catch (err) { alert("Error placing order."); }
};

loadProducts();