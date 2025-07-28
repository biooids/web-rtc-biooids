import { useEffect, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import { WebRTCService } from "../features/webrtc/WebRTCService";
import { callStarted, callEnded } from "../features/webrtc/webrtcSlice";

export const useWebRTC = (
  roomId: string,
  displayName: string,
  localStream: MediaStream | null
) => {
  const dispatch = useAppDispatch();
  const { remoteStreams, isCallActive, peerDisplayNames } = useAppSelector(
    (state) => state.webrtc
  );
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

  useEffect(() => {
    if (!localStream || !displayName) {
      return;
    }

    const service = new WebRTCService(roomId, displayName, dispatch);
    rtcServiceRef.current = service;

    service
      .start(localStream)
      .then(() => {
        dispatch(callStarted(roomId));
      })
      .catch((error) => {
        console.error("Failed to start WebRTC service:", error);
      });

    return () => {
      leaveCall();
    };
  }, [roomId, localStream, displayName, dispatch, leaveCall]);

  return {
    remoteStreams,
    isCallActive,
    peerDisplayNames,
    leaveCall,
    replaceTrack,
  };
};
