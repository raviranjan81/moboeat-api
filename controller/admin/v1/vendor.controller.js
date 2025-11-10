import { AppError } from "../../../class/AppError.js";
import VendorModel from "../../../model/vendor.model.js";
import { deleteFileIfExists } from "../../../utils/helper.js";
import { removeImageBackground } from "../../../utils/remove-background.js";
import path from "path";
import bcrypt from "bcrypt";
export const getVendors = async (req, res, next) => {
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
    const sortOptions = { [sortField]: sortOrder === "asc" ? 1 : -1 };

    if (paginate) {
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      const totalRecord = await VendorModel.countDocuments(query);
      const totalPages = Math.ceil(totalRecord / limitNumber);

      const vendors = await VendorModel.find(query)
        .populate("countryId", "name")
        .populate("cityId", "name")
        .populate("stateId", "name")
        .sort(sortOptions)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean();

      const vendorIds = vendors.map((v) => v._id);

      const staffCounts = await VendorModel.aggregate([
        { $match: { addedBy: { $in: vendorIds } } },
        { $group: { _id: "$addedBy", count: { $sum: 1 } } },
      ]);

      const staffCountMap = staffCounts.reduce((acc, curr) => {
        acc[curr._id.toString()] = curr.count;
        return acc;
      }, {});

      const enrichedVendors = vendors.map((vendor) => ({
        ...vendor,
        staffCount: vendor.isSuperVendor
          ? staffCountMap[vendor._id.toString()] || 0
          : undefined,
      }));

      // Send response
      return res.status(200).json({
        response: true,
        data: {
          vendors: enrichedVendors,
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
      const vendors = await VendorModel.find(query).sort(sortOptions).lean();

      const vendorIds = vendors.map((v) => v._id);

      const staffCounts = await VendorModel.aggregate([
        { $match: { addedBy: { $in: vendorIds } } },
        { $group: { _id: "$addedBy", count: { $sum: 1 } } },
      ]);

      const staffCountMap = staffCounts.reduce((acc, curr) => {
        acc[curr._id.toString()] = curr.count;
        return acc;
      }, {});

      const enrichedVendors = vendors.map((vendor) => ({
        ...vendor,
        staffCount: vendor.isSuperVendor
          ? staffCountMap[vendor._id.toString()] || 0
          : undefined,
      }));

      return res.status(200).json({
        response: true,
        message: "Vendors fetched successfully",
        data: { vendors: enrichedVendors },
      });
    }
  } catch (error) {
    next(error);
  }
};

export const createVendor = async (req, res, next) => {
  try {
    const {
      name,
      countryId,
      cityId,
      stateId,
      corporateName,
      corporateCode,
      mobile,
      email,
      contactPerson,
      vendorType,
      password,
      userId,
      isSuperVendor = false,
      addedBy,
    } = req.body;

    const SuperVendor = await VendorModel.findById(addedBy);
    console.log(SuperVendor);

    if (isSuperVendor) {
      const existingVendor = await VendorModel.findOne({
        $or: [{ email }, { mobile }, { corporateCode }, { userId }],
      });

      console.log(existingVendor);

      if (existingVendor) {
        return next(
          new AppError(
            "Vendor with provided email, mobile, corporate code or userId already exists",
            409
          )
        );
      }
    }

    let adminId = req.user._id;

    var imagePath = null;
    if (req.file) {
      let finalFilePath = req.file.path;
      let finalFileName = req.file.filename;

      if (removeBg === true || removeBg === "true") {
        const bgRemovedPath = await removeImageBackground(finalFilePath);
        if (bgRemovedPath) {
          finalFilePath = bgRemovedPath;
          finalFileName = path.basename(bgRemovedPath);
        }
      }

      imagePath = `uploads/vendors/${finalFileName}`;
    }

    const vendor = await VendorModel.create({
      name,
      countryId,
      cityId,
      stateId,
      corporateName,
      corporateCode: SuperVendor?.corporateCode ?? corporateCode,
      mobile,
      email,
      contactPerson,
      vendorType,
      password,
      addedBy: SuperVendor?._id ?? null,
      adminId,
      userId,
      isSuperVendor,
      logo: imagePath,
    });

    res.status(201).json({
      response: true,
      message: "Vendor created successfully",
      data: { vendor },
    });
  } catch (error) {
    next(error);
  }
};

export const updateVendor = async (req, res, next) => {
  try {
    const vendorId = req.params.id;
    const {
      name,
      countryId,
      cityId,
      stateId,
      corporateName,
      corporateCode,
      mobile,
      email,
      contactPerson,
      vendorType,
      password,
      userId,
      isSuperVendor = false,
    } = req.body;

    const existingVendor = await VendorModel.findById(vendorId);
    if (!existingVendor) {
      return next(new AppError("Vendor not found", 404));
    }

    const duplicateVendor = await VendorModel.findOne({
      _id: { $ne: vendorId },
      $or: [{ email }, { mobile }, { userId }],
    });

    if (duplicateVendor) {
      return next(
        new AppError(
          "Another vendor with same email, mobile, or userId already exists",
          409
        )
      );
    }

    if (name) existingVendor.name = name;
    if (countryId) existingVendor.countryId = countryId;
    if (stateId) existingVendor.stateId = stateId;
    if (cityId) existingVendor.cityId = cityId;
    if (corporateName) existingVendor.corporateName = corporateName;
    if (corporateCode) existingVendor.corporateCode = corporateCode;
    if (mobile) existingVendor.mobile = mobile;
    if (email) existingVendor.email = email;
    if (contactPerson) existingVendor.contactPerson = contactPerson;
    if (vendorType) existingVendor.vendorType = vendorType;
    if (userId) existingVendor.userId = userId;
    if (typeof isSuperVendor !== "undefined")
      existingVendor.isSuperVendor = isSuperVendor;

    if (password && password.trim() !== "") {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      existingVendor.password = hashedPassword;
    }

    if (req.file) {
      let finalFilePath = req.file.path;
      let finalFileName = req.file.filename;

      if (req.body.removeBg === true || req.body.removeBg === "true") {
        const bgRemovedPath = await removeImageBackground(finalFilePath);
        if (bgRemovedPath) {
          finalFilePath = bgRemovedPath;
          finalFileName = path.basename(bgRemovedPath);
        }
      }

      existingVendor.logo = `uploads/vendors/${finalFileName}`;
    }

    await existingVendor.save();

    res.status(200).json({
      response: true,
      message: "Vendor updated successfully",
      data: { vendor: existingVendor },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVendor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const vendor = await VendorModel.findById(id);
    if (!vendor) {
      return next(new AppError("Vendor not found", 404));
    }

    if (vendor.logo) {
      deleteFileIfExists(vendor.logo);
    }

    if (vendor.isSuperVendor) {
      const staffCount = await VendorModel.countDocuments({
        addedBy: vendor._id,
      });

      if (staffCount > 0) {
        return next(
          new AppError(
            "Cannot delete Super Vendor because staff/vendors are associated with it",
            400
          )
        );
      }
    }

    await VendorModel.findByIdAndDelete(id);

    res.status(200).json({
      response: true,
      message: "Vendor deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getHeadVendors = async (req, res, next) => {
  const {
    filters = {},
    sortField = "createdAt",
    sortOrder = "desc",
  } = req.body;

  try {
    const query = {
      ...filters,
      isSuperVendor: { $ne: false },
      vendorType: "superVendor",
    };

    const sortOptions = { [sortField]: sortOrder === "asc" ? 1 : -1 };

    const vendors = await VendorModel.find(query)
      .sort(sortOptions)
      .select("id name")
      .lean();

    return res.status(200).json({
      response: true,
      message: "vendors fetched successfully",
      data: { vendors },
    });
  } catch (error) {
    next(error);
  }
};
export const getVendorsStaff = async (req, res, next) => {
  const {
    filters = {},
    sortField = "createdAt",
    sortOrder = "desc",
  } = req.body;

  try {

    const query = {
      ...filters,
      isSuperVendor: { $ne: true },
      vendorType: "Vendor",
    };

    const sortOptions = { [sortField]: sortOrder === "asc" ? 1 : -1 };

    const vendors = await VendorModel.find(query)
      .sort(sortOptions)
      .select("id name")
      .lean();

    return res.status(200).json({
      response: true,
      message: "vendors fetched successfully",
      data: { vendors },
    });
  } catch (error) {
    next(error);
  }
};
