"use strict";

exports.getAllJobs = (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "All jobs",
  });
};
