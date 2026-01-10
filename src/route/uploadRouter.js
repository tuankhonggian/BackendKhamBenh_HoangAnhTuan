// routes/uploadRoutes.js
const express = require('express');
const {uploadFile} = require("../controllers/User/upload.controller")
const router = express.Router();

// Tạo route upload
router.post('/upload', uploadFile);

module.exports = router;
