import { AppError } from "../../../class/AppError.js";
import AdminModel from "../../../model/admin.model.js";
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

    let admin = await AdminModel.findOne({ mobile });
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

    const admin = await AdminModel.findOne({ mobile });
    if (!admin) {
      return next(new AppError("Admin not found", 404));
    }

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
    const token = generateToken({
      id: admin._id,
      mobile: admin.mobile,
      name: admin.name,
      type: "Admin",
    });
    res.json({
      response: true,
      message: "Login successful",
      data: {
        token,
        id: admin._id,
        name: admin.name,
        mobile: admin.mobile,
        type: admin.type,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const register = async (req, res, next) => {
  try {
    const {
      mobile,
      name,
      password,
      email,
      address,
      type = "adminHead",
      addedBy,
      countryId,
      cityId,
      stateId,
      corporateName,
      corporateCode,
      contactPerson,
      isSuperAdmin = false,
      userId,
    } = req.body;

    var moboEatAdmin = null;

    if (!req.isSuperAdmin) {
      moboEatAdmin = req?.user?.id ?? null;
    }

    const admin = await AdminModel.findOne({ mobile });

    if (admin) {
      return next(new AppError("Allready admin register", 400));
    }
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

      imagePath = `uploads/admins/${finalFileName}`;
    }

    const newAdmin = new AdminModel({
      mobile,
      name,
      password,
      email,
      address,
      type,
      logo: imagePath,
      addedBy,
      moboEatAdmin,
      countryId,
      cityId,
      stateId,
      corporateName,
      corporateCode,
      contactPerson,
      userId,
    });
    await newAdmin.save();
    res.json({
      response: true,
      message: `${type} added successful`,
      data: {
        ...newAdmin,
      },
    });
  } catch (error) {
    console.error("Error in register controller:", error);

    next(error);
  }
};

export const updateAdmin = async (req, res, next) => {
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

    const admin = await AdminModel.findById(id);
    if (!admin) {
      return next(new AppError("Admin not found", 404));
    }

    if (mobile && mobile !== admin.mobile) {
      const existingMobile = await AdminModel.findOne({ mobile });
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
      message: `Admin updated successfully`,
      data: { admin },
    });
  } catch (error) {
    console.error("Error in updateAdmin controller:", error);
    next(error);
  }
};

export const deleteAdmin = async (req, res, next) => {
  try {
    await AdminModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
      response: true,
      message: `Admin Deleted successfully`,
      data: { admin },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdmins = async (req, res, next) => {
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

      const totalRecord = await AdminModel.countDocuments(query);
      const totalPages = Math.ceil(totalRecord / limitNumber);

      const admins = await AdminModel.find(query)
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

      const staffCounts = await AdminModel.aggregate([
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

      const admins = await AdminModel.find(query).sort(sortOptions).lean();
      const adminIds = admins.map((v) => v._id);

      const staffCounts = await AdminModel.aggregate([
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
export const getHeadAdmins = async (req, res, next) => {
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

    const admins = await AdminModel.find(query)
      .sort(sortOptions)
      .select("id name")
      .lean();

    return res.status(200).json({
      response: true,
      message: "Admins fetched successfully",
      data: { admins },
    });
  } catch (error) {
    next(error);
  }
};
