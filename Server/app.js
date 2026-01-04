require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");

const productsRoutes = require("./src/routes/products");
const ordersRoutes = require("./src/routes/Order");
const adminRoutes = require("./src/routes/admin");
const app = express();

// 1. MIDDLEWARE
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors());
app.use(express.json());

// 2. PATH SETUP (Critical for Render)
// This points to the 'client' folder sitting outside the 'server' folder
const clientPath = path.resolve(__dirname, "..", "Client");

// 3. SERVE STATIC FILES
app.use(express.static(clientPath));

// 4. API ROUTES
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/admin", adminRoutes);

// 5. PAGE ROUTES
app.get('/admin', (req, res) => {
  res.sendFile(path.join(clientPath, 'admin-login.html'));
});

// Main shop page & Catch-all
app.get('*', (req, res) => {
  console.log("index.html path", path.join(clientPath, 'index.html'))
  res.sendFile(path.join(clientPath, 'index.html'));
});

// 6. DATABASE & START
const PORT = process.env.PORT || 4000; // Render will provide the PORT automatically

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`🚀 Niranthara Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error("❌ DB Error:", err));