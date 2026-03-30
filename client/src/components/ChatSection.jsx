import React, { useState, useEffect, useRef } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router";
import { useAuth } from "@/context/authContext";
import axios from "axios";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const ChatSection = ({ setParticipantsList, setSettingsOpen }) => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchRoomData = async () => {
      if (!roomId) return;
      setLoading(true);
      try {
        const res = await axios.get(`${API}/api/rooms/get-room/${roomId}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setMessages(res.data.messages || []);
        }
      } catch (err) {
        console.error("Error fetching room data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId]);

  const socketRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    socketRef.current = io(API);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("joinRoom", {
        roomId,
        username: user?.name,
        userId: user?.id,
      });
    });

    socketRef.current.on("participants", (list) => {
      setParticipantsList(list);
    });

    socketRef.current.on("toastError", (msg) => {
      toast.error(msg);
    });

    socketRef.current.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (message.trim() && roomId && user?.id) {
      const newMessage = {
        roomId,
        encryptedText: message,
        sender: user.id,
      };

      socketRef.current.emit("sendMessage", newMessage);
      setMessage("");
    }
  };

  if (!roomId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-muted-foreground font-mono uppercase tracking-[0.2em] text-[10px]">
        Select a secure channel to begin transmission
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background relative">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {loading ? (
          <div className="text-center text-muted-foreground animate-pulse mt-10 font-mono tracking-widest text-[10px] uppercase">
            Synchronizing data...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground italic mt-10 font-mono tracking-widest text-[10px] uppercase">
            No history found. Post your first encrypted log.
          </div>
        ) : (
          messages.map((msg) => {
            const currentUserName = user?.name;
            const senderName =
              msg.sender?.username ||
              (typeof msg.sender === "string" ? msg.sender : "");
            // Case-insensitive check just in case
            const isMe =
              (senderName &&
                currentUserName &&
                senderName.toLowerCase() === currentUserName.toLowerCase()) ||
              senderName.toLowerCase() === "me";

            const isSystem = senderName.toLowerCase() === "system";

            if (isSystem) {
              return (
                <div
                  key={msg._id}
                  className="flex justify-center items-center py-2 animate-in fade-in duration-500"
                >
                  <div className="bg-primary/10 border border-primary/20 px-4 py-1 rounded-full text-[11px] font-mono font-bold text-primary uppercase tracking-wider shadow-[0_0_10px_rgba(0,255,0,0.1)]">
                    {msg.encryptedText}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg._id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-2 duration-300 w-full`}
              >
                {senderName && (
                  <span className="text-[10px] font-bold text-primary mb-1 px-1 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(0,255,0,0.5)]">
                    {senderName}
                  </span>
                )}
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm font-mono shadow-[0_0_15px_rgba(0,255,0,0.15)] ${
                    isMe
                      ? "bg-primary/25 text-foreground rounded-tr-none border border-primary"
                      : "bg-secondary/60 text-foreground rounded-tl-none border border-primary/50"
                  }`}
                >
                  {msg.encryptedText}
                </div>
                <span className="text-[9px] text-primary/80 mt-1 px-1 font-mono uppercase">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t bg-background">
        {user ? (
          <div className="flex items-end gap-2 bg-secondary p-2 rounded-xl border border-secondary transition-all focus-within:ring-2 focus-within:ring-primary/20 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]">
            <textarea
              name="text"
              id="text"
              placeholder="Inject secure log..."
              value={message}
              rows={1}
              className="flex-1 min-h-[40px] max-h-[120px] bg-transparent border-none outline-none resize-none p-2 text-sm placeholder:text-muted-foreground font-mono"
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!message.trim()}
              className="shrink-0 size-10 rounded-lg hover:shadow-[0_0_15px_rgba(0,255,0,0.3)] transition-all bg-primary hover:bg-primary/80 text-background"
            >
              <SendHorizontal className="size-5" />
              <span className="sr-only">Send Message</span>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 bg-secondary/20 rounded-xl border border-dashed border-primary/30 backdrop-blur-md animate-in fade-in zoom-in-95 duration-500">
            <p className="text-[11px] font-mono font-bold text-primary/70 uppercase tracking-[0.2em] mb-4 drop-shadow-[0_0_8px_rgba(0,255,0,0.3)] text-center">
              Identity required to participate in secure transmission
            </p>
            <Button
              onClick={() => setSettingsOpen(true)}
              className="bg-primary/20 hover:bg-primary/40 text-primary border border-primary/50 text-[10px] uppercase font-bold tracking-[0.3em] px-8 py-5 h-auto shadow-[0_0_20px_rgba(0,255,0,0.2)] hover:shadow-[0_0_30px_rgba(0,255,0,0.4)] transition-all"
            >
              Establish Connection
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSection;
