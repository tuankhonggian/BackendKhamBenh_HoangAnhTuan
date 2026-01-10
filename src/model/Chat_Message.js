const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat_Conversation',
    },
    sender: {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'sender.senderModel'
        },
        senderModel: {
            type: String,
            required: true,
            enum: ['Doctor', 'BenhNhan']
        }
    },
    content: {
        type: String,
        trim: true,
    },
    // Lưu lại những người đã đọc tin nhắn
    readBy: [{
        _id: false,
        readerId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'readBy.readerModel'
        },
        readerModel: {
            type: String,
            enum: ['Doctor', 'BenhNhan']
        }
    }],
}, { timestamps: true });

module.exports = mongoose.model('Chat_Message', MessageSchema);