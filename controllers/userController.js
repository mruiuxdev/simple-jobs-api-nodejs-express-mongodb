const fs = require("fs");
const User = require("../models/usersModel");
const Job = require("../models/jobsModel");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const createToken = require("../utils/jwtToken");
const APIFilters = require("../utils/apiFilters");

exports.userProfile = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user.id).populate({
		path: "jobsPublished",
		select: "title salary postingDate",
	});

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
	deleteUserData(req.user.id, req.user.role);

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

exports.appliedJobs = catchAsyncErrors(async (req, res, next) => {
	const jobs = await Job.find({ "applicationsApplied.id": req.user.id }).select(
		"+applicationsApplied"
	);

	res.status(200).json({
		success: true,
		results: jobs.length,
		data: jobs,
	});
});

// ! Not working well
exports.publishedJobs = catchAsyncErrors(async (req, res, next) => {
	const jobs = await Job.find({ user: req.user.id });

	console.log(req.user.id);

	res.status(200).json({
		success: true,
		results: jobs.length,
		data: jobs,
	});
});

exports.usersByAdmin = catchAsyncErrors(async (req, res, next) => {
	const apiFilters = new APIFilters(User.find(), req.query)
		.filter()
		.sort()
		.fields()
		.pagination();

	const users = await apiFilters.query;

	res.status(200).json({
		success: true,
		results: users.length,
		data: users,
	});
});

exports.deleteUserAdmin = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	if (!user) {
		return next(
			new ErrorHandler(`User not found with id: ${req.params.id}`, 404)
		);
	}

	deleteUserData(user.id, user.role);

	await user.deleteOne();

	res.status(200).json({
		success: true,
		message: "User is deleted by Admin",
	});
});

async function deleteUserData(user, role) {
	if (role === "employer") {
		await Job.deleteMany({ user });
	}

	if (role === "user") {
		const appliedJobs = await Job.find({
			"applicationsApplied.id": user,
		}).select("+applicationsApplied");

		for (let i = 0; i < appliedJobs.length; i++) {
			let obj = appliedJobs[i].applicationsApplied.find((o) => o.id === user);

			let filePath = `${__dirname}/public/uploads/${obj.resume}`.replace(
				"\\controllers",
				""
			);

			fs.unlink(filePath, (err) => {
				if (err) return console.log(err);
			});

			appliedJobs[i].applicationsApplied.splice(
				appliedJobs[i].applicationsApplied.indexOf(obj.id)
			);

			await appliedJobs[i].save();
		}
	}
}
