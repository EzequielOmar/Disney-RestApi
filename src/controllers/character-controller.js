const Character = require("../../models").Characters;
const Movie = require("../../models").Movies;
const Characters_Movies = require("../../models").Characters_Movies;
const { sequelize } = require("../../models");
const file_controller = require("../controllers/file-controller");
const { checkErrors, checkArrayOfIDs } = require("../const/helpers");
const { Op } = require("sequelize");

const get_characters = async (req, res, next) => {
  //* Prepare query with filter params passed on url
  let where = {},
    include = [];
  if (req.query.name)
    where["name"] = sequelize.where(
      sequelize.fn("LOWER", sequelize.col("name")),
      "LIKE",
      "%" + req.query.name?.toLowerCase() + "%"
    );
  if (req.query.age) where["age"] = req.query.age;
  if (req.query.movies)
    include.push({
      model: Movie,
      where: {
        id: {
          [Op.in]: Array.from(req.query.movies),
        },
      },
      attributes: ["id", "image", "title"],
    });
  //* Return query
  return Character.findAll({
    attributes: ["id", "image", "name"],
    where,
    include,
  })
    .then((data) =>
      res.status(200).send({
        data: data,
        code: 200,
      })
    )
    .catch((err) => next(err));
};

const get_character_by_ID = async (req, res, next) => {
  try {
    //* Get character by id and check if exists
    const exists = await Character.findByPk(req.params.id, {
      include: [
        {
          model: Movie,
          attributes: ["id", "image", "title"],
        },
      ],
    });
    if (!exists)
      throw {
        error: "ID does not belong to existing character",
        code: 404,
      };
    return res.status(200).send({
      data: exists.dataValues,
      code: 200,
    });
  } catch (err) {
    next(err);
  }
};

const new_character = async (req, res, next) => {
  try {
    checkErrors(req);
    let movies, image;
    //* Check movies exists to associate
    if (req.body.movies)
      movies = await checkArrayOfIDs(JSON.parse(req.body.movies), "Movie");
    //* Handle file
    if (req.file && req.file.fieldname === "image")
      image = file_controller.save_image(req.file);
    //* Create new character
    const char = await Character.create({
      image: image,
      name: req.body.name,
      age: req.body.age,
      weight: req.body.weight,
      story: req.body.story,
    });
    //* Add association
    char.addMovie(movies);
    return res.status(201).send({
      message: "Character created",
      data: char.dataValues,
      code: 201,
    });
  } catch (err) {
    next(err);
  }
};

const update_character = async (req, res, next) => {
  try {
    checkErrors(req);
    let movies;
    let newValues = {
      name: req.body.name,
      age: req.body.age,
      weight: req.body.weight,
      story: req.body.story,
    };
    //* Check exists
    let exists = await char_exists(req.params.id);
    //* Handle image
    if (req.file && req.file.fieldname === "image")
      newValues.image = file_controller.move_image(exists.image, req.file);
    //* Check and add new associations
    if (req.body.movies) {
      movies = await checkArrayOfIDs(JSON.parse(req.body.movies), "Movie");
      exists.addMovie(movies);
    }
    const char = await Character.update(newValues, {
      where: { id: req.params.id },
    });
    let message = char[0] ? "Character modified" : "Character not modified";
    return res.status(200).send({
      message: message,
      code: 200,
    });
  } catch (err) {
    next(err);
  }
};

const delete_character = async (req, res, next) => {
  try {
    //* Check exists
    let exists = await char_exists(req.params.id);
    //* Delete file
    file_controller.delete_image(exists.image);
    //* Delete associations first
    await Characters_Movies.destroy({
      where: { CharacterId: exists.id },
    });
    //* Delete character
    await Character.destroy({
      where: {
        id: exists.id,
      },
    });
    return res.status(200).send({
      message: "Character deleted",
      data: req.params.id,
      code: 200,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Search a character by id and return it or throw an error if does not exists
 * @param {*} id of character to search
 * @returns character or throw error
 */
const char_exists = async (id) =>
  Character.findByPk(id)
    .then((c) => {
      if (!c)
        throw {
          error: "ID does not belong to existing character",
          code: 404,
        };
      return c;
    })
    .catch((e) => {
      throw e;
    });

module.exports = {
  get_characters,
  get_character_by_ID,
  new_character,
  update_character,
  delete_character,
};
