"use client";

import React, { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface VideoPlayerProps {
  stream: MediaStream;
  isMuted: boolean;
  // 1. Add displayName prop
  displayName?: string;
}

export default function VideoPlayer({
  stream,
  isMuted,
  displayName,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    // 2. Add a relative container to position the name
    <Card className="overflow-hidden aspect-video relative bg-muted">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        className="w-full h-full object-cover"
      />
      {/* 3. Display the name as an overlay */}
      {displayName && (
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/50 text-white text-sm">
          {displayName}
        </div>
      )}
    </Card>
  );
}
