import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { HOURS } from "@/constants/projectConstants";
import Button from "../Button/Button";
import Select, { DataSelect } from "../Select/Select";
import "./HoursPicker.scss";
import IconDelete from "@/assets/icons/IconDelete";
import { infoDialog } from "../Dialog";

interface Hours {
  startHour: number;
  endHour: number;
}

type THoursPickerProps = {
  startHour?: number;
  endHour?: number;
  onSelectHours?: any;
};

const MemoizedHoursPicker = (props: THoursPickerProps) => {
  const { startHour, endHour, onSelectHours } = props;
  const [hours, setHours] = useState<Hours>({
    startHour: startHour ?? 0,
    endHour: startHour && startHour > (endHour ?? 0) ? startHour ?? 0 : 0,
  });
  const [listHours, setListHours] = useState<Hours[]>([]);
  const [destination, setDestination] = useState<DataSelect[]>([]);
  const [isDisableAddHour, setIsDisableAddHour] = useState<boolean>(false);

  const onChangeHour = (field: string, val: number) => {
    const update = {
      ...hours,
      [field]: val,
    };
    setHours(update);
  };

  const handleAdd = useCallback(() => {
    if (hours.endHour > 0 && hours.endHour > 0) {
      setListHours([...listHours, hours]);
      const destination = [
        { ...HOURS[0], options: HOURS[0].options.slice(hours.endHour + 1) },
      ];
      setHours({ startHour: 0, endHour: 0 });
      setDestination(destination);
      onSelectHours([...listHours, hours]);
    } else {
      infoDialog({message: "Please select hour!"});
    }
  }, [hours, listHours, onSelectHours]);

  const endHours = useMemo(() => {
    return [{ ...HOURS[0], options: HOURS[0].options.slice(hours.startHour) }];
  }, [hours.startHour]);

  const handleDelete = useCallback(
    (indexToDelete: number) => {
      const newList = listHours.filter((_, index) => index !== indexToDelete);
      const des =
        newList.slice(-1).length > 0 ? newList.slice(-1)[0].endHour : 0;

      const destination = [
        { ...HOURS[0], options: HOURS[0].options.slice(des) },
      ];
      setListHours(newList);
      setDestination(destination);

      if (des !== 23) {
        setIsDisableAddHour(false);
      }
    },
    [listHours]
  );

  useEffect(() => {
    if (hours.startHour > hours.endHour && hours.endHour > 0) {
      const updatedHours = {
        ...hours,
        endHour: hours.startHour,
      };
      setHours(updatedHours);
    }
  }, [hours]);

  useEffect(() => {
    if (listHours.length > 0 && destination[0].options.length === 0) {
      const resetHour = [
        {
          ...HOURS[0],
          options: HOURS[0].options.filter((_, index) => index === 0),
        },
      ];
      setDestination(resetHour);
      setIsDisableAddHour((prev) => !prev);
    }
  }, [listHours.length, destination]);

  return (
    <>
      <div className="c-hours-picker">
        <div className="c-hours-picker__start">
          <label>Start hour</label>
          <Select
            className="c-hours-picker__start-select"
            data={listHours.length > 0 ? destination : HOURS}
            onChange={(val) => onChangeHour("startHour", parseInt(val.value))}
            defaultValue={{
              label: hours.startHour.toString(),
              value: hours.startHour.toString(),
            }}
            disabled={isDisableAddHour}
          />
        </div>
        <div className="c-hours-picker__end">
          <label>End hour</label>
          <Select
            className="c-hours-picker__end-select"
            data={listHours.length > 0 ? destination : endHours}
            onChange={(val) => onChangeHour("endHour", parseInt(val.value))}
            defaultValue={{
              label: hours.endHour.toString(),
              value: hours.endHour.toString(),
            }}
            disabled={isDisableAddHour}
          />
        </div>
        <div className="c-hours-picker__action">
          <Button
            className="c-hours-picker__action--add"
            onClick={handleAdd}
            disabled={isDisableAddHour}
          >
            Add
          </Button>
        </div>
      </div>
      <div className="c-hours-picker__list">
        {(listHours ?? []).map((item, index) => (
          <div
            className="c-hours-picker__item"
            key={`key-${item.endHour}-${item.startHour}`}
          >
            <div className="c-hours-picker__item-start">{`${item.startHour}h`}</div>
            <div>-</div>
            <div className="c-hours-picker__item-end">{`${item.endHour}h`}</div>
            <button
              className="c-hours-picker__action--clear"
              onClick={() => handleDelete(index)}
            >
              <IconDelete />
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

const HoursPicker = memo(MemoizedHoursPicker);

export default HoursPicker;
