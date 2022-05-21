const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("Authorization").split(" ")[1];
  if (!token)
    return res.status(401).send({ error: "Token not found", code: 401 });
  try {
    jwt.verify(token, process.env.JWT_PASS);
    next();
  } catch (err) {
    res.status(401).send({ error: "Token expired", code: 401 });
  }
};
