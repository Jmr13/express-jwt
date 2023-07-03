const express = require("express");
const controllers = require("../controllers");
const router = express.Router();

const { signupValidation, loginValidation } = require("../middleware/validation");
const { authenticateToken } = require("../middleware/authentication");

router.route("/register")
  .post(signupValidation , controllers.registerUser);

router.route("/login")
  .post(loginValidation, controllers.loginUser);
  
router.route("/get-user")
  .post(authenticateToken, controllers.getUser);
  
module.exports = router;