import {TOrganizationUser} from "@/hooks/settings/members/useGetListMembers";

export type TRoleKey = "is_qa" | "is_qc" | "-";

export const ROLES_MAP: {[k in TRoleKey]: string} = {
  "is_qa": "QA",
  "is_qc": "QC",
  "-": "Labeler",
}

export function getRoleKey(data: TOrganizationUser): TRoleKey {
  return data.is_qa ? "is_qa" : (data.is_qc ? "is_qc" : "-");
}

export function getRoleName(data: TOrganizationUser): string {
  return ROLES_MAP[getRoleKey(data)];
}
