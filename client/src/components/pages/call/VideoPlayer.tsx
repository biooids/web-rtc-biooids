// FILE: src/components/pages/call/VideoPlayer.tsx

"use client";

import React, { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface VideoPlayerProps {
  stream: MediaStream;
  isMuted: boolean;
}

export default function VideoPlayer({ stream, isMuted }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <Card className="overflow-hidden aspect-video">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        className="w-full h-full object-cover"
      />
    </Card>
  );
}
