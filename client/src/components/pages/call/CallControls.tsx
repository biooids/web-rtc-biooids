//src/components/pages/call/CallControls.tsx

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Monitor,
  MonitorOff,
  MessageSquare,
  Users,
} from "lucide-react";

interface CallControlsProps {
  onLeave: () => void;
  localStream: MediaStream;
  onToggleScreenShare: () => void;
  isScreenSharing: boolean;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
}

export default function CallControls({
  onLeave,
  localStream,
  onToggleScreenShare,
  isScreenSharing,
  onToggleChat,
  onToggleParticipants,
}: CallControlsProps) {
  const [isMicMuted, setIsMicMuted] = useState(
    !localStream.getAudioTracks()[0]?.enabled
  );
  const [isCameraOff, setIsCameraOff] = useState(
    !localStream.getVideoTracks()[0]?.enabled
  );

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
          disabled={isScreenSharing}
        >
          {isCameraOff ? <VideoOff /> : <Video />}
        </Button>
        <Button
          onClick={onToggleScreenShare}
          variant="secondary"
          size="lg"
          className="rounded-full w-16 h-16"
        >
          {isScreenSharing ? <MonitorOff /> : <Monitor />}
        </Button>
        <Button
          onClick={onToggleChat}
          variant="secondary"
          size="lg"
          className="rounded-full w-16 h-16"
        >
          <MessageSquare />
        </Button>
        <Button
          onClick={onToggleParticipants}
          variant="secondary"
          size="lg"
          className="rounded-full w-16 h-16"
        >
          <Users />
        </Button>
        <Button
          onClick={onLeave}
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
