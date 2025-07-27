//src/components/pages/call/CallControls.tsx

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

// --- FIX: Add the localStream prop to the interface ---
interface CallControlsProps {
  onLeave: () => void;
  localStream: MediaStream;
}

export default function CallControls({
  onLeave,
  localStream,
}: CallControlsProps) {
  // We can now derive the initial state from the stream's tracks
  const [isMicMuted, setIsMicMuted] = useState(
    !localStream.getAudioTracks()[0]?.enabled
  );
  const [isCameraOff, setIsCameraOff] = useState(
    !localStream.getVideoTracks()[0]?.enabled
  );

  const handleLeaveCall = () => {
    onLeave();
  };

  // The toggle functions can now control the actual stream
  const toggleMic = () => {
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicMuted(!audioTrack.enabled);
    }
  };

  const toggleCamera = () => {
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOff(!videoTrack.enabled);
    }
  };

  return (
    <div className="flex justify-center items-center p-4 bg-card/50 rounded-lg border">
      <div className="flex gap-4">
        <Button
          onClick={toggleMic}
          variant="secondary"
          size="lg"
          className="rounded-full w-16 h-16"
        >
          {isMicMuted ? <MicOff /> : <Mic />}
        </Button>
        <Button
          onClick={toggleCamera}
          variant="secondary"
          size="lg"
          className="rounded-full w-16 h-16"
        >
          {isCameraOff ? <VideoOff /> : <Video />}
        </Button>
        <Button
          onClick={handleLeaveCall}
          variant="destructive"
          size="lg"
          className="rounded-full w-16 h-16"
        >
          <PhoneOff />
        </Button>
      </div>
    </div>
  );
}
