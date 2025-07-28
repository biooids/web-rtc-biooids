"use client";

import React from "react";
import { useAppSelector } from "@/lib/hooks/hooks";
import { User, Users, VolumeX, Volume2, Mic, MicOff } from "lucide-react";
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
  onRequestUnmute: (peerId: string) => void;
  onForceMute: (peerId: string) => void;
}

export default function ParticipantList({
  localDisplayName,
  isHost,
  hostId,
  localPeerId,
  onToggleMuteAll,
  areAllMuted,
  onTogglePersonalMute,
  onRequestUnmute,
  onForceMute,
}: ParticipantListProps) {
  const { peerDisplayNames, peerMuteStatus, allowedToSpeak } = useAppSelector(
    (state) => state.webrtc
  );
  const participantCount = 1 + Object.keys(peerDisplayNames).length;

  const HostControl = ({ peerId }: { peerId: string }) => {
    if (!isHost || !peerMuteStatus[peerId]?.isMutedByHost) {
      return null;
    }

    const isAllowed = allowedToSpeak.includes(peerId);

    if (isAllowed) {
      // --- FIX: Show "Force Mute" button if user is allowed to speak ---
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onForceMute(peerId)}
              >
                <MicOff className="w-4 h-4 text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mute this participant</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    } else {
      // --- FIX: Show "Ask to Unmute" button if user is not yet allowed ---
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRequestUnmute(peerId)}
              >
                <Mic className="w-4 h-4 text-primary" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ask to Unmute</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
  };

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
            if (!status) return null;
            const isPersonallyMuted =
              localPeerId && status.personallyMutedBy.includes(localPeerId);
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
                  <HostControl peerId={peerId} />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
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
                            ? "Unmute for yourself"
                            : "Mute for yourself"}
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
