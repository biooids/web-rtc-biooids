import { AppDispatch, store } from "@/lib/store";
import {
  addPeer,
  addRemoteStream,
  callStarted,
  removePeer,
  setAllPeersMutedByHost,
  setHostId,
  setIsHost,
  setMyId,
  togglePersonalMute,
  updatePeerPersonalMute,
  setUnmuteRequest,
  removeAllowedSpeaker,
  addAllowedSpeaker,
  setPeerSelfMuted,
} from "./webrtcSlice";
import { addMessage, ChatMessage } from "../chat/chatSlice";
import { showReaction } from "../reactions/reactionsSlice";

const STUN_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export class WebRTCService {
  private ws: WebSocket | null = null;
  private peerConnections = new Map<string, RTCPeerConnection>();
  private localStream: MediaStream | null = null;
  private myId: string | null = null;
  private roomId: string;
  private displayName: string;
  private dispatch: AppDispatch;

  constructor(roomId: string, displayName: string, dispatch: AppDispatch) {
    this.roomId = roomId;
    this.displayName = displayName;
    this.dispatch = dispatch;
  }

  public async start(stream: MediaStream) {
    this.localStream = stream;
    const wsUrl = `${process.env.NEXT_PUBLIC_BACKEND_WEBSOCKET_URL}?roomId=${
      this.roomId
    }&displayName=${encodeURIComponent(this.displayName)}`;

    this.ws = new WebSocket(wsUrl);
    this.ws.onmessage = (event) => this.handleSignalingMessage(event);
  }

  private async handleSignalingMessage(event: MessageEvent) {
    const message = JSON.parse(event.data);
    switch (message.type) {
      case "init":
        this.myId = message.payload.selfId;
        if (this.myId) this.dispatch(setMyId(this.myId));
        this.dispatch(callStarted(this.roomId));
        this.dispatch(setIsHost(this.myId === message.payload.hostId));
        this.dispatch(setHostId(message.payload.hostId));
        this.dispatch(setAllPeersMutedByHost(message.payload.isRoomMuted));
        if (message.payload.isRoomMuted) {
          const audioTrack = this.localStream?.getAudioTracks()[0];
          if (audioTrack) audioTrack.enabled = false;
        }
        message.payload.peers.forEach((peer: any) => {
          this.dispatch(
            addPeer({ peerId: peer.id, displayName: peer.displayName })
          );
          this.createAndSendOffer(peer.id);
        });
        break;
      case "user-joined":
        this.dispatch(
          addPeer({
            peerId: message.payload.peerId,
            displayName: message.payload.displayName,
          })
        );
        this.dispatch(setHostId(message.payload.hostId));
        break;
      case "user-disconnected":
        this.dispatch(removePeer(message.payload.peerId));
        this.dispatch(setHostId(message.payload.newHostId));
        this.closePeerConnection(message.payload.peerId);
        break;
      case "personal-mute-toggle":
        if (message.senderId !== this.myId)
          this.dispatch(updatePeerPersonalMute(message.payload));
        break;
      case "all-peers-muted-state-changed":
        const isMuted = message.payload.isMuted;
        this.dispatch(setAllPeersMutedByHost(isMuted));
        if (isMuted) {
          const amIHost = store.getState().webrtc.isHost;
          if (!amIHost) {
            const audioTrack = this.localStream?.getAudioTracks()[0];
            if (audioTrack) audioTrack.enabled = false;
          }
        }
        break;
      case "chat-message":
        const chatMessage = {
          senderName: message.senderName,
          text: message.payload.text,
          timestamp: message.payload.timestamp,
        };
        this.dispatch(addMessage(chatMessage as ChatMessage));
        break;
      case "reaction":
        this.dispatch(
          showReaction({
            peerId: message.senderId,
            emoji: message.payload.emoji,
          })
        );
        break;
      case "request-unmute":
        this.dispatch(setUnmuteRequest(true));
        break;
      case "force-mute":
        const audioTrack = this.localStream?.getAudioTracks()[0];
        if (audioTrack) audioTrack.enabled = false;
        if (this.myId) this.dispatch(removeAllowedSpeaker(this.myId));
        break;
      case "decline-unmute":
        this.dispatch(removeAllowedSpeaker(message.senderId));
        break;
      case "accepted-unmute-request":
        this.dispatch(addAllowedSpeaker(message.senderId));
        break;
      case "permission-revoked":
        this.dispatch(removeAllowedSpeaker(message.payload.peerId));
        break;
      // --- FIX: Handle the new message to sync peer's local mute state ---
      case "local-audio-state-changed":
        this.dispatch(
          setPeerSelfMuted({
            peerId: message.senderId,
            isMuted: message.payload.isMuted,
          })
        );
        break;
      case "offer":
        this.handleOffer(message.senderId, message.payload.sdp);
        break;
      case "answer":
        this.handleAnswer(message.senderId, message.payload.sdp);
        break;
      case "ice-candidate":
        this.handleIceCandidate(message.senderId, message.payload.candidate);
        break;
    }
  }

  // --- FIX: New method to toggle local audio and broadcast the change ---
  public toggleLocalAudio() {
    const audioTrack = this.localStream?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      this.sendBroadcastMessage({
        type: "local-audio-state-changed",
        payload: { isMuted: !audioTrack.enabled },
      });
    }
  }

  public requestUnmute(targetId: string) {
    this.sendMessage({
      type: "request-unmute",
      targetId: targetId,
      payload: {},
    });
  }
  public forceMute(targetId: string) {
    this.sendMessage({ type: "force-mute", targetId: targetId, payload: {} });
  }
  public declineUnmuteRequest(hostId: string) {
    this.sendMessage({ type: "decline-unmute", targetId: hostId, payload: {} });
  }
  public sendAcceptedUnmuteRequest() {
    this.sendBroadcastMessage({ type: "accepted-unmute-request", payload: {} });
  }
  public togglePersonalMute(peerIdToMute: string) {
    if (!this.myId) return;
    const webrtcState = store.getState().webrtc;
    const isCurrentlyMuted = webrtcState.peerMuteStatus[
      peerIdToMute
    ]?.personallyMutedBy.includes(this.myId);
    const newMuteState = !isCurrentlyMuted;
    this.dispatch(togglePersonalMute({ peerIdToMute, localPeerId: this.myId }));
    this.sendBroadcastMessage({
      type: "personal-mute-toggle",
      payload: {
        mutedPeerId: peerIdToMute,
        muterPeerId: this.myId,
        isMuted: newMuteState,
      },
    });
  }
  public hangUp() {
    this.peerConnections.forEach((pc) => pc.close());
    this.peerConnections.clear();
    this.ws?.close();
  }
  public async replaceTrack(newTrack: MediaStreamTrack) {
    for (const pc of this.peerConnections.values()) {
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender) await sender.replaceTrack(newTrack);
    }
  }
  public sendChatMessage(text: string) {
    this.sendBroadcastMessage({
      type: "chat-message",
      payload: { text, timestamp: new Date().toISOString() },
    });
  }
  public sendReaction(emoji: string) {
    this.sendBroadcastMessage({ type: "reaction", payload: { emoji } });
  }
  public toggleMuteAll(isMuted: boolean) {
    this.sendBroadcastMessage({
      type: "toggle-mute-all",
      payload: { isMuted },
    });
  }
  private sendBroadcastMessage(message: { type: string; payload: any }) {
    if (this.ws?.readyState === WebSocket.OPEN)
      this.ws.send(JSON.stringify(message));
  }
  private sendMessage(message: {
    type: string;
    targetId: string;
    payload: any;
  }) {
    if (this.ws?.readyState === WebSocket.OPEN)
      this.ws.send(JSON.stringify(message));
  }
  private createPeerConnection(peerId: string): RTCPeerConnection {
    if (this.peerConnections.has(peerId))
      return this.peerConnections.get(peerId)!;
    const pc = new RTCPeerConnection(STUN_SERVERS);
    this.localStream
      ?.getTracks()
      .forEach((track) => pc.addTrack(track, this.localStream!));
    pc.onicecandidate = (e) => {
      if (e.candidate)
        this.sendMessage({
          type: "ice-candidate",
          targetId: peerId,
          payload: { candidate: e.candidate },
        });
    };
    pc.ontrack = (e) =>
      this.dispatch(addRemoteStream({ peerId, stream: e.streams[0] }));
    pc.onconnectionstatechange = () => {
      if (["disconnected", "closed", "failed"].includes(pc.connectionState))
        this.closePeerConnection(peerId);
    };
    this.peerConnections.set(peerId, pc);
    return pc;
  }
  private async createAndSendOffer(peerId: string) {
    const pc = this.createPeerConnection(peerId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.sendMessage({
      type: "offer",
      targetId: peerId,
      payload: { sdp: offer },
    });
  }
  private async handleOffer(peerId: string, sdp: RTCSessionDescriptionInit) {
    const pc = this.createPeerConnection(peerId);
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    this.sendMessage({
      type: "answer",
      targetId: peerId,
      payload: { sdp: answer },
    });
  }
  private async handleAnswer(peerId: string, sdp: RTCSessionDescriptionInit) {
    const pc = this.peerConnections.get(peerId);
    if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  }
  private async handleIceCandidate(
    peerId: string,
    candidate: RTCIceCandidateInit
  ) {
    const pc = this.peerConnections.get(peerId);
    if (pc && candidate)
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }
  private closePeerConnection(peerId: string) {
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(peerId);
    }
  }
}
