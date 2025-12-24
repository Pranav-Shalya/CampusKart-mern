import Notification from "../models/Notification.js";

export const getMyNotifications = async (req, res) => {
  const notifs = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(notifs);
};

export const markNotificationRead = async (req, res) => {
  const notif = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!notif) return res.status(404).json({ message: "Not found" });
  notif.isRead = true;
  await notif.save();
  res.json(notif);
};

export const markAllRead = async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );
  res.json({ success: true });
};
