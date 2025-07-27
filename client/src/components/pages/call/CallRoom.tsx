"use client";

import React from "react";
import { useWebRTC } from "@/lib/hooks/useWebRTC";
import VideoPlayer from "./VideoPlayer";
import CallControls from "./CallControls";
import { Loader2 } from "lucide-react";

interface CallRoomProps {
  roomId: string;
  localStream: MediaStream;
  onLeave: () => void;
}

export default function CallRoom({
  roomId,
  localStream,
  onLeave,
}: CallRoomProps) {
  const { remoteStreams, leaveCall, isCallActive } = useWebRTC(
    roomId,
    localStream
  );

  const allStreams = [
    { stream: localStream, peerId: "local" },
    ...Object.entries(remoteStreams).map(([peerId, stream]) => ({
      peerId,
      stream,
    })),
  ];

  const handleLeave = () => {
    leaveCall();
    onLeave();
  };

  if (!isCallActive) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[80vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Connecting to call...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[85vh]">
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {allStreams.map(({ stream, peerId }) => (
          <VideoPlayer
            key={peerId}
            stream={stream}
            isMuted={peerId === "local"}
          />
        ))}
      </div>
      <div className="mt-auto p-4">
        <CallControls onLeave={handleLeave} localStream={localStream} />
      </div>
    </div>
  );
}
