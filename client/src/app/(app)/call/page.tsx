"use client";

import React, { useState } from "react";
import Lobby from "@/components/pages/call/Lobby";
import CallRoom from "@/components/pages/call/CallRoom";

export default function CallPage() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const handleJoinCall = (id: string, name: string, stream: MediaStream) => {
    setRoomId(id);
    setDisplayName(name);
    setLocalStream(stream);
  };

  const handleLeaveCall = () => {
    // This is the correct place to stop the stream, as the user is leaving the entire call feature.
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    setRoomId(null);
    setDisplayName(null);
    setLocalStream(null);
  };

  return (
    <div className="container mx-auto p-4">
      {roomId && localStream && displayName ? (
        <CallRoom
          roomId={roomId}
          displayName={displayName}
          localStream={localStream}
          onLeave={handleLeaveCall}
        />
      ) : (
        <Lobby onJoin={handleJoinCall} />
      )}
    </div>
  );
}
