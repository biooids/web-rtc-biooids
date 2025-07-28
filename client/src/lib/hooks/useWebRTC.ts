import { useEffect, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import { WebRTCService } from "../features/webrtc/WebRTCService";
import {
  callEnded,
  setUnmuteRequest,
  addAllowedSpeaker,
  removeAllowedSpeaker,
} from "../features/webrtc/webrtcSlice";
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

  const requestUnmute = useCallback(
    (targetId: string) => {
      webrtcServiceRef.current?.requestUnmute(targetId);
      dispatch(addAllowedSpeaker(targetId));
    },
    [dispatch]
  );

  const forceMuteUser = useCallback(
    (targetId: string) => {
      webrtcServiceRef.current?.forceMute(targetId);
      dispatch(removeAllowedSpeaker(targetId));
    },
    [dispatch]
  );

  const declineUnmuteRequest = useCallback(() => {
    dispatch(setUnmuteRequest(false));
    if (webrtcState.hostId) {
      webrtcServiceRef.current?.declineUnmuteRequest(webrtcState.hostId);
    }
  }, [dispatch, webrtcState.hostId]);

  const acceptUnmuteRequest = useCallback(() => {
    webrtcServiceRef.current?.sendAcceptedUnmuteRequest();
    dispatch(addAllowedSpeaker(webrtcState.myId!));
    dispatch(setUnmuteRequest(false));
  }, [dispatch, webrtcState.myId]);

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
    requestUnmute,
    declineUnmuteRequest,
    forceMuteUser,
    acceptUnmuteRequest,
  };
};
