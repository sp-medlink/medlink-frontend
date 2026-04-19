"use client";

import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";

interface MedlinkVideoRoomProps {
  serverUrl: string;
  token: string;
  onDisconnected: () => void;
}

export function MedlinkVideoRoom({
  serverUrl,
  token,
  onDisconnected,
}: MedlinkVideoRoomProps) {
  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      connect
      audio
      video
      onDisconnected={onDisconnected}
      className="bg-background h-[min(78vh,680px)] w-full overflow-hidden rounded-xl border"
    >
      <VideoConference />
    </LiveKitRoom>
  );
}
