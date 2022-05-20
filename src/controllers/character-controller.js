const Character = require("../../models").Characters;
const Production = require("../../models").Productions;
const Characters_Productions = require("../../models").Characters_Productions;
const fs = require("fs");
const { Uploads_URLs } = require("../const/urls");

const get_characters = async (req, res) =>
  await Character.findAll({
    attributes: ["id", "image", "name"],
  })
    .then((data) =>
      res.status(200).send({
        data: data,
        code: 200,
      })
    )
    .catch((err) => res.status(500).send({ error: err, code: 500 }));

const get_character_by_ID = async (req, res) =>
  Character.findByPk(req.params.id, {
    include: [
      {
        model: Production,
        attributes: ["id", "title"],
      },
    ],
  })
    .then((data) => {
      data
        ? res.status(200).send({
            data: data.dataValues,
            code: 200,
          })
        : res.status(500).send({
            error: "ID does not belong to existing character.",
            code: 500,
          });
    })
    .catch((err) => res.status(500).send({ error: err, code: 500 }));

const new_character = async (req, res) => {
  let movies, err, image;
  if (req.body.movies) [movies, err] = await checkProductions(req.body.movies);
  if (err)
    return res.status(500).send({
      error: err,
      code: 500,
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
      char.addProduction(movies);
      return res.status(201).send({
        message: "Character created.",
        data: char.dataValues,
        code: 201,
      });
    })
    .catch((err) => res.status(500).send({ error: err, code: 500 }));
};

const update_character = async (req, res) => {
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
      .status(500)
      .send({ error: "ID does not belong to existing character.", code: 500 });
  else if (req.file && req.file.fieldname === "image") {
    newValues.image = req.file.filename;
    if (exists.image)
      fs.unlinkSync(Uploads_URLs.Characters + exists.dataValues.image);
  }
  if (req.body.movies) [movies, err] = await checkProductions(req.body.movies);
  if (err)
    return res.status(500).send({
      error: err,
      code: 500,
    });
  exists.addProduction(movies);
  return Character.update(newValues, {
    where: { id: req.params.id },
  })
    .then((c) => {
      let message = c[0] ? "Character modified." : "Character not modified.";
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
    return res.status(500).send({
      error: "ID does not belong to existing character.",
      code: 500,
    });
  if (exists.image)
    fs.unlinkSync(Uploads_URLs.Characters + exists.dataValues.image);
  await Characters_Productions.destroy({
    where: { CharacterId: exists.id },
  });
  return Character.destroy({
    where: {
      id: exists.id,
    },
  })
    .then(() =>
      res.status(200).send({
        message: "Character deleted.",
        data: req.params.id,
        code: 200,
      })
    )
    .catch((err) => res.status(500).send({ error: err, code: 500 }));
};

const checkProductions = async (movies) => {
  let res = [];
  let err = "";
  let arr = JSON.parse(movies);
  if (arr.length)
    for (let i = 0; i < arr.length; i++)
      await Production.findByPk(arr[i]).then((p) =>
        p
          ? res.push(arr[i])
          : (err =
              "Movie with Id: " +
              arr[i] +
              " does not exists. You should create the movie first.")
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
