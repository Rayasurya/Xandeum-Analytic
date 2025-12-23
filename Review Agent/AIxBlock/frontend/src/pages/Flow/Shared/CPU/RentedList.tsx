import dayjs from "dayjs";
import Pagination from "@/components/Pagination/Pagination";
import { formatFloat } from "@/utils/customFormat";
import RentedComputeItem from "./RentedComputeItem";
import React, { Dispatch, SetStateAction } from "react";
import { TPageFlowProvider, useFlowProvider } from "../../FlowProvider";
import EmptyContent from "@/components/EmptyContent/EmptyContent";

type TRentedListProps = {
  rentedGpus: TPageFlowProvider["computes"]["list"];
  page?: number;
  project_id?: number;
  setPage?: Dispatch<SetStateAction<number>>;
  onDeleteCompute?: (id: number, project_id?: number | null) => void;
}

const PAGE_SIZE = 5;

const RentedList = (props: TRentedListProps) => {
  const {models} = useFlowProvider();
  const {rentedGpus, onDeleteCompute, project_id} = props;
  const [page, setPage] = React.useState(1);

  const paginatedList: TPageFlowProvider["computes"]["list"] = React.useMemo(() => {
    const startOffset = (page - 1) * PAGE_SIZE;
    return rentedGpus.slice(startOffset, startOffset + PAGE_SIZE);
  }, [page, rentedGpus]);

  return (
    <>
      {paginatedList.length === 0 && (
        <EmptyContent message="(Empty list)" hideIcon={true} />
      )}
      {paginatedList.map((item) => {
        let config = {};

        try {
          if (item.compute_marketplace.config) {
            if (typeof item.compute_marketplace.config === "object") {
              config = item.compute_marketplace.config;
            } else if (typeof item.compute_marketplace.config === "string") {
              config = JSON.parse(item.compute_marketplace.config ?? "{}");
            }
          }
        } catch (e) {
          if (window.APP_SETTINGS.debug) {
            console.error(e);
          }
        }

        const specs: { cpu: string | null } = {
          cpu: "cpu" in config ? String(config["cpu"]) : null,
        };

        let price = null;

        if (item.compute_marketplace.is_using_cpu) {
          price = item.compute_marketplace.cpu_price;
        } else if (item.prices) {
          price = "$" + item.prices.price;
        }

        let ip = (item.compute_marketplace.ip_address ? item.compute_marketplace.ip_address : "??") + ":" + item.compute_marketplace.port;
        const model = models.listData?.results?.find((m) => m.model_marketplace?.related_compute?.id === item.id);
        const modelName = model ? model.model_marketplace?.id + " - " + model.model_marketplace?.name + " - " + model.version : undefined;

        return (
          <RentedComputeItem
            key={"compute-" + item.id}
            compute_id={item.compute_marketplace.id}
            datacenter={item.compute_gpu?.datacenter}
            location={item.compute_gpu?.location_name ?? item.compute_marketplace?.location_name}
            machine_type="Virtual Machine"
            service={(item.service_type ?? "full").toUpperCase()}
            gpu_tflops={item.compute_gpu?.gpu_tflops}
            max_cuda_version={item.compute_gpu?.max_cuda_version}
            per_gpu_ram={item.compute_gpu?.gpu_memory}
            per_gpu_memory_bandwidth={item.compute_gpu?.gpu_memory_bandwidth}
            motherboard={item.compute_gpu?.motherboard}
            cpu={specs["cpu"]}
            number_of_pcie_per_gpu={item.compute_gpu?.number_of_pcie_per_gpu}
            eff_out_of_total_nu_of_cpu_virtual_cores={item.compute_gpu?.eff_out_of_total_nu_of_cpu_virtual_cores}
            eff_out_of_total_system_ram={item.compute_gpu?.eff_out_of_total_system_ram}
            internet_down_speed={item.compute_gpu?.internet_down_speed}
            internet_up_speed={item.compute_gpu?.internet_up_speed}
            source={item.type}
            rentingHours={formatFloat(dayjs().diff(dayjs(item.time_start), "hour", true))}
            remainingHours={formatFloat(dayjs(item.time_end).diff(dayjs(), "hour", true))}
            price={price}
            ip={ip}
            provider_id={item.provider_id}
            name={item.compute_marketplace.is_using_cpu ? item.compute_marketplace.name : item.compute_gpu?.gpu_name}
            installStatus={item.compute_install ?? null}
            type={item.compute_marketplace.type}
            schema={item.schema}
            onDeleteCompute={() => onDeleteCompute && onDeleteCompute(item.id, project_id)} // Gọi hàm với id và project_id
            history_id={item.id}
            model_name={modelName}
          />
        );
      })}
      {rentedGpus.length > PAGE_SIZE && (
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={rentedGpus.length}
          setPage={setPage}
        />
      )}
    </>
  );
};

export default RentedList;
