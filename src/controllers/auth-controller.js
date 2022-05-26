const User = require("../../models").Users;
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { checkErrors } = require("../const/helpers");

const signUp = async (req, res, next) => {
  try {
    checkErrors(req);
    const { email, pass } = req.body;
    //* Check for user already logged error
    let exists = await User.findOne({ where: { email: email } });
    if (exists) throw { error: "Email is being used", code: 400 };
    //* Hash password in order to store it
    let hash = await bcryptjs.hash(
      pass,
      await bcryptjs.genSalt(+process.env.SALT)
    );
    //* Store User on db
    await User.create({
      email: email,
      pass: hash,
    });
    return res.status(201).send({
      message: "User created",
      code: 201,
    });
  } catch (err) {
    next(err);
  }
};

const logIn = async (req, res, next) => {
  try {
    checkErrors(req);
    const { email, pass } = req.body;
    //* Check for user does not exists error
    let exists = await User.findOne({ where: { email: email } });
    if (!exists) throw { error: "Invalid email", code: 400 };
    //* Check for incorrect password error
    const match = await bcryptjs.compare(pass, exists.pass);
    if (!match) throw { error: "Invalid password", code: 400 };
    return res.status(200).send({
      message: "User logged correctly",
      accessToken: jwt.sign(
        {
          user_id: exists.id,
        },
        process.env.JWT_PASS,
        {
          expiresIn: "1d",
        }
      ),
      code: 200,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  signUp,
  logIn,
};
