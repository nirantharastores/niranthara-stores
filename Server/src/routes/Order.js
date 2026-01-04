const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const Order = require("../models/Order");
// Import both functions from your updated helper
const { sendWhatsAppMessage, sendOTPMessage } = require("../utils/sendWhatsapp");

// Temporary in-memory storage for OTPs
const pendingOTPs = {}; 

// =======================================================
// 1. SEND OTP ROUTE
// =======================================================
router.post("/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, error: "Phone required" });

    // --- YOUR PHONE CLEANING LOGIC ---
    let cleanPhone = phone.trim().replace(/\D/g, ""); 
    if (cleanPhone.startsWith("0")) cleanPhone = cleanPhone.substring(1);
    if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Store OTP against the cleaned phone number
    pendingOTPs[cleanPhone] = otp;

    // Send via WhatsApp helper
    await sendOTPMessage(cleanPhone, otp);

    console.log(`DEBUG: OTP ${otp} sent to ${cleanPhone}`); // For terminal testing
    return res.json({ success: true, message: "OTP Sent successfully" });

  } catch (err) {
    console.error("Send OTP Error:", err);
    return res.status(500).json({ success: false, error: "Failed to send OTP" });
  }
});

// =======================================================
// 2. VERIFY OTP & CREATE ORDER (Updated Logic)
// =======================================================
router.post("/verify-and-create", async (req, res) => {
  try {
    const { customerName, phone, address, items, otp } = req.body;

    // 1. Basic Validation
    if (!customerName || !phone || !address || !Array.isArray(items) || items.length === 0 || !otp) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // 2. CLEAN PHONE NUMBER (to match stored OTP key)
    let cleanPhone = phone.trim().replace(/\D/g, ""); 
    if (cleanPhone.startsWith("0")) cleanPhone = cleanPhone.substring(1);
    if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;

    // 3. VERIFY OTP
    if (!pendingOTPs[cleanPhone] || pendingOTPs[cleanPhone] !== otp) {
      return res.status(401).json({ success: false, error: "Invalid or expired OTP" });
    }

    // 4. Fetch product details from DB
    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();

    if (!products.length) {
      return res.status(404).json({ success: false, error: "Products not found" });
    }

    let finalItems = [];
    let totalAmount = 0;

    // 5. Calculate Total and Build Final Item List
    items.forEach((cartItem) => {
      const product = products.find((p) => String(p._id) === cartItem.productId);
      if (!product) return;

      finalItems.push({
        productId: product._id,
        name: product.name,
        quantity: cartItem.quantity,
        price: product.price
      });
      totalAmount += product.price * cartItem.quantity;
    });

    // 6. Create order in Database
    const newOrder = await Order.create({
      customerName,
      phone: cleanPhone,
      address,
      items: finalItems,
      totalAmount,
      paymentStatus: "pending"
    });

    // 7. Notify Admin & Customer on WhatsApp (Async)
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

    // 8. Success: Clear the used OTP and respond
    delete pendingOTPs[cleanPhone];
    return res.status(201).json({ 
      success: true, 
      orderId: newOrder._id 
    });

  } catch (err) {
    console.error("Order Creation Error:", err);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// =======================================================
// GET ALL ORDERS (Unchanged)
// =======================================================
router.get("/all", async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, orders });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
});

// =======================================================
// UPDATE STATUS (Unchanged)
// =======================================================
router.patch("/update-status/:id", async (req, res) => {
  try {
    const { status } = req.body;
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