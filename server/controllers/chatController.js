import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

// controllers/chatController.js
export const startConversation = async (req, res) => {
  try {
    const { receiverId, productId, orderId } = req.body;

    if (!receiverId || (!productId && !orderId)) {
      return res
        .status(400)
        .json({ message: "receiverId and productId or orderId are required" });
    }

    const filter = {
      members: { $all: [req.user._id, receiverId] },
    };
    if (productId) filter.product = productId;
    if (orderId) filter.order = orderId;

    let convo = await Conversation.findOne(filter);

    if (!convo) {
      const data = {
        members: [req.user._id, receiverId],
      };
      if (productId) data.product = productId;
      if (orderId) data.order = orderId;

      convo = await Conversation.create(data);
    }

    return res.json(convo);
  } catch (err) {
    console.error("startConversation error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Server error starting conversation" });
  }
};


export const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;

    if (!conversationId || !text) {
      return res
        .status(400)
        .json({ message: "conversationId and text are required" });
    }

    const msg = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      text
    });

    return res.status(201).json(msg);
  } catch (err) {
    console.error("sendMessage error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Server error sending message" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id } = req.params; // conversation id

    const messages = await Message.find({ conversation: id })
      .populate("sender", "name")
      .sort("createdAt");

    return res.json(messages);
  } catch (err) {
    console.error("getMessages error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Server error fetching messages" });
  }
};
