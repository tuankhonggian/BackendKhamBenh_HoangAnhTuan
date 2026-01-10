const express = require("express");
const KhamBenh = require("../model/KhamBenh");
const {
    fetchAllDoctor,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    fetchAllDoctorById,
    fetchDoctorById,
    fetchDoctorByNgayGio,
    fetchDoctorByChuyenKhoa,
    fetchDoctorByPhongKham,
    datLichKham,
    datLichKhamTTVNPay,
    getLichHen,
    handleHuyOrder,
    findAllLichHen,
    findAllLichHenByDoctor,
    xacNhanLich,
    updateTTBN,
    doanhThu,    
    deleteOldTimeSlots,
    addTimeKhamBenhDoctor,
    getTimeSlotsByDoctorAndDate,
    fetchAllThoiGianGio,
    updatePhongKham,
    deleteLichHen,
    deletePhongKham,
    createPhongKham,
    fetchAllPhongKham,
    deleteChucVu,
    updateChucVu,
    createChucVu,
    fetchAllChucVu,
    updateChuyenKhoa,
    deleteChuyenKhoa,
    createChuyenKhoa,
    fetchChuyenKhoaByID,
    fetchAllChuyenKhoa,
    fetchPhongKhamByID,
    thanhToanOnlineSepay,
    layChiTietDonHang
} = require("../controllers/User/user.doctor.controller");

const { IpnFailChecksum, VNPay, IpnOrderNotFound, IpnInvalidAmount, InpOrderAlreadyConfirmed, IpnSuccess, IpnUnknownError, ignoreLogger, VerifyReturnUrl } = require("vnpay");
const router = express.Router();

// get all doctor
router.get("/fetch-all-doctor", fetchAllDoctor);
// find doctor by id
router.get("/fetch-doctor-by-id", fetchAllDoctorById);
// route create doctor
router.post("/create-doctor", createDoctor);
// route update doctor
router.put("/update-doctor", updateDoctor);
// route delete doctor
router.delete("/delete-doctor/:id", deleteDoctor);


// get all Chuyên khoa
router.get("/fetch-all-chuyen-khoa", fetchAllChuyenKhoa);
// get by id
router.get("/fetch-chuyen-khoa-by-id", fetchChuyenKhoaByID);
// route create Chuyên khoa
router.post("/create-chuyen-khoa", createChuyenKhoa);
// route delete Chuyên khoa
router.delete("/delete-chuyen-khoa/:id", deleteChuyenKhoa);
// route update Chuyên khoa
router.put("/update-chuyen-khoa", updateChuyenKhoa);


// get all Chức vụ
router.get("/fetch-all-chuc-vu", fetchAllChucVu);
// route create Chức vụ
router.post("/create-chuc-vu", createChucVu);
// route update Chức vụ
router.put("/update-chuc-vu", updateChucVu);
// route delete Chức vụ
router.delete("/delete-chuc-vu/:id", deleteChucVu);


// get all phòng khám
router.get("/fetch-all-phong-kham", fetchAllPhongKham);
// route create phòng khám
router.post("/create-phong-kham", createPhongKham);
// route delete phòng khám
router.delete("/delete-phong-kham/:id", deletePhongKham);
router.delete("/delete-lich-hen/:id", deleteLichHen);
// route update Chức vụ
router.put("/update-phong-kham", updatePhongKham);

// fetch all thoi gian gio
router.get("/fetch-all-time-gio", fetchAllThoiGianGio);
// API để lấy thời gian khám của bác sĩ theo ngày
router.get("/get-time-slots", getTimeSlotsByDoctorAndDate);
// them thoi gian kham benh
router.post("/add-time", addTimeKhamBenhDoctor);
// xóa lịch trình cũ đi
router.post('/delete-old-time-slots', deleteOldTimeSlots);
// tìm ra doctor để hiển thị chi tiết
router.get('/view-doctor', fetchDoctorById);
// hiển thị info doctor kèm theo thgian khám cho page đặt lịch khám
router.get('/page-dat-lich-kham', fetchDoctorByNgayGio);
// dat lich kham
router.post("/dat-lich-kham", datLichKham);
router.post("/dat-lich-kham-vnpay", datLichKhamTTVNPay);
// get lich hen
router.get("/lich-hen", getLichHen);


// tim bac si thong qua id chuyen khoa
router.get("/doctor-chuyen-khoa", fetchDoctorByChuyenKhoa);

router.post("/huy-order", handleHuyOrder);
router.get("/find-all-order", findAllLichHen)
router.get("/find-all-order-by-doctor", findAllLichHenByDoctor)

router.get("/fetch-phong-kham-by-id", fetchPhongKhamByID);
router.get("/doctor-phong-kham", fetchDoctorByPhongKham);

router.put("/edit-xacnhan-lich", xacNhanLich);
router.put("/edit-thongtinkham", updateTTBN);
router.post("/thong-ke", doanhThu);

router.get('/vnpay_return', async (req, res) => {
    const vnp_TxnRef = req.query.vnp_TxnRef; // Lấy mã giao dịch từ callback
    const vnp_ResponseCode = req.query.vnp_ResponseCode; // Lấy mã phản hồi từ VNPay

    console.log("vnp_TxnRef: ", vnp_TxnRef);

    if (vnp_ResponseCode === '00') { // '00' là mã thành công
        // So sánh vnp_TxnRef với _id trong model Order
        const order = await KhamBenh.findById(vnp_TxnRef);
        if (order) {
            // Cập nhật trạng thái đơn hàng
            order.trangThaiXacNhan = true;
            order.trangThaiThanhToan = true;
            await order.save();

            res.render('tbThanhToan.ejs');

        } else {
            res.status(404).send('Không tìm thấy đơn hàng');
        }
    } else {
        res.send('Thanh toán không thành công, đã đặt đơn nhưng chưa được thanh toán');
        // res.status(400).json({
        //     message: 'Thanh toán không thành công, đã đặt đơn nhưng chưa được thanh toán',
        //     redirectUrl: '/mycart'
        // });
    }
});

router.post("/thanh-toan-online-sepay", thanhToanOnlineSepay);
router.get("/:maDonHang", layChiTietDonHang);



module.exports = router;