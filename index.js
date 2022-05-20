const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Sequelize } = require("sequelize");
require("dotenv").config();

//routes
const characterRoutes = require("./src/routes/character-routes");
const productionRoutes = require("./src/routes/production-routes");

//app
const app = express();
const PORT = process.env.PORT || 8080;

// connection String to mysql
const sequelize = new Sequelize(
  "F8QUBGFw85",
  "F8QUBGFw85",
  process.env.DB_PASS,
  {
    host: "remotemysql.com",
    dialect: "mysql",
  }
);

const connectDB = async () =>
  await sequelize
    .authenticate()
    .then(console.log("Connection has been established successfully."))
    .catch((e) => console.error("Unable to connect to the database:", e));
connectDB();

// Apply CORS policy
//app.use(cors());

// parse application/json
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//Routes
//character endpoints
app.use("/characters", characterRoutes);
//production endpoints
app.use("/movies", productionRoutes);

// Assign the port number to our app
app.listen(PORT, () => console.log(`Server Running on port: ${PORT}`));
