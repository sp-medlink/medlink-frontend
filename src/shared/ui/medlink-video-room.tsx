"use client";

import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import {
  Activity,
  Clock3,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Video,
} from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";

interface MedlinkVideoRoomProps {
  serverUrl: string;
  token: string;
  onDisconnected: () => void;
  participantRole: "doctor" | "patient";
}

export function MedlinkVideoRoom({
  serverUrl,
  token,
  onDisconnected,
  participantRole,
}: MedlinkVideoRoomProps) {
  const isDoctor = participantRole === "doctor";
  const RoleIcon = isDoctor ? Stethoscope : UserRound;
  const roleLabel = isDoctor ? "Doctor workspace" : "Patient consultation";

  return (
    <section className="relative overflow-hidden rounded-2xl border bg-card/95 p-4 shadow-xl shadow-primary/5 backdrop-blur sm:p-5">
      <div className="pointer-events-none absolute -top-16 right-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-0 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />

      <header className="relative mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1.5">
              <RoleIcon className="size-3.5" />
              {roleLabel}
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              Encrypted call
            </Badge>
          </div>
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
            Medlink Video Session
          </h2>
          <p className="text-muted-foreground text-sm">
            Stable HD call experience optimized for online consultations.
          </p>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-xs">
          <Activity className="size-3.5 text-emerald-500" />
          Live connection
        </div>
      </header>

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        {[
          { icon: Video, label: "HD video", value: "Enabled" },
          { icon: Clock3, label: "Session mode", value: "Real-time" },
          { icon: Activity, label: "Media quality", value: "Adaptive" },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-background/70 flex items-center gap-2 rounded-xl border px-3 py-2"
          >
            <item.icon className="text-primary size-4" />
            <div className="leading-tight">
              <p className="text-muted-foreground text-[11px] uppercase tracking-wide">
                {item.label}
              </p>
              <p className="text-sm font-medium">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <LiveKitRoom
        serverUrl={serverUrl}
        token={token}
        connect
        audio
        video
        onDisconnected={onDisconnected}
        className={cn(
          "bg-background h-[min(72vh,680px)] w-full overflow-hidden rounded-xl border",
          "shadow-inner",
        )}
      >
        <VideoConference />
      </LiveKitRoom>
    </section>
  );
}
