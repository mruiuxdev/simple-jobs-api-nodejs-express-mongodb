const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please enter name"],
		},
		email: {
			type: String,
			required: [true, "Please enter email"],
			unique: true,
			validate: [validator.isEmail, "Please enter a valid email"],
		},
		role: {
			type: String,
			enum: {
				values: ["user", "employer", "admin"],
				message: "Please select correct role",
			},
			default: "user",
		},
		password: {
			type: String,
			required: [true, "Please enter password"],
			minLength: [8, "Your password must be at least 8 characters"],
			select: false,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		resetPasswordToken: String,
		resetPasswordExpire: Date,
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		next();
	}

	this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.getJwtToken = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_TIME,
	});
};

userSchema.methods.comparePassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
	const resetToken = crypto.randomBytes(20).toString("hex");

	this.resetPasswordToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");

	this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

	return resetToken;
};

userSchema.virtual("jobsPublished", {
	ref: "Job",
	localField: "_id",
	foreignField: "user",
	justOne: false,
});

module.exports = mongoose.model("User", userSchema);
