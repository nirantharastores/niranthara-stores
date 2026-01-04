const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const Order = require("../models/Order");
const sendWhatsAppMessage = require("../utils/sendWhatsapp");

// =======================================================
// CREATE ORDER (COD)
// =======================================================
router.post("/create", async (req, res) => {
  try {
    const { customerName, phone, address, items } = req.body;

    // 1. Basic Validation
    if (!customerName || !phone || !address || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: "Missing required fields or cart is empty" });
    }

    // 2. CLEAN PHONE NUMBER (+91, 0, or 10-digit handling)
    let cleanPhone = phone.trim().replace(/\D/g, ""); // Removes +, spaces, dashes

    if (cleanPhone.startsWith("0")) {
      cleanPhone = cleanPhone.substring(1); // Remove leading 0
    }

    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`; // Add 91 if it's just a 10-digit number
    }

    // 3. Fetch product details from DB
    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();

    if (!products.length) {
      return res.status(404).json({ success: false, error: "Products not found" });
    }

    let finalItems = [];
    let totalAmount = 0;

    // 4. Calculate Total and Build Final Item List
    items.forEach((cartItem) => {
      const product = products.find((p) => String(p._id) === cartItem.productId);
      if (!product) return;

      const entry = {
        productId: product._id,
        name: product.name,
        quantity: cartItem.quantity,
        price: product.price
      };

      finalItems.push(entry);
      totalAmount += product.price * cartItem.quantity;
    });

    // 5. Create order in Database
    const newOrder = await Order.create({
      customerName,
      phone: cleanPhone, // Save the cleaned number
      address,
      items: finalItems,
      totalAmount,
      paymentStatus: "pending"
    });

    // 6. Notify Admin on WhatsApp (Async)
    // We don't use 'await' here if we don't want to make the customer wait 
    // for the WhatsApp API response, but since it's an admin alert, 
    // it's safer to keep it in a try-catch block.
    try {
      await sendWhatsAppMessage({
        customerName,
        phone: cleanPhone,
        address,
        items: finalItems,
        totalAmount
      });
    } catch (wsErr) {
      console.error("WhatsApp Alert Failed:", wsErr.message);
    }

    return res.status(201).json({ 
      success: true, 
      orderId: newOrder._id 
    });

  } catch (err) {
    console.error("Order Create Error:", err);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// =======================================================
// GET ALL ORDERS (For Admin Panel)
// =======================================================
router.get("/all", async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, orders });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
});

router.patch("/update-status/:id", async (req, res) => {
  try {
    const { status } = req.body; // e.g., "shipped", "delivered", "cancelled"
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, error: "Order not found" });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: "Update failed" });
  }
});

module.exports = router;