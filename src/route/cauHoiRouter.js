const express = require("express");
const { traLoiCauHoi, createCauHoi, getCauHoi, getAllCauHoi } = require("../controllers/CauHoi/cau.hoi.controller");
const router = express.Router();

router.post("/create-cau-hoi", createCauHoi );

router.get("/get-cau-hoi", getCauHoi );

router.get("/get-all-cau-hoi", getAllCauHoi );

router.put("/tra-loi-cau-hoi", traLoiCauHoi );

module.exports = router;