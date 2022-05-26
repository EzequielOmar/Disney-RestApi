const Movie = require("../../models").Movies;
const Character = require("../../models").Characters;
const Genre = require("../../models").Genres;
const Characters_Movies = require("../../models").Characters_Movies;
const Genres_Movies = require("../../models").Genres_Movies;
const { sequelize } = require("../../models");
const file_controller = require("../controllers/file-controller");
const { checkErrors, checkArrayOfIDs } = require("../const/helpers");

const get_movies = async (req, res, next) => {
  //* Prepare query with filter params passed on url
  let where = {},
    include = [],
    ord = "ASC";
  if (req.query.title)
    where["title"] = sequelize.where(
      sequelize.fn("LOWER", sequelize.col("title")),
      "LIKE",
      "%" + req.query.title?.toLowerCase() + "%"
    );
  if (req.query.genre)
    include.push({
      model: Genre,
      where: {
        id: req.query.genre,
      },
    });
  if (req.query.order === "DESC") ord = "DESC";
  //* Return query
  return Movie.findAll({
    attributes: ["id", "image", "title", "creation"],
    where,
    include,
    order: [["creation", ord]],
  })
    .then((data) =>
      res.status(200).send({
        data: data,
        code: 200,
      })
    )
    .catch((err) => next(err));
};

const get_movie_by_ID = async (req, res, next) => {
  try {
    //* Search for movie on db
    const exists = await Movie.findByPk(req.params.id, {
      include: [
        {
          model: Character,
          attributes: ["id", "image", "name"],
        },
        {
          model: Genre,
          attributes: ["id", "image", "name"],
        },
      ],
    });
    if (!exists)
      throw {
        error: "ID does not belong to existing movie",
        code: 404,
      };
    //* Return data
    return res.status(200).send({
      data: exists.dataValues,
      code: 200,
    });
  } catch (err) {
    next(err);
  }
};

const new_movie = async (req, res, next) => {
  try {
    checkErrors(req);
    let characters, genres, image;
    //* Handle image
    if (req.file && req.file.fieldname === "image")
      image = file_controller.save_image(req.file);
    //* Check characters exists to associate
    if (req.body.characters) {
      characters = await checkArrayOfIDs(
        JSON.parse(req.body.characters),
        "Character"
      );
    }
    //* Check genres exists to associate
    if (req.body.genres)
      genres = await checkArrayOfIDs(JSON.parse(req.body.genres), "Genre");
    //* Create movie
    const movie = await Movie.create({
      image: image,
      title: req.body.title,
      creation: req.body.creation,
      score: req.body.score,
    });
    //* Add associations
    movie.addCharacter(characters);
    movie.addGenre(genres);
    return res.status(201).send({
      message: "Movie created",
      data: movie.dataValues,
      code: 201,
    });
  } catch (err) {
    next(err);
  }
};

const update_movie = async (req, res, next) => {
  try {
    checkErrors(req);
    let characters,
      genres,
      newValues = {
        title: req.body.name,
        creation: req.body.creation,
        score: req.body.score,
      };
    //* Check if movie exists
    let exists = await movie_exists(req.params.id);
    //* Handle file
    if (req.file && req.file.fieldname === "image")
      newValues.image = file_controller.move_image(exists.image, req.file);
    //* Check and add characters to associate
    if (req.body.characters) {
      characters = await checkArrayOfIDs(
        JSON.parse(req.body.characters),
        "Character"
      );
      exists.addCharacter(characters);
    }
    //* Check and add genres to associate
    if (req.body.genres) {
      genres = await checkArrayOfIDs(JSON.parse(req.body.genres), "Genre");
      exists.addGenre(genres);
    }
    //* Patch changes
    const movie = await Movie.update(newValues, {
      where: { id: req.params.id },
    });
    const message = movie[0] ? "Movie modified" : "Movie not modified";
    return res.status(200).send({
      message: message,
      code: 200,
    });
  } catch (err) {
    next(err);
  }
};

const delete_movie = async (req, res, next) => {
  try {
    //* Check exists
    let exists = await movie_exists(req.params.id);
    //* Delete file
    file_controller.delete_image(exists.image);
    //* Destroy assosiations first
    await Characters_Movies.destroy({
      where: { MovieId: exists.id },
    });
    await Genres_Movies.destroy({
      where: { MovieId: exists.id },
    });
    //* Destroy movie
    await Movie.destroy({
      where: {
        id: exists.id,
      },
    });
    return res.status(200).send({
      message: "Movie deleted",
      data: req.params.id,
      code: 200,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Search a movie by id and return it or throw an error if does not exists
 * @param {*} id of movie to search
 * @returns movie or throw error
 */
const movie_exists = async (id) =>
  Movie.findByPk(id)
    .then((m) => {
      if (!m)
        throw {
          error: "ID does not belong to existing movie",
          code: 404,
        };
      return m;
    })
    .catch((e) => {
      throw e;
    });

module.exports = {
  get_movies,
  get_movie_by_ID,
  new_movie,
  update_movie,
  delete_movie,
};
