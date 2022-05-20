var express = require("express");
var router = express.Router();
const productionController = require("../controllers/production-controller");
const multer = require("multer");
const { Uploads_URLs } = require("../const/urls");
const upload = multer({ dest: Uploads_URLs.Productions });

//CHARACTER ROUTES

router.get("/", productionController.get_productions);

router.get("/:id", productionController.get_production_by_ID);

router.post("/", upload.single("image"), productionController.new_production);

router.patch(
  "/:id",
  upload.single("image"),
  productionController.update_production
);

router.delete("/:id", productionController.delete_production);

module.exports = router;
