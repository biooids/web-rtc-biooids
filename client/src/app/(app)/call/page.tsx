"use client";

import React, { useState } from "react";
import Lobby from "@/components/pages/call/Lobby";
import CallRoom from "@/components/pages/call/CallRoom";

export default function CallPage() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const handleJoinCall = (id: string, stream: MediaStream) => {
    setRoomId(id);
    setLocalStream(stream);
  };

  const handleLeaveCall = () => {
    // This is now the single source of truth for stopping the stream tracks.
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    setRoomId(null);
    setLocalStream(null);
  };

  return (
    <div className="container mx-auto p-4">
      {roomId && localStream ? (
        <CallRoom
          roomId={roomId}
          localStream={localStream}
          onLeave={handleLeaveCall}
        />
      ) : (
        <Lobby onJoin={handleJoinCall} />
      )}
    </div>
  );
}
