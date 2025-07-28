"use client";

import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Video, VideoOff, Mic, MicOff, Copy, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

interface LobbyProps {
  onJoin: (roomId: string, displayName: string, stream: MediaStream) => void;
}

export default function Lobby({ onJoin }: LobbyProps) {
  const [roomId, setRoomId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices.", error);
        toast.error("Could not access camera or microphone.");
      }
    };
    getMedia();
  }, []);

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled =
        !localStream.getVideoTracks()[0].enabled;
      setIsCameraOff(!localStream.getVideoTracks()[0].enabled);
    }
  };

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled =
        !localStream.getAudioTracks()[0].enabled;
      setIsMicMuted(!localStream.getAudioTracks()[0].enabled);
    }
  };

  const handleGenerateRoomId = () => {
    const newRoomId = uuidv4();
    setRoomId(newRoomId);
    navigator.clipboard.writeText(newRoomId);
    toast.success("New Room ID generated and copied to clipboard!");
  };

  const handleJoin = () => {
    if (!displayName.trim()) {
      toast.error("Please enter a display name.");
      return;
    }
    if (!roomId.trim()) {
      toast.error("Please enter a Room ID.");
      return;
    }
    if (!localStream) {
      toast.error("Could not access camera. Please check permissions.");
      return;
    }
    onJoin(roomId, displayName, localStream);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join a Call</CardTitle>
          <CardDescription>
            Check your audio and video before joining.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video bg-muted rounded-md overflow-hidden mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] ${
                isCameraOff ? "hidden" : "block"
              }`}
            />
            {isCameraOff && (
              <div className="absolute inset-0 flex items-center justify-center">
                <VideoOff className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
              <Button
                onClick={toggleMic}
                variant="secondary"
                size="icon"
                className="rounded-full"
              >
                {isMicMuted ? <MicOff /> : <Mic />}
              </Button>
              <Button
                onClick={toggleCamera}
                variant="secondary"
                size="icon"
                className="rounded-full"
              >
                {isCameraOff ? <VideoOff /> : <Video />}
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <Input
              placeholder="Enter your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="text-center"
            />
            <div className="flex gap-2">
              <Input
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
              <Button variant="outline" onClick={handleGenerateRoomId}>
                <Copy className="h-4 w-4 mr-2" /> Generate
              </Button>
            </div>

            <Button onClick={handleJoin} className="w-full">
              Join Call <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
