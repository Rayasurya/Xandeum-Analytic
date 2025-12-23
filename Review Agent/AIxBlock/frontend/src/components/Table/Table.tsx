import React from "react";
import "./Table.scss";
import IconDelete from "@/assets/icons/IconDelete";
import IconEdit from "@/assets/icons/IconEdit";
import IconExport from "@/assets/icons/IconExport";
import SkeletonBox from "../SkeletonBox/SkeletonBox";
import IconPlusSquare from "@/assets/icons/IconPlusSquare";
import IconFilterOutline from "@/assets/icons/IconFilterOutline";

export type TTableActions = {
  actions: {
    disabled?: boolean;
    icon: "ADD" | "DELETE" | "EDIT" | "EXPORT" | React.ReactNode;
    onClick?: () => void;
  }[];
};

export type TTableColumn = {
  align?: "LEFT" | "CENTER" | "RIGHT";
  label?: React.ReactNode;
  dataKey?: string;
  noWrap?: boolean;
  renderer?: (dataRow: any, idx?: number) => React.ReactNode | string;
  sortable?: boolean;
  className?: string;
};

export type TTableRow = {
  columns: TTableColumn[];
  dataRow: Object;
  rowKey: string;
  rowIndex: number;
};

export type TTable = {
  columns: TTableColumn[];
  data: Object[];
  className?: string;
  skeleton?: boolean;
  headHidden?: boolean;
};

const ALIGNS_MAP = {
  LEFT: "c-table__cell--left",
  CENTER: "c-table__cell--center",
  RIGHT: "c-table__cell--right",
};

export function TableActions({ actions }: TTableActions) {
  return (
    <>
      {actions.map((a, idx) => {
        const classes = ["c-table__action"];

        if (a.disabled) {
          classes.push("c-table__action--disabled");
        }

        return (
          <button
            disabled={a.disabled}
            key={"table-action-" + idx}
            onClick={a.onClick}
            className={classes.join(" ")}
          >
            {a.icon === "DELETE" ? (
              <IconDelete />
            ) : a.icon === "EDIT" ? (
              <IconEdit />
            ) : a.icon === "EXPORT" ? (
              <IconExport />
            ) : a.icon === "ADD" ? (
              <IconPlusSquare />
            ) : (
              a.icon
            )}
          </button>
        );
      })}
    </>
  );
}

function TableRow({ columns, dataRow, rowKey, rowIndex }: TTableRow) {
  return (
    <tr>
      {columns.map((c, idx) => {
        const cellKey = rowKey + "-" + idx;
        const classes =
          (c.noWrap ? "c-table__cell--nowrap " : "") +
          " " +
          ALIGNS_MAP[c.align ?? "LEFT"] +  " " + (c.className ?? "c-col");

        if (c.renderer) {
          return (
            <td className={classes} key={cellKey}>
              {c.renderer(dataRow, rowIndex)}
            </td>
          );
        } else if (c.dataKey && Object.hasOwn(dataRow, c.dataKey)) {
          // @ts-ignore
          return (<td className={classes} key={cellKey}>{dataRow[c.dataKey]}</td>
          );
        }

        return <td className={classes} key={cellKey}></td>;
      })}
    </tr>
  );
}

export default function Table({
  columns,
  data,
  className,
  skeleton,
	headHidden,
}: TTable) {
  return (
    <div className={`c-table__wrapper ${className ? className : ""}`}>
      <table className="c-table">
        {!headHidden && (
          <thead>
            <tr>
              {columns.map((c, idx) => (
                <th
                  key={"table-th0-" + idx}
                  className={ALIGNS_MAP[c.align ?? "LEFT"]}
                >
                  <div className={c.sortable ? "sortable" : ""}>
                    {c.label}
                    {c.sortable && (
                      <div className="table-sort-action">
                        <IconFilterOutline />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {data.map((dataRow, idx) => (
            <React.Fragment key={"table-row-" + idx}>
              {skeleton ? (
                <tr>
                  {columns.map((c, idx) => (
                    <td key={`skeleton-cell-${idx}`}>
                      <SkeletonBox />
                    </td>
                  ))}
                </tr>
              ) : (
                <TableRow
                  key={"table-row-" + idx}
                  columns={columns}
                  dataRow={dataRow}
                  rowKey={"table-row-" + idx}
                  rowIndex={idx}
                />
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
