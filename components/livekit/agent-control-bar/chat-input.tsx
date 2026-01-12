"use client";

import { useState } from "react";
import { PaperPlaneRight } from "@phosphor-icons/react";
import { Button } from "@/components/livekit/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  chatOpen: boolean;
  isAgentAvailable: boolean;
  onSend: (message: string) => void;
}

export function ChatInput({
  chatOpen,
  isAgentAvailable,
  onSend,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && isAgentAvailable) {
      onSend(message.trim());
      setMessage("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex items-center gap-2 overflow-hidden transition-all duration-300",
        chatOpen ? "mb-2 max-h-12 opacity-100" : "max-h-0 opacity-0"
      )}
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 rounded-full bg-secondary px-4 py-2 text-sm outline-none placeholder:text-muted-foreground"
        disabled={!isAgentAvailable}
      />
      <Button
        type="submit"
        size="icon"
        variant="secondary"
        disabled={!message.trim() || !isAgentAvailable}
      >
        <PaperPlaneRight weight="bold" />
      </Button>
    </form>
  );
}
