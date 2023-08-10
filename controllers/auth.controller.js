const crypto = require("crypto");
const OTPAuth = require("otpauth");
const { encode } = require("hi-base32");
const qr = require("qrcode");
const User = require("../models/user.model.js");

const RegisterUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      status: "success",
      message: "Registered successfully, please login",
    });
  } catch (error) {
    if (error.code === 11000) { // MongoDB duplicate key error code
      return res.status(409).json({
        status: "fail",
        message: "Email already exists, please use another email address",
      });
    }
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const LoginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({
          status: "fail",
          message: "No user with that email exists",
        });
      }
  
      const hashedPassword = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");
  
      if (hashedPassword !== user.password) {
        return res.status(401).json({
          status: "fail",
          message: "Incorrect password",
        });
      }
  
      res.status(200).json({
        status: "success",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          otp_enabled: user.otp_enabled,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  };
  

const generateRandomBase32 = () => {
  const buffer = crypto.randomBytes(15);
  const base32 = encode(buffer).replace(/=/g, "").substring(0, 24);
  return base32;
};

const GenerateOTP = async (req, res) => {
  try {
    const { user_id } = req.query;

    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user with that ID exists",
      });
    }

    const base32_secret = generateRandomBase32();

    const totp = new OTPAuth.TOTP({
      issuer: "2FA Test",
      label: `2FA Test: @${user.name}`,
      algorithm: "SHA1",
      digits: 6,
      period: 15,
      secret: base32_secret,
    });
    const otpauth_url = totp.toString();

    user.otp_auth_url = otpauth_url;
    user.otp_base32 = base32_secret;
    await user.save();

    qr.toDataURL(otpauth_url, async (err, dataURL) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            status: "error",
            message: "Error generating QR code",
          });
        }
      
        res.render('generate-otp', {
            dataURL,
            base32_secret,
            otpauth_url,
          });

        // res.status(200).json({
        //   base32: base32_secret,
        //   otpauth_url,
        //   dataURL,
        // });
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const VerifyOTP = async (req, res) => {
  try {
    const { user_id, token } = req.body;

    const user = await User.findById(user_id);
    const message = "Token is invalid or user doesn't exist";

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message,
      });
    }

    const totp = new OTPAuth.TOTP({
        issuer: "2FA Test",
        label: `2FA Test: @${user.name}`,
        algorithm: "SHA1",
        digits: 6,
        period: 15,
        secret: user.otp_base32,
    });
    console.log("totp", totp);

    const delta = totp.validate({ token });
    console.log("delta", delta);

    if (delta === null) {
      return res.status(401).json({
        status: "fail",
        message,
      });
    }

    user.otp_enabled = true;
    user.otp_verified = true;
    await user.save();

    res.status(200).json({
      otp_verified: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        otp_enabled: user.otp_enabled,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const ValidateOTP = async (req, res) => {
  try {
    const { user_id, token } = req.body;
    const user = await User.findById(user_id);

    const message = "Token is invalid or user doesn't exist";

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message,
      });
    }

    const totp = new OTPAuth.TOTP({
        issuer: "2FA Test",
        label: `2FA Test: @${user.name}`,
        algorithm: "SHA1",
        digits: 6,
        period: 15,
        secret: user.otp_base32,
    });
    console.log("totp", totp);


    const delta = totp.validate({ token, window: 1 });
    console.log("delta", delta);

    if (delta === null) {
      return res.status(401).json({
        status: "fail",
        message,
      });
    }

    res.status(200).json({
      otp_valid: true,
      message: "Otp verified successfully"
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const DisableOTP = async (req, res) => {
  try {
    const { user_id, token } = req.body;

    const user = await User.findById(user_id);
    
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "User doesn't exist",
      });
    }

    
    const totp = new OTPAuth.TOTP({
        issuer: "2FA Test",
        label: `2FA Test: @${user.name}`,
        algorithm: "SHA1",
        digits: 6,
        period: 15,
        secret: user.otp_base32,
    });
    console.log("totp", totp);


    const delta = totp.validate({ token, window: 1 });
    console.log("delta", delta);

    if (delta === null) {
      return res.status(401).json({
        status: "fail",
        message: "Otp can not be disabled due to wrong token",
    });
    }

    user.otp_enabled = false;
    await user.save();

    res.status(200).json({
      otp_disabled: true,
      message: "Otp disabled successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        otp_enabled: user.otp_enabled,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  RegisterUser,
  LoginUser,
  GenerateOTP,
  VerifyOTP,
  ValidateOTP,
  DisableOTP,
};
