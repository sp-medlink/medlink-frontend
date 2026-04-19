"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ApiError } from "@/shared/api";
import { routes } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { loginSchema, type LoginFormValues } from "../model/schema";
import { useLoginMutation } from "../api/login";

export function LoginForm() {
  const router = useRouter();
  const mutation = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { emailOrPhoneOrIin: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const user = await mutation.mutateAsync(values);
      toast.success(`Welcome back, ${user.firstName}`);
      // Land on `/` so admin-capability probes can finish; the home page
      // shows the role-specific overview there (no redirect to /patient).
      router.replace("/");
    } catch (err) {
      const message = err instanceof ApiError ? (err.reason ?? err.message) : "Login failed";
      toast.error(message);
    }
  });

  const pending = isSubmitting || mutation.isPending;

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="emailOrPhoneOrIin">Email, phone, or IIN</Label>
        <Input
          id="emailOrPhoneOrIin"
          autoComplete="username"
          disabled={pending}
          aria-invalid={!!errors.emailOrPhoneOrIin}
          {...register("emailOrPhoneOrIin")}
        />
        {errors.emailOrPhoneOrIin ? (
          <p className="text-destructive text-xs">{errors.emailOrPhoneOrIin.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          disabled={pending}
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-destructive text-xs">{errors.password.message}</p>
        ) : null}
      </div>

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
        Log in
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href={routes.signup} className="underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
