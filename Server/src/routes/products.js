const express = require("express");
const router = express.Router();
const Product = require("../models/product");

// -------------------------------------------------------------
// 1. GET ALL PRODUCTS (FOR ADMIN) - MUST BE ABOVE /:slug
// -------------------------------------------------------------
router.get("/all", async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------------------------------------------------
// 2. GET AVAILABLE PRODUCTS (FOR MAIN SHOP)
// -------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    // Note: Changed 'available: true' to match your app.js logic 'isAvailable: true'
    let products = await Product.find({ isAvailable: true }).lean();
    products = products.map((p) => {
      const filename = p.image ? p.image.split("/").pop() : "placeholder.png";
      return {
        ...p,
        image: `assets/images/${filename}`
      };
    });

    res.json(products);
  } catch (err) {
    console.error("Product Fetch Error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch products" });
  }
});

// -------------------------------------------------------------
// 3. GET PRODUCT BY SLUG (KEEP THIS AT THE BOTTOM)
// -------------------------------------------------------------
router.get("/:slug", async (req, res) => {
  try {
    let p = await Product.findOne({ slug: req.params.slug });

    if (!p) return res.status(404).json({ success: false, message: "Product not found" });

    const filename = p.image ? p.image.split("/").pop() : "placeholder.png";
    const productData = p.toObject();
    productData.image = `assets/images/${filename}`;

    res.json(productData);
  } catch (err) {
    console.error("Single Product Error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch product" });
  }
});

// -------------------------------------------------------------
// 4. SEED ROUTE (Optional testing)
// -------------------------------------------------------------
router.post("/seed", async (req, res) => {
  try {
    const data = req.body.products;
    if (!Array.isArray(data)) {
      return res.status(400).json({ success: false, error: "products must be array" });
    }
    await Product.deleteMany({});
    const created = await Product.insertMany(data);
    return res.json({ success: true, products: created });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to seed products" });
  }
});

module.exports = router;