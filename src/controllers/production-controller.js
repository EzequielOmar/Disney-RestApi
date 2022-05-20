const Production = require("../../models").Productions;
const Character = require("../../models").Characters;
const Genre = require("../../models").Genres;
const Characters_Productions = require("../../models").Characters_Productions;
const Genres_Productions = require("../../models").Genres_Productions;
const { sequelize } = require("../../models");
const fs = require("fs");
const { Uploads_URLs } = require("../const/urls");

const get_productions = async (req, res) => {
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
      attributes: ["id", "image", "name"],
    });
  if (req.query.order === "DESC") ord = "DESC";
  Production.findAll({
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

const get_production_by_ID = async (req, res) =>
  Production.findByPk(req.params.id, {
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
        : res.status(500).send({
            error: "ID does not belong to existing production.",
            code: 500,
          })
    )
    .catch((err) => res.status(500).send({ error: err, code: 500 }));

const new_production = async (req, res) => {
  let characters, genres, err, image;
  if (req.file && req.file.fieldname === "image") image = req.file.filename;
  if (req.body.characters)
    [characters, err] = await checkCharacters(req.body.characters);
  if (err)
    return res.status(500).send({
      error: err,
      code: 500,
    });
  if (req.body.genres) [genres, err] = await checkGenres(req.body.genres);
  if (err)
    return res.status(500).send({
      error: err,
      code: 500,
    });
  return Production.create({
    image: image,
    title: req.body.title,
    creation: req.body.creation,
    score: req.body.score,
  })
    .then((prod) => {
      prod.addCharacter(characters);
      prod.addGenre(genres);
      return res.status(201).send({
        message: "Production created.",
        data: prod.dataValues,
        code: 201,
      });
    })
    .catch((err) => res.status(500).send({ error: err, code: 500 }));
};

const update_production = async (req, res) => {
  let characters,
    genres,
    err,
    newValues = {
      title: req.body.name,
      creation: req.body.creation,
      score: req.body.score,
    };
  let exists = await Production.findByPk(req.params.id);
  if (!exists)
    return res
      .status(500)
      .send({ error: "ID does not belong to existing production.", code: 500 });
  else if (req.file && req.file.fieldname === "image") {
    newValues.image = req.file.filename;
    if (exists.image)
      fs.unlinkSync(Uploads_URLs.Productions + exists.dataValues.image);
  }
  if (req.body.characters)
    [characters, err] = await checkCharacters(req.body.characters);
  if (err)
    return res.status(500).send({
      error: err,
      code: 500,
    });
  if (req.body.genres) [genres, err] = await checkGenres(req.body.genres);
  if (err)
    return res.status(500).send({
      error: err,
      code: 500,
    });
  exists.addCharacter(characters);
  exists.addGenre(genres);
  return Production.update(newValues, {
    where: { id: req.params.id },
  })
    .then((c) => {
      let message = c[0] ? "Production modified." : "Production not modified.";
      return res.status(200).send({
        message: message,
        code: 200,
      });
    })
    .catch((err) => res.status(500).send({ error: err, code: 500 }));
};

const delete_production = async (req, res) => {
  let exists = await Production.findByPk(req.params.id);
  if (!exists)
    return res.status(500).send({
      error: "ID does not belong to existing production.",
      code: 500,
    });
  if (exists.image)
    fs.unlinkSync(Uploads_URLs.Productions + exists.dataValues.image);
  await Characters_Productions.destroy({
    where: { ProductionId: exists.id },
  });
  await Genres_Productions.destroy({
    where: { ProductionId: exists.id },
  });
  return Production.destroy({
    where: {
      id: exists.id,
    },
  })
    .then(() =>
      res.status(200).send({
        message: "Production deleted.",
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
              " does not exists. You should create it first.")
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
              " does not exists. You should create it first.")
      );
  return [res, err];
};

module.exports = {
  get_productions,
  get_production_by_ID,
  new_production,
  update_production,
  delete_production,
};
