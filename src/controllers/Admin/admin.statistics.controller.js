const KhamBenh = require('../../model/KhamBenh');
const Booking = require('../../model/Booking');
const SepayTransaction = require('../../model/SepayTransaction');
const moment = require('moment-timezone');

module.exports = {
    // API thống kê ca khám
    getAppointmentsStatistics: async (req, res) => {
        try {
            const { type = 'day', startDate, endDate } = req.query;
            // type: 'day', 'week', 'month', 'year'
            // startDate, endDate: format 'DD/MM/YYYY' or ISO date

            let start, end;
            const timezone = 'Asia/Ho_Chi_Minh';

            // Xác định khoảng thời gian
            if (startDate && endDate) {
                // Nếu có startDate và endDate từ query
                if (startDate.includes('/')) {
                    // Format DD/MM/YYYY
                    const [day, month, year] = startDate.split('/');
                    start = moment.tz(`${year}-${month}-${day}`, 'YYYY-MM-DD', timezone).startOf('day');
                    const [endDay, endMonth, endYear] = endDate.split('/');
                    end = moment.tz(`${endYear}-${endMonth}-${endDay}`, 'YYYY-MM-DD', timezone).endOf('day');
                } else {
                    start = moment.tz(startDate, timezone).startOf('day');
                    end = moment.tz(endDate, timezone).endOf('day');
                }
            } else {
                // Mặc định theo type
                const now = moment.tz(timezone);
                switch (type) {
                    case 'week':
                        start = now.clone().subtract(7, 'days').startOf('day');
                        end = now.clone().endOf('day');
                        break;
                    case 'month':
                        start = now.clone().subtract(30, 'days').startOf('day');
                        end = now.clone().endOf('day');
                        break;
                    case 'year':
                        start = now.clone().subtract(365, 'days').startOf('day');
                        end = now.clone().endOf('day');
                        break;
                    default: // 'day'
                        start = now.clone().subtract(7, 'days').startOf('day');
                        end = now.clone().endOf('day');
                }
            }

            // Lấy tất cả ca khám trong khoảng thời gian
            const appointments = await KhamBenh.find({
                createdAt: {
                    $gte: start.toDate(),
                    $lte: end.toDate()
                }
            }).sort({ createdAt: 1 });

            // Thống kê theo ngày
            const statsByDay = {};
            const statsByStatus = {
                'Đã đặt lịch': 0,
                'Chưa đặt lịch': 0,
                'Đã Hủy': 0,
                'Không Hủy': 0,
                'Đã xác nhận': 0,
                'Chưa xác nhận': 0,
                'Đã khám': 0,
                'Chưa khám': 0,
                'Đã thanh toán': 0,
                'Chưa thanh toán': 0
            };

            appointments.forEach(apt => {
                const dateKey = moment(apt.createdAt).tz(timezone).format('DD/MM/YYYY');
                
                if (!statsByDay[dateKey]) {
                    statsByDay[dateKey] = {
                        date: dateKey,
                        total: 0,
                        confirmed: 0,
                        cancelled: 0,
                        completed: 0,
                        paid: 0
                    };
                }

                statsByDay[dateKey].total++;
                
                // Thống kê theo trạng thái
                if (apt.trangThai === 'Đã đặt lịch') statsByStatus['Đã đặt lịch']++;
                if (apt.trangThai === 'Chưa đặt lịch') statsByStatus['Chưa đặt lịch']++;
                if (apt.trangThaiHuyDon === 'Đã Hủy') {
                    statsByStatus['Đã Hủy']++;
                    statsByDay[dateKey].cancelled++;
                } else {
                    statsByStatus['Không Hủy']++;
                }
                if (apt.trangThaiXacNhan) {
                    statsByStatus['Đã xác nhận']++;
                    statsByDay[dateKey].confirmed++;
                } else {
                    statsByStatus['Chưa xác nhận']++;
                }
                if (apt.trangThaiKham) {
                    statsByStatus['Đã khám']++;
                    statsByDay[dateKey].completed++;
                } else {
                    statsByStatus['Chưa khám']++;
                }
                if (apt.trangThaiThanhToan) {
                    statsByStatus['Đã thanh toán']++;
                    statsByDay[dateKey].paid++;
                } else {
                    statsByStatus['Chưa thanh toán']++;
                }
            });

            // Chuyển đổi thành mảng và sắp xếp theo ngày
            const chartData = Object.values(statsByDay).sort((a, b) => {
                const [dayA, monthA, yearA] = a.date.split('/');
                const [dayB, monthB, yearB] = b.date.split('/');
                return new Date(`${yearA}-${monthA}-${dayA}`) - new Date(`${yearB}-${monthB}-${dayB}`);
            });

            res.json({
                success: true,
                data: {
                    chartData, // Dữ liệu cho biểu đồ
                    statsByStatus, // Thống kê theo trạng thái
                    total: appointments.length,
                    period: {
                        start: start.format('DD/MM/YYYY'),
                        end: end.format('DD/MM/YYYY')
                    }
                }
            });
        } catch (error) {
            console.error('Error getting appointments statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy thống kê ca khám',
                error: error.message
            });
        }
    },

    // API thống kê doanh thu
    getRevenueStatistics: async (req, res) => {
        try {
            const { type = 'day', startDate, endDate } = req.query;
            const timezone = 'Asia/Ho_Chi_Minh';

            let start, end;

            // Xác định khoảng thời gian
            if (startDate && endDate) {
                if (startDate.includes('/')) {
                    const [day, month, year] = startDate.split('/');
                    start = moment.tz(`${year}-${month}-${day}`, 'YYYY-MM-DD', timezone).startOf('day');
                    const [endDay, endMonth, endYear] = endDate.split('/');
                    end = moment.tz(`${endYear}-${endMonth}-${endDay}`, 'YYYY-MM-DD', timezone).endOf('day');
                } else {
                    start = moment.tz(startDate, timezone).startOf('day');
                    end = moment.tz(endDate, timezone).endOf('day');
                }
            } else {
                const now = moment.tz(timezone);
                switch (type) {
                    case 'week':
                        start = now.clone().subtract(7, 'days').startOf('day');
                        end = now.clone().endOf('day');
                        break;
                    case 'month':
                        start = now.clone().subtract(30, 'days').startOf('day');
                        end = now.clone().endOf('day');
                        break;
                    case 'year':
                        start = now.clone().subtract(365, 'days').startOf('day');
                        end = now.clone().endOf('day');
                        break;
                    default: // 'day'
                        start = now.clone().subtract(7, 'days').startOf('day');
                        end = now.clone().endOf('day');
                }
            }

            // Lấy doanh thu từ KhamBenh (đã thanh toán)
            const paidAppointments = await KhamBenh.find({
                trangThaiThanhToan: true,
                createdAt: {
                    $gte: start.toDate(),
                    $lte: end.toDate()
                }
            });

            // Lấy doanh thu từ SepayTransaction (giao dịch thành công)
            const transactions = await SepayTransaction.find({
                transactionDate: {
                    $gte: start.toDate(),
                    $lte: end.toDate()
                },
                transferAmount: { $gt: 0 } // Chỉ lấy giao dịch có số tiền > 0
            });

            // Thống kê theo ngày
            const revenueByDay = {};
            let totalRevenueFromAppointments = 0;
            let totalRevenueFromTransactions = 0;

            // Xử lý doanh thu từ ca khám
            paidAppointments.forEach(apt => {
                const dateKey = moment(apt.createdAt).tz(timezone).format('DD/MM/YYYY');
                const amount = parseFloat(apt.giaKham) || 0;
                
                if (!revenueByDay[dateKey]) {
                    revenueByDay[dateKey] = {
                        date: dateKey,
                        revenue: 0,
                        count: 0
                    };
                }

                revenueByDay[dateKey].revenue += amount;
                revenueByDay[dateKey].count++;
                totalRevenueFromAppointments += amount;
            });

            // Xử lý doanh thu từ giao dịch
            transactions.forEach(trans => {
                const dateKey = moment(trans.transactionDate).tz(timezone).format('DD/MM/YYYY');
                const amount = parseFloat(trans.transferAmount) || 0;
                
                if (!revenueByDay[dateKey]) {
                    revenueByDay[dateKey] = {
                        date: dateKey,
                        revenue: 0,
                        count: 0
                    };
                }

                // Chỉ cộng nếu chưa tính từ appointments (tránh trùng lặp)
                // Hoặc có thể tính riêng nếu muốn
                revenueByDay[dateKey].revenue += amount;
                totalRevenueFromTransactions += amount;
            });

            // Chuyển đổi thành mảng và sắp xếp
            const chartData = Object.values(revenueByDay)
                .sort((a, b) => {
                    const [dayA, monthA, yearA] = a.date.split('/');
                    const [dayB, monthB, yearB] = b.date.split('/');
                    return new Date(`${yearA}-${monthA}-${dayA}`) - new Date(`${yearB}-${monthB}-${dayB}`);
                })
                .map(item => ({
                    ...item,
                    revenue: Math.round(item.revenue)
                }));

            const totalRevenue = totalRevenueFromAppointments + totalRevenueFromTransactions;

            res.json({
                success: true,
                data: {
                    chartData, // Dữ liệu cho biểu đồ
                    totalRevenue: Math.round(totalRevenue),
                    totalRevenueFromAppointments: Math.round(totalRevenueFromAppointments),
                    totalRevenueFromTransactions: Math.round(totalRevenueFromTransactions),
                    totalAppointments: paidAppointments.length,
                    totalTransactions: transactions.length,
                    period: {
                        start: start.format('DD/MM/YYYY'),
                        end: end.format('DD/MM/YYYY')
                    }
                }
            });
        } catch (error) {
            console.error('Error getting revenue statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy thống kê doanh thu',
                error: error.message
            });
        }
    },

    // API tổng hợp thống kê dashboard
    getDashboardStatistics: async (req, res) => {
        try {
            const timezone = 'Asia/Ho_Chi_Minh';
            const now = moment.tz(timezone);
            const today = now.clone().startOf('day');
            const thisMonth = now.clone().startOf('month');
            const lastMonth = now.clone().subtract(1, 'month').startOf('month');
            const lastMonthEnd = now.clone().subtract(1, 'month').endOf('month');

            // Thống kê hôm nay
            const todayAppointments = await KhamBenh.countDocuments({
                createdAt: { $gte: today.toDate() }
            });

            const todayPaidAppointments = await KhamBenh.find({
                trangThaiThanhToan: true,
                createdAt: { $gte: today.toDate() }
            });

            let todayRevenue = 0;
            todayPaidAppointments.forEach(apt => {
                todayRevenue += parseFloat(apt.giaKham) || 0;
            });

            // Thống kê tháng này
            const thisMonthAppointments = await KhamBenh.countDocuments({
                createdAt: { $gte: thisMonth.toDate() }
            });

            const thisMonthPaidAppointments = await KhamBenh.find({
                trangThaiThanhToan: true,
                createdAt: { $gte: thisMonth.toDate() }
            });

            let thisMonthRevenue = 0;
            thisMonthPaidAppointments.forEach(apt => {
                thisMonthRevenue += parseFloat(apt.giaKham) || 0;
            });

            // Thống kê tháng trước
            const lastMonthAppointments = await KhamBenh.countDocuments({
                createdAt: {
                    $gte: lastMonth.toDate(),
                    $lte: lastMonthEnd.toDate()
                }
            });

            const lastMonthPaidAppointments = await KhamBenh.find({
                trangThaiThanhToan: true,
                createdAt: {
                    $gte: lastMonth.toDate(),
                    $lte: lastMonthEnd.toDate()
                }
            });

            let lastMonthRevenue = 0;
            lastMonthPaidAppointments.forEach(apt => {
                lastMonthRevenue += parseFloat(apt.giaKham) || 0;
            });

            // Tổng số ca khám theo trạng thái
            const totalConfirmed = await KhamBenh.countDocuments({ trangThaiXacNhan: true });
            const totalPending = await KhamBenh.countDocuments({ trangThaiXacNhan: false });
            const totalCompleted = await KhamBenh.countDocuments({ trangThaiKham: true });
            const totalCancelled = await KhamBenh.countDocuments({ trangThaiHuyDon: 'Đã Hủy' });

            res.json({
                success: true,
                data: {
                    today: {
                        appointments: todayAppointments,
                        revenue: Math.round(todayRevenue)
                    },
                    thisMonth: {
                        appointments: thisMonthAppointments,
                        revenue: Math.round(thisMonthRevenue)
                    },
                    lastMonth: {
                        appointments: lastMonthAppointments,
                        revenue: Math.round(lastMonthRevenue)
                    },
                    statusSummary: {
                        confirmed: totalConfirmed,
                        pending: totalPending,
                        completed: totalCompleted,
                        cancelled: totalCancelled
                    },
                    revenueGrowth: lastMonthRevenue > 0 
                        ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
                        : 0
                }
            });
        } catch (error) {
            console.error('Error getting dashboard statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy thống kê dashboard',
                error: error.message
            });
        }
    }
};
