import type { Metadata } from "next";
import { LoginForm } from "@/features/auth-login";

export const metadata: Metadata = {
  title: "Log in · Medlink",
};

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">Medlink</h1>
        <p className="text-muted-foreground text-sm">Log in to your account</p>
      </div>
      <LoginForm />
    </div>
  );
}
