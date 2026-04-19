"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useLandingRoute } from "@/entities/session";

export default function Page() {
  const router = useRouter();
  const landing = useLandingRoute();

  useEffect(() => {
    if (landing.href) router.replace(landing.href);
  }, [landing.href, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Loader2 className="text-muted-foreground size-6 animate-spin" />
    </main>
  );
}
