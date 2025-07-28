import { useEffect, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import { WebRTCService } from "../features/webrtc/WebRTCService";
import { callEnded } from "../features/webrtc/webrtcSlice";
import { clearChat } from "../features/chat/chatSlice";

export const useWebRTC = (
  roomId: string,
  displayName: string,
  localStream: MediaStream
) => {
  const dispatch = useAppDispatch();
  const webrtcState = useAppSelector((state) => state.webrtc);
  const webrtcServiceRef = useRef<WebRTCService | null>(null);

  useEffect(() => {
    const service = new WebRTCService(roomId, displayName, dispatch);
    webrtcServiceRef.current = service;
    service.start(localStream);
    return () => {
      service.hangUp();
      dispatch(callEnded());
      dispatch(clearChat());
    };
  }, [roomId, displayName, localStream, dispatch]);

  const leaveCall = useCallback(() => webrtcServiceRef.current?.hangUp(), []);
  const replaceTrack = useCallback(async (track: MediaStreamTrack) => {
    await webrtcServiceRef.current?.replaceTrack(track);
  }, []);
  const sendChatMessage = useCallback((message: string) => {
    webrtcServiceRef.current?.sendChatMessage(message);
  }, []);
  const sendReaction = useCallback((emoji: string) => {
    webrtcServiceRef.current?.sendReaction(emoji);
  }, []);
  const toggleMuteAll = useCallback((isMuted: boolean) => {
    webrtcServiceRef.current?.toggleMuteAll(isMuted);
  }, []);

  // --- FIX: Expose the service method to the UI ---
  const togglePersonalMute = useCallback((peerId: string) => {
    webrtcServiceRef.current?.togglePersonalMute(peerId);
  }, []);

  return {
    ...webrtcState,
    leaveCall,
    replaceTrack,
    sendChatMessage,
    sendReaction,
    toggleMuteAll,
    togglePersonalMute,
  };
};
