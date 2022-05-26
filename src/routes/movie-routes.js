var express = require("express");
var router = express.Router();
const movieController = require("../controllers/movie-controller");
const { Uploads_URLs } = require("../const/helpers");
const auth = require("../middlewares/auth");
const { body } = require("express-validator");
const multer = require("multer");

const upload = multer({
  storage: multer.diskStorage({
    destination: Uploads_URLs.Movies,
  }),
  fileFilter: (req, file, cb) => {
    if (
      !["jpg", "jpeg", "webp", "gif", "png", "svg"].includes(
        file.mimetype.split("/")[1]
      )
    )
      return cb({ error: "File format is not allowed", code: 400 });
    if (file.size >= 2097152)
      return cb({ error: "File is too heavy. Max allowed is 2mb", code: 400 });
    return cb(null, true);
  },
});

//MOVIES ROUTES

router.get("/", movieController.get_movies);

router.get("/:id", movieController.get_movie_by_ID);

router.post(
  "/",
  auth,
  upload.single("image"),
  body("title", "Field title is invalid").isLength({ min: 2, max: 125 }),
  body("creation", "Field creation is invalid").isDate(),
  body("characters", "Field characters must be an array of int").if(
    body("characters")
      .exists()
      .custom((value) => {
        if (Array.isArray(JSON.parse(value))) return true;
      })
  ),
  body("genres", "Field genres must be an array of int").if(
    body("genres")
      .exists()
      .custom((value) => {
        if (Array.isArray(JSON.parse(value))) return true;
      })
  ),
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
  body("characters", "Field characters must be an array of int").if(
    body("characters")
      .exists()
      .custom((value) => {
        if (Array.isArray(JSON.parse(value))) return true;
      })
  ),
  body("genres", "Field genres must be an array of int").if(
    body("genres")
      .exists()
      .custom((value) => {
        if (Array.isArray(JSON.parse(value))) return true;
      })
  ),
  movieController.update_movie
);

router.delete("/:id", auth, movieController.delete_movie);

module.exports = router;
