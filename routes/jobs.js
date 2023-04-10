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
	applyJob,
} = require("../controllers/jobsController");
const { isAuthentication, authorizeRoles } = require("../middleware/auth");

router.route("/jobs").get(getAllJobs);
router.route("/jobs/:zipcode/:distance").get(getJobsByRadius);
router.route("/jobs/:topic").get(getJobsStats);
router.route("/job/:id/:slug").get(getJobByIdSlug);
router
	.route("/job")
	.post(isAuthentication, authorizeRoles("employer", "admin"), createJob);
router
	.route("/job/:id/apply")
	.put(isAuthentication, authorizeRoles("user"), applyJob);
router
	.route("/job/:id")
	.put(isAuthentication, authorizeRoles("employer", "admin"), updateJobById)
	.delete(isAuthentication, authorizeRoles("employer", "admin"), deleteJobById);

module.exports = router;
