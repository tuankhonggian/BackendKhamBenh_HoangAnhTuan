const express = require("express");
const { loginAccAdmin, logoutAdmin, registerAccAdmin } = require('../controllers/Login/login.admin.controller');
const { doiThongTinDoctor, loginDoctor, logoutDoctor } = require('../controllers/Login/login.doctor.controller');
const { 
    loginBenhNhan, registerBenhNhan, logoutBenhNhan, createKH, updateKH, getAccKH, getOneAccKH, khoaAccKH, deleteKH, doiThongTinKH
 } = require('../controllers/Login/login.user.controller');
 const { quenMatKhauBN, quenMatKhauDoctor } = require('../controllers/Login/quen.password.controller');
const router = express.Router();

// route đăng nhập admin
router.post("/login-admin", loginAccAdmin );
// route register admin
router.post("/register-admin", registerAccAdmin );
// route logout  admin
router.post("/logout-admin", logoutAdmin );

// route đăng nhập benh nhan
router.post("/login-benh-nhan", loginBenhNhan );
// route register benh nhan
router.post("/register-benh-nhan", registerBenhNhan);
// route logout  benh nhan
router.post("/logout-benh-nhan", logoutBenhNhan );
router.post("/create-benh-nhan", createKH );
router.put("/update-benh-nhan", updateKH );

router.get("/get-one-kh", getOneAccKH );

router.put("/doi-thong-tin", doiThongTinKH)

router.put("/doi-mat-khau-doctor", doiThongTinDoctor)

// route đăng nhập admin
router.post("/login-doctor", loginDoctor );
router.post("/logout-doctor", logoutDoctor );

router.post("/quen-mat-khau-doctor", quenMatKhauDoctor)
router.post("/quen-mat-khau-kh", quenMatKhauBN)

router.get("/get-all-kh", getAccKH);
router.put("/khoa-kh", khoaAccKH);
router.delete("/delete-kh/:id", deleteKH);

module.exports = router;