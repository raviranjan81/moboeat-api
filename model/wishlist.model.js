import mongoose from 'mongoose';
const { Schema } = mongoose;

const WishlistProductSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
});

const WishlistSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, required: true },
    products: [WishlistProductSchema],
  },
  { timestamps: true }
);

const WishlistModel = mongoose.model('Wishlist', WishlistSchema);

export default WishlistModel;
