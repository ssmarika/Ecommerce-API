import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  buyerId: { type: mongoose.ObjectId, ref: "User", required: true },
  productID: { type: mongoose.ObjectId, ref: "Product", required: true },
  orderedQuantity: {
    type: Number,
    min: 1,
    required: true,
  },
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
