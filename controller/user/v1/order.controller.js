import Razorpay from "razorpay";
import { AppError } from "../../../class/AppError.js";
import CouponModel from "../../../model/coupon.model.js";
import OrderModel from "../../../model/order.model.js";
import ProductModel from "../../../model/product.model.js";
import UserModel from "../../../model/user.model.js";
import { generateOrderId } from "../../../utils/helper.js";
import dotenv from "dotenv";
import PaymentModel from "../../../model/payment.model.js";
import CartModel from "../../../model/cart.model.js";

dotenv.config();
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});
export const applyCoupon = async (req, res, next) => {
  const { couponCode, orderAmount } = req.body;

  try {
    if (!couponCode || !orderAmount) {
      return next(
        new AppError("Coupon code and order amount are required.", 400)
      );
    }

    const coupon = await CouponModel.findOne({
      code: couponCode,
      isActive: true,
    });
    if (!coupon) return next(new AppError("Invalid or inactive coupon.", 400));

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return next(new AppError("Coupon is not valid at this time.", 400));
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return next(new AppError("Coupon usage limit reached.", 400));
    }

    let discount =
      coupon.discountType === "percentage"
        ? (orderAmount * coupon.discountValue) / 100
        : coupon.discountValue;

    discount = Math.min(discount, orderAmount);
    const finalAmount = orderAmount - discount;

    await CouponModel.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });

    res.status(200).json({
      response: true,
      message: "Coupon applied successfully.",
      data: { discount, finalAmount },
    });
  } catch (error) {
    next(error);
  }
};

export const completeOrder1 = async (req, res, next) => {
  try {
    const {
      referBy,
      products,
      subtotal,
      shippingCharges = 0,
      couponCode,
      address,
      notes,
    } = req.body;

    console.log(req.body);

    if (!req.user) return next(new AppError("Unauthorized access.", 401));
    const enrichedProducts = await Promise.all(
      products.map(async (item) => {
        const product = await ProductModel.findById(item.product).lean();
        if (!product) throw new AppError(`Product not found`, 404);

        return {
          productId: product._id,
          adminId: product.adminId || null,
          vendorId: product.vendorId || null,
          quantity: item.quantity,
          priceAtPurchase:
            product.finalPrice || product.offerPrice || product.price,
        };
      })
    );

    let discount = 0;
    let couponId = null;

    if (couponCode) {
      const coupon = await CouponModel.findOne({
        code: couponCode,
        isActive: true,
      });
      const now = new Date();
      if (
        !coupon ||
        now < coupon.validFrom ||
        now > coupon.validUntil ||
        (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
      ) {
        return next(new AppError("Invalid or expired coupon.", 400));
      }

      discount =
        coupon.discountType === "percentage"
          ? (subtotal * coupon.discountValue) / 100
          : coupon.discountValue;

      discount = Math.min(discount, subtotal);
      couponId = coupon._id;
      await CouponModel.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
    }

    const totalAmount = subtotal + shippingCharges - discount;

    const orderCount = await OrderModel.countDocuments();
    const firstProduct = enrichedProducts[0];
    const orderId = await generateOrderId(
      firstProduct.productId.toString(),
      (orderCount + 1).toString()
    );

    const order = await OrderModel.create({
      orderId,
      userId: req.user.id,
      referBy,
      products: enrichedProducts.map((p) => ({
        productId: p.productId,
        adminId: p.adminId,
        vendorId: p.vendorId,
        quantity: p.quantity,
        priceAtPurchase: p.priceAtPurchase,
      })),
      address,
      subtotal,
      shippingCharges,
      discount,
      couponId,
      totalAmount,
      notes,
      reports: [
        {
          status: "Order Placed",
          updatedBy: req.user.id,
          role: "User",
          remark: "Order created successfully",
        },
      ],
    });

    res.status(201).json({
      response: true,
      message: "Order placed successfully.",
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const completeOrder = async (req, res, next) => {
  try {
    const {
      referBy,
      products,
      subtotal,
      shippingCharges = 0,
      couponCode,
      address,
      notes,
    } = req.body;

    if (!req.user) return next(new AppError("Unauthorized access.", 401));

    const enrichedProducts = await Promise.all(
      products.map(async (item) => {
        const product = await ProductModel.findById(item.product).lean();
        if (!product) throw new AppError(`Product not found`, 404);

        return {
          productId: product._id,
          adminId: product.adminId || null,
          vendorId: product.vendorId || null,
          quantity: item.quantity,
          priceAtPurchase:
            product.finalPrice || product.offerPrice || product.price,
        };
      })
    );

    let discount = 0;
    let couponId = null;

    if (couponCode) {
      const coupon = await CouponModel.findOne({
        code: couponCode,
        isActive: true,
      });

      const now = new Date();
      if (
        !coupon ||
        now < coupon.validFrom ||
        now > coupon.validUntil ||
        (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
      ) {
        return next(new AppError("Invalid or expired coupon.", 400));
      }

      discount =
        coupon.discountType === "percentage"
          ? (subtotal * coupon.discountValue) / 100
          : coupon.discountValue;

      discount = Math.min(discount, subtotal);
      couponId = coupon._id;

      await CouponModel.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
    }

    const totalAmount = subtotal + shippingCharges - discount;

    const orderCount = await OrderModel.countDocuments();
    const firstProduct = enrichedProducts[0];
    const orderId = await generateOrderId(
      firstProduct.productId.toString(),
      (orderCount + 1).toString()
    );

    const order = await OrderModel.create({
      orderId,
      userId: req.user.id,
      referBy,
      products: enrichedProducts.map((p) => ({
        productId: p.productId,
        adminId: p.adminId,
        vendorId: p.vendorId,
        quantity: p.quantity,
        priceAtPurchase: p.priceAtPurchase,
      })),
      address,
      subtotal,
      shippingCharges,
      discount,
      couponId,
      totalAmount,
      notes,
      reports: [
        {
          status: "Order Placed",
          updatedBy: req.user.id,
          role: "User",
          remark: "Order created successfully",
        },
      ],
    });
    await CartModel.deleteMany({ user: req?.user?._id });

    if (1 === 1) {
      const options = {
        amount: totalAmount * 100,
        currency: "INR",
        receipt: `order_rcpt_${order._id}`,
        notes: {
          orderId: order._id.toString(),
          userId: req.user.id.toString(),
        },
      };

      const razorOrder = await razorpay.orders.create(options);

      const payment = await PaymentModel.create({
        userId: req.user.id,
        orderId: order._id,
        razorpay_order_id: razorOrder.id,
        amount: totalAmount,
        currency: "INR",
        status: "Created",
        method: "razorpay",
        description: `Payment for order ${order._id}`,
        notes: options.notes,
      });

      await OrderModel.findByIdAndUpdate(order._id, { paymentId: payment._id });

      return res.status(201).json({
        response: true,
        message: "Order created",
        data: {
          order,
          razorpay: {
            key: process.env.RAZORPAY_KEY_ID,
            orderId: razorOrder.id,
            amount: razorOrder.amount,
            currency: razorOrder.currency,
            paymentId: payment._id,
          },
        },
      });
    }

    res.status(201).json({
      response: true,
      message: "Order placed successfully (COD).",
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return next(new AppError("Unauthorized access.", 401));
    }

    const {
      page = 1,
      limit = 10,
      paginate = true,
      filters = {},
      sortField = "createdAt",
      sortOrder = "desc",
    } = req.body;

    const user = await UserModel.findById(req.user.id).lean();
    if (!user) return next(new AppError("User not found.", 404));

    const sortOptions = { [sortField]: sortOrder === "asc" ? 1 : -1 };

    const query = {};

    if (filters.status) {
      query.reports = { $elemMatch: { status: filters.status } };
    }

    if (user.role === "User") {
      query.userId = user._id;
    }

    if (user.role === "Vendor") {
      query["products.vendorId"] = user._id;
    }

    if (user.role === "Admin") {
      query["products.adminId"] = user._id;
    }

    if (paginate) {
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      const totalRecord = await OrderModel.countDocuments(query);
      const totalPages = Math.ceil(totalRecord / limitNumber);

      const orders = await OrderModel.find(query)
        .populate("products.product", "name image price")
        .populate("userId", "name email")
        .sort(sortOptions)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean();

      return res.status(200).json({
        response: true,
        data: {
          orders,
          pagination: {
            page: pageNumber,
            totalPages,
            totalItems: totalRecord,
            perPage: limitNumber,
          },
        },
      });
    }

    const orders = await OrderModel.find(query)
      .populate("products.product", "name image price")
      .populate("userId", "name email")
      .sort(sortOptions)
      .lean();

    return res.status(200).json({
      response: true,
      message: "Orders fetched successfully.",
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      paginate = true,
      filters = {},
      sortField = "createdAt",
      sortOrder = "desc",
    } = req.body;

    if (!req.user?.id) {
      return next(new CustomError("Unauthorized access.", 401));
    }

    const user = await UserModel.findById(req.user.id).lean();
    if (!user) {
      return next(new CustomError("User not found.", 404));
    }

    const sortOptions = { [sortField]: sortOrder === "asc" ? 1 : -1 };

    const query = { userId: user._id };

    if (filters.status) {
      query.reports = { $elemMatch: { status: filters.status } };
    }

    if (paginate) {
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      const totalOrders = await OrderModel.countDocuments(query);
      const totalPages = Math.ceil(totalOrders / limitNumber);

      const orders = await OrderModel.find(query)
        .populate("products.productId", "name image price status")
        .populate("userId", "name email")
        .sort(sortOptions)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean();

      return res.status(200).json({
        response: true,
        data: {
          orders,
          pagination: {
            page: pageNumber,
            perPage: limitNumber,
            totalItems: totalOrders,
            totalPages,
          },
        },
      });
    }

    const orders = await OrderModel.find(query)
      .populate("products.productId", "name image price status")
      .populate("userId", "name email")
      .sort(sortOptions)
      .lean();

    return res.status(200).json({
      response: true,
      message: "Orders fetched successfully.",
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};
export const updateOrder = async (req, res, next) => {
  try {
    if (!req.user) return next(new AppError("Unauthorized", 401));

    const { id } = req.params;
    const { status, remark } = req.body;

    if (!status) {
      return next(new AppError("Status is required", 400));
    }

    if (req.user.role === "User") {
      return next(
        new AppError("You are not allowed to update order status.", 403)
      );
    }

    const order = await OrderModel.findById(id);
    if (!order) return next(new AppError("Order not found", 404));

    order.reports.push({
      status,
      updatedBy: req.user.id,
      role: req.user.role,
      remark: remark || "",
      reportedAt: new Date(),
    });

    if (status === "Dispatched") {
      await Promise.all(
        order.products.map(async (item) => {
          await ProductModel.findByIdAndUpdate(item.productId, {
            $set: { status: "Dispatched" },
          });
        })
      );
    }

    if (status === "Delivered") {
      await Promise.all(
        order.products.map(async (item) => {
          await ProductModel.findByIdAndUpdate(item.productId, {
            $set: { status: "Sold" },
          });
        })
      );
    }

    if (status === "Cancelled") {
      await Promise.all(
        order.products.map(async (item) => {
          await ProductModel.findByIdAndUpdate(item.productId, {
            $set: { status: "Active" },
          });
        })
      );
    }

    await order.save();

    return res.status(200).json({
      response: true,
      message: "Order status updated successfully.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const confirmOrderProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { productData } = req.body;

    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    if (req.user.role !== "User") {
      return next(new AppError("Only User can confirm order products.", 403));
    }

    if (!Array.isArray(productData) || productData.length === 0) {
      return next(new AppError("productData must be a non-empty array.", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError("Invalid Order ID", 400));
    }

    const order = await OrderModel.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    const productMap = new Map();
    productData.forEach((item) => {
      if (mongoose.Types.ObjectId.isValid(item.productId)) {
        productMap.set(item.productId, item.isConfirmed === true);
      }
    });

    let matchedAny = false;

    order.products = order.products.map((item) => {
      const pid = item.productId.toString();
      if (productMap.has(pid)) {
        matchedAny = true;
        item.isConfirmed = productMap.get(pid);
        item.confirmedAt = item.isConfirmed ? new Date() : null;
      }
      return item;
    });

    if (!matchedAny) {
      return next(new AppError("No matching products found in order.", 400));
    }

    order.reports.push({
      status: "Products Confirmed",
      updatedBy: req.user.id,
      role: "User",
      remark: "Customer confirmed the products",
      reportedAt: new Date(),
    });

    await order.save();

    return res.status(200).json({
      response: true,
      message: "Order products confirmed successfully.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderedProductWithAttributeDetail = async (req, res, next) => {
  try {
    const orderId = req.params.id;

    if (!req.user?.id) {
      return next(new AppError("Unauthorized access.", 401));
    }

    const user = await UserModel.findById(req.user.id).lean();
    if (!user) return next(new AppError("User not found.", 404));

    const query = { _id: orderId };

    if (user.role === "User") {
      query.userId = user._id;
    }

    if (user.role === "Vendor") {
      query["products.vendorId"] = user._id;
    }

    if (user.role === "Admin") {
      query["products.adminId"] = user._id;
    }

    const order = await OrderModel.findOne(query)
      .populate("userId", "name email mobile address")
      .populate({
        path: "products.product",
        select: "name image price description attributes",
      })
      .populate({
        path: "products.productId",
        select: "name",
      })
      .lean();

    if (!order) {
      return next(new AppError("Order not found.", 404));
    }

    return res.status(200).json({
      response: true,
      message: "Order details fetched successfully.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
export const getOrderDetails = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    if (!orderId) {
      return res.status(400).json({
        response: false,
        message: "Order ID is required.",
      });
    }

    const order = await OrderModel.findOne({ _id: orderId })
      .populate("userId", "name email mobile address")
      .populate({
        path: "products.productId.vendorId", 
        select: "name image price description",
      })
      .populate({
        path: "products.vendorId", 
        select: "name ",
      })
      .lean();

    if (!order) {
      return res.status(404).json({
        response: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      response: true,
      message: "Order details fetched successfully.",
      data: order,
    });
  } catch (error) {
    console.error("❌ getOrderDetails error:", error.message);
    next(error);
  }
};

