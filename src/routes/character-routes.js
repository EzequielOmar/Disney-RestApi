var express = require("express");
var router = express.Router();
const characterController = require("../controllers/character-controller");
const multer = require("multer");
const { Uploads_URLs } = require("../const/urls");
const upload = multer({ dest: Uploads_URLs.Characters });

//CHARACTER ROUTES

router.get("/", characterController.get_characters);

router.get("/:id", characterController.get_character_by_ID);

router.post("/", upload.single("image"), characterController.new_character);

router.patch(
  "/:id",
  upload.single("image"),
  characterController.update_character
);

router.delete("/:id", characterController.delete_character);

module.exports = router;
