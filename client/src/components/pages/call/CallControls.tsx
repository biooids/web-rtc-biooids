"use client";

import React, { useState, useEffect } from "react";
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

// --- FIX: Add isMicDisabled to the props interface ---
interface CallControlsProps {
  onLeave: () => void;
  localStream: MediaStream;
  onToggleScreenShare: () => void;
  isScreenSharing: boolean;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  isMicDisabled: boolean;
}

export default function CallControls({
  onLeave,
  localStream,
  onToggleScreenShare,
  isScreenSharing,
  onToggleChat,
  onToggleParticipants,
  isMicDisabled,
}: CallControlsProps) {
  const [isMicMuted, setIsMicMuted] = useState(
    !localStream.getAudioTracks()[0]?.enabled
  );
  const [isCameraOff, setIsCameraOff] = useState(
    !localStream.getVideoTracks()[0]?.enabled
  );

  useEffect(() => {
    const audioTrack = localStream.getAudioTracks()[0];
    if (!audioTrack) return;
    const syncState = () => setIsMicMuted(!audioTrack.enabled);
    const intervalId = setInterval(syncState, 200);
    return () => clearInterval(intervalId);
  }, [localStream]);

  const toggleMic = () => {
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
    }
  };

  const toggleCamera = () => {
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
    }
  };

  return (
    <div className="flex justify-center items-center p-4 bg-card/50 rounded-lg border">
      <div className="flex gap-4">
        {/* --- FIX: Add the 'disabled' attribute to the button --- */}
        <Button
          onClick={toggleMic}
          variant="secondary"
          size="lg"
          className="rounded-full w-16 h-16"
          disabled={isMicDisabled}
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
