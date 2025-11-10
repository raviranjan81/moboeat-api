import { AppError } from "../../../class/AppError.js";
import CartModel from "../../../model/cart.model.js";
import ProductModel from "../../../model/product.model.js";

export const getUserCart = async (req, res, next) => {
    try {
        if (!req.user) return next(new AppError("Unauthorized access.", 401));

        const cart = await CartModel.findOne({ user: req.user.id })
            .populate("products.product");

        res.status(200).json({
            response: true,
            message: "Cart fetched successfully",
            data: { cart },
        });
    } catch (error) {
        next(error);
    }
};

export const addToCart = async (req, res, next) => {
    try {
        if (!req.user) return next(new AppError("Unauthorized access.", 401));
        const { productId, quantity, type } = req.body;

        let cart = await CartModel.findOne({ user: req.user.id });
        const product = await ProductModel.findOne({ _id: productId });

        if (!product) {
            return next(new AppError("Product Not Found", 404));
        }

    

        if (!cart) {
            cart = await CartModel.create({
                user: req.user.id,
                products: [{ product: productId, quantity }],
            });
        } else {
            const existingProduct = cart.products.find(
                (p) => p.product.toString() === productId
            );

            if (existingProduct) {
                if (type === "I") {
                    existingProduct.quantity += 1;
                } else if (type === "D") {
                    existingProduct.quantity -= 1;
                } else {
                    existingProduct.quantity = 1;
                }
            } else {
                cart.products.push({ product: productId, quantity });
            }

            await cart.save();
        }

        res.status(200).json({
            response: true,
            message: "Product added to cart",
            data: { cart },
        });
    } catch (error) {
        next(error);
    }
};


export const removeFromCart = async (req, res, next) => {
    try {
        if (!req.user) return next(new AppError("Unauthorized access.", 401));
        const { productId } = req.params;

        const cart = await CartModel.findOneAndUpdate(
            { user: req.user.id },
            { $pull: { products: { product: productId } } },
            { new: true }
        );

        res.status(200).json({
            response: true,
            message: "Product removed from cart",
            data: { cart },
        });
    } catch (error) {
        next(error);
    }
};
