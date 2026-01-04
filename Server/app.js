require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// ROUTES
const productsRoutes = require("./src/routes/products");
const ordersRoutes = require("./src/routes/Order");
const adminRoutes = require("./src/routes/admin");

const app = express();

// 1. GLOBAL MIDDLEWARE
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------
// 2. API ROUTES (MOVED UP - THIS IS THE CRITICAL CHANGE)
// ---------------------------------------------------------
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/admin", adminRoutes);


// ---------------------------------------------------------
// 3. STATIC FILES & PAGE ROUTES (MOVED DOWN)
// ---------------------------------------------------------
app.use(express.static(path.join(__dirname, '../client')));

// Page Routes
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/admin-login.html'));
});

// Main shop page (Catch-all for root)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});


// 4. GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
});

// 5. DATABASE & SERVER START
const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 Admin Login: http://localhost:${PORT}/admin`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
  });