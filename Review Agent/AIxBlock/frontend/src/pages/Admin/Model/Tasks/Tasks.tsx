import Button from "@/components/Button/Button";
import IconPlus from "@/assets/icons/IconPlus";
import React, {useCallback, useState} from "react";
import AdminLayout from "@/pages/Admin/Layout";
import useModelTasks from "@/hooks/models/useModelTasks";
import {IconRefresh} from "@/assets/icons/Index";
import Table, {TableActions} from "@/components/Table/Table";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import {formatDate} from "@/utils/formatDate";
import {TModelTask} from "@/models/modelMarketplace";
import ModelTaskForm, {TModelTaskFormData} from "@/pages/Admin/Model/Tasks/Form";
import {toastError, toastSuccess} from "@/utils/toast";
import {extractErrorMessage, extractErrorMessageFromResponse} from "@/utils/error";
import {confirmDialog} from "@/components/Dialog";

const emptyData: TModelTaskFormData = {id: 0, name: "", description: ""};

export default function ModelTasks() {
  const {loading, refresh, list, create, update, remove} = useModelTasks();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<TModelTaskFormData>(emptyData);
  const [saving, setSaving] = useState(false);

  const saveModelTask = useCallback(() => {
    if (formData.name.trim().length === 0) {
      toastError("Please enter model task name");
      return;
    }

    setSaving(true);
    const ar = formData.id > 0 ? update(formData.id, formData) : create(formData);

    ar.promise
      .then(async res => {
        if (res.ok) {
          setShowForm(false);
          toastSuccess("Model task has been saved");
          refresh();
          return;
        }

        toastError(await extractErrorMessageFromResponse(res));
      })
      .catch(e => {
        toastError(extractErrorMessage(e));
      })
      .finally(() => setSaving(false));
  }, [create, formData, refresh, update]);

  return (
    <AdminLayout
      title="Model tasks"
      actions={
        <>
          <Button
            size="small"
            type="primary"
            icon={<IconRefresh />}
            onClick={refresh}
          >
            Refresh
          </Button>
          <Button
            size="small"
            type="gradient"
            icon={<IconPlus />}
            onClick={() => {
              setFormData(emptyData);
              setShowForm(true);
            }}
          >
            Add
          </Button>
        </>
      }
    >
      {
        loading
          ? <EmptyContent message="Loading model tasks..." />
          : (
            <Table
              data={list}
              columns={[
                {label: "ID", dataKey: "id", align: "RIGHT" },
                {
                  label: "Name",
                  noWrap: true,
                  renderer: (dataRow: TModelTask) => (
                    <>
                      <div>{dataRow.name}</div>
                      {dataRow.description && (
                        <small style={{whiteSpace: "wrap", opacity: .5}}>{dataRow.description}</small>
                      ) }
                    </>
                  ),
                },
                {
                  label: "Created At",
                  noWrap: true,
                  renderer: (dataRow: TModelTask) =>
                    formatDate(dataRow.created_at ?? "", "MMM. D, YYYY, h:mm a"),
                },
                {
                  align: "RIGHT",
                  noWrap: true,
                  renderer: (dataRow: TModelTask) => (
                    <TableActions
                      actions={[
                        {
                          icon: "DELETE",
                          onClick: () => {
                            confirmDialog({
                              title: "Delete model task",
                              message: "Are you sure you want to delete this model task?",
                              submitText: "Delete",
                              onSubmit: () => remove(dataRow.id).promise.finally(refresh),
                            });
                          },
                        },
                        {
                          icon: "EDIT",
                          onClick: () => {
                            setFormData(dataRow);
                            setShowForm(true);
                          },
                        },
                      ]}
                    />
                  ),
                },
              ]}
            />
          )
      }
      <ModelTaskForm
        isOpen={showForm}
        isProcessing={saving}
        onChange={setFormData}
        data={formData}
        onSave={saveModelTask}
        onClose={() => setShowForm(false)}
      />
    </AdminLayout>
  );
}
