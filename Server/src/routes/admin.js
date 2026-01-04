const express = require("express");
const router = express.Router();
const Product = require("../models/product"); // Ensure path is correct

// ADMIN LOGIN (Checks against .env)
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return res.json({ success: true });
  }
  
  return res.status(401).json({ success: false, message: "Invalid Credentials" });
});

// TOGGLE PRODUCT AVAILABILITY
router.patch("/product-status/:id", async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { isAvailable },
      { new: true }
    );
    res.json({ success: true, product: updatedProduct });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;