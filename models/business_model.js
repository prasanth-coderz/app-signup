const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema({
  business_name: {
    type: String,
    required: [true, "Business name is required"],
    unique:true
  },
  address: {
    type: String,
    required: [true, "Address is required"],
  },
  tax_id: {
    type: String,
    required: [true, "Tax ID is required"],
    unique: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

const Business = mongoose.model("Business_model", businessSchema);

module.exports = Business;
