import mongoose from 'mongoose';
const { Schema } = mongoose;

const CartProductSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const CartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, required: true },
    products: [CartProductSchema],
  },
  { timestamps: true }
);

const CartModel = mongoose.model('Cart', CartSchema);

export default CartModel;
