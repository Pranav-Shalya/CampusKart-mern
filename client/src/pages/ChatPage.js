import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";

export default function ChatPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!user || !conversationId) return;

    const fetchMessages = async () => {
      const { data } = await api.get(`/chat/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMessages(data);
    };

    fetchMessages();

    // join socket room for this conversation
    socket.emit("join", conversationId);

    // listen for new messages from server
    const handleNewMessage = (msg) => {
      if (msg.conversation === conversationId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [conversationId, user]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;

    // send via socket for realtime
    socket.emit("sendMessage", {
      conversationId,
      text,
      senderId: user._id,
    });

    // optional: optimistic UI
    setMessages((prev) => [
      ...prev,
      {
        _id: Date.now().toString(),
        conversation: conversationId,
        sender: { _id: user._id, name: user.name },
        text,
      },
    ]);

    setText("");
  };

  if (!user) {
    return <Typography sx={{ mt: 2 }}>Please log in to chat.</Typography>;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "75vh" }}>
      <Paper
        sx={{
          flex: 1,
          p: 2,
          mb: 1,
          overflowY: "auto",
          borderRadius: 2,
        }}
      >
        {messages.length === 0 ? (
          <Typography color="text.secondary">No messages yet.</Typography>
        ) : (
          messages.map((m) => {
            const isMe =
              m.sender?._id === user._id || m.sender === user._id;
            const name = m.sender?.name || (isMe ? "You" : "User");

            return (
              <Box
                key={m._id}
                sx={{
                  display: "flex",
                  justifyContent: isMe ? "flex-end" : "flex-start",
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    maxWidth: "80%",
                    bgcolor: isMe ? "primary.main" : "#e0e0e0",
                    color: isMe ? "primary.contrastText" : "inherit",
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {name}
                  </Typography>
                  <Typography variant="body2">{m.text}</Typography>
                </Box>
              </Box>
            );
          })
        )}
      </Paper>

      <Box
        component="form"
        onSubmit={handleSend}
        sx={{ display: "flex", gap: 1 }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button type="submit" variant="contained">
          Send
        </Button>
      </Box>
    </Box>
  );
}
