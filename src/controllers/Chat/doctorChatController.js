const { getIo } = require("../../Socket.IO");
const Chat_Conversation = require("../../model/Chat_Conversation");
const Chat_Message = require("../../model/Chat_Message");
const Doctor = require("../../model/Doctor"); // Import model Doctor

// Bệnh nhân bắt đầu cuộc trò chuyện với một bác sĩ
exports.startOrGetConversation = async (req, res) => {
    try {
        const { doctorId, patientId } = req.body;
        const patient = req.user; // Lấy từ middleware 'protect', giả sử là bệnh nhân

        if (!doctorId) {
            return res.status(400).json({ message: "Vui lòng cung cấp ID bác sĩ." });
        }
        
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: "Bác sĩ không tồn tại." });
        }
        
        // Cấu trúc thông tin người tham gia
        const patientParticipant = { participantId: patientId, participantModel: 'BenhNhan' };
        const doctorParticipant = { participantId: doctor._id, participantModel: 'Doctor' };

        // Tìm cuộc trò chuyện đã tồn tại giữa 2 người
        let conversation = await Chat_Conversation.findOne({
            $and: [
                { participants: { $elemMatch: { participantId: patientId } } },
                { participants: { $elemMatch: { participantId: doctor._id } } }
            ]
        }).populate('participants.participantId', 'firstName lastName image');

        // Nếu chưa có, tạo mới
        if (!conversation) {
            conversation = new Chat_Conversation({
                participants: [patientParticipant, doctorParticipant],
            });
            await conversation.save();
            conversation = await Chat_Conversation.findById(conversation._id)
                .populate('participants.participantId', 'firstName lastName image');
        }

        // Lấy lịch sử tin nhắn và populate thông tin người gửi
        const messages = await Chat_Message.find({ conversationId: conversation._id })
            .populate('sender.senderId', 'firstName lastName image')
            .sort({ createdAt: 'asc' });

        res.status(200).json({ conversation, messages });

    } catch (error) {
        console.error("Lỗi tại startOrGetConversation:", error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};

// Lấy tất cả các cuộc trò chuyện của một người dùng (Bác sĩ hoặc Bệnh nhân)
exports.getConversations = async (req, res) => {
    try {
        const user = req.user;
        // const userId = user._id;
        const userId = req.body._idBN;
        // const userModel = req.user.roleId.ten_role === 'Doctor' ? 'Doctor' : 'BenhNhan'; // Giả sử có thông tin role

        const conversations = await Chat_Conversation.find({ 'participants.participantId': userId })
            .populate('participants.participantId', 'firstName lastName image')
            .sort({ 'updatedAt': -1 })
            .lean();

        for (const convo of conversations) {
            convo.unreadCount = await Chat_Message.countDocuments({
                conversationId: convo._id,
                'sender.senderId': { $ne: userId },
                'readBy.readerId': { $nin: [userId] }
            });
        }

        res.status(200).json(conversations);
    } catch (error) {
        console.error("Lỗi tại getConversations:", error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};

// Lấy tin nhắn của một cuộc hội thoại
exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Chat_Message.find({ conversationId })
            .populate('sender.senderId', 'firstName lastName image')
            .sort({ createdAt: 'asc' });
        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error("Lỗi tại getMessages: ", error);
        res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
};

// Đánh dấu đã đọc
exports.markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        // ✅ BƯỚC 1: Lấy thông tin người dùng từ req.body thay vì req.user
        const { userId, userRole } = req.body;

        // ✅ BƯỚC 2: Kiểm tra xem thông tin cần thiết đã được cung cấp chưa
        if (!userId || !userRole) {
            return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ userId và userRole trong body." });
        }
        if (userRole !== 'Doctor' && userRole !== 'patient') {
            return res.status(400).json({ message: "userRole không hợp lệ. Phải là 'Doctor' hoặc 'patient'." });
        }

        // ✅ BƯỚC 3: Tạo readerInfo từ các biến mới
        const readerInfo = {
            readerId: userId,
            readerModel: userRole
        };

        const conversation = await Chat_Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Không tìm thấy cuộc trò chuyện." });
        }
        
        // ✅ BƯỚC 4: Sử dụng userId từ body trong câu truy vấn
        await Chat_Message.updateMany(
            {
                conversationId: conversationId,
                'sender.senderId': { $ne: userId },
                'readBy.readerId': { $nin: [userId] }
            },
            {
                $addToSet: { readBy: readerInfo }
            }
        );

        // ✅ BƯỚC 5: Sử dụng userId từ body để tìm người còn lại và gửi socket
        const otherParticipant = conversation.participants.find(p => p.participantId.toString() !== userId.toString());
        if (otherParticipant) {
            const io = getIo();
            io.to(otherParticipant.participantId.toString()).emit('messagesRead', {
                conversationId: conversationId,
                readerId: userId // Gửi đi userId đã đọc
            });
        }

        res.status(200).json({ success: true, message: "Đã đánh dấu đã đọc." });

    } catch (error) {
        console.error("Lỗi tại markAsRead:", error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};