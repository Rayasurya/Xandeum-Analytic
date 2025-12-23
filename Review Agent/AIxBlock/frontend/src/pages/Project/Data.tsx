import "./Data.scss";
import { usePageProjectDetail } from "./Detail";
import React, {Suspense} from "react";
import useColumnsHook from "@/hooks/project/columns/useColumnsHook";
import useActionsHook from "@/hooks/project/actions/useActionsHook";
import { TProjectModel } from "@/models/project";
import useUrlQuery from "@/hooks/useUrlQuery";
import { useLocation, useNavigate } from "react-router-dom";
import { TViewFilterModel, TViewModel } from "@/models/view";
import { TTaskModel } from "@/models/task";
import Pagination from "@/components/Pagination/Pagination";
import { useUserLayout } from "@/layouts/UserLayout";
import Tasks from "@/components/Tasks";
import { TColumnModel } from "@/models/column";
import useViewActionsHook from "@/hooks/project/actions/useViewActionsHook";
import { TActionModel } from "@/models/action";
import { columnKey } from "@/utils/column";
import useViewHook from "@/hooks/project/view/useViewHook";
import Filters from "@/components/Filters";
import { getDefaultOperator } from "@/components/Filters/operators";
import getDefaultValue from "@/components/Filters/defaultValues";
import Dropdown from "@/components/Dropdown/Dropdown";
import Tabs from "@/components/Tabs/Tabs";
import Editor from "@/components/Editor/Editor";
import useTaskHook from "@/hooks/project/task/useTaskHook";
import EditorPreload from "@/components/Editor/EditorPreload";
import Button from "@/components/Button/Button";
import IconRefresh from "@/assets/icons/iconRefresh";
import Modal from "@/components/Modal/Modal";
import ExportDialog from "./ExportDialog/Index";
import DropdownItem, {
  TDropdownItem,
} from "@/components/DropdownItem/DropdownItem";
// import useLockTaskHook from "@/hooks/project/task/useLockTaskHook";
import { TNavbarBreadcrumb } from "@/components/Navbar/Navbar";
import { useAuth } from "@/providers/AuthProvider";
import useTaskWorkflowHook from "@/hooks/project/task/useTaskWorkflowHook";
import {useBooleanLoader, usePromiseLoader} from "@/providers/LoaderProvider";
import { confirmDialog, infoDialog } from "@/components/Dialog";
import useTasksHook from "@/hooks/project/task/useTasksHook";
import useViewsHook from "@/hooks/project/view/useViewsHook";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import Spin from "@/components/Spin/Spin";
import AppLoading from "@/components/AppLoading/AppLoading";
import { useCachedImages } from "@/providers/CachedProvider";
import ApiProvider, {useApi} from "@/providers/ApiProvider";
import { TApiCallResult} from "@/providers/ApiProvider";
import canHandleTask from "@/utils/canHandleTask";
import ReplaceUser, {TReplaceRoles} from "./ReplaceUser";
import UserName from "@/components/UserName/UserName";
import {useCentrifuge} from "@/providers/CentrifugoProvider";

type TDataTasksProps = {
  pjId: number;
  actions: TActionModel[];
  loadingActions: boolean;
  columns: TColumnModel[];
  loadingColumns: boolean;
  onViewUpdated?: (view: TViewModel, reload: boolean) => void;
  onTaskUpdated?: (taskID: number, task?: TTaskModel) => void;
  view: TViewModel;
  currentTask?: TTaskModel | null;
  dataUrl: string;
};

function DataTasks({
  pjId,
  actions,
  loadingActions,
  columns,
  loadingColumns,
  onViewUpdated,
  onTaskUpdated,
  view,
  currentTask,
  dataUrl,
}: TDataTasksProps) {
  const queries = useUrlQuery();
  const tasks = useTasksHook({
    view: view,
    pageSize: 10,
    page: parseInt(queries.has("page") ? (queries.get("page") ?? "1") : "1"),
  });
  const [checkedAll, setCheckedAll] = React.useState<boolean>(false);
  const [isShowExportDialog, setShowExportDialog] =
    React.useState<boolean>(false);
  const [checkedIDs, setCheckedIDs] = React.useState<number[]>([]);
  const [hiddenColumns, setHiddenColumns] = React.useState<string[]>(
    view.data.hiddenColumns.explore
  );
  const [filters, setFilters] = React.useState<TViewFilterModel[]>(
    view.data.filters.items
  );
  const currentViewID = React.useRef<number>(view.id);
  const viewActions = useViewActionsHook(view);
  const viewHook = useViewHook(view);
  const navigate = useNavigate();
  const {onTaskMessage} = useCentrifuge();
  const { clearCached } = useCachedImages();
  const {user} = useAuth();
  const {project} = usePageProjectDetail();
  const {call} = useApi();
  const [userRoles, setUserRoles] = React.useState<{ isQC: boolean; isQA: boolean } | null>(null);
  // useBooleanLoader(tasks.loading, "Loading tasks list...");

  // React.useEffect(() => {
  //   onTasksUpdated?.(tasks.list ?? null);
  // }, [tasks, onTasksUpdated]);

  React.useEffect(() => {
    console.log(queries);
  }, [queries]);

  React.useEffect(() => {
    clearCached(view.project.toString())
  }, [view.project, clearCached]);

  const onCheckChange = React.useCallback(
    (task: TTaskModel, isChecked: boolean) => {
      if (isChecked) {
        if (checkedIDs.indexOf(task.id) === -1) {
          setCheckedIDs([...checkedIDs, task.id]);
        }
      } else {
        if (checkedIDs.indexOf(task.id) > -1) {
          setCheckedIDs(checkedIDs.filter((id) => id !== task.id));
        }
      }
    },
    [checkedIDs]
  );

  const processAction = React.useCallback(
    (action: TActionModel) => {
      if (action.dialog?.type === "confirm" && action.dialog?.text) {
        confirmDialog({
          message: action.dialog.text,
          onSubmit() {
            const ar = viewActions.process(action.id, checkedIDs, checkedAll);

            ar.result
              .then(r => {
                if (r.reload) {
                  tasks.refresh();
                }
              })
              .catch((e) => {
                infoDialog({
                  message: e instanceof Error ? e.message : JSON.stringify(e),
                });
              });
          },
        });
      } else {
        const ar = viewActions.process(action.id, checkedIDs, checkedAll);

        ar.result
          .then(r => {
            if (r.reload) {
              tasks.refresh();
            }
          })
          .catch((e) => {
            infoDialog({
              message: e instanceof Error ? e.message : JSON.stringify(e),
            });
          });
      }
    },
    [checkedAll, checkedIDs, tasks, viewActions]
  );

  const toggleColumn = React.useCallback(
    (column: TColumnModel) => {
      const ar = viewHook.toggleColumn(column);

      ar.result
        .then((v) => {
          setHiddenColumns(v.data.hiddenColumns.explore);
          onViewUpdated?.(v, false);
        })
        .catch((e) => {
          infoDialog({
            message: e instanceof Error ? e.message : JSON.stringify(e),
          });
        });
    },
    [onViewUpdated, viewHook]
  );

  const addFilter = React.useCallback(() => {
    const operator = getDefaultOperator(columns[0].type);

    setFilters([
      ...filters,
      {
        filter: "filter:" + columnKey(columns[0]),
        operator,
        type: columns[0].type,
        value: getDefaultValue(columns[0].type, operator),
      },
    ]);
  }, [columns, filters]);

  const updateFilter = React.useCallback(
    (index: number, filter: TViewFilterModel) => {
      const f = {...filter};

      if (
        (["in", "not_in"].includes(f.operator) && typeof filter.value !== "object")
        || (!["in", "not_in"].includes(f.operator) && typeof filter.value === "object")
      ) {
        f.value = getDefaultValue(f.type.toLowerCase(), f.operator);
      }

      filters[index] = f;
      setFilters([...filters]);
    },
    [filters]
  );

  const applyFilter = React.useCallback(() => {
    const ar = viewHook.filter(filters);

    ar.result
      .then((v) => {
        navigate("?tab=" + v.id);
        tasks.setPage(1);
        onViewUpdated?.(v, true);
      })
      .catch((e) => {
        infoDialog({
          message: e instanceof Error ? e.message : JSON.stringify(e),
        });
      });

    document.dispatchEvent(new MouseEvent("mousedown"));
  }, [filters, onViewUpdated, viewHook, tasks, navigate]);

  const removeFilter = React.useCallback(
    (index: number) => {
      setFilters(filters.filter((_, idx) => idx !== index));
    },
    [filters]
  );

  const orderColumn = React.useMemo(() => {
    if (!view.data.ordering || view.data.ordering.length === 0) {
      return null;
    }

    let orderingColKey = view.data.ordering[0];

    if (orderingColKey.startsWith("-")) {
      orderingColKey = orderingColKey.substring(1);
    }

    const col = columns.find((c) => c.target + ":" + c.id === orderingColKey);
    return col ?? null;
  }, [columns, view.data.ordering]);

  const orderDirection = React.useMemo(() => {
    if (
      view.data.ordering &&
      view.data.ordering.length > 0 &&
      view.data.ordering[0].startsWith("-")
    ) {
      return "-";
    }

    return "";
  }, [view.data.ordering]);

  const orderDirectionButton = React.useMemo(() => {
    if (!orderColumn) {
      return null;
    }

    return (
      <button
        onClick={(ev) => {
          ev.stopPropagation();
          viewHook
            .ordering(orderColumn, orderDirection !== "-")
            .result.then((v) => {
              onViewUpdated?.(v, true);
            });
        }}
      >
        {orderDirection === "-" ? "desc" : "asc"}
      </button>
    );
  }, [onViewUpdated, orderColumn, orderDirection, viewHook]);

  const isTasksLoading = React.useMemo(() => !tasks.initialized || tasks.loading, [tasks.initialized, tasks.loading]);

  const closeModal = () => {
    setShowExportDialog(false);
  };

  // const currentTask = React.useMemo(() => {
  //   return tasks.list.find(t => t.id === currentTaskID);
  // }, [tasks.list, currentTaskID]);
  React.useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const response = await call("UserRoleInProject", {
          query: new URLSearchParams({ project_id: project.id.toString() }),
        });
        const data = await response.promise;
        const jsonData = await data.json();
        setUserRoles({
          isQC: jsonData["is_qc"] ?? false,
          isQA: jsonData["is_qa"] ?? false,
        });
        // console.log("aaa",userRoles?.isQC, userRoles?.isQA)
      } catch (error) {
        console.error("Error fetching user roles:", error);
        setUserRoles(null);
      }
    };

    fetchUserRoles();
  }, [call, project.id, userRoles?.isQA, userRoles?.isQC]);

  const canNotHandleTasks = React.useMemo(() => {
    if (!user) {
      return [];
    }

    return tasks.list
      .map(t => {
        const check = canHandleTask(user, project, t, userRoles?.isQA, userRoles?.isQC);
        return !check.canView ? t.id : null;
      })
      .filter(v => v !== null) as number[];
  }, [project, tasks.list, user, userRoles?.isQA, userRoles?.isQC]);

  React.useEffect(() => {
    if (tasks.loading || !currentTask || !user) {
      return;
    }

    const check = canHandleTask(user, project, currentTask, userRoles?.isQA, userRoles?.isQC);

    if (!check.canView) {
      if (check.error) {
        infoDialog({title: "Notice", message: check.error});
      }

      navigate(dataUrl);
    }
  }, [currentTask, dataUrl, navigate, project, tasks.loading, user, userRoles?.isQA, userRoles?.isQC]);

  React.useEffect(() => {
    setFilters(view.data.filters.items);
  }, [view.data.filters.items]);

  React.useEffect(() => {
    setHiddenColumns(view.data.hiddenColumns.explore);
  }, [view.data.hiddenColumns.explore]);

  React.useEffect(() => {
    setCheckedIDs([]);
    setCheckedAll(false);
  }, [tasks.list]);

  // Reset page to 1 after view changed
  React.useEffect(() => {
    if (view.id === currentViewID.current) {
      return;
    }

    currentViewID.current = view.id;
    tasks.setPage(1);
  }, [tasks, view, currentViewID]);

  React.useEffect(() => {
    const unsubscribes = tasks.list.map((t) =>
      onTaskMessage(t.id, (msg: Object) => {
        if (!("command" in msg)) {
          return;
        }

        // @ts-ignore
        const command = msg["command"];

        if (command === "lock") {
          // @ts-ignore
          tasks.lockTask(t.id, parseInt(msg["user_id"] ?? "0"));
        } else if (command === "release") {
          // @ts-ignore
          tasks.releaseTask(t.id, msg["user_id"] ?? "0");
        } else if (command === "update") {
          tasks.refreshTask(t.id, (newTaskData: TTaskModel) => {
            onTaskUpdated?.(t.id, newTaskData);
          });
        }
      })
    );

    return () => {
      unsubscribes.forEach((u) => u());
    };
  }, [tasks, onTaskMessage, onTaskUpdated]);

  // if (!tasks.initialized || tasks.loading) {
  //   return <>Loading tasks list...</>;
  // }

  const convertDataDropdownActions = (): TDropdownItem[] => {
    const disabled = checkedIDs.length === 0 && !checkedAll;
    const actionItems = actions.map((item) => ({
      id: `action-${item.id}`,
      label: item.title,
      disabled,
      handler: () => processAction(item),
    }));

    actionItems.push({
      id: `action-replace-user`,
      label: "Replace User",
      disabled,
      handler: () => {
        let role: TReplaceRoles = "annotator";
        let from: number | null = null;
        let to: number | null = null;
        let processingCb: null | ((state: boolean) => void) = null;
        let isProcessing = false;

        confirmDialog({
          title: "Replace User",
          message: (
            <ApiProvider>
              <ReplaceUser
                registerProcessingSetter={cb => processingCb = cb}
                organization={user?.active_organization ?? 0}
                onChange={(r: TReplaceRoles, f: number, t: number) => {
                  role = r;
                  from = f;
                  to = t;
                }}
              />
            </ApiProvider>
          ),
          submitText: "Replace",
          onSubmit: async () => {
            if (isProcessing) {
              infoDialog({title: "Notice", message: "Another request is in processing. Please wait a moment"});
              return false;
            }

            if (!from || !to) {
              infoDialog({title: "Error", message: "Please select user to replace"});
              return false;
            }

            if (from === to) {
              infoDialog({title: "Error", message: "Please select user to replace"});
              return false;
            }

            processingCb?.(true);
            isProcessing = true;

            const ar = call("replaceUser", {
              params: {id: project.id.toString()},
              body: {
                tasks: checkedAll ? [-1] : checkedIDs,
                role,
                from,
                to,
              }
            });

            const res = await ar.promise;
            processingCb?.(false);
            isProcessing = false;

            return res.ok;
          },
        });
      },
    });

    return actionItems;
  };

  const convertDataDropdownColumn = (): TDropdownItem[] =>
    columns.map((item) => ({
      id: `column-${item.id}`,
      label: item.title,
      checked: view.data.hiddenColumns.explore.indexOf(columnKey(item)) === -1,
      className: "c-dropdown-item-checkbox c-dropdown-item-not-radius",
      handler: () => toggleColumn(item),
    }));

  const convertDataDropdownOrdering = (): TDropdownItem[] =>
    columns.map((item) => ({
      id: `ordering-${item.target}-${item.id}`,
      label: item.title,
      className: "c-dropdown-item-not-radius",
      handler: () => {
        viewHook.ordering(item, orderDirection === "-").result.then((v) => {
          onViewUpdated?.(v, true);
        });
      },
    }));

  return (
    <>
      <div className="page-project-data__toolbar">
        <div className="toolbar-section">
          {(loadingActions || loadingColumns) && <Spin inline={true} loading={true} size="sm" /> }
          {!loadingActions && !currentTask?.id && <Dropdown label="actions" arrow>
            <DropdownItem data={convertDataDropdownActions()} />
          </Dropdown>}
          {!loadingColumns && <Dropdown label="column" arrow>
            <DropdownItem data={convertDataDropdownColumn()} isCheckbox />
          </Dropdown>}
          {!loadingColumns && (
            <Dropdown
              className="page-project-data__filter-dropdown"
              label={(
                <>
                  Filters
                  {filters.length > 0 && <span className="page-project-data__toolbar-badge">{filters.length}</span>}
                </>
              )}
              arrow
            >
              <Filters
                columns={columns}
                filters={filters}
                onAdd={addFilter}
                onApply={applyFilter}
                onRemove={removeFilter}
                onUpdate={updateFilter}
              />
            </Dropdown>
          )}
          {!loadingColumns && <Dropdown
            label={"Ordering: " + (orderColumn?.title ?? "Default")}
            icon={orderDirectionButton}
            arrow
          >
            <DropdownItem data={convertDataDropdownOrdering()} />
          </Dropdown>}
        </div>
        <div className="toolbar-section toolbar-section-ordering">
          {/*<Dropdown label="Label all task"></Dropdown>*/}
        </div>
        <div className="toolbar-section">
          <Button
            type="secondary"
            className="toolbar-section--refresh"
            icon={<IconRefresh />}
            onClick={tasks.refresh}
          />
          <Button
            type="secondary"
            className="toolbar-section--import"
            onClick={() =>
              navigate("/projects/" + view.project + "/import/local")
            }
          >
            Import
          </Button>
          <Button
            type="secondary"
            className="toolbar-section--export"
            onClick={() => setShowExportDialog(true)}
          >
            Export
          </Button>
          {/*<Mode />*/}
        </div>
      </div>
      {!tasks.loadingError && !isTasksLoading && <Tasks
        checkedAll={checkedAll}
        checkedIDs={checkedIDs}
        currentTaskID={currentTask?.id}
        columns={columns}
        hiddenColumnKeys={hiddenColumns}
        onCheckAll={() => setCheckedAll(!checkedAll)}
        onCheckChange={onCheckChange}
        onTaskSelect={(t) => {
          if (t) {
            if (t.assigned_to.length > 0 && t.assigned_to.indexOf(user?.id ?? 0) === -1) {
              infoDialog({
                title: "Notice",
                message: "The task #" + t.id + " has been assigned to another user",
              });

              return;
            }

            navigate(dataUrl + "&task=" + t.id);
          } else {
            navigate(dataUrl);
          }
        }}
        tasks={isTasksLoading ? [] : tasks.list}
        isLoading={isTasksLoading}
        canNotHandleTasks={canNotHandleTasks}
      />}
      {tasks.loadingError && <EmptyContent hideIcon={true} message={tasks.loadingError} />}
      {isTasksLoading && <EmptyContent message={"Loading tasks..."} />}
      {tasks.total > tasks.pageSize && (
        <div className="page-project-data__pagination">
          <Pagination
            page={tasks.page}
            pageSize={tasks.pageSize}
            setPage={tasks.setPage}
            total={tasks.total}
            target={dataUrl.startsWith("/") ? dataUrl.substring(1) : dataUrl}
          />
        </div>
      )}
       <Suspense fallback={<AppLoading/>}>
        <Modal
          open={isShowExportDialog}
          title={"Export Data"}
          className="c-ml__add-gallery"
          onCancel={closeModal}
        >
          <ExportDialog pjId={pjId} dataTypes={project.data_types} />
        </Modal>
      </Suspense>
    </>
  );
}

type TDataInternalProps = {
  project: TProjectModel;
  onTaskUpdated?: (taskID: number, task?: TTaskModel) => void;
  currentTask?: TTaskModel | null;
  dataUrl: string;
};

/**
 * This component will make sure that actions, columns, views are loaded properly,
 * then render the <DataTasks/> component to display tasks list.
 *
 * @param {TDataInternalProps} props
 * @constructor
 */
function DataInternal({ project, onTaskUpdated, currentTask, dataUrl }: TDataInternalProps) {
  const {
    initialized: actionsInitialized,
    loading: actionsLoading,
    list: actionsList,
  } = useActionsHook(project.id);

  const {
    initialized: columnsInitialized,
    loading: columnsLoading,
    list: columnsList,
  } = useColumnsHook(project.id);

  const {
    create: viewsCreate,
    refresh: viewsRefresh,
    close: viewsClose,
    update: viewsUpdate,
    duplicate: viewsDuplicate,
    initialized: viewsInitialized,
    loading: viewsLoading,
    list: viewsList,
    makePublic: makeViewPublic,
    makePrivate: makeViewPrivate,
  } = useViewsHook(project.id);

  const urlQuery = useUrlQuery();
  const navigate = useNavigate();
  const [view, setView] = React.useState<TViewModel | null>(null);
  const {addPromise} = usePromiseLoader();
  // useBooleanLoader(actionsLoading, "Loading actions...");
  // useBooleanLoader(columnsLoading, "Loading columns...");
  useBooleanLoader(viewsLoading, "Loading...");

  // Create view for new project that doesn't has any view
  React.useEffect(() => {
    if (!viewsInitialized || !columnsInitialized || viewsList.length > 0) {
      return;
    }

    const ar = viewsCreate(columnsList);

    return () => {
      ar.controller.abort("Component unmounted");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewsInitialized, columnsInitialized]);

  // If current URL is missing the tab query, redirect to a new URL with a tab query.
  React.useEffect(() => {
    // Waiting for initialized state
    if (!viewsInitialized) {
      return;
    }

    // Next hook will check the tab query value if present
    if (urlQuery.has("tab")) {
      return;
    }

    // Redirect to a new URL with tab query if not present
    if (viewsList.length > 0) {
      navigate("/projects/" + project.id + "/data?tab=" + viewsList[0].id, {
        replace: true,
      });
    }
  }, [project.id, viewsInitialized, viewsList, urlQuery, navigate]);

  // Check the tab query in URL, redirect to another valid one if invalid.
  React.useEffect(() => {
    // Waiting for initialized state
    if (!viewsInitialized) {
      return;
    }

    // Above hook will add tab query if not present.
    // Just waiting for next round when it was available.
    const tab = urlQuery.get("tab");

    if (!tab) {
      setView(null);
      return;
    }

    // Bypass if this value has been checked already
    const tabID = parseInt(tab);

    if (view && view.id === tabID) {
      return;
    }

    // Validate tab ID in the URL
    const _view = viewsList.find((v) => v.id === tabID);

    // Valid tab ID
    if (_view) {
      setView(_view);
    }
    // Invalid tab ID, redirect to the base URL.
    // The hook above will redirect to another valid URL with a valid tab query.
    // else {
    //   setView(null);
    //   navigate("/projects/" + project.id + "/data", { replace: true });
    // }
  }, [urlQuery, viewsInitialized, viewsList, view, navigate, project.id]);

  const onViewUpdated = React.useCallback(
    (v: TViewModel, reload: boolean) => {
      if (reload) {
        viewsRefresh();
      }

      setView(v);
    },
    [viewsRefresh]
  );

  function closeView(viewID: number) {
    if (view && viewID === view.id) {
      let idx = -1;

      for (let i = 0; i < viewsList.length; i++) {
        if (viewsList[i].id !== view.id) {
          continue;
        }

        idx = i;
        break;
      }

      let targetIdx;

      if (idx > 0) {
        targetIdx = idx - 1;
      } else {
        targetIdx = idx + 1;
      }

      navigate(
        "/projects/" + project.id + "/data?tab=" + viewsList[targetIdx].id,
        { replace: true }
      );
    }

    try {
      const ar = viewsClose(viewID);
      addPromise(ar.promise, "Closing tab...");
    } catch (_) {}
  }

  function switchView(viewID: number) {
    if (viewID === view?.id) {
      return;
    }

    navigate("/projects/" + project.id + "/data?tab=" + viewID);
  }

  function renameView(viewID: number) {
    const _view = viewsList.find((f) => f.id === viewID);

    if (!_view) {
      return;
    }

    const name = window.prompt("Enter new tab name", _view.data.title)?.trim();

    if (!name || name.length === 0) {
      return;
    }

    _view.data.title = name;
    const ar = viewsUpdate(viewID, { ..._view });
    ar.result.then(viewsRefresh);
    addPromise(ar.result, "Renaming tab...");
  }

  function createView(columns: TColumnModel[]) {
    const ar = viewsCreate(columns);
    ar.promise.then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        navigate("/projects/" + project.id + "/data?tab=" + data.id);
      }
    });
    addPromise(ar.promise, "Creating tab...");
  }

  function makePrivate(v: TViewModel) {
    const ar = makeViewPrivate(v);
    ar.result.then(async(res) => {
      if (res) {
        setView(res);
      }
      return;
    });
  }

  function makePublic(v: TViewModel) {
    const ar = makeViewPublic(v);
    ar.result.then(async(res) => {
      if (res) {
        setView(res);
      }
      return;
    });
  }

  return (
    <div className="page-project-data">
      {/* <h2 className="project-data__title">{project.title}</h2> */}
      <Tabs
        refresh={viewsRefresh}
        views={viewsList}
        loadingViews={viewsLoading || !viewsInitialized}
        currentView={view}
        createView={() => createView(columnsList)}
        switchView={switchView}
        closeView={closeView}
        renameView={renameView}
        duplicateView={viewsDuplicate}
        makePublic={(v) => makePublic(v)}
        makePrivate={(v) => makePrivate(v)}
      />
      {view && <DataTasks
        pjId={project.id}
        actions={actionsList}
        loadingActions={actionsLoading || !actionsInitialized}
        columns={columnsList}
        loadingColumns={columnsLoading || !columnsInitialized}
        onViewUpdated={onViewUpdated}
        onTaskUpdated={onTaskUpdated}
        view={view}
        currentTask={currentTask}
        dataUrl={dataUrl}
      />}
    </div>
  );
}

/**
 * This component will make sure that project detail is available,
 * then load the <DataInternal /> component.
 *
 * @constructor
 */
export default function Data() {
  // Don't use the useProjectHook() here, use the usePageProjectDetail() hook instead to avoid unnecessary API calls.
  const { project, patchProject } = usePageProjectDetail();
  const userLayout = useUserLayout();
  const api = useApi();
  const navigate = useNavigate();
  const queries = useUrlQuery();
  const queryTaskID = React.useMemo(() => queries.get("task") ?? "0", [queries]);
  const taskID = React.useMemo(() => parseInt(queryTaskID), [queryTaskID]);
	const projectID = React.useMemo(() => project.id ?? 0, [project]);
	// const tabID = React.useMemo(() => parseInt(queries.get("tab") ?? "0"),[queries]);
  // const [tasks, setTasks] = React.useState<TTaskModel[]>([]);
  // const {/*locking: lockingTask, lockingTaskID,*/ lockingError} = useLockTaskHook(taskID > 0 ? taskID : null);
  const {task, loading: loadingTask, refresh: refreshTask, setTask} = useTaskHook(taskID ?? 0, projectID);
  const location = useLocation();
  const fallBackPage = location.state?.currentPage ?? 1;
  const [fallBack] = React.useState(fallBackPage);
  const { user } = useAuth();
  const {call} = useApi();
  const [isQC, setIsQC] = React.useState<boolean | undefined>(undefined);
  const [isQA, setIsQA] = React.useState<boolean | undefined>(undefined);
  const {
    submitToReview,
    approve,
    reject,
    qualify,
    unqualify,
    processing,
    error: workflowError,
  } = useTaskWorkflowHook(taskID > 0 ? taskID : null);
  const {addPromise} = usePromiseLoader();
  // useBooleanLoader(lockingTask, "Locking task...");
  // useBooleanLoader(loadingTask, "Getting task...");
  useBooleanLoader(processing, "Processing workflow...");

  const dataUrl = React.useMemo(() => {
    const q = new URLSearchParams();

    if (queries.has("tab")) {
      q.append("tab", queries.get("tab") ?? "");
    }

    if (queries.has("page")) {
      q.append("page", queries.get("page") ?? "");
    }

    return "/projects/" + project.id + "/data?" + q;
  }, [project.id, queries]);

  const afterWorkflowAction = React.useCallback(() => {
    refreshTask();
  }, [refreshTask]);

  const claimTask = React.useCallback(() => {
    const ar = call("claimTask", {
      query: new URLSearchParams({
        project_id: projectID.toString(),
      }),
    });

    ar.promise
      .then(async r => {
        const text = await r.text();

        if (r.status === 404) {
          infoDialog({title: "Claim task", message: "No tasks available at this time"});

          if (taskID > 0) {
            navigate(dataUrl);
          }
        } else if (!r.ok) {
          infoDialog({
            title: "Claim task",
            message: "Unable to check tasks at this time. Error: " + text,
          });
        } else {
          navigate(dataUrl + "&task=" + text);
        }
      });

    addPromise(ar.promise, "Getting new task...");
  }, [call, navigate, projectID, dataUrl, taskID, addPromise]);

  // const unassignTask = React.useCallback(async () => {
  //   if (!task?.id) {
  //     return;
  //   }
  //
  //   const ar = call("unassignTask", {
  //     params: {id: task.id.toString()},
  //   });
  //
  //   ar.promise
  //     .then(async r => {
  //       if (r.ok) {
  //         navigate(dataUrl);
  //       } else {
  //         const data = await r.json();
  //
  //         if ("message" in data) {
  //           infoDialog({title: "Error", message: data["message"]});
  //         } else {
  //           infoDialog({title: "Error", message: "Failed to release task. Please try again!"});
  //         }
  //       }
  //     })
  //     .catch(e => {
  //       if (window.APP_SETTINGS.debug) {
  //         console.error(e);
  //       }
  //     });
  //
  //   return ar.promise;
  // }, [call, dataUrl, navigate, task?.id]);
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response: TApiCallResult = await api.call("UserRoleInProject", {
          query: new URLSearchParams({
            project_id: project.id?.toString()
          }),
        });
        
        const data = await response.promise;
        const jsonData = await data.json();
        setIsQC(jsonData["is_qc"] ?? undefined);
        setIsQA(jsonData["is_qa"] ?? undefined);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };
  
    fetchData();
  }, [project.id]);

  const userRole = React.useMemo(() => {
    if (!user) {
      return null;
    }

    const currentIsQC = isQC !== undefined ? isQC : user.is_qc;
    const currentIsQA = isQA !== undefined ? isQA : user.is_qa;

    if (user.is_superuser) {
      return "Admin";
    }

    if (user.is_organization_admin) {
      return "Organization Admin";
    }

    if (project.need_to_qa) {
      // if (user.is_qa) {
      if (currentIsQA) {
        return "QA";
      }

      // if (project.need_to_qc && user.is_qc) {
      if (project.need_to_qc && currentIsQC) {
        return "QC";
      }
    }

    return "Annotator";
  }, [project.need_to_qa, project.need_to_qc, user]);

  const actions: TNavbarBreadcrumb[] = React.useMemo(() => {
    const list: TNavbarBreadcrumb[] = [];

    const currentIsQC = isQC !== undefined ? isQC : user?.is_qc;
    const currentIsQA = isQA !== undefined ? isQA : user?.is_qa;

    if (task?.assigned_to && task?.assigned_to.length > 0) {
      list.push({
        label: user?.id && task.assigned_to.includes(user.id)
          ? "Assigned to: You"
          : <>Assigned to: <UserName userID={task.assigned_to[0]} /></>,
        actionType: "link",
        onClick: () => void 0,
      });
    }

    if (user) {
      list.push({
        label: "You: " + user.email + " / " + userRole,
        actionType: "link",
        onClick: () => void 0,
      });
    }

    if (task) {
      if (project.need_to_qa) {
        if (task.is_in_review) {
          // if (user?.is_qa || user?.is_superuser) {
          if (currentIsQA || user?.is_superuser) {
            list.push(
              {
                label: task.reviewed_result === "rejected" ? <strong>REJECTED</strong> : "Reject",
                actionType: "danger",
                onClick: () => reject(afterWorkflowAction),
              },
              {
                label: task.reviewed_result === "approved" ? <strong>APPROVED</strong> : "Approve",
                actionType: "success",
                onClick: () => approve(afterWorkflowAction),
              }
            );
          }
        } else if (task.is_in_qc) {
          // if (user?.is_qc || user?.is_superuser) {
          if (currentIsQC || user?.is_superuser) {
            list.push(
              {
                label: task.qualified_result === "unqualified" ? <strong>UNQUALIFIED</strong> : "Unqualify",
                actionType: "danger",
                onClick: () => unqualify(afterWorkflowAction),
              },
              {
                label: task.qualified_result === "qualified" ? <strong>QUALIFIED</strong> : "Qualify",
                actionType: "success",
                onClick: () => qualify(afterWorkflowAction),
              }
            );
          }
        } else {
          // if ((!user?.is_qc && !user?.is_qa) || user?.is_superuser) {
          if ((!currentIsQC && !currentIsQA) || user?.is_superuser) {
            list.push({
              label: "SEND TO QA",
              actionType: "primary",
              onClick: () => submitToReview(afterWorkflowAction),
            });
          }
        }
      }
    } else {
      list.push(
        {label: "Settings", onClick: () => navigate(`/projects/${project.id}/settings/general`)},
        // {label: "Train", onClick: () => void 0},
        {label: "Demo Environment", onClick: () => navigate(`/projects/${project.id}/demo`)},
        // {label: "Deploy", onClick: () => void 0},
      );
    }

    list.push({label: "New Task", actionType: "primary", onClick: () => claimTask()});

    return list;
  }, [
    afterWorkflowAction,
    approve,
    navigate,
    project,
    qualify,
    reject,
    submitToReview,
    task,
    unqualify,
    claimTask,
    userRole,
    user,
  ]);

  React.useEffect(() => {
    if (!workflowError) {
      return;
    }

    infoDialog({ message: workflowError });
  }, [workflowError]);

  // React.useEffect(() => {
  //   if (!lockingError) {
  //     return;
  //   }
  //
  //   infoDialog({ message: lockingError });
  // }, [lockingError]);
  //
  // React.useEffect(() => {
  //   if (!lockingError || !queries.has("task")) {
  //     return;
  //   }
  //
  //   queries.delete("task");
  //   navigate("/projects/" + project.id + "/data?" + queries);
  // }, [lockingError, navigate, queries, project.id]);

  React.useEffect(() => {
    if (taskID > 0) {
      userLayout.setBreadcrumbs([
        {label: "Projects", onClick: () => navigate(`/projects?page=${fallBack}`)},
        {label: project.title, onClick: () => navigate(dataUrl)},
        {label: "Task #" + taskID.toString()},
      ]);

      userLayout.setCloseCallback(dataUrl);
    } else {
      userLayout.setBreadcrumbs([
        {label: "Projects", onClick: () => navigate(`/projects?page=${fallBack}`)},
        {label: project.title}
      ]);

      userLayout.setCloseCallback(`/projects?page=${fallBack}`);
    }

    return () => {
      userLayout.clearBreadcrumbs();
      userLayout.clearCloseCallback();
    };
	}, [project, userLayout, navigate, taskID, queries, fallBack, actions, dataUrl]);

  React.useEffect(() => {
    userLayout.setActions(actions);

    return () => {
      userLayout.clearActions();
    };
  }, [userLayout, actions]);
	
	// const handleTaskSelect = React.useCallback(
  //   (t: TTaskModel) => {
  //     if (t) {
  //       navigate(
  //         "/projects/" + t.project + "/data?tab=" + tabID + "&task=" + t.id
  //       );
  //     } else {
  //       navigate("/projects/" + projectID + "/data?tab=" + tabID);
  //     }
  //   },
  //   [projectID, tabID, navigate]
  // );

  const editorPreloader = React.useMemo(() => {
    return <EditorPreload project={project} />;
  }, [project]);

  const dataWrapperStyle = React.useMemo((): React.CSSProperties => {
    return {
      opacity: loadingTask || processing ? 1 : 1,
    };
  }, [loadingTask, processing]);

  const onLabelCreated = React.useCallback((type: string, name: string, label: string) => {
    const ar = call("addLabels", {
      body: {type: type, name: name, labels: label, pk: projectID},
    });

    ar.promise
      .then(async r => {
        const data = await r.json();

        if (r.ok) {
          patchProject({label_config: data["label_config"]}, true);
        } else {
          infoDialog({
            title: "Error",
            message: data["message"],
          });
        }
      })
      .catch(() => {});
  }, [call, patchProject, projectID]);

  const onLabelDeleted = React.useCallback((type: string, name: string, label: string) => {
    const ar = call("removeLabel", {
      body: {type: type, labels: label, name: name, pk: projectID},
    });

    ar.promise
      .then(async r => {
        const data = await r.json();

        if (r.ok) {
          patchProject({label_config: data["label_config"]}, true);
        } else {
          infoDialog({
            title: "Error",
            message: data["message"],
          });
        }
      })
      .catch(() => {});
  }, [call, patchProject, projectID]);

  /**
   * Waiting for checking current task using the "task" query param.
   * If can not load task using this value, navigate to list view.
   */
  React.useEffect(() => {
    if (loadingTask) {
      return;
    }

    if (!task) {
      navigate(dataUrl);
    }
  }, [dataUrl, loadingTask, navigate, task]);

  return (
    <div style={dataWrapperStyle}>
      <DataInternal
        project={project}
        onTaskUpdated={(taskID, newTaskData?: TTaskModel) => {
          if (taskID === task?.id && newTaskData) {
            setTask(newTaskData);
          }
        }}
        currentTask={task}
        dataUrl={dataUrl}
      />
      {taskID > 0 && <Editor
        project={project}
        task={task}
        // tasks={tasks}
        // onTaskSelect={handleTaskSelect}
        onLabelCreated={onLabelCreated}
        onLabelDeleted={onLabelDeleted}
      />}
      {editorPreloader}
    </div>
  );
}
