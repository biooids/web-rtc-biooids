import { useEffect, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import { WebRTCService } from "../features/webrtc/WebRTCService";
import { callStarted, callEnded } from "../features/webrtc/webrtcSlice";

export const useWebRTC = (roomId: string, localStream: MediaStream | null) => {
  const dispatch = useAppDispatch();
  const { remoteStreams, isCallActive } = useAppSelector(
    (state) => state.webrtc
  );
  const rtcServiceRef = useRef<WebRTCService | null>(null);

  const leaveCall = useCallback(() => {
    if (rtcServiceRef.current) {
      rtcServiceRef.current.hangUp();
      dispatch(callEnded());
      rtcServiceRef.current = null;
    }
  }, [dispatch]);

  useEffect(() => {
    // Only start the connection if we have a local stream.
    if (!localStream) {
      return;
    }

    const service = new WebRTCService(roomId, dispatch);
    rtcServiceRef.current = service;

    // Start the service and update Redux state
    service
      .start(localStream)
      .then(() => {
        dispatch(callStarted(roomId));
      })
      .catch((error) => {
        console.error("Failed to start WebRTC service:", error);
      });

    // The cleanup function will be called when the component unmounts.
    return () => {
      leaveCall();
    };
  }, [roomId, localStream, dispatch, leaveCall]);

  return { remoteStreams, isCallActive, leaveCall };
};
