import { AppError } from "../../../class/AppError.js";
import WishlistModel from "../../../model/wishlist.model.js";

export const getUserWishlist = async (req, res, next) => {
    try {
        if (!req.user) return next(new AppError("Unauthorized access.", 401));

        const wishlist = await WishlistModel.findOne({ user: req.user.id })
            .populate("products.product");

        res.status(200).json({
            response: true,
            message: "Wishlist fetched successfully",
            data: { wishlist },
        });
    } catch (error) {
        next(error);
    }
};

export const addToWishlist = async (req, res, next) => {
    try {
        if (!req.user) return next(new AppError("Unauthorized access.", 401));
        const { productId } = req.body;

        let wishlist = await WishlistModel.findOne({ user: req.user.id });

        if (!wishlist) {
            wishlist = await WishlistModel.create({
                user: req.user.id,
                products: [{ product: productId }],
            });
        } else {
            const exists = wishlist.products.find(
                (p) => p.product.toString() === productId
            );
            if (!exists) {
                wishlist.products.push({ product: productId });
                await wishlist.save();
            }
        }

        res.status(200).json({
            response: true,
            message: "Product added to wishlist",
            data: { wishlist },
        });
    } catch (error) {
        next(error);
    }
};

export const removeFromWishlist = async (req, res, next) => {
    try {
        if (!req.user) return next(new AppError("Unauthorized access.", 401));
        const { productId } = req.params;

        const wishlist = await WishlistModel.findOneAndUpdate(
            { user: req.user.id },
            { $pull: { products: { product: productId } } },
            { new: true }
        );

        res.status(200).json({
            response: true,
            message: "Product removed from wishlist",
            data: { wishlist },
        });
    } catch (error) {
        next(error);
    }
};
