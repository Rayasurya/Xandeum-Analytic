import InputBase from "@/components/InputBase/InputBase";
import React from "react";
import IconPlus from "@/assets/icons/IconPlus";
import Button from "@/components/Button/Button";
import {TSaveRewardAction} from "@/hooks/rewards/useRewardActions";
import {createAlert} from "@/utils/createAlert";

export type TProps = {
  item: TSaveRewardAction,
  onSave?: (item: TSaveRewardAction) => void,
  errors?: { [k: string]: string[] },
  error?: null | string,
}

export default function ActionForm({errors, error, item, onSave}: TProps) {
  const data = React.useRef<TSaveRewardAction>(item);
  const isUpdate = (item.id ?? 0) > 0;

  const errorNode = React.useMemo(() => {
    return createAlert(error, undefined, false);
  }, [error]);

  return (
    <React.Fragment>
      {errorNode}
      <div className="p-admin-rewards-history-form">
        <InputBase
          label="Name"
          onChange={e => data.current.name = e.target.value}
          value={data.current.name?.toString()}
          error={errors?.["name"]?.[0]}
        />
        <InputBase
          label="Description"
          isMultipleLine={true}
          onChange={e => data.current.description = e.target.value}
          value={data.current.description?.toString()}
          error={errors?.["description"]?.[0]}
        />
        <InputBase
          label="Activity"
          isRequired={true}
          onChange={e => data.current.activity = e.target.value}
          value={data.current.activity.toString()}
          error={errors?.["activity"]?.[0]}
        />
        <InputBase
          label="Point"
          type="number"
          onChange={e => data.current.point = parseInt(e.target.value)}
          value={data.current.point.toString()}
          error={errors?.["point"]?.[0]}
        />
      </div>
      {<div className="p-admin-rewards-history-form__actions">
        <Button icon={<IconPlus/>} onClick={() => onSave?.(data.current)}>
          {isUpdate ? "Update" : "Add"}
        </Button>
      </div>}
    </React.Fragment>
  );
}
