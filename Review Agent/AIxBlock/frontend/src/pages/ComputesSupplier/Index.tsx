import React, { useEffect } from "react";
import IconDevices from "@/assets/icons/IconDevices";
import IconGift from "@/assets/icons/IconGift";
import { useUserLayout } from "@/layouts/UserLayout";
import ComputesSupplierMain from "./ComputesSupplierMain/Index";
import "./Index.scss";
import EarningsAndRewards from "./EarningsAndRewards/Index";
import IconCirclePlus from "@/assets/icons/IconCirclePlus";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetListComputeMarketplace } from "@/hooks/computes/useGetListComputeMarketplace";
import IconPlay from "@/assets/icons/IconPlay";
import VideoPlayer from "@/components/VideoPlayer/VideoPlayer";
import { infoDialog } from "@/components/Dialog";
import { TNavbarBreadcrumb } from "@/components/Navbar/Navbar";
import { VIDEO_URL } from "@/constants/projectConstants";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
// import { useAuth } from "@/providers/AuthProvider";
// import ComputesSupplierAIBuilder from "./ComputesSupplierAIBuilder/Index";

type ComputesSupplierPageProps = {
  showBtnAdd?: boolean;
};

const ComputesSupplierPage = (props: ComputesSupplierPageProps) => {
  const { showBtnAdd = true } = props;
  const userLayout = useUserLayout();
  // const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<number>(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentPage = searchParams.get("page");

  const {
    listData,
    loading,
    fetchData: refetch,
    error,
  } = useGetListComputeMarketplace({
    page: currentPage ? Number(currentPage) : 1,
    type: "supply",
  });

  const actions: TNavbarBreadcrumb[] = [
    {
      icon: <IconCirclePlus />,
      label: "Add New Compute",
      onClick: () => navigate("/computes-supplier/add"),
      actionType: "danger",
      class: "btn-add-new-compute"
    },
    {
      icon: <IconPlay />,
      label: "Watch demo video",
      onClick: () => {
        infoDialog({
          cancelText: null,
          className: "model-demo-video",
          message: (
            <VideoPlayer url={VIDEO_URL.RENT_OUT_COMPUTE} />
          ),
        });
      },
      actionType: "outline",
      class: "watch-demo-video"
    },
  ]

  useEffect(() => {
    userLayout.setBreadcrumbs([{ label: "List computes for rent out" }]);
    userLayout.setActions(listData && listData.results.length > 0 ? actions : []);
    return () => {
      userLayout.clearBreadcrumbs();
      userLayout.clearActions();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLayout, navigate, listData]);

  if (error) {
    return <EmptyContent message={error} buttons={[
      {
        children: "Retry",
        type: "hot",
        onClick: () => refetch(),
      }
    ]} />
  }

  return (
    <div className="p-computes-supplier">
      <div className="p-computes-supplier__tabs">
        <div
          className={`p-computes-supplier__tab ${activeTab === 0 && "active"}`}
          onClick={() => {
            setActiveTab(0);
          }}
        >
          <IconDevices /> Devices
        </div>
        <div
          className={`p-computes-supplier__tab ${activeTab === 1 && "active"}`}
          onClick={() => {
            setActiveTab(1);
          }}
        >
          <IconGift /> Earnings & Rewards
        </div>
        <div className="p-computes-supplier__tab-space"></div>
      </div>
      <div className="p-computes-supplier__container">
        {activeTab === 0 ? (
          <ComputesSupplierMain
            showBtnAdd={showBtnAdd}
            data={listData?.results}
            loading={loading}
            refetch={refetch}
          />
        ) : (
          <EarningsAndRewards />
        )}
      </div>
    </div>
  );
};

export default ComputesSupplierPage;
