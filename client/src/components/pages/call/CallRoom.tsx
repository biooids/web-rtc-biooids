"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { useWebRTC } from "@/lib/hooks/useWebRTC";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/hooks";
import { toggleChat } from "@/lib/features/chat/chatSlice";
import VideoPlayer from "./VideoPlayer";
import CallControls from "./CallControls";
import ChatPanel from "./ChatPanel";
import ParticipantList from "./ParticipantList";
import { Loader2, Grid, UserSquare, PanelLeft, Hand } from "lucide-react"; // Added Hand icon
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
    togglePersonalMute,
  } = useWebRTC(roomId, displayName, localStream);

  const dispatch = useAppDispatch();
  const isChatOpen = useAppSelector((state) => state.chat.isOpen);

  const [layout, setLayout] = useState<"grid" | "featured" | "sidebar">("grid");
  const [featuredPeerId, setFeaturedPeerId] = useState<string>("local");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const cameraTrackRef = useRef<MediaStreamTrack | null>(null);

  const areAllMuted = useMemo(() => {
    if (Object.keys(peerMuteStatus).length === 0) return false;
    return Object.values(peerMuteStatus).every(
      (status) => status.isMutedByHost
    );
  }, [peerMuteStatus]);

  const handleLeave = () => {
    leaveCall();
    onLeave();
  };
  const handleToggleChat = () => {
    if (isParticipantsOpen) setIsParticipantsOpen(false);
    dispatch(toggleChat());
  };
  const handleToggleParticipants = () => {
    if (isChatOpen) dispatch(toggleChat());
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
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
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
      } catch (err) {
        console.error("Screen share failed:", err);
      }
    }
  }, [isScreenSharing, localStream, replaceTrack]);

  const allStreams = useMemo(
    () => [
      {
        stream: localStream,
        peerId: myId || "local",
        displayName: `${displayName} (You)`,
      },
      ...Object.entries(remoteStreams).map(([peerId, stream]) => ({
        peerId,
        stream,
        displayName: peerDisplayNames[peerId] || "Guest",
      })),
    ],
    [myId, localStream, remoteStreams, displayName, peerDisplayNames]
  );

  const featuredStream =
    allStreams.find((s) => s.peerId === featuredPeerId) || allStreams[0];
  const otherStreams = allStreams.filter((s) => s.peerId !== featuredPeerId);

  if (!isCallActive) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[80vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Connecting to call...</p>
      </div>
    );
  }

  // This sub-component handles sending the reaction. Its logic is correct.
  const ReactionButton = ({
    emoji,
    children,
  }: {
    emoji: string;
    children: React.ReactNode;
  }) => (
    <Button
      variant="outline"
      size="lg"
      onClick={() => sendReaction(emoji)}
      className="flex gap-2 items-center"
    >
      {children}
    </Button>
  );

  return (
    <div className="flex h-full min-h-[85vh]">
      <div className="flex flex-col flex-1 relative">
        <div className="absolute top-4 left-4 z-10">
          <div className="flex gap-2 p-2 bg-card/75 backdrop-blur-sm rounded-md">
            <ReactionButton emoji="✋">
              <Hand className="w-5 h-5" />
            </ReactionButton>
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
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 flex-1`}
                >
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
            } else {
              return (
                <div
                  className={`flex flex-1 gap-4 ${
                    layout === "featured" ? "flex-col" : ""
                  }`}
                >
                  <div className="flex-1 w-full h-full relative rounded-lg overflow-hidden">
                    <VideoPlayer
                      stream={featuredStream.stream}
                      displayName={featuredStream.displayName}
                      peerId={featuredStream.peerId}
                      localPeerId={myId}
                    />
                  </div>
                  <div
                    className={`flex gap-4 ${
                      layout === "featured"
                        ? "justify-center overflow-x-auto"
                        : "flex-col w-48 overflow-y-auto"
                    }`}
                  >
                    {otherStreams.map(({ stream, peerId, displayName }) => (
                      <div
                        key={peerId}
                        className={`relative rounded-lg overflow-hidden cursor-pointer ${
                          layout === "featured"
                            ? "w-48 h-28 flex-shrink-0"
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
          onTogglePersonalMute={togglePersonalMute}
        />
      )}
    </div>
  );
}
