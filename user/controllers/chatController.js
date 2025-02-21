const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const validationHelper = require('../utils/validationHelper');
const paginationHelper = require('../utils/paginationHelper');
const fileHandler = require('../utils/fileHandler');

const chatController = {
  createChat: catchAsync(async (req, res) => {
    if (!validationHelper.isValidId(req.body.userId) || 
        !validationHelper.isValidId(req.body.participantId)) {
      throw new ApiError(400, 'Invalid user IDs');
    }

    const existingChat = await Chat.findOne({
      participants: { 
        $all: [req.body.userId, req.body.participantId] 
      }
    });

    if (existingChat) {
      throw new ApiError(400, 'Chat already exists');
    }

    const chat = new Chat({
      participants: [req.body.userId, req.body.participantId],
      type: req.body.type || 'direct',
      lastMessage: null
    });

    await chat.save();

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'username email profileImage')
      .populate('lastMessage');

    const response = new ResponseHandler(res);
    return response.created(populatedChat);
  }),

  getUserChats: catchAsync(async (req, res) => {
    const { userId } = req.params;
    if (!validationHelper.isValidId(userId)) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const chats = await Chat.find({
      participants: userId
    })
      .skip(skip)
      .limit(limit)
      .populate('participants', 'username email profileImage')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    const total = await Chat.countDocuments({
      participants: userId
    });

    const response = new ResponseHandler(res);
    return response.success({
      chats,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  getChatMessages: catchAsync(async (req, res) => {
    const { chatId } = req.params;
    if (!validationHelper.isValidId(chatId)) {
      throw new ApiError(400, 'Invalid chat ID');
    }

    const { page, limit, skip } = paginationHelper.getPaginationParams(req);

    const messages = await Message.find({ chatId })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username email profileImage')
      .sort({ createdAt: -1 });

    const total = await Message.countDocuments({ chatId });

    await Message.updateMany(
      { chatId, read: false, sender: { $ne: req.user.id } },
      { read: true, readAt: Date.now() }
    );

    const response = new ResponseHandler(res);
    return response.success({
      messages,
      meta: paginationHelper.getPaginationMetadata(total, page, limit)
    });
  }),

  sendMessage: catchAsync(async (req, res) => {
    const { chatId } = req.params;
    if (!validationHelper.isValidId(chatId)) {
      throw new ApiError(400, 'Invalid chat ID');
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new ApiError(404, 'Chat not found');
    }

    const message = new Message({
      chatId,
      sender: req.user.id,
      content: req.body.content,
      type: req.body.type || 'text'
    });

    if (req.file && req.body.type === 'file') {
      const filePath = await fileHandler.saveFile(req.file, 'uploads/chat-files');
      message.fileUrl = filePath;
      message.fileName = req.file.originalname;
    }

    await message.save();

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
      updatedAt: Date.now()
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username email profileImage');

    const response = new ResponseHandler(res);
    return response.created(populatedMessage);
  }),

  deleteMessage: catchAsync(async (req, res) => {
    const { messageId } = req.params;
    if (!validationHelper.isValidId(messageId)) {
      throw new ApiError(400, 'Invalid message ID');
    }

    const message = await Message.findById(messageId);
    if (!message) {
      throw new ApiError(404, 'Message not found');
    }

    if (message.sender.toString() !== req.user.id) {
      throw new ApiError(403, 'Not authorized to delete this message');
    }

    if (message.fileUrl) {
      await fileHandler.deleteFile(message.fileUrl);
    }

    await message.remove();

    const lastMessage = await Message.findOne({ chatId: message.chatId })
      .sort({ createdAt: -1 });

    await Chat.findByIdAndUpdate(message.chatId, {
      lastMessage: lastMessage ? lastMessage._id : null
    });

    const response = new ResponseHandler(res);
    return response.noContent();
  }),

  markChatAsRead: catchAsync(async (req, res) => {
    const { chatId } = req.params;
    if (!validationHelper.isValidId(chatId)) {
      throw new ApiError(400, 'Invalid chat ID');
    }

    await Message.updateMany(
      {
        chatId,
        read: false,
        sender: { $ne: req.user.id }
      },
      {
        read: true,
        readAt: Date.now()
      }
    );

    const response = new ResponseHandler(res);
    return response.success({ message: 'Chat marked as read' });
  }),

  deleteChat: catchAsync(async (req, res) => {
    const { chatId } = req.params;
    if (!validationHelper.isValidId(chatId)) {
      throw new ApiError(400, 'Invalid chat ID');
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new ApiError(404, 'Chat not found');
    }

    if (!chat.participants.includes(req.user.id)) {
      throw new ApiError(403, 'Not authorized to delete this chat');
    }

    const messages = await Message.find({ chatId });
    for (const message of messages) {
      if (message.fileUrl) {
        await fileHandler.deleteFile(message.fileUrl);
      }
    }

    await Message.deleteMany({ chatId });
    await chat.remove();

    const response = new ResponseHandler(res);
    return response.noContent();
  })
};

module.exports = chatController; 