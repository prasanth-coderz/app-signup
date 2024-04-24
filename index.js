const express = require("express");
const ConnectToDB = require("./config/db_config"); //Database config
const router = require("./router/routes");
const User = require("./models/user_model");
const Business = require("./models/business_model");

const app = express();

const port = process.env.SERVER_PORT || 4000;

app.use(express.json());


app.use("/", router);

ConnectToDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
