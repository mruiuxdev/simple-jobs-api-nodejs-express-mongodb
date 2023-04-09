const crypto = require("crypto");
const User = require("../models/usersModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const createToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");

exports.register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  createToken(user, 200, res);
});

exports.login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new ErrorHandler("Please enter email and password", 400));

  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("Invalid email and password", 401));

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched)
    return next(new ErrorHandler("Invalid email and password", 401));

  createToken(user, 200, res);
});

exports.forgetPassword = catchAsyncErrors(async function (req, res, next) {
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(new ErrorHandler("No user found with this email", 404));

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your password reset link is as follow:\n\n${resetPasswordUrl}\n\n If you have not request this, then please ignore`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Jobs API Password Recovery",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email is sent successfully to: ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    console.log(error);
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler("Email is not sent", 500));
  }
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user)
    return next(new ErrorHandler("Password reset token is invalid", 400));

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  createToken(user, 200, res);
});
