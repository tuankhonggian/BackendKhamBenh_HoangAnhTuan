const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    // Mảng chứa thông tin của những người tham gia
    participants: [{
        _id: false, // Không tạo _id cho sub-document này
        participantId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            // ✅ Tham chiếu động tới nhiều model
            refPath: 'participants.participantModel'
        },
        participantModel: {
            type: String,
            required: true,
            // ✅ Chỉ cho phép giá trị là 'Doctor' hoặc 'BenhNhan'
            enum: ['Doctor', 'BenhNhan']
        }
    }],
    // Lưu lại tin nhắn cuối cùng để hiển thị preview
    lastMessage: {
        content: String,
        senderId: {
             type: mongoose.Schema.Types.ObjectId,
             refPath: 'lastMessage.senderModel'
        },
        senderModel: {
            type: String,
            enum: ['Doctor', 'BenhNhan']
        },
        createdAt: Date,
    },
}, { timestamps: true });

module.exports = mongoose.model('Chat_Conversation', ConversationSchema);