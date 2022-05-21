var express = require("express");
var router = express.Router();
const characterController = require("../controllers/character-controller");
const { Uploads_URLs } = require("../const/urls");
const multer = require("multer");
const upload = multer({ dest: Uploads_URLs.Characters });
const { body } = require("express-validator");
const auth = require("../middlewares/auth");

//CHARACTER ROUTES

router.get("/", characterController.get_characters);

router.get("/:id", characterController.get_character_by_ID);

router.post(
  "/",
  auth,
  upload.single("image"),
  body("name", "Field name is invalid").isLength({ min: 2, max: 125 }),
  body("age", "Field age is invalid").isInt(),
  body("weight", "Field weight is invalid").isFloat(),
  body("story", "Field story is invalid").isLength({ min: 2, max: 225 }),
  characterController.new_character
);

router.patch(
  "/:id",
  auth,
  upload.single("image"),
  body("name", "Field name is invalid")
    .if(body("name").exists())
    .isLength({ min: 2, max: 125 }),
  body("age", "Field age is invalid").if(body("age").exists()).isInt(),
  body("weight", "Field weight is invalid")
    .if(body("weight").exists())
    .isFloat(),
  body("story", "Field story is invalid")
    .if(body("story").exists())
    .isLength({ max: 225 }),
  characterController.update_character
);

router.delete("/:id", auth, characterController.delete_character);

module.exports = router;
