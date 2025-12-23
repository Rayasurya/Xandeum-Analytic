import { TProjectModel } from "@/models/project";
import { TUseProjectHook } from "@/hooks/project/useProjectHook";
import { TParsedPiiEntities } from "../../parsePiiEntities";
import { useCallback, useMemo, useState } from "react";
import styles from "./PiiEntitiesManager.module.scss";
import IconClearCircle from "@/assets/icons/IconClearCircle";
import InputBase from "@/components/InputBase/InputBase";
import Button from "@/components/Button/Button";
import { useCentrifuge } from "@/providers/CentrifugoProvider";
import useDebouncedEffect from "@/hooks/useDebouncedEffect";
import { useApi } from "@/providers/ApiProvider";
import { toastError, toastSuccess, toastWarn } from "@/utils/toast";
import { extractErrorMessage } from "@/utils/error";

export type TManagerProps = {
  project: TProjectModel;
  patchProject: TUseProjectHook["patchProject"];
  piiEntities: TParsedPiiEntities;
}

export default function PiiEntitiesManager({ project, patchProject, piiEntities }: TManagerProps) {
  const { onProjectMessage } = useCentrifuge();

  useDebouncedEffect(() => {
    const unsub = onProjectMessage(project.id, (msg) => {
      if (("added_pii" in msg || "deleted_pii" in msg) && "label_config" in msg) {
        patchProject({ label_config: msg["label_config"] as string }, true);
      }
    });

    return () => {
      unsub();
    }
  }, [ project.id ]);

  return (
    <>
      { piiEntities.redactors.map(redactor => (
        <PiiEntities project={ project } patchProject={ patchProject } redactor={ redactor }/>
      )) }
    </>
  );
}

export type TProps = {
  project: TProjectModel;
  patchProject: TUseProjectHook["patchProject"];
  redactor: Element;
}

function PiiEntities({ project, redactor }: TProps) {
  const listVal = redactor.getAttribute("pii") ?? "";
  const list = useMemo(() => listVal.split(","), [ listVal ]);
  const [ newEntity, setNewEntity ] = useState("");
  const { call } = useApi();
  const pk = useMemo(() => project.id, [ project.id ]);
  const name = useMemo(() => redactor.getAttribute("name") ?? "", [ redactor ]);

  const addEntity = useCallback((entity: string) => {
    if (entity.trim().length === 0) {
      return;
    }

    if (list.includes(entity)) {
      toastWarn("Entity already exists!");
      return;
    }

    const ar = call("addPii", { body: { pk, name, entity } });

    ar.promise
      .then(async r => {
        const data = await r.json();

        if (r.ok) {
          setNewEntity("");
          toastSuccess(data?.["message"] ?? "Entity has been added successfully");
        } else {
          toastSuccess(data?.["message"] ?? "Failed to add new entity");
        }
      })
      .catch(e => {
        toastError(extractErrorMessage(e));
      });
  }, [list, call, pk, name]);

  const removeEntity = useCallback((entity: string) => {
    if (entity.trim().length === 0) {
      return;
    }

    const ar = call("removePii", { body: { pk, name, entity } });

    ar.promise
      .then(async r => {
        const data = await r.json();

        if (r.ok) {
          setNewEntity("");
          toastSuccess(data?.["message"] ?? "Entity has been removed successfully");
        } else {
          toastSuccess(data?.["message"] ?? "Failed to remove entity");
        }
      })
      .catch(e => {
        toastError(extractErrorMessage(e));
      });
  }, [ call, pk, name ]);

  return (
    <div className={ styles.manager }>
      <div className={ styles.title }>
        <div>
          Redact target: { redactor.getAttribute("toName") }
        </div>
        <div className={ styles.titleRight }>
          <InputBase
            isControlledValue={ true }
            value={ newEntity }
            onChange={ e => setNewEntity(e.currentTarget.value) }
            allowClear={ false }
            placeholder="Enter new entity..."
            onKeyUp={ ev => {
              if (ev.key !== "Enter") {
                return;
              }

              addEntity(newEntity);
            } }
          />
          <Button
            size="tiny"
            disabled={ newEntity.trim().length === 0 }
            onClick={ () => addEntity(newEntity) }
          >
            Add
          </Button>
        </div>
      </div>
      <div className={ styles.list }>
        { list.map((e, idx) => (
          <span className={ styles.entity } key={ idx }>
            { e }
            <span
              className={ styles.removeEntity }
              onClick={() => removeEntity(e)}
            >
              <IconClearCircle/>
            </span>
          </span>
        )) }
      </div>
    </div>
  );
}
