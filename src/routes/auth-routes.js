const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth-controller");
const { check } = require("express-validator");

router.post(
  "/signup",
  check("email", "Field email is invalid.").isEmail(),
  check("pass", "Field pass is invalid.").isLength({
    min: 6,
  }),
  check(
    "pass_repeat",
    "Field pass_repeat do not match with field pass."
  ).custom((value, { req }) => value === req.body.pass),
  authController.signUp
);

router.post(
  "/login",
  check("email", "Field email is invalid.").isEmail(),
  check("pass", "Field pass is invalid.").isLength({
    min: 6,
  }),
  authController.logIn
);

module.exports = router;
