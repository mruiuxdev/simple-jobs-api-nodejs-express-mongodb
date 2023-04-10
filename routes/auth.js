const express = require("express");
const router = express.Router();

const {
	register,
	login,
	forgetPassword,
	resetPassword,
	logout,
} = require("../controllers/authController");
const { isAuthentication } = require("../middleware/auth");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/password/forget").post(forgetPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/logout").get(isAuthentication, logout);

module.exports = router;
