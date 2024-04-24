//DATABASE CONFIG FILE

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

const ConnectToDB = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Database connected ...");
  } catch (err) {
    console.log("Error connecting to DB:", err);
    process.exit(1);
  }
};
module.exports = ConnectToDB;
