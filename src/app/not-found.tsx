import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { routes } from "@/shared/config";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground max-w-md text-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild>
        <Link href={routes.login}>Go home</Link>
      </Button>
    </div>
  );
}
