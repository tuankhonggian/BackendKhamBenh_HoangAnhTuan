const express = require("express");
const {
    getAppointmentsStatistics,
    getRevenueStatistics,
    getDashboardStatistics
} = require('../controllers/Admin/admin.statistics.controller');

const router = express.Router();

// API thống kê ca khám
// GET /api/admin/statistics/appointments?type=day&startDate=01/01/2024&endDate=31/01/2024
router.get("/statistics/appointments", getAppointmentsStatistics);

// API thống kê doanh thu
// GET /api/admin/statistics/revenue?type=day&startDate=01/01/2024&endDate=31/01/2024
router.get("/statistics/revenue", getRevenueStatistics);

// API tổng hợp thống kê dashboard
// GET /api/admin/statistics/dashboard
router.get("/statistics/dashboard", getDashboardStatistics);

module.exports = router;
