const Movie = require("../../models").Movies;
const Character = require("../../models").Characters;
const Genre = require("../../models").Genres;
const { validationResult } = require("express-validator");

const Uploads_URLs = {
  Characters: "src/uploads/characters/",
  Genres: "src/uploads/genres/",
  Movies: "src/uploads/movies/",
};

/**
 * Check for errors of missing or invalid values in the request
 * sended by the client.
 * @param {*} req request
 * @param {*} next next callback that will handle the error
 */
const checkErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw { error: errors.array(), code: 400 };
};

/**
 * Look for each entitie by id, and check that exists.
 * Throw error if some entitie does not exists
 * @param {*} arr Array<int> of id's to search from
 * @param {*} model 'Character'|'Genre'|'Movie' String with name of entitie to look for.
 * (other string entered wont take efect)
 * @returns Array<id> with the existing entities, or throw error.
 */
const checkArrayOfIDs = async (arr, model) => {
  let res = [];
  let err = [];
  if (arr.length)
    for (let i = 0; i < arr.length; i++) {
      switch (model) {
        case "Character":
          await Character.findByPk(arr[i]).then((m) =>
            m
              ? res.push(arr[i])
              : err.push(
                  "Character with Id: " +
                    arr[i] +
                    " does not exists. You should create it first"
                )
          );
          break;
        case "Genre":
          await Genre.findByPk(arr[i]).then((m) =>
            m
              ? res.push(arr[i])
              : err.push(
                  "Genre with Id: " +
                    arr[i] +
                    " does not exists. You should create it first"
                )
          );
          break;
        case "Movie":
          await Movie.findByPk(arr[i]).then((m) =>
            m
              ? res.push(arr[i])
              : err.push(
                  "Movie with Id: " +
                    arr[i] +
                    " does not exists. You should create it first"
                )
          );
          break;
        default:
          break;
      }
    }
  if (err.length) throw { error: err, code: 400 };
  return res;
};

module.exports = { Uploads_URLs, checkErrors, checkArrayOfIDs };
