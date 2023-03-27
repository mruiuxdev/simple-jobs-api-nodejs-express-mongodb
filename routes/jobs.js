"use strict";

const express = require("express");
const router = express.Router();
const { getAllJobs } = require("../controllers/jobsController");

router.route("/jobs").get(getAllJobs);

module.exports = router;
