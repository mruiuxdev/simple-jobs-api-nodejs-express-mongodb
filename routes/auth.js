const express = require("express");
const router = express.Router();

const {
  register,
  login,
  forgetPassword,
  resetPassword,
} = require("../controllers/authController");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/password/forget").post(forgetPassword);
router.route("/password/reset/:token").put(resetPassword);

module.exports = router;
