const UserService = require("../db_services/user_services");

exports.registerUser = async (req, res) => {
  try {
    const userData = req.body;
    if (!["regular", "admin"].includes(userData.role)) {
      return res.status(400).json({ error: "Invalid role." });
    }
    const newUser = await UserService.registerUser(userData);
   res.status(201).json(newUser);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await UserService.loginUser(email, password);
    res.status(200).json({ token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Failed to log in user" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedUserData = req.body;
    const updatedUser = await UserService.updateUser(userId, updatedUserData);
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await UserService.deleteUser(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};



exports.getUsersWithBusiness = async (req, res) => {
  try {
    const usersWithBusiness = await UserService.getUsersWithBusiness();
    res.status(200).json(usersWithBusiness);
  } catch (error) {
    console.error("Error getting users with business:", error);
    res.status(500).json({ error: "Failed to get users with business" });
  }
};

exports.pagination = async (req, res) => {
  try {
    await UserService.paginateRecords(req, res);
  } catch (error) {
    console.error("Error getting users with pagination:", error);
    res.status(500).json({ error: "Failed to get users with pagination" });
  }
};