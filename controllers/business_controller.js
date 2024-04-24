const BusinessService = require("../db_services/business_services");

exports.createBusiness = async (req, res) => {
  try {
    const businessData = req.body;
    
    const newBusiness = await BusinessService.createBusiness(businessData);
    res.status(201).json(newBusiness);
  } catch (error) {
    console.error("Error creating business:", error);
    res.status(500).json({ error: "Failed to create business" });
  }
};

exports.getBusiness = async (req, res) => {
  try {
    const businessId = req.params.id;
    const business = await BusinessService.getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }
    res.json(business);
  } catch (error) {
    console.error("Error getting business:", error);
    res.status(500).json({ error: "Failed to get business" });
  }
};

exports.updateBusiness = async (req, res) => {
  try {
    const businessId = req.params.id;
    const updatedBusinessData = req.body;
    const updatedBusiness = await BusinessService.updateBusiness(
      businessId,
      updatedBusinessData
    );
    if (!updatedBusiness) {
      return res.status(404).json({ error: "Business not found" });
    }
    res.json(updatedBusiness);
  } catch (error) {
    console.error("Error updating business:", error);
    res.status(500).json({ error: "Failed to update business" });
  }
};
