export {
  useCreateDepartmentMutation,
  useUpdateDepartmentAsOrgAdminMutation,
  useUpdateDepartmentAsDeptAdminMutation,
  useDeleteDepartmentMutation,
  useSetDepartmentActiveAsOrgAdminMutation,
  useSetDepartmentActiveAsDeptAdminMutation,
} from "./api/mutations";
export {
  departmentFormSchema,
  type DepartmentFormValues,
} from "./model/schema";
export { DepartmentCreateDialog } from "./ui/department-create-dialog";
export { DepartmentEditForm } from "./ui/department-edit-form";
export { DepartmentDeleteButton } from "./ui/department-delete-button";
export { DepartmentActiveToggle } from "./ui/department-active-toggle";
