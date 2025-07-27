import { AppDispatch } from "@/lib/store";
import { addRemoteStream, removeRemoteStream } from "./webrtcSlice";

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
  private dispatch: AppDispatch;

  constructor(roomId: string, dispatch: AppDispatch) {
    this.roomId = roomId;
    this.dispatch = dispatch;
  }

  public async start(stream: MediaStream) {
    this.localStream = stream;
    const wsUrl = `${process.env.NEXT_PUBLIC_BACKEND_WEBSOCKET_URL}?roomId=${this.roomId}`;

    this.ws = new WebSocket(wsUrl);
    this.ws.onopen = () => console.log("[WebRTC] Signaling connection opened.");
    this.ws.onmessage = (event) => this.handleSignalingMessage(event);
    this.ws.onclose = () =>
      console.log("[WebRTC] Signaling connection closed.");
    this.ws.onerror = (err) => console.error("[WebRTC] Signaling error:", err);
  }

  public hangUp() {
    this.peerConnections.forEach((pc) => pc.close());
    this.peerConnections.clear();
    this.ws?.close();
    console.log("[WebRTC] Hung up all connections.");
  }

  private async handleSignalingMessage(event: MessageEvent) {
    const message = JSON.parse(event.data);

    switch (message.type) {
      case "init":
        // The client learns its own ID and waits for others to call.
        this.myId = message.payload.selfId;
        console.log(`[WebRTC] Initialized with ID: ${this.myId}`);
        break;

      case "user-joined":
        // An existing client is told a new user has joined, so it sends an offer.
        console.log(
          `[WebRTC] User ${message.payload.peerId} joined. Sending offer.`
        );
        this.createAndSendOffer(message.payload.peerId);
        break;

      case "offer":
        // A new client receives an offer from an existing client.
        console.log(`[WebRTC] Received offer from ${message.senderId}`);
        await this.handleOffer(message.senderId, message.payload.sdp);
        break;

      case "answer":
        console.log(`[WebRTC] Received answer from ${message.senderId}`);
        await this.handleAnswer(message.senderId, message.payload.sdp);
        break;

      case "ice-candidate":
        await this.handleIceCandidate(
          message.senderId,
          message.payload.candidate
        );
        break;

      case "user-disconnected":
        this.closePeerConnection(message.payload.peerId);
        break;
    }
  }

  private createPeerConnection(peerId: string): RTCPeerConnection {
    if (this.peerConnections.has(peerId)) {
      return this.peerConnections.get(peerId)!;
    }

    const pc = new RTCPeerConnection(STUN_SERVERS);

    this.localStream?.getTracks().forEach((track) => {
      pc.addTrack(track, this.localStream!);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendMessage({
          type: "ice-candidate",
          targetId: peerId,
          payload: { candidate: event.candidate },
        });
      }
    };

    pc.ontrack = (event) => {
      console.log(`[WebRTC] Received remote track from ${peerId}`);
      this.dispatch(addRemoteStream({ peerId, stream: event.streams[0] }));
    };

    pc.onconnectionstatechange = () => {
      if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "closed" ||
        pc.connectionState === "failed"
      ) {
        this.closePeerConnection(peerId);
      }
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
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    }
  }

  private async handleIceCandidate(
    peerId: string,
    candidate: RTCIceCandidateInit
  ) {
    const pc = this.peerConnections.get(peerId);
    if (pc && candidate) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  private closePeerConnection(peerId: string) {
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(peerId);
      this.dispatch(removeRemoteStream(peerId));
      console.log(`[WebRTC] Connection closed for peer: ${peerId}`);
    }
  }

  private sendMessage(message: {
    type: string;
    targetId: string;
    payload: any;
  }) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}
