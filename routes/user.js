const express = require("express");
const router = express.Router();
const {
	userProfile,
	updatePassword,
	updateUser,
	deleteUser,
} = require("../controllers/userController");
const { isAuthentication } = require("../middleware/auth");

router.route("/user").get(isAuthentication, userProfile);
router.route("/password/update").put(isAuthentication, updatePassword);
router.route("/user/update").put(isAuthentication, updateUser);
router.route("/user/delete").delete(isAuthentication, deleteUser);

module.exports = router;
