import crypto from "crypto";
import axios from "axios";
import fs from 'fs';
import path from "path";

export const generateOtpExpiry = (minutes)=> {
  return Date.now() + minutes * 60 * 1000;
};


export const generateOtp = (digits) => {
  const bytes = Math.ceil(digits / 2);
  const randomBytes = crypto.randomBytes(bytes);
  let otp = parseInt(randomBytes.toString("hex"), 16)
    .toString()
    .slice(0, digits);
  while (otp.length < digits) {
    otp = "0" + otp;
  }

  return parseInt(otp);
};


export const sendSms = async (
  otp,
  mobileNumber
) => {
  // const message = `Hi Smarty, To complete the log in process for BEST VALUE of your device use OTP: ${otp} . We appreciate your smart choice. -Tap2Cash, we value your device!`;
  // const apiUrl = "https://bulk.powerstext.in/http-tokenkeyapi.php";
  // const params = {
  //   "authentic-key": "373774617032636173683130301732628626",
  //   senderid: "TPCASH",
  //   route: 1,
  //   number: mobileNumber,
  //   message,
  //   templateid: '1707172664174575126',
  // };

  try {
    //const response = await axios.get(apiUrl, { params });
    return {
      success: true,
      otp,
      //response: response?.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to send SMS",
    };
  }
};



export const deleteFileIfExists = (relativePath) => {
  const fullPath = path.join(process.cwd(), 'public', relativePath);

  fs.access(fullPath, fs.constants.F_OK, (err) => {
    if (err) {
      // console.log(`[deleteFileIfExists] File does NOT exist: ${fullPath}`);
    } else {
      fs.unlink(fullPath, (unlinkErr) => {
        // if (unlinkErr) {
        //   console.error(`[deleteFileIfExists] Error deleting file: ${fullPath}`, unlinkErr);
        // } else {
        //   console.log(`[deleteFileIfExists] File deleted successfully: ${fullPath}`);
        // }
      });
    }
  });
};

export const generateOrderId = (productId, count) => {
  const shortId = productId.toString().slice(-6).toUpperCase();
  const padded = String(count).padStart(4, "0");             
  return `ORD-${shortId}-${padded}`;
};