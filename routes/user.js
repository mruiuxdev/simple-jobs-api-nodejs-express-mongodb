const express = require("express");
const router = express.Router();
const {
	userProfile,
	updatePassword,
	updateUser,
	deleteUser,
	appliedJobs,
	publishedJobs,
	usersByAdmin,
	deleteUserAdmin,
} = require("../controllers/userController");
const { isAuthentication, authorizeRoles } = require("../middleware/auth");

router.use(isAuthentication);

router.route("/user").get(userProfile);
router.route("/password/update").put(updatePassword);
router.route("/user/update").put(updateUser);
router.route("/user/delete").delete(deleteUser);
router.route("/user/appliedJobs").get(authorizeRoles("user"), appliedJobs);
router
	.route("/jobs/published")
	.get(authorizeRoles("employer", "admin"), publishedJobs);
router.route("/users").get(authorizeRoles("admin"), usersByAdmin);
router.route("/user/:id").delete(authorizeRoles("admin"), deleteUserAdmin);

module.exports = router;
