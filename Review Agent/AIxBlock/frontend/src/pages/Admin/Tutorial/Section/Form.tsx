import React from "react";
import InputBase from "@/components/InputBase/InputBase";
import {usePromiseLoader} from "@/providers/LoaderProvider";
import Modal from "@/components/Modal/Modal";
import Alert from "@/components/Alert/Alert";
import {TTutorialSectionForm} from "../Index";
import {TTutorialGroup} from "@/models/tutorialGroup";
import Select, {DataSelect, SelectOption} from "@/components/Select/Select";
import useTutorialSections from "@/hooks/tutorial/useTutorialSections";

export default function TutorialSectionForm({groups, obj, onCancel, onChange, onSuccess}: {
  groups: TTutorialGroup[],
  obj: TTutorialSectionForm | null,
  onCancel: () => void,
  onChange: (obj: TTutorialSectionForm) => void,
  onSuccess: () => void,
}) {
  const {save: saveSection, saving: savingSection} = useTutorialSections();
  const [errors, setErrors] = React.useState<{[k:string]: string[]}>({});
  const [error, setError] = React.useState<string>("");
  const {addPromise} = usePromiseLoader();

  const save = React.useCallback((o: TTutorialSectionForm) => {
    setErrors({});
    setError("");

    const ar = saveSection(o);
    addPromise(ar.promise, "Saving tutorial section...");

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
  }, [onSuccess, saveSection, addPromise]);

  const subgroupOptions = React.useMemo((): DataSelect[] => {
    const list: SelectOption[] = [];

    groups.forEach(g => {
      g.sub_groups.forEach(sg => {
        list.push({label: g.name + " > " + sg.name, value: sg.id.toString()});
      });
    })

    return [{
      label: "",
      options: list,
    }]
  }, [groups]);

  const selectedSubgroup = React.useMemo((): SelectOption => {
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];

      for (let j = 0; j < group.sub_groups.length; j++) {
        const subgroup = group.sub_groups[j];

        if (subgroup.id === obj?.sub_group_id) {
          return {label: group.name + " > " + subgroup.name, value: subgroup.id.toString()}
        }
      }
    }

    return {label: "-- Select subgroup --", value: "0"};
  }, [groups, obj?.sub_group_id]);

  const errorNode = React.useMemo(() => {
    if (error.trim().length === 0) {
      return null;
    }

    return <Alert message={error} type="Danger" dismissable={true} style={{marginBottom: 16}} />;
  }, [error]);

  return (
    <Modal
      open={!!obj && !savingSection}
      title="Tutorial Section"
      onSubmit={() => obj && save(obj)}
      onCancel={onCancel}
      submitText="Save"
    >
      <div className="page-admin-tutorial-group-form">
        {errorNode}
        <InputBase
          label="Name"
          type="text"
          value={obj?.title}
          onChange={e => obj && onChange({...obj, title: e.target.value})}
          error={Object.hasOwn(errors, "title") ? errors["title"][0] : null}
        />
        <InputBase
          label="URL"
          type="text"
          value={obj?.url}
          onChange={e => obj && onChange({...obj, url: e.target.value})}
          error={Object.hasOwn(errors, "url") ? errors["url"][0] : null}
        />
        <Select
          data={subgroupOptions}
          label="Group"
          defaultValue={selectedSubgroup}
          onChange={o => obj && onChange({...obj, sub_group_id: parseInt(o.value)})}
          error={Object.hasOwn(errors, "group_id") ? errors["group_id"][0] : null}
        />
      </div>
    </Modal>
  );
}
