"use strict";

const Job = require("../models/jobsModel");
const ErrorHandler = require("../utils/errorHandler");
const geoCoder = require("../utils/geocoder");

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

exports.updateJobById = async (req, res, next) => {
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

exports.getJobsByRadius = async (req, res, next) => {
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

exports.getJobsStats = async (req, res, next) => {
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
    res.status(404).json({
      success: false,
      message: "Not found",
    });
  } else {
    res.status(200).json({
      success: true,
      results: stats.length,
      data: stats,
    });
  }
};
