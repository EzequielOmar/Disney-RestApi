const Movie = require("../../models").Movies;
const Character = require("../../models").Characters;
const Genre = require("../../models").Genres;
const Characters_Movies = require("../../models").Characters_Movies;
const Genres_Movies = require("../../models").Genres_Movies;
const { sequelize } = require("../../models");
const fs = require("fs");
const { Uploads_URLs } = require("../const/urls");
const { validationResult } = require("express-validator");

const get_movies = async (req, res) => {
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
  Movie.findAll({
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
    .catch((err) => res.status(500).send({ error: err, code: 500 }));
};

const get_movie_by_ID = async (req, res) =>
  Movie.findByPk(req.params.id, {
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
  })
    .then((data) =>
      data
        ? res.status(200).send({
            data: data.dataValues,
            code: 200,
          })
        : res.status(404).send({
            error: "ID does not belong to existing movie",
            code: 404,
          })
    )
    .catch((err) => res.status(500).send({ error: err, code: 500 }));

const new_movie = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).send({ error: errors.array(), code: 400 });
  let characters, genres, err, image;
  if (req.file && req.file.fieldname === "image") image = req.file.filename;
  if (req.body.characters)
    [characters, err] = await checkCharacters(req.body.characters);
  if (err)
    return res.status(400).send({
      error: err,
      code: 400,
    });
  if (req.body.genres) [genres, err] = await checkGenres(req.body.genres);
  if (err)
    return res.status(400).send({
      error: err,
      code: 400,
    });
  return Movie.create({
    image: image,
    title: req.body.title,
    creation: req.body.creation,
    score: req.body.score,
  })
    .then((prod) => {
      prod.addCharacter(characters);
      prod.addGenre(genres);
      return res.status(201).send({
        message: "Movie created",
        data: prod.dataValues,
        code: 201,
      });
    })
    .catch((err) => res.status(500).send({ error: err, code: 500 }));
};

const update_movie = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).send({ error: errors.array(), code: 400 });
  let characters,
    genres,
    err,
    newValues = {
      title: req.body.name,
      creation: req.body.creation,
      score: req.body.score,
    };
  let exists = await Movie.findByPk(req.params.id);
  if (!exists)
    return res
      .status(404)
      .send({ error: "ID does not belong to existing movie", code: 404 });
  else if (req.file && req.file.fieldname === "image") {
    newValues.image = req.file.filename;
    if (exists.image)
      fs.unlinkSync(Uploads_URLs.Movies + exists.dataValues.image);
  }
  if (req.body.characters)
    [characters, err] = await checkCharacters(req.body.characters);
  if (err)
    return res.status(400).send({
      error: err,
      code: 400,
    });
  if (req.body.genres) [genres, err] = await checkGenres(req.body.genres);
  if (err)
    return res.status(400).send({
      error: err,
      code: 400,
    });
  exists.addCharacter(characters);
  exists.addGenre(genres);
  return Movie.update(newValues, {
    where: { id: req.params.id },
  })
    .then((m) => {
      let message = m[0] ? "Movie modified" : "Movie not modified";
      return res.status(200).send({
        message: message,
        code: 200,
      });
    })
    .catch((err) => res.status(500).send({ error: err, code: 500 }));
};

const delete_movie = async (req, res) => {
  let exists = await Movie.findByPk(req.params.id);
  if (!exists)
    return res.status(404).send({
      error: "ID does not belong to existing movie",
      code: 404,
    });
  if (
    exists.image &&
    fs.existsSync(Uploads_URLs.Movies + exists.dataValues.image)
  )
    fs.unlinkSync(Uploads_URLs.Movies + exists.dataValues.image);
  await Characters_Movies.destroy({
    where: { MovieId: exists.id },
  });
  await Genres_Movies.destroy({
    where: { MovieId: exists.id },
  });
  return Movie.destroy({
    where: {
      id: exists.id,
    },
  })
    .then(() =>
      res.status(200).send({
        message: "Movie deleted",
        data: req.params.id,
        code: 200,
      })
    )
    .catch((err) => res.status(500).send({ error: err, code: 500 }));
};

const checkCharacters = async (characters) => {
  let res = [];
  let err = "";
  let arr = JSON.parse(characters);
  if (arr.length)
    for (let i = 0; i < arr.length; i++)
      await Character.findByPk(arr[i]).then((c) =>
        c
          ? res.push(arr[i])
          : (err =
              "Character with Id: " +
              arr[i] +
              " does not exists. You should create it first")
      );
  return [res, err];
};

const checkGenres = async (characters) => {
  let res = [];
  let err = "";
  let arr = JSON.parse(characters);
  if (arr.length)
    for (let i = 0; i < arr.length; i++)
      await Genre.findByPk(arr[i]).then((g) =>
        g
          ? res.push(arr[i])
          : (err =
              "Genre with Id: " +
              arr[i] +
              " does not exists. You should create it first")
      );
  return [res, err];
};

module.exports = {
  get_movies,
  get_movie_by_ID,
  new_movie,
  update_movie,
  delete_movie,
};
