"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { useAppSelector } from "@/lib/hooks/hooks";
import { Card } from "@/components/ui/card";
import { Reaction } from "@/lib/features/reactions/reactionsSlice";
import "./ReactionAnimation.css"; // Make sure you have this CSS file for the animation
import { MicOff } from "lucide-react";

interface VideoPlayerProps {
  stream: MediaStream;
  displayName?: string;
  peerId: string;
  localPeerId: string | null;
}

// --- FIX: This is the component that will render the animated emoji ---
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
  const { peerMuteStatus, peerDisplayNames } = useAppSelector(
    (state) => state.webrtc
  );
  // --- FIX: Select the reaction state for this specific peer ---
  const reaction = useAppSelector(
    (state) => state.reactions.latestReactions[peerId]
  );

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
      audioTrack.addEventListener("mute", updateMuteState);
      audioTrack.addEventListener("unmute", updateMuteState);
      return () => {
        audioTrack.removeEventListener("mute", updateMuteState);
        audioTrack.removeEventListener("unmute", updateMuteState);
      };
    }
  }, [stream]);

  const muteReasons = useMemo(() => {
    if (!muteStatus || isLocal) return [];
    const reasons: string[] = [];
    if (muteStatus.isMutedByHost || isRemoteTrackMuted) {
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
  }, [muteStatus, isRemoteTrackMuted, localPeerId, peerDisplayNames, isLocal]);

  return (
    <Card className="overflow-hidden aspect-video relative bg-muted">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className="w-full h-full object-cover scale-x-[-1]"
      />

      {/* --- FIX: Conditionally render the reaction bubble on this video card --- */}
      {reaction && <ReactionBubble reaction={reaction} />}

      {(muteStatus?.isMutedByHost || isRemoteTrackMuted) && !isLocal && (
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
