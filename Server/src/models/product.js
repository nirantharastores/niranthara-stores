const mongoose = require("mongoose");
const slugify = require("slugify");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  slug: {
    type: String,
    required: true,
    unique: true
  },

  price: {
    type: Number,
    required: true,
    min: [1, "Price must be at least 1"]
  },

  description: {
    type: String,
    default: ""
  },

  // ONLY store filename: "idly.png"
  image: {
    type: String,
    default: ""
  },
  category: { type: String, required: true, default: "Batters" },

  isAvailable: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// --------------------------------------------
// AUTO-GENERATE SLUG BEFORE SAVE
// --------------------------------------------
ProductSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true
    });
  }
  next();
});

module.exports = mongoose.model("Product", ProductSchema);
