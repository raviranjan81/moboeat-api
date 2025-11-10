import { AppError } from "../../../class/AppError.js";
import CouponModel from "../../../model/coupon.model.js";


export const createCoupon = async (req, res, next) => {
    try {
        const { code, discountType, discountValue, usageLimit, validFrom, validUntil, isActive } = req.body;

        const exists = await CouponModel.findOne({ code });
        if (exists) {
            return next(new AppError("Coupon code already exists", 409));
        }

        const coupon = await CouponModel.create({
            code,
            discountType,
            discountValue,
            usageLimit,
            validFrom,
            validUntil,
            isActive,
            adminId: req.user?.id,
        });

        res.status(201).json({
            response: true,
            message: "Coupon created successfully",
            data: { coupon },
        });
    } catch (error) {
        next(error);
    }
};

export const getCoupon = async (req, res, next) => {
    const {
        page = 1,
        limit = 10,
        paginate = true,
        filters = {},
        sortField = "createdAt",
        sortOrder = "desc",
    } = req.body;

    try {
        const query = { ...filters };
        const sortOptions = {
            [sortField]: sortOrder === "asc" ? 1 : -1,
        };

        if (paginate) {
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);
            const totalRecord = await CouponModel.countDocuments(query);
            const totalPages = Math.ceil(totalRecord / limitNumber);

            const coupons = await CouponModel.find(query)
                .sort(sortOptions)
                .skip((pageNumber - 1) * limitNumber)
                .limit(limitNumber)
                .lean();

            res.status(200).json({
                response: true,
                data: {
                    coupons,
                    pagination: {
                        filterCriteria: query,
                        page: pageNumber,
                        skipping: (pageNumber - 1) * limitNumber,
                        currentPage: pageNumber,
                        totalPages,
                        totalItems: totalRecord,
                        perPage: limitNumber,
                    },
                },
            });
        } else {
            const coupons = await CouponModel.find(query).sort(sortOptions).lean();
            res.status(200).json({
                response: true,
                message: "Products fetched successfully",
                data: { coupons },
            });
        }
    } catch (error) {
        next(error);
    }
};

export const updateCoupon = async (req, res, next) => {
    try {
        const { id } = req.params;

        req.body.adminId = req.user?.id;
        const updated = await CouponModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) {
            return next(new AppError("Coupon not found", 404));
        }

        res.status(200).json({
            response: true,
            message: "Coupon updated successfully",
            data: { coupon: updated },
        });
    } catch (error) {
        next(error);
    }
};

export const deleteCoupon = async (req, res, next) => {
    try {
        const { id } = req.params;

        const deleted = await CouponModel.findByIdAndDelete(id);
        if (!deleted) {
            return next(new AppError("Coupon not found", 404));
        }

        res.status(200).json({
            response: true,
            message: "Coupon deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};