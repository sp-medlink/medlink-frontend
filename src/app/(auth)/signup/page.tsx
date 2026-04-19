import type { Metadata } from "next";
import { SignupForm } from "@/features/auth-signup";

export const metadata: Metadata = {
  title: "Sign up · Medlink",
};

export default function SignupPage() {
  return (
    <div className="w-full space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">Medlink</h1>
        <p className="text-muted-foreground text-sm">Create a new account</p>
      </div>
      <SignupForm />
    </div>
  );
}
