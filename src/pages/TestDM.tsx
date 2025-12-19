import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Button } from "../manual-components/ui/button";
import { Card } from "../manual-components/ui/card";
interface Message {
  id: number;
  user_name: string;
  content: string;
  created_at: string;
}

interface ChatBoxProps {
  communityId: string;
  currentUser: string;
}

export default function ChatBox({ communityId, currentUser }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // ambil pesan pertama kali
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("community_id", communityId)
      .order("created_at", { ascending: true });

    if (!error && data) setMessages(data);
  };

  // kirim pesan baru
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const { error } = await supabase.from("messages").insert([
      {
        community_id: communityId,
        user_name: currentUser,
        content: newMessage,
      },
    ]);
    if (!error) setNewMessage("");
  };

  // realtime listener
  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("messages-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card className="text-black flex flex-col h-[500px] w-full md:w-[400px] border-[#006989]/50">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.user_name === currentUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-3 py-2 rounded-xl max-w-[80%] text-sm ${
                msg.user_name === currentUser
                  ? "bg-[#006989] text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <p className="font-medium">{msg.user_name}</p>
              <p>{msg.content}</p>
              <span className="text-[10px] opacity-70">
                {new Date(msg.created_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 p-3 border-t">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#006989] text-black"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button
          onClick={sendMessage}
          className="bg-[#006989] hover:bg-[#006989]/90 text-white"
        >
          Send
        </Button>
      </div>
    </Card>
  );
}
