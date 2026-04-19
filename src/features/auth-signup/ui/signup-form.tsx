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
import { signupSchema, type SignupFormValues } from "../model/schema";
import { useSignupMutation } from "../api/signup";

interface FieldProps {
  id: keyof SignupFormValues;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}

const FIELDS: FieldProps[] = [
  { id: "firstName", label: "First name", autoComplete: "given-name" },
  { id: "lastName", label: "Last name", autoComplete: "family-name" },
  { id: "iin", label: "IIN", autoComplete: "off", placeholder: "12 digits" },
  { id: "phoneNumber", label: "Phone number", autoComplete: "tel" },
  { id: "email", label: "Email", type: "email", autoComplete: "email" },
  { id: "birthDate", label: "Birth date", type: "date", autoComplete: "bday" },
  { id: "address", label: "Address", autoComplete: "street-address" },
  { id: "password", label: "Password", type: "password", autoComplete: "new-password" },
  {
    id: "confirmPassword",
    label: "Confirm password",
    type: "password",
    autoComplete: "new-password",
  },
];

export function SignupForm() {
  const router = useRouter();
  const mutation = useSignupMutation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      iin: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      birthDate: "",
      gender: "male",
      address: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const user = await mutation.mutateAsync(values);
      toast.success(`Welcome, ${user.firstName}`);
      router.replace("/");
    } catch (err) {
      const message = err instanceof ApiError ? (err.reason ?? err.message) : "Signup failed";
      toast.error(message);
    }
  });

  const pending = isSubmitting || mutation.isPending;

  return (
    <form onSubmit={onSubmit} className="grid w-full gap-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.id} className="flex flex-col gap-2">
            <Label htmlFor={f.id}>{f.label}</Label>
            <Input
              id={f.id}
              type={f.type}
              autoComplete={f.autoComplete}
              placeholder={f.placeholder}
              disabled={pending}
              aria-invalid={!!errors[f.id]}
              {...register(f.id)}
            />
            {errors[f.id] ? (
              <p className="text-destructive text-xs">{errors[f.id]?.message}</p>
            ) : null}
          </div>
        ))}

        <div className="flex flex-col gap-2">
          <Label htmlFor="gender">Gender</Label>
          <select
            id="gender"
            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
            disabled={pending}
            {...register("gender")}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender ? (
            <p className="text-destructive text-xs">{errors.gender.message}</p>
          ) : null}
        </div>
      </div>

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
        Create account
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link href={routes.login} className="underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
