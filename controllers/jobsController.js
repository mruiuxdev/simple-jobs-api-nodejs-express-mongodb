"use strict";

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
