const mongoose = require("mongoose");
const validator = require("validator");
const slugify = require("slugify");
const geoCoder = require("../utils/geocoder");

const jobSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, "Please enter job title"],
		trim: true,
		maxLength: [100, "Job title can not exceed 100 characters"],
	},
	slug: String,
	description: {
		type: String,
		required: [true, "Please enter description job"],
		maxLength: [1000, "Job description can not exceed 1000 characters"],
	},
	email: {
		type: String,
		validate: [validator.isEmail, "Please enter a valid email"],
	},
	address: {
		type: String,
		required: [true, "Please add an address."],
	},
	location: {
		type: {
			type: String,
			enum: ["Point"],
		},
		coordinates: {
			type: [Number],
			index: "2dsphere",
		},
		formattedAddress: String,
		city: String,
		state: String,
		zipcode: String,
		countryCode: String,
	},
	company: {
		type: String,
		required: [true, "Please add a company named"],
	},
	industry: {
		type: [String],
		required: [true, "Please add a industry"],
		enum: {
			values: [
				"Business",
				"Information Technology",
				"Training/Education",
				"Banking",
				"Telecommunication",
			],
			message: "Please select correct options for industry",
		},
	},
	jobType: {
		type: [String],
		required: [true, "Please add a job type"],
		enum: {
			values: ["Permanent", "Temporary", "Internship"],
			message: "Please select correct options for job type",
		},
	},
	minEducation: {
		type: String,
		required: [true, "Please add a minimum education"],
		enum: {
			values: ["Bachelors", "Masters", "Phd"],
			message: "Please select correct options for education",
		},
	},
	positions: {
		type: Number,
		default: 1,
	},
	experience: {
		type: String,
		required: [true, "Please add an experience"],
		enum: {
			values: [
				"No Experience",
				"1 year - 2 years",
				"2 years - 5 years",
				"+5 years",
			],
			message: "Please select correct options for experience",
		},
	},
	salary: {
		type: Number,
		required: [true, "Please enter an excepted salary"],
	},
	positingDate: {
		type: Date,
		default: Date.now,
	},
	lastDate: {
		type: Date,
		default: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
	},
	applicationsApplied: {
		type: [Object],
		select: false,
	},
	user: {
		type: mongoose.Schema.ObjectId,
		ref: "User",
		required: true,
	},
});

jobSchema.pre("save", function (next) {
	this.slug = slugify(this.title, { lower: true, strict: true });

	next();
});

jobSchema.pre("save", async function () {
	const loc = await geoCoder.geocode(this.address);

	const {
		longitude,
		latitude,
		formattedAddress,
		state,
		zipcode,
		city,
		countryCode,
	} = loc[0];

	this.location = {
		type: "Point",
		coordinates: [longitude, latitude],
		formattedAddress,
		city,
		state,
		zipcode,
		countryCode,
	};
});

module.exports = mongoose.model("Job", jobSchema);
