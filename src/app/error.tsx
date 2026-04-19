"use client";

import { useEffect } from "react";
import { Button } from "@/shared/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground max-w-md text-sm">
        An unexpected error occurred. You can try again or return to the home page.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
