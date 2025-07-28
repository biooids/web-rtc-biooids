"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { useAppSelector } from "@/lib/hooks/hooks";
import { Card } from "@/components/ui/card";
import { Reaction } from "@/lib/features/reactions/reactionsSlice";
import "./ReactionAnimation.css";
import { MicOff } from "lucide-react";

interface VideoPlayerProps {
  stream: MediaStream;
  displayName?: string;
  peerId: string;
  localPeerId: string | null;
}

const ReactionBubble = ({ reaction }: { reaction: Reaction }) => (
  <div key={reaction.id} className="reaction-bubble">
    {reaction.emoji}
  </div>
);

export default function VideoPlayer({
  stream,
  displayName,
  peerId,
  localPeerId,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // --- FIX: Get the global room mute status and host status ---
  const {
    peerMuteStatus,
    peerDisplayNames,
    isRoomMutedByHost,
    isHost,
    allowedToSpeak,
  } = useAppSelector((state) => state.webrtc);

  const reactionForPeer = useAppSelector(
    (state) => state.reactions.latestReactions[peerId]
  );
  const reactionForLocal = useAppSelector(
    (state) => state.reactions.latestReactions[localPeerId || ""]
  );
  const reaction = peerId === "local" ? reactionForLocal : reactionForPeer;

  const [isRemoteTrackMuted, setIsRemoteTrackMuted] = useState(false);

  const isLocal = peerId === "local" || peerId === localPeerId;
  const muteStatus = peerMuteStatus[peerId];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      if (!isLocal && localPeerId) {
        videoRef.current.muted =
          muteStatus?.personallyMutedBy.includes(localPeerId) || false;
      }
    }
  }, [stream, muteStatus, localPeerId, isLocal]);

  useEffect(() => {
    const audioTrack = stream?.getAudioTracks()[0];
    if (audioTrack) {
      const updateMuteState = () => setIsRemoteTrackMuted(!audioTrack.enabled);
      updateMuteState();
      const interval = setInterval(updateMuteState, 500);
      return () => clearInterval(interval);
    }
  }, [stream]);

  const muteReasons = useMemo(() => {
    if (!muteStatus || isLocal) return [];
    const reasons: string[] = [];
    const isAllowed = allowedToSpeak.includes(peerId);

    // Only show "Muted by host" if they are not specifically allowed to speak
    if ((muteStatus.isMutedByHost || isRemoteTrackMuted) && !isAllowed) {
      reasons.push("Muted by host");
    }
    muteStatus.personallyMutedBy.forEach((muterId) => {
      if (muterId === localPeerId) {
        reasons.push("Muted by you");
      } else {
        reasons.push(`Muted by ${peerDisplayNames[muterId] || "another user"}`);
      }
    });
    return [...new Set(reasons)];
  }, [
    muteStatus,
    isRemoteTrackMuted,
    localPeerId,
    peerDisplayNames,
    isLocal,
    allowedToSpeak,
    peerId,
  ]);

  return (
    <Card className="overflow-hidden aspect-video relative bg-muted">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className="w-full h-full object-cover scale-x-[-1]"
      />
      {reaction && <ReactionBubble reaction={reaction} />}

      {/* --- FIX: New logic to show an overlay on YOUR screen when muted by host --- */}
      {isLocal && isRoomMutedByHost && !isHost && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 text-center">
          <div className="flex items-center gap-2 text-white text-sm">
            <MicOff className="w-5 h-5" />
            You are muted by the host
          </div>
        </div>
      )}

      {/* This overlay is for remote peers */}
      {muteReasons.length > 0 && !isLocal && (
        <div className="absolute top-2 right-2 p-2 rounded-full bg-black/50">
          <MicOff className="w-5 h-5 text-white" />
        </div>
      )}

      {displayName && (
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/50 text-white text-sm backdrop-blur-sm">
          <p>{displayName}</p>
          {muteReasons.length > 0 && !isLocal && (
            <ul className="text-xs opacity-80 list-disc list-inside">
              {muteReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}
