const express = require("express");
const router = express.Router();

const {
	getAllJobs,
	getJobByIdSlug,
	createJob,
	findJobByRadius,
	updateJobById,
	deleteJobById,
	jobsStats,
} = require("../controllers/jobsController");

router.route("/jobs").get(getAllJobs);
router.route("/jobs/:zipcode/:distance").get(findJobByRadius);
router.route("/jobs/stats/:topic").get(jobsStats);
router.route("/job/:id/:slug").get(getJobByIdSlug);
router.route("/job").post(createJob);
router.route("/job/:id").put(updateJobById).delete(deleteJobById);

module.exports = router;
