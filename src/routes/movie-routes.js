var express = require("express");
var router = express.Router();
const movieController = require("../controllers/movie-controller");
const { Uploads_URLs } = require("../const/helpers");
const multer = require("multer");
const upload = multer({ dest: Uploads_URLs.Movies });
const { body } = require("express-validator");
const auth = require("../middlewares/auth");

//CHARACTER ROUTES

router.get("/", movieController.get_movies);

router.get("/:id", movieController.get_movie_by_ID);

router.post(
  "/",
  auth,
  upload.single("image"),
  body("title", "Field title is invalid").isLength({ min: 2, max: 125 }),
  body("creation", "Field creation is invalid").isDate(),
  movieController.new_movie
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
  movieController.update_movie
);

router.delete("/:id", auth, movieController.delete_movie);

module.exports = router;
