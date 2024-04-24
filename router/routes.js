// routes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user_controller");
const businessController = require("../controllers/business_controller");
const { verifyToken, isAdmin } = require("../middlewares/verification");


// User routes
router.post("/user/create", userController.registerUser); // POST request to create a new user
router.post("/user/login", userController.loginUser); // POST request to login a user
router.put("/user/update/:id", verifyToken, userController.updateUser); // PUT request to update a user
router.delete("/user/delete/:id", verifyToken, userController.deleteUser); // DELETE request to delete a user

// Business routes
router.post("/business/create", verifyToken, isAdmin, businessController.createBusiness); // POST request to create a new business
router.get("/business/combination",  userController.getUsersWithBusiness); // GET request to get users with business
router.get("/business/:id", verifyToken, isAdmin, businessController.getBusiness); // GET request to get a business
router.put("/business/update/:id", verifyToken, isAdmin, businessController.updateBusiness); // PUT request to update a business

// Pagination
router.post("/pagination", userController.pagination);

module.exports = router;
