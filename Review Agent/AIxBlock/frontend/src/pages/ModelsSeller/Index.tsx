import {useEffect} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import IconPlus from "@/assets/icons/IconPlus";
import Button from "@/components/Button/Button";
import { useUserLayout } from "@/layouts/UserLayout";
import {
  TModelMarketplaceSell,
  useGetModelMarketplaceListSell
} from "@/hooks/modelsSeller/useGetModelMarketplaceListSell";
import { useBooleanLoader } from "@/providers/LoaderProvider";
import EmptyModelsSeller from "./EmptyModelsSeller";
import Pagination from "@/components/Pagination/Pagination";
import "./index.scss";
import IconPlay from "@/assets/icons/IconPlay";
import { infoDialog } from "@/components/Dialog";
import VideoPlayer from "@/components/VideoPlayer/VideoPlayer";
import { TNavbarBreadcrumb } from "@/components/Navbar/Navbar";
import { VIDEO_URL } from "@/constants/projectConstants";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import ModelItem from "./ModelItem";
import { useCheckVerifyNotification } from "@/hooks/computes/useCheckVerifyNotification";
import CommercializeMyModels from "../LandingPage/CommercializeMyModels";

const ModelsSellerPage = () => {
  const userLayout = useUserLayout();
  const navigate = useNavigate();
  useCheckVerifyNotification()
  const [searchParams] = useSearchParams();
  const currentPage = searchParams.get("page");
  const { listData, loading, count, setPage, error, fetchData: refresh } = useGetModelMarketplaceListSell({
    page: currentPage ? Number(currentPage) : 1,
  });

  useBooleanLoader(loading, "Loading Models Sell...");

  const actions: TNavbarBreadcrumb[] = [
    {
      icon: <IconPlay />,
      label: "Watch demo video",
      onClick: () => {
        infoDialog({
          cancelText: null,
          className: "model-demo-video",
          message: (
            <VideoPlayer url={VIDEO_URL.COMMERCIALIZE} />
          ),
        });
      },
      actionType: "outline",
      class: "watch-demo-video"
    },
  ]

  useEffect(() => {
    userLayout.setBreadcrumbs([{ label: "Models Sell" }]);
    userLayout.setActions(listData && listData.results.length > 0 ? actions : []);
    return () => {
      userLayout.clearBreadcrumbs();
      userLayout.clearActions();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLayout, listData?.results, listData]);

  if (error) {
    return <EmptyContent message={error} buttons={[
      {
        children: "Retry",
        type: "hot",
        onClick: () => refresh(),
      }
    ]} />
  }

  if ((listData?.results.length ?? 0) === 0) {
    return <CommercializeMyModels />;
  }

  return (listData?.results ?? []).length ? (
    <div className="p-models">
      <div className="p-models__actions">
        <div className="count-models">
          Models (<span>{count}</span>)
        </div>
        <Button
          className="p-models__actions--add"
					size="medium"
					type="gradient"
          icon={<IconPlus />}
          onClick={() => navigate(`/models-seller/add`)}
        >
          Add
        </Button>
      </div>
      <div className="p-models__table models-list">
        {listData?.results.map((l: TModelMarketplaceSell, i) => {
          let config: {[k: string]: string} = {};

          try {
            config = JSON.parse(l.related_compute?.config ?? "{}");
          } catch (e) {
            if (window.APP_SETTINGS.debug) {
              console.error(e);
            }
          }

          const specs = {
            os: "os" in config ? config["os"] : null,
            ram: "ram" in config ? (parseInt(config["ram"]) / 1024).toString() : null,
            diskSize: "disk" in config ? config["disk"] : null,
            diskType: "diskType" in config ? config["diskType"] : null,
            cpu: "cpu" in config ? config["cpu"] : null,
          };

          const gpuRam = l.related_compute_gpu?.gpu_memory
            ? (parseInt(l.related_compute_gpu.gpu_memory) / 1024 / 1024 / 1024).toString()
            : null;

          return (
            <ModelItem
              id={l.id}
              model_name={l.name}
              model_price={l.price}
              model_source={l.model_source}
              docker_image={l.docker_image}
              download_count={l.download_count}
              like_count={l.like_count}
              status={l.status}
              total_user_rent={l.total_user_rent}
              related_compute={l.related_compute}
              related_compute_gpu={l.related_compute_gpu}
              gpu_name={l.related_compute_gpu?.gpu_name}
              compute_id={l.related_compute?.id}
              datacenter={l.related_compute_gpu?.datacenter}
              location={l.related_compute_gpu?.location_name}
              gpu_tflops={l.related_compute_gpu?.gpu_tflops}
              max_cuda_version={l.related_compute_gpu?.max_cuda_version}
              per_gpu_ram={gpuRam}
              per_gpu_memory_bandwidth={l.related_compute_gpu?.gpu_memory_bandwidth}
              motherboard={l.related_compute_gpu?.motherboard}
              number_of_pcie_per_gpu={l.related_compute_gpu?.number_of_pcie_per_gpu}
              cpu={specs.cpu}
              eff_out_of_total_nu_of_cpu_virtual_cores={l.related_compute_gpu?.eff_out_of_total_nu_of_cpu_virtual_cores}
              eff_out_of_total_system_ram={l.related_compute_gpu?.eff_out_of_total_system_ram}
              internet_down_speed={l.related_compute_gpu?.internet_down_speed}
              internet_up_speed={l.related_compute_gpu?.internet_up_speed}
              reliability={l.related_compute_gpu?.reliability}
              ram={specs.ram ?? "???"}
              diskSize={specs.diskSize}
              diskType={specs.diskType}
              onEdit={() =>
                navigate(`/models-seller/${l.id}`, {
                  state: {
                    item: l,
                  },
                })
              }
            />
          );
        })}
        {/*{listData?.results.map((l: any, i) => (
          <div className="models-item" key={i}>
            <div className="row-item">
              <div className="row-item-name">
                <span>{l.name ? l.name : "-"}</span>
              </div>
              <div className="row-item-line">
                <span>IP Port</span>
                <span>
                  {l.ip_address && l.port && l.ip_address + ":" + l.port}
                </span>
              </div>
              <div className="row-item-line">
                <span>Price</span>
                <span>{l.price > 0 ? l.price : "-"}</span>
              </div>
              <div className="row-item-line">
                <span>Model Type</span>
                <span>
                  {listCatalog?.find((f) => f.id === l.catalog_id)?.name}
                </span>
              </div>
               <div className="row-item-line">
                <span>GPU</span>
                <span>{l.compute_gpus?.map((m: any) => m.Value)?.join(", ")}</span>
              </div>
            </div>
            <button
              className="models-item-btn"
              onClick={() =>
                navigate(`/models-seller/${l.id}`, {
                  state: {
                    item: l,
                  },
                })
              }
            >
              <span>Edit</span>
              <IconArrowRight />
            </button>
          </div>
        ))}*/}
      </div>
      <Pagination
        page={Number(currentPage ?? 1)}
        pageSize={12}
        total={count}
        setPage={setPage}
        target="models-seller"
      />
    </div>
  ) : (
    <EmptyModelsSeller />
  );
};

export default ModelsSellerPage;
