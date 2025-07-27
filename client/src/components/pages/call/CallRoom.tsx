"use client";

import React, { useState, useMemo } from "react";
import { useWebRTC } from "@/lib/hooks/useWebRTC";
import VideoPlayer from "./VideoPlayer";
import CallControls from "./CallControls";
import { Loader2, Grid, UserSquare, PanelLeft } from "lucide-react"; // 1. Import new icon
import { Button } from "@/components/ui/button";

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

  // 2. Add 'sidebar' to the possible layout types
  const [layout, setLayout] = useState<"grid" | "featured" | "sidebar">("grid");
  const [featuredPeerId, setFeaturedPeerId] = useState<string>("local");

  const allStreams = useMemo(
    () => [
      { stream: localStream, peerId: "local" },
      ...Object.entries(remoteStreams).map(([peerId, stream]) => ({
        peerId,
        stream,
      })),
    ],
    [localStream, remoteStreams]
  );

  const featuredStream = allStreams.find((s) => s.peerId === featuredPeerId);
  const otherStreams = allStreams.filter((s) => s.peerId !== featuredPeerId);

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
    <div className="flex flex-col h-full min-h-[85vh] relative">
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
          {/* 3. Add button for the new layout */}
          <Button
            variant={layout === "sidebar" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setLayout("sidebar")}
          >
            <PanelLeft className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* 4. Update rendering logic with the new 'sidebar' case */}
      <div className="flex-1 flex flex-col p-4">
        {(() => {
          if (layout === "grid") {
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 flex-1">
                {allStreams.map(({ stream, peerId }) => (
                  <div
                    key={peerId}
                    className="relative rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => {
                      setFeaturedPeerId(peerId);
                      setLayout("featured");
                    }}
                  >
                    <VideoPlayer stream={stream} isMuted={peerId === "local"} />
                  </div>
                ))}
              </div>
            );
          } else if (layout === "featured") {
            return (
              <>
                <div className="flex-1 w-full h-full relative rounded-lg overflow-hidden">
                  {featuredStream && (
                    <VideoPlayer
                      stream={featuredStream.stream}
                      isMuted={featuredStream.peerId === "local"}
                    />
                  )}
                </div>
                <div className="flex justify-center gap-4 pt-4">
                  {otherStreams.map(({ stream, peerId }) => (
                    <div
                      key={peerId}
                      className="w-48 h-28 relative rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => setFeaturedPeerId(peerId)}
                    >
                      <VideoPlayer
                        stream={stream}
                        isMuted={peerId === "local"}
                      />
                    </div>
                  ))}
                </div>
              </>
            );
          } else if (layout === "sidebar") {
            return (
              <div className="flex flex-1 gap-4">
                <div className="flex-1 w-full h-full relative rounded-lg overflow-hidden">
                  {featuredStream && (
                    <VideoPlayer
                      stream={featuredStream.stream}
                      isMuted={featuredStream.peerId === "local"}
                    />
                  )}
                </div>
                <div className="flex flex-col gap-4 w-48">
                  {otherStreams.map(({ stream, peerId }) => (
                    <div
                      key={peerId}
                      className="w-full aspect-video relative rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => setFeaturedPeerId(peerId)}
                    >
                      <VideoPlayer
                        stream={stream}
                        isMuted={peerId === "local"}
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
        <CallControls onLeave={handleLeave} localStream={localStream} />
      </div>
    </div>
  );
}
