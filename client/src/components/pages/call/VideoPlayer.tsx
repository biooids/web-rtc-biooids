"use client";

import React, { useRef, useEffect, useMemo } from "react";
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
  isLocalMicMuted: boolean; // --- FIX: Receive local mute state ---
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
  isLocalMicMuted,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    peerMuteStatus,
    peerDisplayNames,
    isRoomMutedByHost,
    isHost,
    allowedToSpeak,
    myId,
  } = useAppSelector((state) => state.webrtc);

  const reactionForPeer = useAppSelector(
    (state) => state.reactions.latestReactions[peerId]
  );
  const reactionForLocal = useAppSelector(
    (state) => state.reactions.latestReactions[localPeerId || ""]
  );
  const reaction = peerId === "local" ? reactionForLocal : reactionForPeer;

  const isLocal = peerId === "local" || peerId === myId;
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

  const muteReasons = useMemo(() => {
    if (isLocal || !muteStatus) return [];
    const reasons: string[] = [];
    const isAllowed = allowedToSpeak.includes(peerId);

    if (muteStatus.isSelfMuted) {
      reasons.push("Muted");
    }

    if (muteStatus.isMutedByHost && !isAllowed) {
      reasons.push(reasons.length > 0 ? "by host" : "Muted by host");
    }

    muteStatus.personallyMutedBy.forEach((muterId) => {
      if (muterId === localPeerId) {
        reasons.push("by you");
      }
    });
    return reasons.length > 0 ? [reasons.join(", ")] : [];
  }, [muteStatus, localPeerId, isLocal, allowedToSpeak, peerId]);

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

      {/* --- FIX: Logic for displaying self-mute overlay on your own card --- */}
      {isLocal && isLocalMicMuted && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 text-center">
          <div className="flex items-center gap-2 text-white text-sm">
            <MicOff className="w-5 h-5" />
            You muted yourself
          </div>
        </div>
      )}

      {isLocal &&
        isRoomMutedByHost &&
        !isHost &&
        !allowedToSpeak.includes(myId || "") && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 text-center">
            <div className="flex items-center gap-2 text-white text-sm">
              <MicOff className="w-5 h-5" />
              You are muted by the host
            </div>
          </div>
        )}

      {muteReasons.length > 0 && !isLocal && (
        <div className="absolute top-2 right-2 p-2 rounded-full bg-black/50">
          <MicOff className="w-5 h-5 text-white" />
        </div>
      )}

      {displayName && (
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/50 text-white text-sm backdrop-blur-sm">
          <p>{displayName}</p>
          {muteReasons.length > 0 && !isLocal && (
            <p className="text-xs opacity-80">{muteReasons[0]}</p>
          )}
        </div>
      )}
    </Card>
  );
}
