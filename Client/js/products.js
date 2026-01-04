console.log("📦 products.js loaded");

const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:4000/api"
    : "/api";

// Load products for products.html UI
async function loadProductsUI() {

  const productContainer = document.getElementById("products");

  // Show a loading message
  productContainer.innerHTML = "<p style='text-align:center; color:#555;'>Loading products...</p>";

  try {
    const res = await fetch(`${API}/products`);

    if (!res.ok) {
      productContainer.innerHTML =
        "<p style='color:red; text-align:center;'>Failed to load products.</p>";
      return;
    }

    const products = await res.json();

    if (!products.length) {
      productContainer.innerHTML =
        "<p style='text-align:center; color:#777;'>No products available.</p>";
      return;
    }

    // Render grid
    productContainer.innerHTML = products
      .map((p) => {
        return `
        <div class="product-card">
          <img src="${p.image || 'https://via.placeholder.com/200'}" alt="${p.name || "Product"}">

          <h4>${p.name || "Unnamed Product"}</h4>

          <p>${p.description || "No description available."}</p>

          <p class="price">₹${p.price || 0}</p>

          <button onclick="addToCart('${p._id}')">
            Add to Cart
          </button>
        </div>
      `;
      })
      .join("");

    console.log("✅ Products loaded successfully");

  } catch (err) {
    console.error("🔥 Error loading products:", err);
    productContainer.innerHTML =
      "<p style='color:red; text-align:center;'>Server error. Please try again.</p>";
  }
}

loadProductsUI();
