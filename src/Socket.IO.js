
const { Server } = require("socket.io");
const Message = require("./model/Chat_Message");
const Conversation = require("./model/Chat_Conversation");

let io;

// ✅ Dùng Set để lưu danh sách user đang online, hiệu quả hơn object
const onlineUsers = new Set();

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
        origin: [
            'http://localhost:3002', // home 
            'http://localhost:3001', // doctor
            'https://homekhambenh.dantri24h.com',
            'https://homekhambenh.dantri24h.com',
            'https://doctorkhambenh.dantri24h.com',
            'https://datlichkhambenh.dokhactu.site',
        ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Một người dùng đã kết nối:", socket.id);

    // Lắng nghe sự kiện 'join' từ client để biết ai đang online
    socket.on("join", (userId) => {
        console.log(`User ${userId} đã tham gia với socket ${socket.id}`);
        // Cho socket này vào một "phòng" riêng có tên chính là userId
        // Giúp gửi tin nhắn tới tất cả các thiết bị của user đó
        socket.join(userId);
        onlineUsers.add(userId);
        // Gửi danh sách người đang online tới tất cả client
        io.emit("getOnlineUsers", Array.from(onlineUsers));
    });

    // Lắng nghe sự kiện gửi tin nhắn
    socket.on("sendMessage", async ({ conversationId, sender, receiver, content }) => {
        try {
          // sender và receiver giờ là object: { id: '...', model: '...' }
          const { id: senderId, model: senderModel } = sender;
          const { id: receiverId, model: receiverModel } = receiver;
  
          const newMessage = new Message({
            conversationId,
            sender: { senderId, senderModel },
            content,
            readBy: [{ readerId: senderId, readerModel: senderModel }],
          });
          await newMessage.save();
  
          await Conversation.findByIdAndUpdate(conversationId, {
              lastMessage: {
                  content,
                  senderId: senderId,
                  senderModel: senderModel,
                  createdAt: new Date(),
              },
              $set: { updatedAt: new Date() } // Cập nhật để sort
          });
  
          // ✅ Sửa cách populate cho Dynamic References
          const populatedMessage = await Message.findById(newMessage._id)
              .populate('sender.senderId', 'firstName lastName image');
  
          // Gửi tin nhắn tới phòng của người nhận và người gửi
          io.to(receiverId).emit("receiveMessage", populatedMessage);
          io.to(senderId).emit("receiveMessage", populatedMessage);
  
        } catch (error) {
          console.error("Lỗi khi gửi tin nhắn:", error);
        }
      });

    socket.on("disconnect", () => {
        console.log("🔴 Người dùng đã ngắt kết nối:", socket.id);
        // Cần tìm ra userId nào đã ngắt kết nối để xóa khỏi onlineUsers
        // Cách đơn giản là khi client disconnect, nó gửi 1 event cuối cùng
        // Hoặc bạn cần một cấu trúc phức tạp hơn để map socket.id với userId
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error("Socket.io chưa được khởi tạo!");
  }
  return io;
};

module.exports = { initSocket, getIo };