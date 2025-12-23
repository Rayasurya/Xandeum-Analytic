import {useEffect, useMemo, useRef, useState} from "react";
import {useSearchParams} from "react-router-dom";
import Pagination from "../Pagination/Pagination";
import Select,  /*Select,*/ {DataSelect, SelectOption} from "../Select/Select";
import {useGetListModel} from "@/hooks/settings/ml/useGetListModel";
import {useBooleanLoader} from "@/providers/LoaderProvider";
import "./Index.scss";
import ModelItem from "../Model/Item";
import {IconClose} from "@/assets/icons/Index";
import {createAlert} from "@/utils/createAlert";
import InputBase from "../InputBase/InputBase";
import {TModelMarketplace} from "@/models/modelMarketplace";
import {TProjectModel} from "@/models/project";
// import {useGetListCatalog} from "@/hooks/computes/useGetListCatalog";
import styles from "./Index.module.scss";
import useModelTasks from "@/hooks/models/useModelTasks";
import EmptyContent from "../EmptyContent/EmptyContent";
import { getPredictTask } from "@/utils/models";

const SORT_OPTIONS: DataSelect[] = [
  {
    label: "",
    options: [
      {label: "Default order", value: ""},
      {label: "Type ASC", value: "type-asc"},
      {label: "Type DESC", value: "type-desc"},
      {label: "Price ASC", value: "price-asc"},
      {label: "Price DESC", value: "price-desc"},
      {label: "Like ASC", value: "like-asc"},
      {label: "Like DESC", value: "like-desc"},
      {label: "Download ASC", value: "download-asc"},
      {label: "Download DESC", value: "download-desc"},
    ],
  },
];

export type TProps = {
  project?: TProjectModel;
  pageUrl: string;
  onDetailClick: (item: TModelMarketplace) => void;
  tasksFilter?: boolean;
}

const ModelMarketplace = ({project, pageUrl, onDetailClick, tasksFilter}: TProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = searchParams.get("page");
  // const projectId = parseInt(project?.id.toString() ?? "0");
  const [sort, setSort] = useState<null | SelectOption>(
    SORT_OPTIONS[0].options.find(o => o.value === searchParams.get("sort")) ?? null
  );
  const [searchName, setSearchName] = useState<string | null>(searchParams.get("name"));
  const [searchTask, setSearchTask] = useState<string | null>(searchParams.get("task"));
  // const {listData: listCatalog} = useGetListCatalog({type: "model"});
  const keywordTimeoutRef = useRef<NodeJS.Timeout>();
  const { list: modelTasks, loading: mtLoading, loadingError: mtLoadingError } = useModelTasks();
  const searchNameRef = useRef<HTMLInputElement>(null);

  const {
    listData,
    fetchData: reFetch,
    loading,
    page,
    pageSize,
    setPage,
    error,
  } = useGetListModel({
    page: currentPage ? Number(currentPage) : 1,
    pageSize: 12,
    ...sort ? {sort: sort.value} : {},
    ...searchName ? {name: searchName} : {},
    // project_id: projectId.toString(),
    ...tasksFilter
      ? searchTask ? {task_names: [searchTask]} : {}
      : project ? {task_names: [getPredictTask(project.label_config_title)]} : {},
  });

  useBooleanLoader(loading, "Loading models marketplace...");

  const onClearFilter = () => {
    if (searchNameRef.current) {
      searchNameRef.current.value = "";
    }

    setSort(null);
    setSearchTask(null);
    setSearchName(null);
  };

  // const catalog: {id: number, name: string}[] = useMemo(() => {
  //   return listCatalog?.map(c => ({id: c.id, name: c.name})) ?? [];
  // }, [listCatalog]);

  const errorNode = useMemo(() => {
    return createAlert(error, reFetch);
  }, [error, reFetch]);

  useEffect(() => {
    reFetch();
  }, [reFetch]);

  useEffect(() => {
    const newSearchParams = new URLSearchParams();

    if (sort) {
      newSearchParams.set("sort", sort.value);
    }

    if (searchName) {
      newSearchParams.set("name", searchName);
    }

    if (searchTask) {
      newSearchParams.set("task", searchTask);
    }

    if (page > 1) {
      newSearchParams.set("page", page.toString());
    }

    setSearchParams(newSearchParams);
  }, [setSearchParams, sort, searchName, searchTask, page]);

  useEffect(() => {
    setPage(1);
  }, [setPage, sort, searchName, searchTask]);

  const taskOptions = useMemo((): DataSelect[] => [
    {
      options: [
        { label: "(any task)", value: "" },
        ...modelTasks.map(mt => ({
          label: mt.name,
          value: mt.name,
          data: mt.description,
        })),
      ],
    },
  ], [modelTasks]);

  const selectedTask = useMemo(() => {
    const t = taskOptions[0].options.find(mt => mt.value === searchTask);
    return t ?? taskOptions[0].options[0];
  }, [searchTask, taskOptions]);

  const searchNameInput = useMemo(() => (
    <InputBase
      outsideRef={searchNameRef}
      key="search-name"
      placeholder={"Enter model name"}
      style={{minWidth: 256}}
      value={searchParams.get("name") ?? ""}
      isDefaultValue={true}
      allowClear={false}
      onKeyUp={e => {
        e.preventDefault();

        if (e.key !== "Enter") {
          return;
        }

        clearTimeout(keywordTimeoutRef.current);
        setSearchName(e.currentTarget.value);
      }}
      onChange={e => {
        clearTimeout(keywordTimeoutRef.current);

        keywordTimeoutRef.current = setTimeout(() => {
          setSearchName(e.target.value);
        }, 1000);
      }}
    />
    // eslint-disable-next-line
  ), []);

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <h4 className={styles.title}>
          <strong>Marketplace</strong> ({listData?.count} model{(listData?.count ?? 0) > 1 ? "s" : ""})
        </h4>
        <div className={styles.actions}>
          {searchNameInput}
          {tasksFilter && (
            <Select
              className={styles.taskList}
              isLoading={mtLoading}
              error={mtLoadingError}
              data={taskOptions}
              defaultValue={selectedTask}
              canFilter={true}
              withContent="300"
              onChange={o => {
                searchParams.set("task", o.value);
                setSearchTask(o.value);
              }}
              customRenderLabel={o => (
                <div className={styles.taskItem}>
                  <div className={styles.taskItemLabel}>{o.label}</div>
                  {o.data && typeof o.data === "string" && (
                    <div className={ styles.taskItemDesc } title={o.data}>
                      {o.data.length > 75 ? o.data.substring(0, 75) + "..." : o.data}
                    </div>
                  )}
                </div>
              ) }
            />
          )}
          {((sort && sort.value !== SORT_OPTIONS[0].options[0].value) || searchName || searchTask) && (
            <button
              className={styles.clear}
              onClick={() => onClearFilter()}
            >
              <IconClose/>
            </button>
          )}
        </div>
      </div>
      {errorNode}
      {
        loading
          ? <EmptyContent message="Loading models..." />
          : listData?.results && listData.results.length > 0
            ? (
              <>
                <div className={styles.list}>
                  {listData.results.map((item) => (
                    <ModelItem
                      key={`key-${item.id}`}
                      // catalogName={item.catalog_id in catalog ? catalog[item.catalog_id].name : undefined}
                      model={item}
                      onClick={() => onDetailClick(item)}
                    />
                  ))}
                </div>
                <Pagination
                  page={page}
                  pageSize={pageSize}
                  total={listData?.count ?? 1}
                  setPage={(val) => {
                    setPage(val);
                    reFetch();
                  }}
                  target={pageUrl}
                />
              </>
            )
            : !loading && <EmptyContent message="(no model found)" />
      }
    </div>
  );
};

export default ModelMarketplace;
