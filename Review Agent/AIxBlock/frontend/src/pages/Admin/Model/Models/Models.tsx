import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import { useUserLayout } from "@/layouts/UserLayout";
import IconPlus from "@/assets/icons/IconPlus";
import Button from "@/components/Button/Button";
import Pagination from "@/components/Pagination/Pagination";
import { useApi } from "@/providers/ApiProvider";
import { useAuth } from "@/providers/AuthProvider";
import { formatDate } from "@/utils/formatDate";
import {TModel, TProps, useGetModel} from "@/hooks/modelsSeller/useGetModel";
import AddModelModal from "./AddModelModal";
import { TCreateModel } from "@/hooks/admin/model/useCreateModel";
import { confirmDialog, infoDialog } from "@/components/Dialog";
import AdminLayout from "../../Layout";
import Table, { TableActions } from "@/components/Table/Table";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import InputBase from "@/components/InputBase/InputBase";
import Checkbox from "@/components/Checkbox/Checkbox";
import Select, {DataSelect} from "@/components/Select/Select";
import useModelTasks from "@/hooks/models/useModelTasks";

const Models = () => {
  const userLayout = useUserLayout();
  const [searchParams] = useSearchParams();
  const currentPage = searchParams.get("page");
  const { call } = useApi();
  const { user } = useAuth();
  const [name, setName] = useState(searchParams.get("name") ?? "");
  const queryType = searchParams.get("type");
  const [type, setType] = useState<TProps["type"] | undefined>(
    queryType === "MODEL-SYSTEM"
      ? "MODEL-SYSTEM"
      : queryType === "MODEL-CUSTOMER"
        ? "MODEL-CUSTOMER"
        : undefined
  );
  const {list: modelTasks, loading: mtLoading} = useModelTasks();
  const queryTasks = searchParams.get("tasks");
  const [selectedTasks, setSelectedTasks] = useState(queryTasks?.split(",") ?? []);
  const { models, page, pageSize, setPage, fetchData, loading, error } = useGetModel({
    page: currentPage ? Number(currentPage) : 1,
    sort: "id-desc",
    name,
    type,
    tasks: selectedTasks,
  });
  const [openModal, setOpenModal] = useState(false);
  const [dataEdit, setDataEdit] = useState<TCreateModel>();
  const searchTimeout = useRef<NodeJS.Timeout>();
  const navigate = useNavigate();

  useEffect(() => {
    searchParams.set("name", name);
    searchParams.set("type", type ?? "");
    searchParams.set("tasks", selectedTasks?.join(",") ?? "");
    navigate("?" + searchParams.toString());
  }, [name, navigate, searchParams, selectedTasks, type]);

  const onDeleteModels = useCallback(
    (id: number) => {
      confirmDialog({
        message: "Are you sure you want to delete this models?",
        onSubmit() {
          try {
            const ar = call("deleteModel", {
              params: { id: id.toString() },
            });
            ar.promise.then(() => {
              fetchData();
            });
          } catch (error) {
            const err =
              error instanceof Error ? error.message : "Something when wrong!";
              infoDialog({message: err});
          }
        },
      });
    },
    [call, fetchData]
  );

  useEffect(() => {
    userLayout.setBreadcrumbs([{ label: "Account setting" }]);

    return () => {
      userLayout.clearBreadcrumbs();
    };
  }, [userLayout]);

  const errorNode = useMemo(() => {
    if (error) {
      return <EmptyContent message={error} buttons={[
        {
          children: "Retry",
          type: "hot",
          onClick: () => fetchData(),
        }
      ]} />;
    }
    if (!error && models && models.results && models.results.length  === 0) {
      return <EmptyContent message="No models found" />;
    }
    return null;
  }, [error, models, fetchData]);

  const onNameChange = React.useCallback((v: string) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setName(v), 500);
  }, [setName]);

  const taskOptions = useMemo((): DataSelect[] => [
    {
      options: [
        ...modelTasks.map(mt => ({
          label: mt.name,
          value: mt.name,
          data: mt.id,
        })),
      ],
    },
  ], [modelTasks]);

  const selectedTask = useMemo(() => {
    return taskOptions[0].options.filter(mt => selectedTasks.includes(mt.value));
  }, [selectedTasks, taskOptions]);

  return (
    <AdminLayout
      title="Select models to change"
      actions={
        <Button
          size="small"
          type="gradient"
          icon={<IconPlus />}
          onClick={() => {
            setOpenModal(true)
            setDataEdit(undefined)
          }}
        >
          Add
        </Button>
      }
    >
      <div style={{
        marginBottom: 16,
        display: "flex",
        gap: 16,
        alignItems: "center",
        flexWrap: "wrap",
      }}>
        <div style={{flex: 1}}>
          <InputBase
            placeholder="Enter model name to search"
            value={name}
            allowClear={false}
            onChange={ev => {
              onNameChange(ev.target?.value.trim() ?? "");
            }}
            onKeyUp={ev => {
              if (ev.key === "Enter") {
                onNameChange(ev.currentTarget.value.trim());
              }
            }}
            onBlur={ev => {
              onNameChange(ev.currentTarget.value.trim());
            }}
          />
        </div>
        <label>Filter by task:</label>
        <div style={{width: 320}}>
          <Select
            data={taskOptions}
            defaultValue={selectedTask}
            isMultiple={true}
            type="checkbox"
            placeholderText="Select tasks to filter"
            isLoading={mtLoading}
            onMultipleChange={opts => {
              setSelectedTasks(opts.map(o => o.value));
            }}
          />
        </div>
        <label>Filter by type:</label>
        <Checkbox label="All types" checked={!type} onChange={v => {
          if (v) setType(undefined);
        }}/>
        <Checkbox label="System" checked={type === "MODEL-SYSTEM"} onChange={v => {
          if (v) setType("MODEL-SYSTEM");
        }}/>
        <Checkbox label="Customer" checked={type === "MODEL-CUSTOMER"} onChange={v => {
          if (v) setType("MODEL-CUSTOMER");
        }}/>
      </div>
      <div style={{
        marginBottom: 16,
        display: "flex",
        gap: 16,
        alignItems: "center",
        flexWrap: "wrap",
        paddingLeft: 4,
      }}>
      </div>
      {loading && (
        <EmptyContent message="Loading..."/>
      )}
      {!loading && <>
        {models && models.results && models.results.length > 0 ? (
          <>
            <Table
              columns={[
                {label: "ID", dataKey: "id", align: "RIGHT" },
                {
                  label: "Name",
                  noWrap: true,
                  renderer: (dataRow: TModel) => (
                    <>
                      <div>{dataRow.name}</div>
                      {dataRow.tasks && (
                        <small>
                          {dataRow.tasks.map(t => t.name).join(", ")}
                        </small>
                      ) }
                    </>
                  ),
                },
                { label: "IP Port Of The Device", noWrap: true, dataKey: "ip_address" },
                { label: "Port", noWrap: true, dataKey: "port" },
                { label: "Type", noWrap: true, dataKey: "type" },
                { label: "Price", noWrap: true, dataKey: "price" },
                {
                  label: "Created At",
                  noWrap: true,
                  renderer: (dataRow: TModel) =>
                    formatDate(dataRow.created_at ?? "", "MMM. D, YYYY, h:mm a"),
                },
                {
                  align: "RIGHT",
                  noWrap: true,
                  renderer: (dataRow: TModel) => (
                    <TableActions
                      actions={[
                        user?.id !== dataRow.id
                          ? {
                              icon: "DELETE",
                              onClick: () => onDeleteModels(dataRow.id!),
                            }
                          : { icon: "" },
                        {
                          icon: "EDIT",
                          onClick: () => {
                            setDataEdit(dataRow);
                            setOpenModal(true);
                          },
                        },
                      ]}
                    />
                  ),
                },
              ]}
              data={models?.results ?? []}
            />
            {models.count > 1 &&
              <Pagination
                page={page}
                pageSize={pageSize}
                total={models?.count}
                setPage={setPage}
                target="admin/model/models"
              />
            }
          </>
        ) : (
          errorNode
        )}
      </>}

      {openModal && (
        <AddModelModal
          isOpenModal={openModal}
          dataEdit={dataEdit}
          setCloseModal={() => setOpenModal(false)}
          onCreated={() => {
            setOpenModal(false);
            setDataEdit(undefined);
            fetchData();
          }}
          taskIds={dataEdit?.tasks ? dataEdit.tasks?.map(t => t.id) : []}
        />
      )}
    </AdminLayout>
  );
};

export default Models;
