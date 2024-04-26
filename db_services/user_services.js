const UserModel = require("../models/user_model");
const Business = require("../models/business_model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerUser = async (userData) => {
  const { name, email, password, phone, role, businessName } = userData;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new UserModel({
    name,
    email,
    password: hashedPassword,
    phone,
    role,
    businessName,
  });
  return await newUser.save();
};
exports.loginUser = async (email, password) => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new Error("Invalid email or password");
  }
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRY,
    }
  );
  return token;
};

exports.updateUser = async (userId, updatedUserData) => {
  return await UserModel.findByIdAndUpdate(userId, updatedUserData, {
    new: true,
  });
};

exports.deleteUser = async (userId) => {
  return await UserModel.findByIdAndDelete(userId);
};

exports.getUsersWithBusiness = async () => {
  try {
    return await UserModel.aggregate([
      {
        $lookup: {
          from: "business_models",
          localField: "businessName",
          foreignField: "business_name",
          as: "Business Details",
        },
      },
    ]);
  } catch (error) {
    throw new Error("Failed to get users with business: " + error.message);
  }
};

exports.paginateRecords = async (req, res) => {
  try {
    const { page, limit, search, filters, sort } = req.body;
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 5;
    const skip = (pageNumber - 1) * limitNumber;

    const aggregationPipeline = [];

    const matchQuery = {};
    aggregationPipeline.push({
      $lookup: {
        from: "business_models",
        localField: "businessName",
        foreignField: "business_name",
        as: "businessDetails",
      },
    });

    // Aggregation pipeline to calculate total revenue for each business
    aggregationPipeline.push(
      // Group by business name and calculate total revenue
      {
        $group: {
          _id: "$businessName",
          Total_Revenue: { $sum: "$revenue" },
          users: { $push: "$$ROOT" },
        },
      },
      // Unwind users to handle filtering and pagination
      { $unwind: "$users" }
    );

    if (search) {
      const fieldsToSearch = ["name", "phone", "role", "businessName"];
      matchQuery.$or = fieldsToSearch.map((field) => ({
        ["users." + field]: { $regex: search, $options: "i" },
      }));
    }

    let message = "";
    if (!search) {
      message = "All records are displayed because the search field is empty.";
    }

    if (filters) {
      Object.entries(filters).forEach(([field, value]) => {
        if (value !== "") {
          if (field === "_id") {
            matchQuery["_id"] = {
              $regex: value,
              $options: "i",
            };
          }
          if (field === "Total_Revenue") {
            matchQuery["Total_Revenue"] = parseInt(value);
          } else {
            const fieldSchema = UserModel.schema.paths[field];
            if (fieldSchema && fieldSchema.instance === "String") {
              matchQuery["users." + field] = { $regex: value, $options: "i" };
            } else if (fieldSchema && fieldSchema.instance === "Number") {
              matchQuery[field] = parseInt(value);
            }
          }
        }
      });
    }
    if (Object.keys(matchQuery).length > 0) {
      aggregationPipeline.push({ $match: matchQuery });
    }


    // Pagination stages
    aggregationPipeline.push({ $skip: skip });
    aggregationPipeline.push({ $limit: limitNumber });

    // Execute aggregation pipeline
    const result = await UserModel.aggregate(aggregationPipeline);


    const user_records = result;

    res.json({
      totalCount: user_records.length,
      currentPage: pageNumber,
      totalPages: Math.ceil(user_records.length / limitNumber),
      ...(message !== "" && { message }),
      user_records,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error on retrieving user", error: error.message });
  }
};
