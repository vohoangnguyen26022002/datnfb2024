// routes/auth.js
const express = require('express');
const { signup, login, logout, changePassword, getKhoaStatus, updateKhoaStatus, logUnlockHistory,  } = require('../Controller/auth');
const router = express.Router();
const middlewareController = require("../Controller/middleWare");


// Định nghĩa route cho đăng ký
router.post('/signup', signup);

// Định nghĩa route cho đăng nhập
router.post('/login', login);

router.post("/logout", middlewareController.verifyToken, logout);

router.post("/changepassword",middlewareController.verifyToken, changePassword);

router.get('/khoa',middlewareController.verifyToken, getKhoaStatus);

router.post('/khoa',middlewareController.verifyToken, updateKhoaStatus);

router.post('/khoahistory', middlewareController.verifyToken, logUnlockHistory);

module.exports = router;
