var express = require("express");
var router = express.Router();
const productionController = require("../controllers/production-controller");
const { Uploads_URLs } = require("../const/urls");
const multer = require("multer");
const upload = multer({ dest: Uploads_URLs.Productions });
const { body } = require("express-validator");
const auth = require("../middlewares/auth");

//CHARACTER ROUTES

router.get("/", productionController.get_productions);

router.get("/:id", productionController.get_production_by_ID);

router.post(
  "/",
  auth,
  upload.single("image"),
  body("title", "Field title is invalid").isLength({ min: 2, max: 125 }),
  body("creation", "Field creation is invalid").isDate(),
  productionController.new_production
);

router.patch(
  "/:id",
  auth,
  upload.single("image"),
  body("title", "Field title is invalid")
    .if(body("title").exists())
    .isLength({ min: 2, max: 125 }),
  body("creation", "Field creation is invalid")
    .if(body("creation").exists())
    .isDate(),
  productionController.update_production
);

router.delete("/:id", auth, productionController.delete_production);

module.exports = router;
