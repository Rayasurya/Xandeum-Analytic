import {Suspense, useCallback, useEffect, useState} from "react";
import IconPlus from "@/assets/icons/IconPlus";
import Button from "@/components/Button/Button";
import InputBase from "@/components/InputBase/InputBase";
import Spin from "@/components/Spin/Spin";
import LabelItem from "../LabelItem/LabelItem";
import { confirmDialog } from "@/components/Dialog";
import IconDanger from "@/assets/icons/IconDanger";
import {useApi} from "@/providers/ApiProvider";
import styles from "./LabelManager.module.scss";

export type TLabelManagerProps<T extends Element | null> = {
  labelsRoot: T;
  projectID: number;
  updateLabelConfig: (labeConfig: string) => void;
};

const LabelManager = <T extends Element | null>(
  {labelsRoot, projectID, updateLabelConfig}: TLabelManagerProps<T>
) => {
  const [labels, setLabels] = useState<any[]>([]);
  const [newLabel, setNewLabel] = useState<string | undefined>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const {call} = useApi();

  const handleCreateLabel = useCallback(() => {
    if (!labelsRoot) {
      setError("Document or labels root is not available.");
      return;
    }

    if (!newLabel || newLabel.trim().length === 0) {
      setError("Please enter new label name.");
      return;
    }

    setLoading(true);
    setError(null);

    const ar = call("addLabels", {
      body: {
        type: labelsRoot?.tagName ?? "Labels",
        name: labelsRoot?.getAttribute("name"),
        labels: newLabel,
        pk: projectID,
      },
    });

    ar.promise
      .then(async r => {
        const data = await r.json();

        if (r.ok) {
          updateLabelConfig(data["label_config"]);
          setNewLabel("");
        } else {
          setError(data["message"]);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, [call, labelsRoot, newLabel, projectID, updateLabelConfig]);

  useEffect(() => {
    if (labelsRoot && labelsRoot.children) {
      setLabels(Array.from(labelsRoot.children));
    }
  }, [labelsRoot]);

  const handleLabelRemoval = (node: any) => {
    confirmDialog({
      title: "Are you sure to delete this label?",
      message: "",
      iconTitle: <IconDanger />,
      className: styles.modal,
      submitText: "Delete",
      onSubmit: () => {
        setLoading(true);
        setError(null);

        const ar = call("removeLabel", {
          body: {
            type: labelsRoot?.tagName ?? "Labels",
            name: labelsRoot?.getAttribute("name"),
            labels: node.getAttribute("value"),
            pk: projectID,
          },
        });

        ar.promise
          .then(async r => {
            const data = await r.json();

            if (r.ok) {
              updateLabelConfig(data["label_config"]);
            } else {
              setError(data["message"]);
            }
          })
          .catch(() => {})
          .finally(() => {
            setLoading(false);
          });
      },
    });
  };

  if (!labelsRoot) {
    return <div>Initializing...</div>;
  }

  return (
    <>
      {error && <div className={styles.error}>{error}</div>}
      <Suspense>
        <Spin loading={loading} />
      </Suspense>
      <div onKeyDown={(e) => e.stopPropagation()} className={styles.form}>
        <InputBase
          placeholder="New label name..."
          onChange={(e) => setNewLabel(e.target.value)}
          value={newLabel ?? ""}
          isControlledValue={true}
          allowClear={false}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleCreateLabel();
            }
          }}
          label="Label name"
        />
        <Button
          size="small"
          icon={<IconPlus width={14} height={14} />}
          className={styles.btnAdd}
          onClick={handleCreateLabel}
        >
          Add
        </Button>
      </div>
      {labels.length > 0 && (
        <div className={styles.list}>
          {labels.map((node, index) => (
            <LabelItem
              key={`key-label-${index}`}
              node={node}
              onRemove={handleLabelRemoval}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default LabelManager;
