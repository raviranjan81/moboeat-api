import CategoryModel from "../../../model/category.model.js";
import MainCategoryModel from "../../../model/main.category.model.js";
import ProductModel from "../../../model/product.model.js";
export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 30,
      paginate = true,
      filters = {},
      sortField = "createdAt",
      sortOrder = "desc",
    } = req.body;

    const {
      selectedMainCategories = [],
      selectedCategories = [],
      priceRange = { min: 0, max: 999999 },
    } = filters;

    const currentTime = new Date();
    const currentHHMM = `${currentTime.getHours().toString().padStart(2, "0")}:${currentTime
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    // Get main categories (no time filter now)
    const mainCategories = await MainCategoryModel.find(
      selectedMainCategories.length
        ? { name: { $in: selectedMainCategories } }
        : {}
    ).lean();

    const mainCategoryIds = mainCategories.map((cat) => cat._id);

    const categoryFilter = {
      ...(selectedCategories.length ? { name: { $in: selectedCategories } } : {}),
      mainCategory: { $in: mainCategoryIds },
    };

    const categories = await CategoryModel.find(categoryFilter).select("_id").lean();
    const categoryIds = categories.map((c) => c._id);

    const query = {
      mainCategory: { $in: mainCategoryIds },
      category: { $in: categoryIds },
      price: { $gte: priceRange.min, $lte: priceRange.max },
      status: "Active",
    };

    const sortOptions = { [sortField]: sortOrder === "asc" ? 1 : -1 };

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const [totalItems, products] = await Promise.all([
      ProductModel.countDocuments(query),
      ProductModel.find(query)
        .sort(sortOptions)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .populate("mainCategory category subCategory")
        .lean(),
    ]);

    // ✅ Add isAvailable field per product
    const finalProducts = products.map((p) => {
      const mc = p.mainCategory;
      const inTime = currentHHMM >= mc.start && currentHHMM <= mc.end;

      return {
        ...p,
        isAvailable: mc.status !== "Blocked" && inTime ? true : false,
      };
    });

    return res.status(200).json({
      response: true,
      message: "Products fetched successfully",
      data: {
        products: finalProducts,
        pagination: {
          page: pageNumber,
          perPage: limitNumber,
          totalItems,
          totalPages: Math.ceil(totalItems / limitNumber),
        },
      },
    });
  } catch (error) {
    console.error("❌ getProducts error:", error.message);
    next(error);
  }
};

export const searchProducts = async (req, res, next) => {
  try {
    const { query = "" } = req.query;

    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({
        response: false,
        message: "Search query is required",
      });
    }

    const products = await ProductModel.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { sku: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
      ],
    })
      .populate([
        { path: "mainCategory", select: "name start end" },
        { path: "category", select: "name" },
        { path: "subCategory", select: "name" },
      ])
      .lean();

    const currentTime = new Date();
    const currentHHMM = `${currentTime
      .getHours()
      .toString()
      .padStart(2, "0")}:${currentTime
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const activeProducts = products.filter((product) => {
      const mainCat = product.mainCategory;
      if (!mainCat || !mainCat.start || !mainCat.end) return false;
      return currentHHMM >= mainCat.start && currentHHMM <= mainCat.end;
    });
    const filtered = activeProducts.filter((p) => {
      const nameMatch = p.name?.toLowerCase().includes(query.toLowerCase());
      const skuMatch = p.sku?.toLowerCase().includes(query.toLowerCase());
      const tagMatch = p.tags?.some((t) =>
        t.toLowerCase().includes(query.toLowerCase())
      );
      const catMatch =
        p.category?.name?.toLowerCase().includes(query.toLowerCase()) ||
        p.subCategory?.name?.toLowerCase().includes(query.toLowerCase());
      const mainMatch = p.mainCategory?.name
        ?.toLowerCase()
        .includes(query.toLowerCase());
      return nameMatch || skuMatch || tagMatch || catMatch || mainMatch;
    });

    res.status(200).json({
      response: true,
      message: "Search results",
      data: filtered.slice(0, 10),
    });
  } catch (error) {
    console.error("❌ searchProducts error:", error.message);
    next(error);
  }
};
