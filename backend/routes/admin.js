// routes/auth.js
const express = require('express');
const router = express.Router();
const middlewareController = require("../Controller/middleWare");
const adminController = require('../Controller/admin');


// Route to get all users (Admin only)
router.get("/allusers", middlewareController.verifyTokenAndAdminAuth, adminController.getAllUsers);

module.exports = router;