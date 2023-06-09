const express = require("express");
const controllers = require("../controllers");
const router = express.Router();

router.route("/register")
  .post(controllers.registerUser);

router.route("/login")
  .post(controllers.loginUser);
  
router.route("/get-user")
  .post(controllers.getUser);
  
module.exports = router;