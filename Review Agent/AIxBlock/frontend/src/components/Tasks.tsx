import {TTaskModel} from "../models/task";
import {TColumnModel} from "../models/column";
import React from "react";
import {columnKey} from "../utils/column";
import "./Tasks.scss";
import {formatDateTime} from "../utils/formatDate";
import Checkbox from "./Checkbox/Checkbox";
import CompactUser from "./CompactUser/CompactUser";
import {IconAnnotations, IconCancel, IconPredictions} from "../assets/icons/Index";
import { AutoSourceAudio } from "./AutoSourceAudio/AutoSourceAudio";
import { AutoSizeImage } from "./AutoSizeImage/AutoSizeImage";
import Button from "./Button/Button";
import {infoDialog} from "./Dialog";
import VideoPlayer from "./VideoPlayer/VideoPlayer";
import EmptyContent from "./EmptyContent/EmptyContent";
import {toastWarn} from "../utils/toast";
import { formatDuration } from "../utils/duration";

type TTaskCell = {
  column: TColumnModel,
  task: TTaskModel,
}

function TaskCell({column, task}: TTaskCell) {
  return React.useMemo(() => {
    let value: string | undefined | null | React.JSX.Element | (string | React.JSX.Element)[]  = null;

    try {
      value = column.parent
        // @ts-ignore
        ? task[column.parent][column.id]
        // @ts-ignore
        : task[column.id];
    } catch (_) {
    }

    if (value && typeof value === "object") {
      value = JSON.stringify(value);
    }

    // c.type list:
    // - Number
    // - Datetime
    // - List
    // - String
    // - Boolean
    // - Image
    // - Audio
    // - AudioPlus
    // - Video
    // - Duration
    // - Unknown

    switch (column.type) {
      case "Duration":
        if (value !== null && value !== undefined) {
          value = <span className="c-tasks__cell--number-wrapper">{value ? formatDuration(value) : ""}</span>;
        }

        return <td className="c-tasks__cell c-tasks__cell--number">{value}</td>;
      case "Number":
        if (value !== null && value !== undefined) {
          value = <span className="c-tasks__cell--number-wrapper">{value}</span>;
        }

        return <td className="c-tasks__cell c-tasks__cell--number">{value}</td>;
      case "Datetime":
        return <td className="c-tasks__cell c-tasks__cell--datetime">{value ? formatDateTime(value) : ""}</td>;
      case "List":
        if (column.id === "reviewed_result") {
          if (value === "approved") {
            return <td className="c-tasks__cell c-tasks__cell--boolean c-tasks__cell--boolean--true">
              <span>Approved</span>
            </td>
          } else if (value === "rejected") {
            return <td className="c-tasks__cell c-tasks__cell--boolean c-tasks__cell--boolean--false">
              <span>Rejected</span>
            </td>
          }

          return <td/>;
        } else if (column.id === "qualified_result") {
          if (value === "qualified") {
            return <td className="c-tasks__cell c-tasks__cell--boolean c-tasks__cell--boolean--true">
              <span>Qualified</span>
            </td>
          } else if (value === "unqualified") {
            return <td className="c-tasks__cell c-tasks__cell--boolean c-tasks__cell--boolean--false">
              <span>Unqualified</span>
            </td>
          }

          return <td/>;
        }

        let newVal;

        if (typeof value === "string" && value.length > 0) {
          try {
            newVal = JSON.parse(value);
          } catch {
            value = "[" + typeof value + "]";
          }
        }

        if (Array.isArray(newVal)) {
          value = (
            <div className="c-tasks__cell__list">
              {
                newVal.map((v: any, idx: number) => {
                  let userID;

                  if (typeof v === "number") {
                    userID = v;
                  } else if (v && typeof v === "object" && "user_id" in v && typeof v["user_id"] === "number") {
                    // @ts-ignore
                    userID = v["user_id"];
                  } else {
                    return <span key={"task-" + task.id + "-" + column.id + "-list-item-" + idx}>[{typeof v}]</span>;
                  }

                  return <CompactUser key={"task-" + task.id + "-" + column.id + "-user-" + idx} userID={userID}/>
                })
              }
            </div>
          );
        }

        return <td className="c-tasks__cell c-tasks__cell--list">{value}</td>
      case "Boolean":
        return <td className={`c-tasks__cell c-tasks__cell--boolean c-tasks__cell--boolean--${!!value ? "true" : "false"}`}>
          <span>{!!value ? "Yes" : "No"}</span>
        </td>;
      case "Image":
        if (typeof value !== "string") {
          return <td className="c-tasks__cell c-tasks__cell--video">Invalid value type {typeof value}</td>;
        }

        return <td className="c-tasks__cell c-tasks__cell--image">
          <div className="c-tasks__cell--image-wrapper">
            {/* <img src={value} alt={"Task #" + task.id} /> */}
            <AutoSizeImage src={value} alt={"Task #" + task.id} size="small" />
          </div>
        </td>;
      case "Audio":
      case "AudioPlus":
        if (typeof value !== "string") {
          return <td className="c-tasks__cell c-tasks__cell--video">Invalid value type {typeof value}</td>;
        }

        return <td className="c-tasks__cell c-tasks__cell--image">
          <AutoSourceAudio src={value} style={{ width: 320 }}/>
        </td>;
      case "Video":
        if (typeof value !== "string") {
          return <td className="c-tasks__cell c-tasks__cell--video">Invalid value type {typeof value}</td>;
        }

        return <td className="c-tasks__cell c-tasks__cell--video">
          <Button
            size="tiny"
            onClick={e => {
              e.stopPropagation();

              if (typeof value === "string") {
                infoDialog({
                  title: "Player",
                  cancelText: null,
                  message: (
                    <div>
                      <VideoPlayer url={value}/>
                    </div>
                  ),
                });
              }
            }}
          >
            Play
          </Button>
        </td>;
      case "String":
        if (column.parent !== "data" || typeof value !== "string") {
          return <td className="c-tasks__cell">{value}</td>;
        }

        if (value.length > 30) {
          return <td className="c-tasks__cell" title={value}>{value.substring(0, 30)}...</td>;
        }

        return <td className="c-tasks__cell">{value}</td>;
      default:
        if (typeof value === "string" && value.length > 30) {
          return <td className="c-tasks__cell" title={value}>{value.substring(0, 30)}...</td>;
        }

        return <td className="c-tasks__cell">{value}</td>;
    }
  }, [column, task]);
}

type TTaskRow = {
  columns: TColumnModel[],
  currentTaskID?: number | null,
  isChecked?: boolean,
  isForcedCheck?: boolean,
  onCheckChange?: (task: TTaskModel, isChecked: boolean) => void,
  onTaskSelect?: (task: TTaskModel | null) => void,
  task: TTaskModel,
  canHandle: boolean,
}

function TaskRow({columns, currentTaskID, isChecked, isForcedCheck, onCheckChange, onTaskSelect, task, canHandle}: TTaskRow) {
  const cells = React.useMemo(() => {
    return columns.map(c => <TaskCell key={"task-row-" + task.id + "-" + c.id} column={c} task={task} />);
  }, [columns, task]);

  return React.useMemo(() => {
    const classes = ["c-tasks__row"];
    const isLocked = task.locked_by.length > 0;

    if (currentTaskID && task.id === currentTaskID) {
      classes.push("c-tasks__row--selected");
    }

    if (isLocked || !canHandle) {
      classes.push("c-tasks__row--locked")
    }

    return (
      <tr
        className={classes.join(" ")}
        onClick={() => {
          if (isLocked) {
            toastWarn("This task is locked");
            return;
          }

          if (!canHandle) {
            toastWarn("This task is handling by another user");
            return;
          }

          onTaskSelect?.(currentTaskID === task.id ? null : task)
        }}
      >
        {!currentTaskID && <td onClick={ev => ev.stopPropagation()} width={1}>
          <Checkbox
            size="sm"
            label=""
            checked={isChecked || isForcedCheck}
            onChange={() => onCheckChange?.(task, !isChecked)}
            disabled={isForcedCheck}
          />
        </td>}
        {cells}
      </tr>
    )
  }, [cells, currentTaskID, isChecked, isForcedCheck, onCheckChange, onTaskSelect, task, canHandle]);
}

export type TProps = {
  checkedAll?: boolean,
  checkedIDs?: number[],
  columns: TColumnModel[],
  currentTaskID?: number | null,
  onCheckAll?: () => void,
  onCheckChange?: (task: TTaskModel, isChecked: boolean) => void,
  onTaskSelect?: (task: TTaskModel | null) => void,
  tasks: TTaskModel[],
  hiddenColumnKeys: string[],
  isLoading: boolean,
  canNotHandleTasks: number[],
}

export default function Tasks({checkedAll, checkedIDs, columns, currentTaskID, hiddenColumnKeys, onCheckAll, onCheckChange, onTaskSelect, tasks, isLoading, canNotHandleTasks}: TProps) {
  const visibleColumns = React.useMemo(() => {
    return columns.filter(c => hiddenColumnKeys.indexOf(columnKey(c)) === -1);
  }, [columns, hiddenColumnKeys]);

  function generateTaskTitle(id: string, title: string) {
    switch (id) {
      case 'total_annotations':
        return <IconAnnotations />;
      case "total_predictions":
        return <IconPredictions />
      case "cancelled_annotations":
        return <IconCancel />
      default:
        return title;
    }
  }

  const tableHeader = React.useMemo(() => {
    return (
      <thead className="c-tasks__header">
        <tr>
          {!currentTaskID && <th>
            <Checkbox size="sm" label="" checked={checkedAll} onChange={() => onCheckAll?.()} />
          </th>}
          {
            visibleColumns.map(c => (
                <th key={"table-header-" + c.id}>
                {generateTaskTitle(c.id, c.title)}
              </th>
            ))
          }
        </tr>
      </thead>
    );
  }, [currentTaskID, checkedAll, onCheckAll, visibleColumns]);

  const rows = React.useMemo(() => {
    return (
      <tbody className="c-tasks__list">
        {
          tasks.map(t => {
            return (
              <TaskRow
                columns={visibleColumns}
                currentTaskID={currentTaskID}
                isChecked={(checkedIDs?.indexOf(t.id) ?? -1) > -1}
                isForcedCheck={checkedAll}
                key={"task-" + t.id}
                onCheckChange={onCheckChange}
                onTaskSelect={onTaskSelect}
                task={t}
                canHandle={!canNotHandleTasks.includes(t.id)}
              />
            );
          })
        }
      </tbody>
    );
  }, [checkedAll, checkedIDs, currentTaskID, onCheckChange, onTaskSelect, tasks, visibleColumns, canNotHandleTasks]);

  return (
    <div className="c-tasks">
      <div className="c-tasks__scroll">
        <table className="c-tasks__table">
          {tableHeader}
          {rows}
        </table>
        {!isLoading && tasks.length === 0 && (
          <EmptyContent message="The task list is empty." hideIcon={true} />
        )}
      </div>
    </div>
  );
}
