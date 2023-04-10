const User = require("../models/usersModel");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const createToken = require("../utils/jwtToken");

exports.userProfile = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user.id);

	res.status(200).json({
		success: true,
		data: user,
	});
});

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user.id).select("+password");

	const isMatched = await user.comparePassword(req.body.currentPassword);

	if (!isMatched)
		return next(new ErrorHandler("Old password is incorrect", 401));

	user.password = req.body.newPassword;

	await user.save();

	createToken(user, 200, res);
});

exports.updateUser = catchAsyncErrors(async (req, res, next) => {
	const userData = {
		name: req.body.name,
		email: req.body.email,
	};

	const user = await User.findByIdAndUpdate(req.user.id, userData, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: user,
	});
});

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findByIdAndDelete(req.user.id);

	res
		.cookie("token", "none", {
			expires: new Date(Date.now()),
			httpOnly: true,
		})
		.status(200)
		.json({
			success: true,
			message: "Your account is deleted successfully",
		});
});
