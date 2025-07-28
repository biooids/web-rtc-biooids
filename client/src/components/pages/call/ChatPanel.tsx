//src/components/pages/call/ChatPanel.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppSelector } from "@/lib/hooks/hooks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatPanelProps {
  onSendMessage: (message: string) => void;
}

export default function ChatPanel({ onSendMessage }: ChatPanelProps) {
  const { messages } = useAppSelector((state) => state.chat);
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText("");
    }
  };

  return (
    <div className="w-80 h-full bg-card border-l flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-center">In-Call Messages</h3>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {messages.map((msg, index) => (
            <div key={index} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{msg.senderName}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm bg-muted p-2 rounded-md">{msg.text}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            autoComplete="off"
          />
          <Button type="submit" size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
