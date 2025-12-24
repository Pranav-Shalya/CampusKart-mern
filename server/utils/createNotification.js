import Notification from "../models/Notification.js";

export const createNotification = async ({
  userId,
  title,
  message,
  orderId,
  type = "ORDER_STATUS",
}) => {
  if (!userId) return;
  return Notification.create({
    user: userId,
    title,
    message,
    order: orderId || undefined,
    type,
  });
};
