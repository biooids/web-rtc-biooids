"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { useWebRTC } from "@/lib/hooks/useWebRTC";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/hooks";
import { toggleChat } from "@/lib/features/chat/chatSlice";
import VideoPlayer from "./VideoPlayer";
import CallControls from "./CallControls";
import ChatPanel from "./ChatPanel";
import ParticipantList from "./ParticipantList";
import { Loader2, Grid, UserSquare, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CallRoomProps {
  roomId: string;
  displayName: string;
  localStream: MediaStream;
  onLeave: () => void;
}

export default function CallRoom({
  roomId,
  displayName,
  localStream,
  onLeave,
}: CallRoomProps) {
  const {
    myId,
    remoteStreams,
    isCallActive,
    peerDisplayNames,
    isHost,
    hostId,
    peerMuteStatus,
    leaveCall,
    replaceTrack,
    sendChatMessage,
    sendReaction,
    toggleMuteAll,
  } = useWebRTC(roomId, displayName, localStream);

  const dispatch = useAppDispatch();
  const isChatOpen = useAppSelector((state) => state.chat.isOpen);

  const [layout, setLayout] = useState<"grid" | "featured" | "sidebar">("grid");
  const [featuredPeerId, setFeaturedPeerId] = useState<string>("local");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const cameraTrackRef = useRef<MediaStreamTrack | null>(null);

  const areAllMuted = useMemo(() => {
    const remotePeers = Object.values(peerMuteStatus);
    if (remotePeers.length === 0) return false;
    return remotePeers.every((status) => status.isMutedByHost);
  }, [peerMuteStatus]);

  const handleLeave = () => {
    leaveCall();
    onLeave();
  };

  const handleToggleChat = () => {
    if (isParticipantsOpen) {
      setIsParticipantsOpen(false);
    }
    dispatch(toggleChat());
  };

  const handleToggleParticipants = () => {
    if (isChatOpen) {
      dispatch(toggleChat());
    }
    setIsParticipantsOpen(!isParticipantsOpen);
  };

  const handleToggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      if (cameraTrackRef.current) {
        localStream.getVideoTracks()[0].stop();
        await replaceTrack(cameraTrackRef.current);
        localStream.removeTrack(localStream.getVideoTracks()[0]);
        localStream.addTrack(cameraTrackRef.current);
        setIsScreenSharing(false);
      }
    } else {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      if (!screenStream) return;

      const screenTrack = screenStream.getVideoTracks()[0];
      cameraTrackRef.current = localStream.getVideoTracks()[0];
      await replaceTrack(screenTrack);
      localStream.removeTrack(cameraTrackRef.current);
      localStream.addTrack(screenTrack);
      setIsScreenSharing(true);

      screenTrack.onended = () => {
        if (cameraTrackRef.current) {
          replaceTrack(cameraTrackRef.current);
          localStream.removeTrack(screenTrack);
          localStream.addTrack(cameraTrackRef.current);
          setIsScreenSharing(false);
        }
      };
    }
  }, [isScreenSharing, localStream, replaceTrack]);

  const allStreams = useMemo(
    () => [
      { stream: localStream, peerId: "local", displayName: displayName },
      ...Object.entries(remoteStreams).map(([peerId, stream]) => ({
        peerId,
        stream,
        displayName: peerDisplayNames[peerId] || "Guest",
      })),
    ],
    [localStream, remoteStreams, displayName, peerDisplayNames]
  );

  const featuredStream = allStreams.find((s) => s.peerId === featuredPeerId);
  const otherStreams = allStreams.filter((s) => s.peerId !== featuredPeerId);

  if (!isCallActive) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[80vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Connecting to call...</p>
      </div>
    );
  }

  const ReactionButton = ({ emoji }: { emoji: string }) => (
    <Button variant="outline" size="icon" onClick={() => sendReaction(emoji)}>
      {emoji}
    </Button>
  );

  return (
    <div className="flex h-full min-h-[85vh]">
      <div className="flex flex-col flex-1 relative">
        <div className="absolute top-4 left-4 z-10">
          <div className="flex gap-2 p-2 bg-card/75 backdrop-blur-sm rounded-md">
            <ReactionButton emoji="👍" />
            <ReactionButton emoji="❤️" />
            <ReactionButton emoji="🎉" />
          </div>
        </div>
        <div className="absolute top-4 right-4 z-10">
          <div className="flex gap-2 p-2 bg-card/75 backdrop-blur-sm rounded-md">
            <Button
              variant={layout === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setLayout("grid")}
            >
              <Grid className="w-5 h-5" />
            </Button>
            <Button
              variant={layout === "featured" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setLayout("featured")}
            >
              <UserSquare className="w-5 h-5" />
            </Button>
            <Button
              variant={layout === "sidebar" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setLayout("sidebar")}
            >
              <PanelLeft className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-4">
          {(() => {
            if (layout === "grid") {
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 flex-1">
                  {allStreams.map(({ stream, peerId, displayName }) => (
                    <div
                      key={peerId}
                      className="relative rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => {
                        setFeaturedPeerId(peerId);
                        setLayout("featured");
                      }}
                    >
                      <VideoPlayer
                        stream={stream}
                        displayName={displayName}
                        peerId={peerId}
                        localPeerId={myId}
                      />
                    </div>
                  ))}
                </div>
              );
            } else if (layout === "featured" || layout === "sidebar") {
              return (
                <div
                  className={`flex flex-1 gap-4 ${
                    layout === "featured" ? "flex-col" : ""
                  }`}
                >
                  <div className="flex-1 w-full h-full relative rounded-lg overflow-hidden">
                    {featuredStream && (
                      <VideoPlayer
                        stream={featuredStream.stream}
                        displayName={featuredStream.displayName}
                        peerId={featuredStream.peerId}
                        localPeerId={myId}
                      />
                    )}
                  </div>
                  <div
                    className={`flex gap-4 ${
                      layout === "featured" ? "justify-center" : "flex-col w-48"
                    }`}
                  >
                    {otherStreams.map(({ stream, peerId, displayName }) => (
                      <div
                        key={peerId}
                        className={`relative rounded-lg overflow-hidden cursor-pointer ${
                          layout === "featured"
                            ? "w-48 h-28"
                            : "w-full aspect-video"
                        }`}
                        onClick={() => setFeaturedPeerId(peerId)}
                      >
                        <VideoPlayer
                          stream={stream}
                          displayName={displayName}
                          peerId={peerId}
                          localPeerId={myId}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
          })()}
        </div>

        <div className="mt-auto px-4 pb-4">
          <CallControls
            onLeave={handleLeave}
            localStream={localStream}
            onToggleScreenShare={handleToggleScreenShare}
            isScreenSharing={isScreenSharing}
            onToggleChat={handleToggleChat}
            onToggleParticipants={handleToggleParticipants}
          />
        </div>
      </div>
      {isChatOpen && <ChatPanel onSendMessage={sendChatMessage} />}
      {isParticipantsOpen && (
        <ParticipantList
          localDisplayName={displayName}
          isHost={isHost}
          hostId={hostId}
          localPeerId={myId}
          onToggleMuteAll={() => toggleMuteAll(!areAllMuted)}
          areAllMuted={areAllMuted}
        />
      )}
    </div>
  );
}
