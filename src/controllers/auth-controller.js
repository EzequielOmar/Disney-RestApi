const User = require("../../models").Users;
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const signUp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).send({ error: errors.array(), code: 400 });
  const { email, pass } = req.body;
  let exists = await User.findOne({ where: { email: email } });
  if (exists)
    return res.status(400).send({ error: "Email is being used", code: 400 });
  let hash = await bcryptjs.hash(
    pass,
    await bcryptjs.genSalt(+process.env.SALT)
  );
  return User.create({
    email: email,
    pass: hash,
  })
    .then((user) =>
      res.status(201).send({
        message: "User created",
        email: user.dataValues.email,
        code: 201,
      })
    )
    .catch((err) => res.status(500).send({ error: err, code: 500 }));
};

const logIn = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).send({ error: errors.array(), code: 400 });
  const { email, pass } = req.body;
  let exists = await User.findOne({ where: { email: email } });
  if (!exists)
    return res.status(400).send({ error: "Invalid email", code: 400 });
  const match = await bcryptjs.compare(pass, exists.pass);
  if (!match)
    return res.status(400).send({ error: "Invalid password", code: 400 });
  const payload = {
    user_id: exists.id,
  };
  return res.status(200).send({
    message: "User logged correctly",
    accessToken: jwt.sign(payload, process.env.JWT_PASS, {
      expiresIn: "1d",
    }),
    code: 200,
  });
};

module.exports = {
  signUp,
  logIn,
};
