"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import type { Department } from "@/entities/department";
import { ApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import {
  useUpdateDepartmentAsDeptAdminMutation,
  useUpdateDepartmentAsOrgAdminMutation,
} from "../api/mutations";
import {
  departmentFormSchema,
  type DepartmentFormValues,
} from "../model/schema";

type Scope =
  | { kind: "org"; orgId: string; deptId: string }
  | { kind: "dept"; deptId: string };

interface DepartmentEditFormProps {
  dept: Department;
  scope: Scope;
}

/**
 * Dept edit form used by both the org-admin drill-down page and the
 * dept-admin landing. The `scope` determines which backend endpoint we hit.
 * We instantiate both hooks so React's rules of hooks are satisfied, then
 * pick the relevant mutation based on scope.
 */
export function DepartmentEditForm({ dept, scope }: DepartmentEditFormProps) {
  const orgMutation = useUpdateDepartmentAsOrgAdminMutation(
    scope.kind === "org" ? scope.orgId : "",
    scope.kind === "org" ? scope.deptId : "",
  );
  const deptMutation = useUpdateDepartmentAsDeptAdminMutation(
    scope.kind === "dept" ? scope.deptId : "",
  );
  const mutation = scope.kind === "org" ? orgMutation : deptMutation;

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: { name: dept.name, code: dept.code },
  });

  useEffect(() => {
    form.reset({ name: dept.name, code: dept.code });
  }, [dept, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync(values);
      toast.success("Department saved");
      form.reset(values);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.reason ?? err.message)
          : "Could not save department";
      toast.error(message);
    }
  });

  const pending = mutation.isPending || form.formState.isSubmitting;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dept-name-edit">Name</Label>
          <Input
            id="dept-name-edit"
            disabled={pending}
            aria-invalid={!!form.formState.errors.name}
            {...form.register("name")}
          />
          {form.formState.errors.name ? (
            <p className="text-destructive text-xs">
              {form.formState.errors.name.message}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dept-code-edit">Code</Label>
          <Input
            id="dept-code-edit"
            disabled={pending}
            aria-invalid={!!form.formState.errors.code}
            {...form.register("code")}
          />
          {form.formState.errors.code ? (
            <p className="text-destructive text-xs">
              {form.formState.errors.code.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={pending || !form.formState.isDirty}
          onClick={() => form.reset({ name: dept.name, code: dept.code })}
        >
          Discard
        </Button>
        <Button type="submit" disabled={pending || !form.formState.isDirty}>
          {pending ? (
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
          ) : null}
          Save changes
        </Button>
      </div>
    </form>
  );
}
