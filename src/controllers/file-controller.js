const fs = require("fs");
const { Uploads_URLs } = require("../const/helpers");

const save_image = (file) => {
  const newName = file.filename + "." + file.mimetype.split("/").pop();
  fs.rename(file.path, file.destination + newName, (err) => {
    if (err) throw { error: err, code: 500 };
  });
  return newName;
};

const move_image = (oldImageName, newFile) => {
  const newName = save_image(newFile);
  if (oldImageName) fs.unlinkSync(Uploads_URLs.Characters + oldImageName);
  return newName;
};

const delete_image = (imageName) => {
  if (imageName && fs.existsSync(Uploads_URLs.Characters + imageName))
    fs.unlinkSync(Uploads_URLs.Characters + imageName);
};

module.exports = { save_image, move_image, delete_image };
