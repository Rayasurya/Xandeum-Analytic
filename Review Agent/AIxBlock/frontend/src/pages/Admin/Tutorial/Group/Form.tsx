import React from "react";
import InputBase from "@/components/InputBase/InputBase";
import {usePromiseLoader} from "@/providers/LoaderProvider";
import Modal from "@/components/Modal/Modal";
import Alert from "@/components/Alert/Alert";
import {TApiCallResult} from "@/providers/ApiProvider";
import {TTutorialGroupForm} from "../Index";

export default function TutorialGroupForm({obj, onCancel, onChange, onSuccess, saveGroup, saving}: {
  obj: TTutorialGroupForm | null,
  onCancel: () => void,
  onChange: (obj: TTutorialGroupForm) => void,
  onSuccess: () => void,
  saveGroup: (obj: TTutorialGroupForm) => TApiCallResult,
  saving: boolean,
}) {
  const [errors, setErrors] = React.useState<{[k:string]: string[]}>({});
  const [error, setError] = React.useState<string>("");
  const {addPromise} = usePromiseLoader();

  const save = React.useCallback((o: TTutorialGroupForm) => {
    setErrors({});
    setError("");

    const ar = saveGroup(o);
    addPromise(ar.promise, "Saving tutorial group...");

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
  }, [onSuccess, saveGroup, addPromise]);


  const errorNode = React.useMemo(() => {
    if (error.trim().length === 0) {
      return null;
    }

    return <Alert message={error} type="Danger" dismissable={true} style={{marginBottom: 16}} />;
  }, [error]);

  return (
    <Modal
      open={!!obj && !saving}
      title="Tutorial Group"
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
        <InputBase
          label="Order"
          type="number"
          value={obj?.order?.toString()}
          onChange={e => obj && onChange({...obj, order: parseInt(e.target.value)})}
          error={Object.hasOwn(errors, "order") ? errors["order"][0] : null}
        />
      </div>
    </Modal>
  );
}
