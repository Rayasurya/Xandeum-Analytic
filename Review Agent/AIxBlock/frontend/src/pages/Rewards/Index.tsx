import React from "react";
import {useSearchParams} from "react-router-dom";
import Pagination from "@/components/Pagination/Pagination";
import Table from "@/components/Table/Table";
import {useBooleanLoader} from "@/providers/LoaderProvider";
import Header from "@/components/Header/Header";
import useRewardsHistoryHook from "@/hooks/rewards/useRewardsHistory";
import {TRewardHistory} from "@/models/rewards";
import "./Index.scss";
import {TAnnotationTemplate} from "@/models/annotationTemplateList";
import {formatDateTime} from "@/utils/formatDate";
import {useAuth} from "@/providers/AuthProvider";
import useRewardActionsHook from "@/hooks/rewards/useRewardActions";
import EmptyContent from "@/components/EmptyContent/EmptyContent";

const RewardsPage = () => {
  const [searchParams] = useSearchParams();
  const currentPage = searchParams.get("page");
  const {user} = useAuth();
  const {list, loading, page, setPage, refresh, pageSize, total, loadingError} = useRewardsHistoryHook({
    page: currentPage ? Number(currentPage) : 1,
    user: user?.id ?? 0,
  });
  const {list: actions} = useRewardActionsHook();
  useBooleanLoader(loading, "Loading rewards history...");

  if (loadingError) {
    return <EmptyContent message={loadingError} buttons={[
      {
        children: "Retry",
        type: "hot",
        onClick: () => refresh(),
      }
    ]} />
  }

  return (
    <div className="p-rewards">
      <Header title="Rewards"/>
      <Table
        columns={[
          {label: "ID", dataKey: "id", noWrap: true},
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
            dataKey: "point",
            noWrap: true,
            renderer: (dataRow: TRewardHistory) => {
              return (dataRow.status === 0 ? "+" : "-") + dataRow.point;
            },
          },
          {label: "Order #", dataKey: "order", noWrap: true},
          {
            label: "Date",
            noWrap: true,
            renderer: (dataRow: TAnnotationTemplate) =>
              formatDateTime(dataRow["created_at"]),
          },
        ]}
        data={list}
      />
      {pageSize < total && <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        setPage={setPage}
        target="user/rewards"
      />}
    </div>
  );
};

export default RewardsPage;
