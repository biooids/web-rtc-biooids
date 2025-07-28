import { useEffect, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import { WebRTCService } from "../features/webrtc/WebRTCService";
import { callEnded } from "../features/webrtc/webrtcSlice";

export const useWebRTC = (
  roomId: string,
  displayName: string,
  localStream: MediaStream | null
) => {
  const dispatch = useAppDispatch();
  const {
    myId, // Get myId from the store
    remoteStreams,
    isCallActive,
    peerDisplayNames,
    isHost,
    hostId,
    peerMuteStatus,
  } = useAppSelector((state) => state.webrtc);

  const rtcServiceRef = useRef<WebRTCService | null>(null);

  const replaceTrack = useCallback(async (newTrack: MediaStreamTrack) => {
    if (rtcServiceRef.current) {
      await rtcServiceRef.current.replaceTrack(newTrack);
    }
  }, []);

  const leaveCall = useCallback(() => {
    if (rtcServiceRef.current) {
      rtcServiceRef.current.hangUp();
      dispatch(callEnded());
      rtcServiceRef.current = null;
    }
  }, [dispatch]);

  const sendChatMessage = useCallback((message: string) => {
    if (rtcServiceRef.current) {
      rtcServiceRef.current.sendChatMessage(message);
    }
  }, []);

  const sendReaction = useCallback((emoji: string) => {
    if (rtcServiceRef.current) {
      rtcServiceRef.current.sendReaction(emoji);
    }
  }, []);

  const requestMutePeer = useCallback((peerId: string) => {
    if (rtcServiceRef.current) {
      rtcServiceRef.current.requestMutePeer(peerId);
    }
  }, []);

  const toggleMuteAll = useCallback((isMuted: boolean) => {
    if (rtcServiceRef.current) {
      rtcServiceRef.current.toggleMuteAll(isMuted);
    }
  }, []);

  useEffect(() => {
    if (!localStream || !displayName) {
      return;
    }
    const service = new WebRTCService(roomId, displayName, dispatch);
    rtcServiceRef.current = service;
    service.start(localStream);
    return () => {
      leaveCall();
    };
  }, [roomId, localStream, displayName, dispatch, leaveCall]);

  return {
    myId, // Return myId
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
    requestMutePeer,
    toggleMuteAll,
  };
};
