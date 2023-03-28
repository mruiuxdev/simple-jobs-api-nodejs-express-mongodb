"use strict";

const Job = require("../models/jobsModel");
const geoCoder = require("../utils/geocoder");
const slugify = require("slugify");

exports.getAllJobs = async (req, res, next) => {
	const allJobs = await Job.find();

	res.status(200).json({
		success: true,
		results: allJobs.length,
		data: allJobs,
	});
};

exports.createJob = async (req, res, next) => {
	const job = await Job.create(req.body);

	res.status(200).json({
		success: true,
		message: "Job created",
		data: job,
	});
};

exports.findJobByRadius = async (req, res, next) => {
	const { zipcode, distance } = req.params;

	const loc = await geoCoder.geocode(zipcode);
	const { latitude, longitude } = loc[0];

	const radius = distance / 3963;

	const jobs = await Job.find({
		location: {
			$geoWithin: { $centerSphere: [[longitude, latitude], radius] },
		},
	});

	res.status(200).json({
		success: true,
		result: jobs.length,
		data: jobs,
	});
};

exports.updateJobById = async (req, res, next) => {
	let job = await Job.findById(req.params.id);

	if (!job) {
		res.status(404).json({ success: false, message: "Job not found" });
	} else {
		job = await Job.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		res.status(200).json({
			success: true,
			message: "Job is updated",
			data: job,
		});
	}
};
