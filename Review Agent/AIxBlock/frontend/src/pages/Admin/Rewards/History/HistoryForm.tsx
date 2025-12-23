import {TRewardAction} from "@/models/rewards";
import InputBase from "@/components/InputBase/InputBase";
import React from "react";
import Select, {DataSelect, SelectOption} from "@/components/Select/Select";
import IconPlus from "@/assets/icons/IconPlus";
import Button from "@/components/Button/Button";
import {TCreateRewardHistory} from "@/hooks/rewards/useRewardsHistory";
import {createAlert} from "@/utils/createAlert";

export type TProps = {
  actions: TRewardAction[],
  item: TCreateRewardHistory,
  onCreate?: (item: TCreateRewardHistory) => void,
  error?: null | string,
  errors?: { [k: string]: string[] },
}

export default function HistoryForm({actions, error, errors, item, onCreate}: TProps) {
  const data = React.useRef<TCreateRewardHistory>(item);
  const isAdd = item.id === 0;

  const actionOptions = React.useMemo((): DataSelect => {
    return {
      label: "",
      options: actions.map(a => ({
        label: a.name ? a.name : "",
        value: a.id.toString(),
      })),
    };
  }, [actions]);

  const actionValue = React.useMemo((): SelectOption => {
    const action = actions.find(a => a.id === item.action);

    if (action) {
      return {label: action.name ? action.name : "", value: item.action.toString()};
    }

    return {label: "- Select action -", value: "0"};
  }, [actions, item.action]);

  const errorNode = React.useMemo(() => {
    return createAlert(error, undefined, false);
  }, [error]);

  return (
    <React.Fragment>
      {errorNode}
      <div className="p-admin-rewards-history-form">
        <Select
          disabled={!isAdd}
          data={[actionOptions]}
          defaultValue={actionValue}
          label="Action"
          onChange={o => {
            data.current.action = parseInt(o.value);
            const action = actions.find(a => a.id.toString() === o.value);

            if (action) {
              data.current.point = action.point;
            }
          }}
          error={errors?.["action"]?.[0]}
        />
        <InputBase
          label="User"
          type="number"
          readonly={!isAdd}
          onChange={e => data.current.user = parseInt(e.target.value)}
          value={data.current.user.toString()}
          error={errors?.["user"]?.[0]}
        />
        <Select
          label="Type"
          disabled={!isAdd}
          data={[
            {
              label: "",
              options: [
                {label: "Add points", value: "0"},
                {label: "Substract points", value: "1"},
              ],
            }]}
          defaultValue={{label: "Add point", value: "0"}}
          onChange={e => data.current.status = parseInt(e.value) === 1 ? 1 : 0}
          error={errors?.["status"]?.[0]}
        />
        <InputBase
          label="Note"
          isMultipleLine={true}
          readonly={!isAdd}
          onChange={e => data.current.note = e.target.value}
          value={data.current.note}
          error={errors?.["note"]?.[0]}
        />
      </div>
      {isAdd && <div className="p-admin-rewards-history-form__actions">
        <Button icon={<IconPlus/>} onClick={() => onCreate?.(data.current)}>Add</Button>
      </div>}
    </React.Fragment>
  );
}
