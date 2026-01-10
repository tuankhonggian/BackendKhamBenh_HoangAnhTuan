const mongoose = require('mongoose');

// Hàm sinh mã đơn hàng ngẫu nhiên 6 ký tự
function generateOrderCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}
const KhamBenh_Schema = new mongoose.Schema({     
        maDonHang: {
            type: String,
            unique: true,
            required: true,
            default: generateOrderCode,
        },        
        _idDoctor: {ref: "Doctor", type: mongoose.SchemaTypes.ObjectId},     
        _idTaiKhoan: {ref: "BenhNhan", type: mongoose.SchemaTypes.ObjectId},     
        patientName: { type: String },        
        email: { type: String },        
        gender: { type: Boolean },        
        phone: { type: String },        
        dateBenhNhan: { type: String },        
        address: { type: String },        
        lidokham: { type: String },        
        hinhThucTT: { type: String },        
        tenGioKham: { type: String },        
        ngayKhamBenh: { type: String },        
        giaKham: { type: String },  
        trangThai: { 
            type: String, 
            enum: ["Đã đặt lịch", "Chưa đặt lịch"], 
            default: "Đã đặt lịch" 
        },   
        trangThaiHuyDon: { 
            type: String, 
            enum: ["Đã Hủy", "Không Hủy"], 
            default: "Không Hủy" 
        },  
        trangThaiXacNhan: {
            type: Boolean,
            default: false
        },
        trangThaiKham: {
            type: Boolean,
            default: false
        },
        trangThaiThanhToan: {
            type: Boolean,
            default: false
        },
        benhAn: { type: String, default: '' }, 
    },
    { 
        timestamps: true,   // createAt, updateAt
    }
);
module.exports = mongoose.model("KhamBenh", KhamBenh_Schema);