import {TColumnModel} from "@/models/column";
import {TViewFilterModel, TViewModel} from "@/models/view";
import React from "react";
import {columnKey} from "@/utils/column";
import useViewsHook from "./useViewsHook";

export type TUseViewHook = {
  filter: (filters: TViewFilterModel[]) => {
    controller: AbortController,
    result: Promise<TViewModel>,
  },
  ordering: (column: TColumnModel | null, desc: boolean) => {
    controller: AbortController,
    result: Promise<TViewModel>,
  },
  toggleColumn: (column: TColumnModel) => {
    controller: AbortController,
    result: Promise<TViewModel>,
  },
}

export default function useViewHook(view: TViewModel): TUseViewHook {
  const viewsHook = useViewsHook(view.project);

  const updateView = React.useCallback((body: TViewModel, interaction?: string) => {
    return viewsHook.update(view.id, body);
  }, [view, viewsHook]);

  const filter = React.useCallback((filters: TViewFilterModel[]) => {
    const body = {...view};
    body.data.filters.items = filters;
    return viewsHook.update(view.id, body, "filter");
  }, [view, viewsHook]);

  const ordering = React.useCallback((column: TColumnModel | null, desc: boolean) => {
    const body = {...view};
    body.data.ordering = column === null ? [] : [(desc ? "-" : "") + column.target + ":" + column.id];
    return viewsHook.update(view.id, body, "ordering");
  }, [view, viewsHook]);

  const toggleColumn = React.useCallback((column: TColumnModel) => {
    const body = {...view};
    const key = columnKey(column);

    if (view.data.hiddenColumns.explore.indexOf(key) === -1) {
      body.data.hiddenColumns.explore.push(key);
    } else {
      body.data.hiddenColumns.explore = body.data.hiddenColumns.explore.filter(c => c !== key);
    }

    return updateView(body);
  }, [updateView, view]);

  return React.useMemo(() => {
    return {
      filter,
      ordering,
      toggleColumn,
    };
  }, [filter, ordering, toggleColumn]);
}
