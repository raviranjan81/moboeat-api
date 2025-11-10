import CartModel from "../../../model/cart.model.js";
import MainCategoryModel from "../../../model/main.category.model.js";
import ProductModel from "../../../model/product.model.js";
import UserModel from "../../../model/user.model.js";
import VendorModel from "../../../model/vendor.model.js";
import WishlistModel from "../../../model/wishlist.model.js";

export const getUserProducts = async (req, res, next) => {
  try {
    console.log(123);

    const userId = req?.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ response: false, message: "Unauthorized user" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ response: false, message: "User not found" });
    }
    const vendors = await VendorModel.find(
      {
        corporateCode: user.corporateCode,
        isSuperVendor: { $ne: true },
      },
      { password: 0, addedBy: 0 }
    )
      .populate("cityId", "name")
      .populate("stateId", "name")
      .populate("countryId", "name")
      .lean();

    if (!vendors.length) {
      return res.status(200).json({
        response: true,
        data: {
          vendors: [],
          products: [],
          cartItems: [],
          wishlistItems: [],
          total: 0,
        },
        message: "No vendors found for this corporate code",
      });
    }

    const vendorIds = vendors.map((v) => v._id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let products = await ProductModel.find({ vendorId: { $in: vendorIds } })
      .populate("mainCategory", "name start end")
      .limit(20)
      .lean();

    const currentTime = new Date();
    products = products.map((product) => {
      let is_available = true;
      if (product.mainCategory?.end) {
        const endTime = new Date(product.mainCategory.end);
        if (currentTime > endTime) {
          is_available = false;
        }
      }
      return { ...product, is_available };
    });

    const total = await ProductModel.countDocuments({
      vendorId: { $in: vendorIds },
    });

    const cart = await CartModel.findOne({ user: userId }).populate(
      "products.product"
    );
    const wishlist = await WishlistModel.findOne({ user: userId }).populate(
      "products.product"
    );

    const cartItems = cart?.products || [];
    const wishlistItems = wishlist?.products || [];

    res.status(200).json({
      response: true,
      data: {
        vendors,
        products,
        cartItems,
        wishlistItems,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error in getUserProducts:", error);
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  console.log(req.body);

  try {
    const input =
      req.body && Object.keys(req.body).length ? req.body : req.query || {};

    const {
      page = 1,
      limit = 30,
      paginate = true,
      filters = {},
      sortField = "createdAt",
      sortOrder = "desc",
    } = input;

    const {
      selectedMainCategories = [],
      priceRange = { min: 0, max: 999999 },
      search = "",
      itemCategories = [],
      foodTypes = [],
    } = filters;

    const vendorId = req.params?.vendorId ?? req.params?.id;
    if (!vendorId) {
      return res.status(400).json({
        response: false,
        message: "Vendor ID is required",
      });
    }
   

    const now = new Date();
    const currentHHMM = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const mainCategories = await MainCategoryModel.find(
      selectedMainCategories.length
        ? { name: { $in: selectedMainCategories } }
        : {}
    ).lean();

    const mainCategoryIds = mainCategories.map((cat) => cat._id);

    const query = {
      vendorId,
      status: "Active",
      finalPrice: { $gte: priceRange.min, $lte: priceRange.max },
    };

     if (itemCategories.length) {
      query.itemCategory = { $in: itemCategories };
    }

    if (foodTypes.length) {
      query.food_type = { $in: foodTypes };
    }

    if (mainCategoryIds.length) query.mainCategory = { $in: mainCategoryIds };

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { food_type: searchRegex },
        { itemCategory: searchRegex },
      ];
    }

    const sortOptions = { [sortField]: sortOrder === "asc" ? 1 : -1 };

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const [totalItems, products] = await Promise.all([
      ProductModel.countDocuments(query),
      ProductModel.find(query)
        .sort(sortOptions)
        .skip(paginate ? (pageNumber - 1) * limitNumber : 0)
        .limit(paginate ? limitNumber : 0)
        .populate("mainCategory")
        .lean(),
    ]);

    const finalProducts = products.map((product) => {
      const mc = product.mainCategory;
      let is_available = true;

      if (mc && mc.start && mc.end) {
        const inTime = currentHHMM >= mc.start && currentHHMM <= mc.end;
        is_available = mc.status !== "Blocked" && inTime;
      }

      return { ...product, is_available };
    });

    const allVendorProducts = await ProductModel.find({ vendorId }).lean();

    const uniqueItemCategories = [
      ...new Set(allVendorProducts.map((p) => p.itemCategory).filter(Boolean)),
    ];

    const uniqueFoodTypes = [
      ...new Set(allVendorProducts.map((p) => p.food_type).filter(Boolean)),
    ];

    return res.status(200).json({
      response: true,
      message: "Products fetched successfully",
      data: {
        products: finalProducts,
        uniqueItemCategories,
        uniqueFoodTypes,
        pagination: paginate
          ? {
              page: pageNumber,
              perPage: limitNumber,
              totalItems,
              totalPages: Math.ceil(totalItems / limitNumber),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("❌ getProducts error:", error.message);
    next(error);
  }
};

export const getProducts2 = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 30,
      paginate = true,
      filters = {},
      sortField = "createdAt",
      sortOrder = "desc",
      search = "",
    } = req.body;

    const {
      selectedMainCategories = [],
      priceRange = { min: 0, max: 999999 },
    } = filters;

    console.log(req?.body);

    const vendorId = req?.params?.id;
    if (!vendorId) {
      return res
        .status(400)
        .json({ response: false, message: "Vendor ID is required" });
    }

    const currentTime = new Date();
    const currentHHMM = `${currentTime
      .getHours()
      .toString()
      .padStart(2, "0")}:${currentTime
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const mainCategories = await MainCategoryModel.find(
      selectedMainCategories.length
        ? { name: { $in: selectedMainCategories } }
        : {}
    ).lean();

    const mainCategoryIds = mainCategories.map((cat) => cat._id);

    const query = {
      vendorId,
      status: "Active",
      price: { $gte: priceRange.min, $lte: priceRange.max },
    };

    if (mainCategoryIds.length) {
      query.mainCategory = { $in: mainCategoryIds };
    }

    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    const sortOptions = { [sortField]: sortOrder === "asc" ? 1 : -1 };

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const [totalItems, products] = await Promise.all([
      ProductModel.countDocuments(query),
      ProductModel.find(query)
        .sort(sortOptions)
        .skip(paginate ? (pageNumber - 1) * limitNumber : 0)
        .limit(paginate ? limitNumber : 0)
        .populate("mainCategory")
        .lean(),
    ]);

    const finalProducts = products.map((p) => {
      const mc = p.mainCategory;
      let is_available = true;

      if (mc && mc.start && mc.end) {
        const inTime = currentHHMM >= mc.start && currentHHMM <= mc.end;
        is_available = mc.status !== "Blocked" && inTime;
      }

      return {
        ...p,
        is_available,
      };
    });

    return res.status(200).json({
      response: true,
      message: "Products fetched successfully",
      data: {
        products: finalProducts,
        pagination: paginate
          ? {
              page: pageNumber,
              perPage: limitNumber,
              totalItems,
              totalPages: Math.ceil(totalItems / limitNumber),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("❌ getProducts error:", error.message);
    next(error);
  }
};
export const getProductFilters = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;

    const foodTypes = await ProductModel.distinct("food_type", {
      vendorId,
      status: "Active",
    });
    const itemCategories = await ProductModel.distinct("itemCategory", {
      vendorId,
      status: "Active",
    });

    return res.status(200).json({
      response: true,
      data: {
        foodTypes: foodTypes.filter(Boolean),
        itemCategories: itemCategories.filter(Boolean),
      },
    });
  } catch (err) {
    return res.status(500).json({ response: false, message: err.message });
  }
};
