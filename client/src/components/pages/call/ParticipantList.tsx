"use client";

import React from "react";
import { useAppSelector } from "@/lib/hooks/hooks";
import { User, Users, VolumeX, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- FIX: Update props interface ---
interface ParticipantListProps {
  localDisplayName: string;
  isHost: boolean;
  hostId: string | null;
  localPeerId: string | null;
  onToggleMuteAll: () => void;
  areAllMuted: boolean;
  onTogglePersonalMute: (peerId: string) => void;
}

export default function ParticipantList({
  localDisplayName,
  isHost,
  hostId,
  localPeerId,
  onToggleMuteAll,
  areAllMuted,
  onTogglePersonalMute,
}: ParticipantListProps) {
  const { peerDisplayNames, peerMuteStatus } = useAppSelector(
    (state) => state.webrtc
  );
  const participantCount = 1 + Object.keys(peerDisplayNames).length;

  return (
    <div className="w-80 h-full bg-card border-l flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-center flex items-center justify-center gap-2">
          <Users className="w-5 h-5" /> Participants ({participantCount})
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
                        {/* --- FIX: Call the prop function directly --- */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onTogglePersonalMute(peerId)}
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
