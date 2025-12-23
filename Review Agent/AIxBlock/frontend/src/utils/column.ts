import {TColumnModel} from "../models/column";

export function columnKey(column: TColumnModel) {
  return column.target + ":" + (column.parent ? column.parent + "." : "") + column.id;
}
