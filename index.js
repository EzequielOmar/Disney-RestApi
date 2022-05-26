const express = require("express");
const bodyParser = require("body-parser");
const { Sequelize } = require("sequelize");
require("dotenv").config();

//routes
const authRoutes = require("./src/routes/auth-routes");
const characterRoutes = require("./src/routes/character-routes");
const movieRoutes = require("./src/routes/movie-routes");

//app
const app = express();
const PORT = process.env.PORT || 8080;

// connection String to mysql
const sequelize = new Sequelize("F8QUBGFw85", "F8QUBGFw85", "b3LvHeDgmu", {
  host: "remotemysql.com",
  dialect: "mysql",
});

const connectDB = async () =>
  await sequelize
    .authenticate()
    .then(console.log("Connection has been established successfully."))
    .catch((e) => console.error("Unable to connect to the database:", e));
connectDB();

// parse application/json
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//Routes

//auth endpoints
app.use("/auth", authRoutes);
//character endpoints
app.use("/characters", characterRoutes);
//movie endpoints
app.use("/movies", movieRoutes);

app.use((err, req, res, next) => {
  console.log("err handler");
  console.log(err);
  //sequelize contrains errors
  if (err.hasOwnProperty("name"))
    return res.status(400).send({ error: err.errors[0].message, code: 400 });
  //operational errors
  else if (err.hasOwnProperty("code") && err.code !== 500)
    return res.status(err.code).send(err);
  //internal errors
  else
    return res
      .status(500)
      .send({ error: "Sorry, something went terribly wrong...", code: 500 });
});
// Assign the port number to our app
app.listen(PORT, () => console.log(`Server Running on port: ${PORT}`));
