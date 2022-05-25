const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.header("Authorization");
  if (!authHeader)
    return res.status(401).send({ error: "Token not found", code: 401 });
  try {
    jwt.verify(authHeader.split(" ")[1], process.env.JWT_PASS);
    next();
  } catch (err) {
    next({ error: "Token expired, please login again", code: 401 });
  }
};
