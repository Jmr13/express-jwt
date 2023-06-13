const express = require("express");
const controllers = require("../controllers");
const router = express.Router();

const { signupValidation, loginValidation } = require("../middleware/validation");

router.route("/register")
  .post(signupValidation , controllers.registerUser);

router.route("/login")
  .post(loginValidation, controllers.loginUser);
  
router.route("/get-user")
  .post(controllers.getUser);
  
module.exports = router;