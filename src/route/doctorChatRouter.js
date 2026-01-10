const express = require('express');
const { startOrGetConversation, getConversations, getMessages, markAsRead } = require('../controllers/Chat/doctorChatController');
const router = express.Router();


// Bệnh nhân bắt đầu cuộc trò chuyện (cần middleware xác thực bệnh nhân)
router.post('/start', startOrGetConversation);

// Lấy danh sách cuộc trò chuyện (cả bác sĩ và bệnh nhân đều dùng được)
router.post('/chat', getConversations);

// Lấy tin nhắn (cả hai đều dùng được)
router.get('/messages/:conversationId', getMessages);

// Đánh dấu đã đọc (cả hai đều dùng được)
router.post('/read/:conversationId', markAsRead);

module.exports = router;