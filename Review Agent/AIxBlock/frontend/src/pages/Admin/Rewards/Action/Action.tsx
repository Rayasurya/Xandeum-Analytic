import {Fragment, Suspense, useCallback, useMemo, useState} from "react";
import {useSearchParams} from "react-router-dom";
import IconPlus from "@/assets/icons/IconPlus";
import Button, {TButtonProps} from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import Pagination from "@/components/Pagination/Pagination";
import {useBooleanLoader} from "@/providers/LoaderProvider";
import {formatDateTime} from "@/utils/formatDate";
import AdminLayout from "../../Layout";
import Table, {TableActions} from "@/components/Table/Table";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import {emptyRewardAction, TRewardAction} from "@/models/rewards";
import useRewardActionsHook, {TSaveRewardAction} from "@/hooks/rewards/useRewardActions";
import "./../Rewards.scss";
import ActionForm from "./ActionForm";
import AppLoading from "@/components/AppLoading/AppLoading";

const RewardActions = () => {
  const [searchParams] = useSearchParams();
  const currentPage = searchParams.get("page");
  const [item, setItem] = useState<TRewardAction | null>(null);
  const {list, total, page, setPage, pageSize, loading, save, saving, savingError, validationErrors, loadingError, refresh} = useRewardActionsHook({
    page: parseInt(currentPage ?? "1"),
  });
  useBooleanLoader(loading || saving, "Loading reward actions...");

  const addButtonProps = useMemo((): TButtonProps => {
    return {
      size: "medium",
      type: "gradient",
      icon: <IconPlus/>,
      onClick: () => setItem({...emptyRewardAction}),
      children: "Add",
    };
  }, []);

  const doSave = useCallback((item: TSaveRewardAction) => {
    const ar = save(item);
    ar.promise
      .then(r => {
        if (r.ok) {
          setItem(null);
        }
      });
  }, [save]);

  const errorNode = useMemo(() => {
    if (loadingError) {
      return <EmptyContent message={loadingError} buttons={[
        {
          children: "Retry",
          type: "hot",
          onClick: () => refresh(),
        }
      ]} />;
    }
    if (!loadingError && list && list.length === 0) {
      return <EmptyContent message="No reward action found" />;
    }
    return null;
  }, [loadingError, list, refresh]);

  return (
    <AdminLayout
      title="Reward actions"
      actions={
        <Button {...addButtonProps} />
      }
    >
      {
        list && list.length > 0
          ? (
            <Fragment>
              <Table
                columns={[
                  {label: "ID", dataKey: "id"},
                  {label: "Name", dataKey: "name"},
                  {label: "Activity", dataKey: "activity"},
                  {label: "Point", dataKey: "point", align: "CENTER"},
                  {
                    label: "Created At",
                    noWrap: true,
                    renderer: (dataRow: TRewardAction) => dataRow.created_at ? formatDateTime(dataRow.created_at) : "",
                  },
                  {
                    label: "Actions",
                    noWrap: true,
                    renderer: (dataRow: TRewardAction) => <TableActions actions={[
                      {icon: "EDIT", onClick: () => setItem(dataRow)},
                    ]} />,
                  },
                ]}
                data={list}
              />
              {pageSize < total &&
                <Pagination
                  page={page}
                  pageSize={pageSize}
                  total={total}
                  setPage={setPage}
                  target="admin/rewards/action"
                />
              }
            </Fragment>
          )
          : (
            errorNode
          )
      }
       <Suspense fallback={<AppLoading/>}>
        <Modal
          title={`${(item?.id ?? 0) > 0 ? "Edit" : "Add"} action`}
          open={!!item && !saving}
          onCancel={() => setItem(null)}
        >
          {item && (
            <ActionForm
              error={savingError}
              errors={validationErrors}
              item={item}
              onSave={item => doSave(item)}
            />
          )}
        </Modal>
      </Suspense>
    </AdminLayout>
  );
};

export default RewardActions;
