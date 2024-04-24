

const Business = require("../models/business_model");

exports.createBusiness = async (businessData) => {
  try {
    const newBusiness = await Business.create(businessData);
    return newBusiness;
  } catch (error) {
    throw new Error("Failed to create business");
  }
};

exports.getBusinessById = async (businessId) => {
  try {
    const business = await Business.findById(businessId);
    return business;
  } catch (error) {
    throw new Error("Failed to get business");
  }
};

exports.updateBusiness = async (businessId, updatedBusinessData) => {
  try {
    const updatedBusiness = await Business.findByIdAndUpdate(
      businessId,
      updatedBusinessData,
      { new: true }
    );
    return updatedBusiness;
  } catch (error) {
    throw new Error("Failed to update business");
  }
};

