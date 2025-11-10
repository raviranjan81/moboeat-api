import bcrypt from "bcrypt";
import { AppError } from "../../../class/AppError.js";
import UserModel from "../../../model/user.model.js";
import { generateToken } from "../../../utils/jwt.js";
import UserOtpModel from "../../../model/userOtp.model.js";

const OTP_EXPIRY_TIME = 5 * 60 * 1000;

export const sendOtp = async (req, res, next) => {
  try {
    const { mobile, type = "login" } = req.body;
    if (!mobile) return next(new AppError("Mobile number is required", 400));
    if (!["login", "register"].includes(type)) {
      return next(new AppError("Invalid type", 400));
    }

    if (type === "login") {
      const existingUser = await UserModel.findOne({ mobile });
      if (!existingUser) {
        return next(
          new AppError("User not found. Please register first.", 400)
        );
      }
    }
    // const otp = Math.floor(1000 + Math.random() * 9000);

    // const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otp = "1234";

    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_TIME);

    let otpRecord = await UserOtpModel.findOne({ mobile });
    if (otpRecord) {
      otpRecord.otp = otp;
      otpRecord.otpExpiry = otpExpiry;
      otpRecord.verified = false;
      await otpRecord.save();
    } else {
      await UserOtpModel.create({
        mobile,
        otp,
        otpExpiry,
        verified: false,
      });
    }

    return res.json({
      response: true,
      message: "OTP sent successfully",
      // NOTE: remove otp from response in production. Returned here only for testing.
      otp,
    });
  } catch (error) {
    console.error("Error in sendOtp:", error);
    return next(new AppError("Something went wrong", 500));
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) {
      return next(new AppError("Mobile and OTP are required", 400));
    }

    const otpRecord = await UserOtpModel.findOne({ mobile });
    if (!otpRecord) return next(new AppError("OTP not found", 404));
    if (otpRecord.otp !== otp) return next(new AppError("Invalid OTP", 400));
    if (otpRecord.otpExpiry < new Date())
      return next(new AppError("OTP expired", 400));

    otpRecord.verified = true;
    await otpRecord.save();

    return res.json({
      response: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    return next(new AppError("Something went wrong", 500));
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, mobile, otp, corporateCode } = req.body;

    if (!name || !mobile || !otp)
      return next(new AppError("Name, Mobile, and OTP are required", 400));

    const otpRecord = await UserOtpModel.findOne({ mobile });
    if (!otpRecord)
      return next(new AppError("Please request OTP before registration", 400));
    if (otpRecord.otp !== otp) return next(new AppError("Invalid OTP", 400));
    if (otpRecord.otpExpiry < new Date())
      return next(new AppError("OTP expired", 400));

    const existingUser = await UserModel.findOne({ mobile });
    if (existingUser) return next(new AppError("User already registered", 400));

    const hashedPassword = await bcrypt.hash("123456", 10);
    const newUser = new UserModel({
      name,
      mobile,
      corporateCode,
      password: hashedPassword,
      verified: true,
    });

    await newUser.save();

    otpRecord.verified = true;
    otpRecord.otp = null;
    otpRecord.otpExpiry = null;
    await otpRecord.save();

    const token = generateToken({
      id: newUser._id,
      mobile: newUser.mobile,
      name: newUser.name,
      code: newUser.corporateCode,
      role: "User",
    });

    return res.status(201).json({
      response: true,
      message: "User registered successfully",
      data: {
        token,
        id: newUser._id,
        mobile: newUser.mobile,
        name: newUser.name,
        code: newUser.corporateCode,
        role: "User",
      },
    });
  } catch (error) {
    console.error("Error in register:", error);
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
    if (!user) return next(new AppError("User not found", 404));

    if (otp) {
      const otpRecord = await UserOtpModel.findOne({ mobile });
      if (!otpRecord) return next(new AppError("OTP not found", 400));
      if (otpRecord.otp !== otp) return next(new AppError("Invalid OTP", 400));
      if (otpRecord.otpExpiry < new Date())
        return next(new AppError("OTP expired", 400));

      otpRecord.verified = true;
      otpRecord.otp = null;
      otpRecord.otpExpiry = null;
      await otpRecord.save();

      user.verified = true;
      await user.save();
    }

    if (password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return next(new AppError("Invalid password", 400));
    }

    const token = generateToken({
      id: user._id,
      mobile: user.mobile,
      name: user.name,
      code: user.corporateCode,
      role: "User",
    });

    return res.json({
      response: true,
      message: "Login successful",
      data: {
        token,
        id: user._id,
        mobile: user.mobile,
        name: user.name,
        code: user.corporateCode,
        role: "User",
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    return next(new AppError("Something went wrong", 500));
  }
};
