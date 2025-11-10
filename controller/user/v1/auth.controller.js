import bcrypt from "bcrypt";
import { AppError } from "../../../class/AppError.js";
import UserModel from "../../../model/user.model.js";
import { generateToken } from "../../../utils/jwt.js";

const OTP_EXPIRY_TIME = 5 * 60 * 1000;



export const sendOtp = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return next(new AppError("Mobile number is required", 400));
    }

    const otp = Math.floor(1000 + Math.random() * 9000);
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_TIME);

    let user = await UserModel.findOne({ mobile });
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    user.otp = otp.toString();
    user.otpExpiry = otpExpiry;
    await user.save();

    res.json({
      response: true,
      message: "OTP sent successfully",
      otp,
    });
  } catch (error) {
    console.error("Error in sendOtp:", error);
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

    const user = await UserModel.findOne({ mobile });
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (otp) {
      if (user.otp !== otp) {
        return next(new AppError("Invalid OTP", 400));
      }
      if (!user.otpExpiry || user.otpExpiry < new Date()) {
        return next(new AppError("OTP expired", 400));
      }

      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
    } else if (password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return next(new AppError("Invalid password", 400));
      }
    }

    const token = generateToken({
      id: user._id,
      mobile: user.mobile,
      email: user.email,
      name: user.name,
      code: user.corporateCode,
      role: "User",
    });

    res.json({
      response: true,
      message: "Login successful",
      data: {
        token,
        id: user._id,
        mobile: user.mobile,
        email: user.email,
        name: user.name,
        code: user.corporateCode,
        role: "User",
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const {
      name,
      mobile,
      email,
      password,
      countryId,
      cityId,
      stateId,
      corporateCode,
      logo,
    } = req.body;

    const existingUser = await UserModel.findOne({ mobile });
    if (existingUser) {
      return next(new AppError("User already registered", 400));
    }

    const newUser = new UserModel({
      name,
      mobile,
      email,
      password,
      countryId,
      cityId,
      stateId,
      corporateCode,
      logo,
    });

    await newUser.save();

    const token = generateToken({
      id: newUser._id,
      mobile: newUser.mobile,
      name: newUser.name,
      role: "User",
    });

    res.status(201).json({
      response: true,
      message: "User registered successfully",
      data: {
        token,
        id: newUser._id,
        mobile: newUser.mobile,
        email: newUser.email,
        name: newUser.name,
        code: newUser.corporateCode,
        role: "User",
      },
    });
  } catch (error) {
    console.error("Error in register:", error);
    next(error);
  }
};
