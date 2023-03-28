const express = require("express");
const router = express.Router();

const {
	getAllJobs,
	createJob,
	findJobByRadius,
	updateJobById,
} = require("../controllers/jobsController");

router.route("/jobs").get(getAllJobs);
router.route("/job/create").post(createJob);
router.route("/job/:zipcode/:distance").get(findJobByRadius);
router.route("/job/update/:id").put(updateJobById);

module.exports = router;
