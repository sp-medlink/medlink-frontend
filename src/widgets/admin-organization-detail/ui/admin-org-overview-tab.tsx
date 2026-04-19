"use client";

import type { Organization } from "@/entities/organization";
import { OrganizationEditForm } from "@/features/admin-organization-crud";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

interface AdminOrgOverviewTabProps {
  org: Organization;
}

export function AdminOrgOverviewTab({ org }: AdminOrgOverviewTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization details</CardTitle>
        <CardDescription>
          Edit organization metadata. Changes are saved to the backend
          immediately upon confirm.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OrganizationEditForm org={org} />
      </CardContent>
    </Card>
  );
}
