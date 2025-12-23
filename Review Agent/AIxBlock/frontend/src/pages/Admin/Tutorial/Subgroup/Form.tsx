import React from "react";
import InputBase from "@/components/InputBase/InputBase";
import {usePromiseLoader} from "@/providers/LoaderProvider";
import Modal from "@/components/Modal/Modal";
import Alert from "@/components/Alert/Alert";
import {TTutorialSubgroupForm} from "../Index";
import useTutorialSubgroups from "@/hooks/tutorial/useTutorialSubgroup";
import {TTutorialGroup} from "@/models/tutorialGroup";
import Select, {DataSelect, SelectOption} from "@/components/Select/Select";

export default function TutorialSubgroupForm({groups, obj, onCancel, onChange, onSuccess}: {
  groups: TTutorialGroup[],
  obj: TTutorialSubgroupForm | null,
  onCancel: () => void,
  onChange: (obj: TTutorialSubgroupForm) => void,
  onSuccess: () => void,
}) {
  const {save: saveSubgroup, saving: savingSubgroup} = useTutorialSubgroups();
  const [errors, setErrors] = React.useState<{[k:string]: string[]}>({});
  const [error, setError] = React.useState<string>("");
  const {addPromise} = usePromiseLoader();

  const save = React.useCallback((o: TTutorialSubgroupForm) => {
    setErrors({});
    setError("");

    const ar = saveSubgroup(o);
    addPromise(ar.promise, "Saving tutorial subgroup...");

    ar.promise
      .then(async r => {
        if (r.ok) {
          onSuccess?.();
          return;
        }

        const res = await r.json();

        if (Object.hasOwn(res, "validation_errors")) {
          setErrors(res["validation_errors"]);
        } else if (Object.hasOwn(res, "detail")) {
          setError(res["detail"]);
        }
      });
  }, [onSuccess, saveSubgroup, addPromise]);

  const groupOptions = React.useMemo((): DataSelect[] => {
    return [{
      label: "",
      options: groups.map((g): SelectOption => {
        return {label: g.name, value: g.id.toString()};
      }),
    }]
  }, [groups]);

  const selectedGroup = React.useMemo((): SelectOption => {
    const group = groups.find(g => g.id === obj?.group_id);
    return group ? {label: group.name, value: group.id.toString()} : {label: "-- Select group --", value: "0"};
  }, [groups, obj?.group_id]);

  const errorNode = React.useMemo(() => {
    if (error.trim().length === 0) {
      return null;
    }

    return <Alert message={error} type="Danger" dismissable={true} style={{marginBottom: 16}} />;
  }, [error]);

  return (
    <Modal
      open={!!obj && !savingSubgroup}
      title="Tutorial Subgroup"
      onSubmit={() => obj && save(obj)}
      onCancel={onCancel}
      submitText="Save"
    >
      <div className="page-admin-tutorial-group-form">
        {errorNode}
        <InputBase
          label="Name"
          type="text"
          value={obj?.name}
          onChange={e => obj && onChange({...obj, name: e.target.value})}
          error={Object.hasOwn(errors, "name") ? errors["name"][0] : null}
        />
        <Select
          data={groupOptions}
          label="Group"
          defaultValue={selectedGroup}
          onChange={o => obj && onChange({...obj, group_id: parseInt(o.value)})}
          error={Object.hasOwn(errors, "group_id") ? errors["group_id"][0] : null}
        />
      </div>
    </Modal>
  );
}
