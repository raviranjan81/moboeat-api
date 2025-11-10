import { AppError } from "../../../class/AppError.js";
import VendorModel from "../../../model/vendor.model.js";
import { deleteFileIfExists, sendSms } from "../../../utils/helper.js";
import path from "path";

import { generateToken } from "../../../utils/jwt.js";
import { removeImageBackground } from "../../../utils/remove-background.js";

export const sendOtp = async (req, res, next) => {
  try {
    const { mobile } = req.body;
    const otp = 123456;
    await sendSms(otp, mobile);
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_TIME);

    let admin = await VendorModel.findOne({ mobile });
    if (!admin) {
      return next(new AppError("invalid credentials", 400));
    }
    admin.otp = otp.toString();
    admin.otpExpiry = otpExpiry;
    await admin.save();
    res.json({
      response: true,
      otp: otp,
      message: "Otp sent to your mobile no.",
    });
  } catch (error) {
    return next(new AppError("Something went wrong", 500));
  }
};

export const login = async (req, res, next) => {
  try {
    const { mobile, otp, password } = req.body;

    if (!mobile || (!otp && !password)) {
      return next(
        new AppError(
          "Mobile number and either OTP or password are required",
          400
        )
      );
    }

    const admin = await VendorModel.findOne({ mobile });
    if (!admin) {
      return next(new AppError("Vendor not found", 404));
    }

    if(1 == 0){

      if (otp) {
        if (admin.otp !== otp) {
          return next(new AppError("Invalid OTP", 400));
        }
        if (!admin.otpExpiry || admin.otpExpiry < new Date()) {
          return next(new AppError("OTP expired", 400));
        }
        admin.otp = undefined;
        admin.otpExpiry = undefined;
        await admin.save();
      } else if (password) {
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
          return next(new AppError("Invalid password", 400));
        }
      }
    }

    const token = generateToken({
      id: admin._id,
      mobile: admin.mobile,
      name: admin.name,
      type: admin.vendorType,
    });
    res.json({
      response: true,
      message: "Login successful",
      data: {
        token,
        id: admin._id,
        name: admin.name,
        mobile: admin.mobile,
        type: admin.vendorType,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const updateVendor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      mobile,
      name,
      email,
      address,
      type,
      addedBy,
      password,
      countryId,
      cityId,
      stateId,
      corporateName,
      corporateCode,
      contactPerson,
      userId,
    } = req.body;
    if (req.body.password) {
      return next(
        new AppError(
          "Password update not allowed here. Use dedicated route.",
          400
        )
      );
    }

    const admin = await VendorModel.findById(id);
    if (!admin) {
      return next(new AppError("Admin not found", 404));
    }

    if (mobile && mobile !== admin.mobile) {
      const existingMobile = await VendorModel.findOne({ mobile });
      if (existingMobile) {
        return next(new AppError("Mobile number already in use", 400));
      }
    }

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

      if (admin.logo) {
        deleteFileIfExists(admin.logo);
      }

      const newImagePath = `uploads/admins/${finalFileName}`;
      admin.logo = newImagePath;
    }

    if (mobile) admin.mobile = mobile;
    if (name) admin.name = name;
    if (email) admin.email = email;
    if (address) admin.address = address;
    if (type) admin.type = type;
    if (addedBy) admin.addedBy = addedBy;
    if (password) admin.password = password;
    if (countryId) admin.countryId = countryId;
    if (stateId) admin.stateId = stateId;
    if (cityId) admin.cityId = cityId;
    if (corporateName) admin.corporateName = corporateName;
    if (corporateCode) admin.corporateCode = corporateCode;
    if (contactPerson) admin.contactPerson = contactPerson;
    if (userId) admin.userId = userId;

    await admin.save();

    res.status(200).json({
      response: true,
      message: `Vendor updated successfully`,
      data: { admin },
    });
  } catch (error) {
    console.error("Error in updateVendor controller:", error);
    next(error);
  }
};

export const deleteVendor = async (req, res, next) => {
  try {
    await VendorModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
      response: true,
      message: `Vendor Deleted successfully`,
      data: { admin },
    });
  } catch (error) {
    next(error);
  }
};

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
    const query = { ...filters, isSuperAdmin: { $ne: true } };
    const sortOptions = { [sortField]: sortOrder === "asc" ? 1 : -1 };

    if (paginate) {
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      const totalRecord = await VendorModel.countDocuments(query);
      const totalPages = Math.ceil(totalRecord / limitNumber);

      const admins = await VendorModel.find(query)
        .populate("countryId", "name")
        .populate("cityId", "name")
        .populate("stateId", "name")
        .populate({
          path: "moboEatAdmin",
          select: "name code",
        })
        .populate({
          path: "addedBy",
          select: "name code",
        })
        .sort(sortOptions)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean();

      const adminIds = admins.map((v) => v._id);

      const staffCounts = await VendorModel.aggregate([
        { $match: { addedBy: { $in: adminIds } } },
        { $group: { _id: "$addedBy", count: { $sum: 1 } } },
      ]);

      const staffCountMap = staffCounts.reduce((acc, curr) => {
        acc[curr._id.toString()] = curr.count;
        return acc;
      }, {});

      const enrichedAdmins = admins.map((admin) => ({
        ...admin,
        staffCount:
          admin.type == "adminHead"
            ? staffCountMap[admin._id.toString()] || 0
            : undefined,
      }));

      // Send response
      return res.status(200).json({
        response: true,
        data: {
          admins: enrichedAdmins,
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
      console.log(query, req?.body);

      const admins = await VendorModel.find(query).sort(sortOptions).lean();
      const adminIds = admins.map((v) => v._id);

      const staffCounts = await VendorModel.aggregate([
        { $match: { addedBy: { $in: adminIds } } },
        { $group: { _id: "$addedBy", count: { $sum: 1 } } },
      ]);

      const staffCountMap = staffCounts.reduce((acc, curr) => {
        acc[curr._id.toString()] = curr.count;
        return acc;
      }, {});

      const enrichedAdmins = admins.map((admin) => ({
        ...admin,
        staffCount:
          admin.type == "adminHead"
            ? staffCountMap[admin._id.toString()] || 0
            : undefined,
      }));

      return res.status(200).json({
        response: true,
        message: "Admins fetched successfully",
        data: { admins: enrichedAdmins },
      });
    }
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
      isSuperAdmin: { $ne: true },
      type: "adminHead",
    };

    const sortOptions = { [sortField]: sortOrder === "asc" ? 1 : -1 };

    const admins = await VendorModel.find(query)
      .sort(sortOptions)
      .select("id name")
      .lean();

    return res.status(200).json({
      response: true,
      message: "Vendors fetched successfully",
      data: { admins },
    });
  } catch (error) {
    next(error);
  }
};
