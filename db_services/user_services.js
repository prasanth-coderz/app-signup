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
    if (search) {
      const fieldsToSearch = ["name", "phone", "role", "businessName"];
      matchQuery.$or = fieldsToSearch.map((field) => ({
        [field]: { $regex: search, $options: "i" },
      }));
    }

    let message = "";
    if (!search) {
      message = "All records are displayed because the search field is empty.";
    }

    if (filters) {
      Object.entries(filters).forEach(([field, value]) => {
        if (value !== "") {
          // Check if the filter field is from the user model or business model
          if (field === "companyName") {
            // If it's from the business model, use the field 'businessName'
            matchQuery["businessName"] = {
              $regex: value,
              $options: "i",
            };
          } else if (field in Business.schema.paths) {
            // Filter by field from the business model
            aggregationPipeline.push({
              $lookup: {
                from: "business_models",
                let: { businessName: "$businessName" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$business_name", "$$businessName"] },
                          {
                            $regexMatch: {
                              input: `$${field}`,
                              regex: value,
                              options: "i",
                            },},],},},},],
                as: "businessDetails",
              },
            });
          } else {
            // Handle fields dynamically based on data type
            const fieldSchema = UserModel.schema.paths[field];
            if (fieldSchema && fieldSchema.instance === "String") {
              matchQuery[field] = { $regex: value, $options: "i" };
            } else if (fieldSchema && fieldSchema.instance === "Number") {
              matchQuery[field] = parseInt(value);
            }}}});
    }
    if (Object.keys(matchQuery).length > 0) {
      aggregationPipeline.push({ $match: matchQuery });
    }

    // SORTING FUNCTIONALITY
    if (sort && sort.order) {
      const sortOptions = {};
      const sortField = sort.field ? sort.field : "name"; // Default sort field "name"
      sortOptions[sortField] = sort.order === "asc" ? 1 : -1;
      aggregationPipeline.push({ $sort: sortOptions });
    }

    // Pagination stages
    aggregationPipeline.push({ $skip: skip });
    aggregationPipeline.push({ $limit: limitNumber });

    // Lookup stage to join with the business collection
    aggregationPipeline.push({
      $lookup: {
        from: "business_models",
        localField: "businessName",
        foreignField: "business_name",
        as: "businessDetails",
      },
    });

    const user_records = await UserModel.aggregate(aggregationPipeline);

    let totalCount = 0;
    let warningMessage = "";

    if (user_records.length === 0 && search) {
      warningMessage = "No records found matching the search term.";
    } else {
      totalCount = await UserModel.aggregate([
        { $match: matchQuery },
        { $count: "count" },
      ]);
    }
    const totalRecords = totalCount.length > 0 ? totalCount[0].count : 0;
    const remainingRecords = Math.max(
      totalRecords - pageNumber * limitNumber,
      0
    );

    res.json({
      totalCount: totalRecords,
      currentPage: warningMessage ? 0 : pageNumber,
      totalPages: Math.ceil(totalRecords / limitNumber),
      ...(message !== "" && { message }),
      remainingRecords,
      user_records,
      ...(warningMessage !== "" && { warningMessage }),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error on retrieving user", error: error.message });
  }
};
