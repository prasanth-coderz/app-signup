const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  phone: {
    type: Number,
    required: [true, "Phone number is required"],
    unique: true,
  },
  role: {
    type: String,
    default: "regular",
    enum: ["regular", "admin"],
  },
  businessName: {
    type: String,
  },
  revenue: {
    type: Number, 
    default: 0
  },

  date: {
    type: Date,
    default: Date.now,
  },
});



const User = mongoose.model("User_model", userSchema);
module.exports = User;
