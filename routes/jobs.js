const express = require("express");
const router = express.Router();

const {
  getAllJobs,
  getJobByIdSlug,
  createJob,
  getJobsByRadius,
  updateJobById,
  deleteJobById,
  getJobsStats,
} = require("../controllers/jobsController");

router.route("/jobs").get(getAllJobs);
router.route("/jobs/:zipcode/:distance").get(getJobsByRadius);
router.route("/jobs/:topic").get(getJobsStats);
router.route("/job/:id/:slug").get(getJobByIdSlug);
router.route("/job").post(createJob);
router.route("/job/:id").put(updateJobById).delete(deleteJobById);

module.exports = router;
