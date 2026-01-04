require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet"); // Security headers
const compression = require("compression"); // Gzip compression

// ROUTES
const productsRoutes = require("./src/routes/products");
const ordersRoutes = require("./src/routes/Order");
const adminRoutes = require("./src/routes/admin");

const app = express();

// 1. GLOBAL MIDDLEWARE
app.use(helmet({
  contentSecurityPolicy: false, // Set to false if you're loading external scripts/images
}));
app.use(compression()); // Compresses responses for faster loading
app.use(cors({
  origin: "*", // In production, replace "*" with your actual domain link
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------
// 2. API ROUTES
// ---------------------------------------------------------
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/admin", adminRoutes);

// ---------------------------------------------------------
// 3. STATIC FILES & PAGE ROUTES
// ---------------------------------------------------------
// Serve all files from the 'client' folder
app.use(express.static(path.join(__dirname, '../client')));

// Specific route for Admin Login
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/admin-login.html'));
});

// Main shop page (Catch-all for root)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// CATCH-ALL ROUTE (Critical for production)
// This ensures that if a user refreshes a sub-page, it doesn't crash
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// ---------------------------------------------------------
// 4. GLOBAL ERROR HANDLER
// ---------------------------------------------------------
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err.stack);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? "Internal server error" : err.message
  });
});

// ---------------------------------------------------------
// 5. DATABASE & SERVER START
// ---------------------------------------------------------
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("❌ Error: MONGODB_URI is not defined in environment variables.");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Niranthara Stores Server is Live!`);
      console.log(`🔗 Port: ${PORT}`);
      console.log(`🔗 Production Mode: ${process.env.NODE_ENV === 'production'}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });