const path = require("path");
const Job = require("../models/jobsModel");
const geoCoder = require("../utils/geocoder");
const APIFilters = require("../utils/apiFilters");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

exports.getAllJobs = catchAsyncErrors(async (req, res, next) => {
	const apiFilters = new APIFilters(Job.find(), req.query)
		.filter()
		.sort()
		.fields()
		.search()
		.pagination();
	const allJobs = await apiFilters.query;

	res.status(200).json({
		success: true,
		results: allJobs.length,
		data: allJobs,
	});
});

exports.createJob = catchAsyncErrors(async (req, res, next) => {
	req.body.user = req.user.id;

	const job = await Job.create(req.body);

	res.status(200).json({
		success: true,
		message: "Job created",
		data: job,
	});
});

exports.updateJobById = catchAsyncErrors(async (req, res, next) => {
	let job = await Job.findById(req.params.id);

	if (!job) {
		return next(new ErrorHandler("Job not found", 404));
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
});

exports.deleteJobById = catchAsyncErrors(async (req, res, next) => {
	let job = await Job.findById(req.params.id);

	if (!job) {
		return next(new ErrorHandler("Job not found", 404));
	} else {
		job = await Job.findByIdAndRemove(req.params.id);

		res.status(200).json({
			success: true,
			message: "Job is deleted",
		});
	}
});

exports.getJobByIdSlug = catchAsyncErrors(async (req, res, next) => {
	let job = await Job.findById(req.params.id);

	if (!job || job.length === 0) {
		return next(new ErrorHandler("Job not found", 404));
	} else {
		job = await Job.find({
			$and: [{ _id: req.params.id }, { slug: req.params.slug }],
		});

		res.status(200).json({
			success: true,
			data: job,
		});
	}
});

exports.getJobsByRadius = catchAsyncErrors(async (req, res, next) => {
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
});

exports.getJobsStats = catchAsyncErrors(async (req, res, next) => {
	const topic = req.params.topic;

	const stats = await Job.aggregate([
		{
			$match: { $text: { $search: topic } },
		},
		{
			$group: {
				_id: { $toUpper: "$experience" },
				totalJobs: { $sum: 1 },
				avgPositions: { $avg: "$positions" },
				avgSalary: { $avg: "$salary" },
				minSalary: { $min: "$salary" },
				maxSalary: { $max: "$salary" },
			},
		},
	]);

	if (!stats || stats.length === 0) {
		return next(new ErrorHandler("Jobs not found", 404));
	} else {
		res.status(200).json({
			success: true,
			results: stats.length,
			data: stats,
		});
	}
});

exports.applyJob = catchAsyncErrors(async (req, res, next) => {
	let job = await Job.findById(req.params.id).select("+applicationsApplied");

	if (!job) return next(new ErrorHandler("Job not found", 404));

	if (job.lastDate < new Date(Date.now()))
		return next(
			new ErrorHandler("You can not apply to this job. Date is over", 400)
		);

	for (let i = 0; i < job.applicationsApplied.length; i++) {
		if (job.applicationsApplied[i].id === req.user.id)
			return next(new ErrorHandler("You already applied before", 400));
	}

	if (!req.files) return next(new ErrorHandler("Please upload file", 400));

	const file = req.files.file;

	const supportedFiles = /.docs|.pdf/;

	if (!supportedFiles.test(path.extname(file.name)))
		return next(new ErrorHandler("Please upload the resume docs or pdf", 400));

	if (file.size > process.env.MAX_FILE_SIZE)
		return next(new ErrorHandler("Please upload file less than 2MB", 400));

	file.name = `${req.user.name.replace(" ", "_")}_${job._id}${
		path.parse(file.name).ext
	}`;

	file.mv(`${process.env.UPLOAD_PATH}/${file.name}`, async (err) => {
		return next(new ErrorHandler("Resume file upload failed", 500));
	});

	await Job.findByIdAndUpdate(
		req.params.id,
		{
			$push: {
				applicationsApplied: {
					id: req.user.id,
					resume: file.name,
				},
			},
		},
		{
			new: true,
			runValidators: true,
		}
	);

	res.status(200).json({
		success: true,
		message: "Applied to job successfully",
		data: file.name,
	});
});
