const Character = require("../../models").Characters;
const Movie = require("../../models").Movies;
const Characters_Movies = require("../../models").Characters_Movies;
const { sequelize } = require("../../models");
const {
  Uploads_URLs,
  checkErrors,
  checkArrayOfIDs,
} = require("../const/helpers");
const { Op } = require("sequelize");
const fs = require("fs");

const get_characters = async (req, res, next) => {
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
    const char = await Character.findByPk(req.params.id, {
      include: [
        {
          model: Movie,
          attributes: ["id", "image", "title"],
        },
      ],
    });
    if (!char)
      throw {
        error: "ID does not belong to existing character",
        code: 404,
      };
    return res.status(200).send({
      data: char.dataValues,
      code: 200,
    });
  } catch (err) {
    next(err);
  }
};

const new_character = async (req, res, next) => {
  try {
    checkErrors(req);
    let movies, err, image;
    if (req.body.movies)
      movies = await checkArrayOfIDs(JSON.parse(req.body.movies), "Movie");
    if (req.file && req.file.fieldname === "image") image = req.file.filename;
    const char = await Character.create({
      image: image,
      name: req.body.name,
      age: req.body.age,
      weight: req.body.weight,
      story: req.body.story,
    });
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
    let movies, err;
    let newValues = {
      name: req.body.name,
      age: req.body.age,
      weight: req.body.weight,
      story: req.body.story,
    };
    let exists = await Character.findByPk(req.params.id);
    if (!exists)
      throw { error: "ID does not belong to existing character", code: 404 };
    else if (req.file && req.file.fieldname === "image") {
      newValues.image = req.file.filename;
      if (exists.image)
        fs.unlinkSync(Uploads_URLs.Characters + exists.dataValues.image);
    }
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
    let exists = await Character.findByPk(req.params.id);
    if (!exists)
      throw {
        error: "ID does not belong to existing character",
        code: 404,
      };
    if (
      exists.image &&
      fs.existsSync(Uploads_URLs.Characters + exists.dataValues.image)
    )
      fs.unlinkSync(Uploads_URLs.Characters + exists.dataValues.image);
    await Characters_Movies.destroy({
      where: { CharacterId: exists.id },
    });
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

module.exports = {
  get_characters,
  get_character_by_ID,
  new_character,
  update_character,
  delete_character,
  // checkCharactersArray,
};
