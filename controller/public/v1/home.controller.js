import jwt from "jsonwebtoken";
import ProductModel from "../../../model/product.model.js";
import CartModel from "../../../model/cart.model.js";
import WishlistModel from "../../../model/wishlist.model.js";


export const getHomeData = async (req, res, next) => {
  try {
    let userId = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        console.log("Invalid token");
      }
    }



    const latestProducts = await ProductModel.find({
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })
      .limit(8)
      .select("_id name price image mainCategory")
      .populate("mainCategory", "name")
      .lean();

    let cartItems = [];
    let wishlistItems = [];

    if (userId) {
      const cart = await CartModel.findOne({ user: userId }).populate("products.product");
      const wishlist = await WishlistModel.findOne({ user: userId }).populate("products.product");

      cartItems = cart?.products || [];
      wishlistItems = wishlist?.products || [];
    }

    res.status(200).json({
      response: true,
      data: {
        recentUploads: latestProducts,
        cartItems,
        wishlistItems,
      },
    });
  } catch (error) {
    console.error("Error in getHomeData:", error);
    next(error);
  }
};