const Character = require("../../models").Characters;
const Movie = require("../../models").Movies;
const Characters_Movies = require("../../models").Characters_Movies;
const { sequelize } = require("../../models");
const { Op } = require("sequelize");
const fs = require("fs");
const { Uploads_URLs } = require("../const/urls");
const { validationResult } = require("express-validator");

const get_characters = async (req, res) => {
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
  return await Character.findAll({
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
    .catch((err) => res.status(500).send({ error: err, code: 500 }));
};

const get_character_by_ID = async (req, res) =>
  Character.findByPk(req.params.id, {
    include: [
      {
        model: Movie,
        attributes: ["id", "image", "title"],
      },
    ],
  })
    .then((data) => {
      data
        ? res.status(200).send({
            data: data.dataValues,
            code: 200,
          })
        : res.status(404).send({
            error: "ID does not belong to existing character",
            code: 404,
          });
    })
    .catch((err) => res.status(500).send({ error: err, code: 500 }));

const new_character = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).send({ error: errors.array(), code: 400 });
  let movies, err, image;
  if (req.body.movies) [movies, err] = await checkMovies(req.body.movies);
  if (err)
    return res.status(400).send({
      error: err,
      code: 400,
    });
  if (req.file && req.file.fieldname === "image") image = req.file.filename;
  return Character.create({
    image: image,
    name: req.body.name,
    age: req.body.age,
    weight: req.body.weight,
    story: req.body.story,
  })
    .then((char) => {
      char.addMovie(movies);
      return res.status(201).send({
        message: "Character created",
        data: char.dataValues,
        code: 201,
      });
    })
    .catch((err) => res.status(500).send({ error: err, code: 500 }));
};

const update_character = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).send({ error: errors.array(), code: 400 });
  let movies, err;
  let newValues = {
    name: req.body.name,
    age: req.body.age,
    weight: req.body.weight,
    story: req.body.story,
  };
  let exists = await Character.findByPk(req.params.id);
  if (!exists)
    return res
      .status(404)
      .send({ error: "ID does not belong to existing character", code: 404 });
  else if (req.file && req.file.fieldname === "image") {
    newValues.image = req.file.filename;
    if (exists.image)
      fs.unlinkSync(Uploads_URLs.Characters + exists.dataValues.image);
  }
  if (req.body.movies) [movies, err] = await checkMovies(req.body.movies);
  if (err)
    return res.status(400).send({
      error: err,
      code: 400,
    });
  exists.addMovie(movies);
  return Character.update(newValues, {
    where: { id: req.params.id },
  })
    .then((c) => {
      let message = c[0] ? "Character modified" : "Character not modified";
      return res.status(200).send({
        message: message,
        code: 200,
      });
    })
    .catch((err) => res.status(500).send({ error: err, code: 500 }));
};

const delete_character = async (req, res) => {
  let exists = await Character.findByPk(req.params.id);
  if (!exists)
    return res.status(404).send({
      error: "ID does not belong to existing character",
      code: 404,
    });
  if (
    exists.image &&
    fs.existsSync(Uploads_URLs.Characters + exists.dataValues.image)
  )
    fs.unlinkSync(Uploads_URLs.Characters + exists.dataValues.image);
  await Characters_Movies.destroy({
    where: { CharacterId: exists.id },
  });
  return Character.destroy({
    where: {
      id: exists.id,
    },
  })
    .then(() =>
      res.status(200).send({
        message: "Character deleted",
        data: req.params.id,
        code: 200,
      })
    )
    .catch((err) => res.status(500).send({ error: err, code: 500 }));
};

const checkMovies = async (movies) => {
  let res = [];
  let err = "";
  let arr = JSON.parse(movies);
  if (arr.length)
    for (let i = 0; i < arr.length; i++)
      await Movie.findByPk(arr[i]).then((p) =>
        p
          ? res.push(arr[i])
          : (err =
              "Movie with Id: " +
              arr[i] +
              " does not exists. You should create the movie first")
      );
  return [res, err];
};

module.exports = {
  get_characters,
  get_character_by_ID,
  new_character,
  update_character,
  delete_character,
};
