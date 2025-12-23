import {TUserCompactModel, TUserModel} from "../models/user";
import {TOrganizationUser} from "../hooks/settings/members/useGetListMembers";

export function userRoles(user: Pick<TUserModel, "is_qa" | "is_qc" | "is_compute_supplier" | "is_model_seller" | "is_superuser" | "is_labeler" | "is_freelancer">, is_organization_admin: boolean = false): string[] {
  const roles = [];

  if (user.is_superuser) {
    return ["Super Admin"];
  }

  if (is_organization_admin) {
    return ["Organization Admin"];
  }

  if (user.is_qa) {
    roles.push("QA");
  }

  if (user.is_qc) {
    roles.push("QC");
  }

  if (user.is_compute_supplier) {
    roles.push("Compute Supplier");
  } else if (user.is_model_seller) {
    roles.push("Model Seller");
  } else if (user.is_labeler || user.is_freelancer) {
    roles.push("Labeler");
  } else {
    roles.push("AI Developer & AI Adopter");
  }

  return roles;
}

export const listUserRoles = [
  { value: "is_qa", label: "QA" },
  { value: "is_qc", label: "QC" },
  { value: "_", label: "Labeler" },
  // { value: "is_compute_supplier", label: "Compute Supplier" },
  // { value: "is_model_seller", label: "Model Seller" },
  { value: "is_organization_admin", label: "Organization Admin" },
  // { value: "is_superuser", label: "Super Admin" },
]

export function getDisplayName(user: TUserModel | TUserCompactModel | TOrganizationUser): string {
  if (user.first_name?.length > 0 || user.last_name?.length > 0) {
    return [user.first_name, user.last_name].join(" ");
  }

  return user.username ?? "#" + user.id;
}
