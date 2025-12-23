import {TProjectModel} from "@/models/project";
import {TUserModel} from "@/models/user";
import {useMemo} from "react";

export type TProps = {
  project?: TProjectModel | null,
  user?: TUserModel | null,
}

export default function useProjectPermission({project, user}: TProps) {
  const canManage = useMemo(() => {
    return !!(
      user?.is_superuser
      || user?.is_organization_admin
      || (project?.created_by?.id && project?.created_by?.id === user?.id)
    );
  }, [project?.created_by?.id, user?.id, user?.is_organization_admin, user?.is_superuser]);

  return useMemo(() => ({
    configure: canManage,
    delete: canManage,
    import: canManage,
    export: canManage,
    bulkDeleteTask: canManage,
    bulkDeleteAnnotations: canManage,
    bulkDeletePredictions: canManage,
    createAnnotationsFromPredictions: canManage,
    retrievePredictions: canManage,
    replaceTaskHandler: canManage,
    unparkTask: canManage,
  }), [canManage])
}
