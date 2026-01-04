const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  name: {
    type: String,
    required: true
  },

  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"]
  },

  price: {
    type: Number,
    required: true,
    min: [1, "Price must be at least 1"]
  }
});

const OrderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true
    },

    address: {
      type: String,
      required: true
    },

    items: {
      type: [OrderItemSchema],
      required: true
    },

    totalAmount: {
      type: Number,
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending"
    },

    stripeSessionId: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true // adds createdAt & updatedAt
  }
);

module.exports = mongoose.model("Order", OrderSchema);
