import {Fragment, Suspense, useCallback, useMemo, useState} from "react";
import {useSearchParams} from "react-router-dom";
import IconPlus from "@/assets/icons/IconPlus";
import Button, {TButtonProps} from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import Pagination from "@/components/Pagination/Pagination";
import {useBooleanLoader} from "@/providers/LoaderProvider";
import {formatDateTime} from "@/utils/formatDate";
import AdminLayout from "../../Layout";
import Table from "@/components/Table/Table";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import useRewardsHistoryHook, {TCreateRewardHistory} from "@/hooks/rewards/useRewardsHistory";
import {emptyRewardHistory, TRewardHistory} from "@/models/rewards";
import useRewardActionsHook from "@/hooks/rewards/useRewardActions";
import HistoryForm from "./HistoryForm";
import "./../Rewards.scss";
import UserName from "@/components/UserName/UserName";
import {useAuth} from "@/providers/AuthProvider";
import AppLoading from "@/components/AppLoading/AppLoading";

const RewardsHistory = () => {
  const {user} = useAuth();
  const [searchParams] = useSearchParams();
  const currentPage = searchParams.get("page");
  const {list, loading, page, setPage, pageSize, total, create, creating, creatingError, validationErrors, refresh, loadingError} = useRewardsHistoryHook({
    page: currentPage ? Number(currentPage) : 1,
  });
  const {list: actions} = useRewardActionsHook();
  const [item, setItem] = useState<TRewardHistory | null>(null);
  useBooleanLoader(loading || creating, "Loading rewards history...");

  const addButtonProps = useMemo((): TButtonProps => {
    return {
      size: "medium",
      type: "gradient",
      icon: <IconPlus/>,
      onClick: () => setItem({...emptyRewardHistory}),
      children: "Add",
    };
  }, []);

  const doCreate = useCallback((item: TCreateRewardHistory) => {
    const ar = create({...item, created_by: user?.id});

    ar.promise
      .then(r => {
        if (r.ok) {
          setItem(null);
        }
      });
  }, [create, user?.id]);

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
      return <EmptyContent message="No rewards history found" />;
    }
    return null;
  }, [loadingError, list, refresh]);

  return (
    <AdminLayout
      title="Rewards history"
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
                  {
                    label: "User",
                    noWrap: true,
                    renderer: (dataRow: TRewardHistory) => {
                      return <UserName userID={dataRow.user} />;
                    },
                  },
                  {
                    label: "Action",
                    noWrap: true,
                    renderer: (dataRow: TRewardHistory) => {
                      const action = actions.find(a => a.id === dataRow.action);
                      return action ? action.name : <em>(Unknown)</em>;
                    },
                  },
                  {
                    label: "Point",
                    noWrap: true,
                    align: "CENTER",
                    renderer: (dataRow: TRewardHistory) => {
                      return <code>{(dataRow.status === 0 ? "+" : "-") + dataRow.point}</code>;
                    },
                  },
                  {label: "Order #", noWrap: true, dataKey: "order", align: "CENTER"},
                  {
                    label: "Created By",
                    noWrap: true,
                    renderer: (dataRow: TRewardHistory) => {
                      return dataRow.created_by ? <UserName userID={dataRow.created_by} /> : <></>;
                    },
                  },
                  {
                    label: "Created At",
                    noWrap: true,
                    renderer: (dataRow: TRewardHistory) => formatDateTime(dataRow.created_at ?? ""),
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
                  target="admin/rewards/history"
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
          title={`${(item?.id ?? 0) > 0 ? "View" : "Add"} history`}
          open={!!item && !creating}
          onCancel={() => setItem(null)}
        >
          {item && (
            <HistoryForm
              actions={actions}
              error={creatingError}
              errors={validationErrors}
              item={item}
              onCreate={item => doCreate(item)}
            />
          )}
        </Modal>
      </Suspense>
    </AdminLayout>
  );
};

export default RewardsHistory;
