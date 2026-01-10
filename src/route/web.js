// route/web.js
const express = require('express');
const { loginAccAdmin } = require('../controllers/Login/login.admin.controller');
const router = express.Router();



let initWebRoutes = (app) => {
    // rest api
    router.post("/api/login-admin", loginAccAdmin );

    app.use("/", router);  
};

module.exports = initWebRoutes;
