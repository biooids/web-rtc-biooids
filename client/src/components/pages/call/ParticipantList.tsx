"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/hooks";
import { togglePersonalMute } from "@/lib/features/webrtc/webrtcSlice";
import { User, Users, MicOff, VolumeX, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ParticipantListProps {
  localDisplayName: string;
  isHost: boolean;
  hostId: string | null;
  localPeerId: string | null;
  onToggleMuteAll: () => void;
  areAllMuted: boolean;
}

export default function ParticipantList({
  localDisplayName,
  isHost,
  hostId,
  localPeerId,
  onToggleMuteAll,
  areAllMuted,
}: ParticipantListProps) {
  const dispatch = useAppDispatch();
  const { peerDisplayNames, peerMuteStatus } = useAppSelector(
    (state) => state.webrtc
  );
  const participantCount = 1 + Object.keys(peerDisplayNames).length;

  // --- DEBUG LOG ---
  // This will show us if the component is re-rendering with new data.
  console.log(
    "[ParticipantList] Re-rendering with peerMuteStatus:",
    JSON.stringify(peerMuteStatus)
  );

  const handleTogglePersonalMute = (peerIdToMute: string) => {
    // --- DEBUG LOG ---
    // This will confirm the button click is working.
    console.log(
      `[ParticipantList] Dispatching togglePersonalMute for peer: ${peerIdToMute}`
    );
    if (localPeerId) {
      dispatch(togglePersonalMute({ peerIdToMute, localPeerId }));
    }
  };

  return (
    <div className="w-80 h-full bg-card border-l flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-center flex items-center justify-center gap-2">
          <Users className="w-5 h-5" />
          Participants ({participantCount})
        </h3>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <span className="font-semibold">{localDisplayName} (You)</span>
              {isHost && (
                <span className="text-xs text-primary font-bold">(Host)</span>
              )}
            </div>
          </div>
          {Object.entries(peerDisplayNames).map(([peerId, displayName]) => {
            const status = peerMuteStatus[peerId];
            const isPersonallyMuted =
              localPeerId && status?.personallyMutedBy.includes(localPeerId);
            return (
              <div key={peerId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5" />
                  <span>{displayName}</span>
                  {peerId === hostId && (
                    <span className="text-xs text-primary font-bold">
                      (Host)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTogglePersonalMute(peerId)}
                        >
                          {isPersonallyMuted ? (
                            <VolumeX className="w-4 h-4 text-destructive" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {isPersonallyMuted
                            ? "Unmute this participant"
                            : "Mute this participant"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {isHost && (
        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={onToggleMuteAll}
          >
            {areAllMuted ? "Unmute All Participants" : "Mute All Participants"}
          </Button>
        </div>
      )}
    </div>
  );
}
