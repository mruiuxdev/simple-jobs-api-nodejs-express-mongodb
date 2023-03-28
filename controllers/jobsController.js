"use strict";

const Job = require("../models/jobsModel");
const geoCoder = require("../utils/geocoder");

exports.getAllJobs = async (req, res, next) => {
	const allJobs = await Job.find();

	res.status(200).json({
		success: true,
		results: allJobs.length,
		data: allJobs,
	});
};

exports.getJobByIdSlug = async (req, res, next) => {
	let job = await Job.findById(req.params.id);

	if (!job || job.length === 0) {
		res.status(404).json({ success: false, message: "Job not found" });
	} else {
		job = await Job.find({
			$and: [{ _id: req.params.id }, { slug: req.params.slug }],
		});

		res.status(200).json({
			success: true,
			data: job,
		});
	}
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

exports.deleteJobById = async (req, res, next) => {
	let job = await Job.findById(req.params.id);

	if (!job) {
		res.status(404).json({ success: false, message: "Job not found" });
	} else {
		job = await Job.findByIdAndRemove(req.params.id);

		res.status(200).json({
			success: true,
			message: "Job is deleted",
		});
	}
};

exports.jobsStats = async (req, res, next) => {
	const stats = await Job.aggregate([
		{
			$match: { $text: { $search: `"${req.params.topic}"` } },
		},
		{
			$group: {
				_id: null,
				totalJobs: { $sum: 1 },
			},
		},
	]);

	if (stats.length === 0) {
		res.status(404).json({
			success: false,
			message: `No stats found for - ${req.params.topic}`,
		});
	} else {
		res.status(200).json({
			success: true,
			data: stats,
		});
	}
};
