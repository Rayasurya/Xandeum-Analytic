import { useMemo, useState } from "react";
import { Tooltip } from "react-tooltip";
import IconDelete from "@/assets/icons/IconDelete";
import IconEdit from "@/assets/icons/IconEdit";
import IconTinyEdit from "@/assets/icons/IconTinyInfo";
import Select, { DataSelect } from "@/components/Select/Select";
import { TComputeSupply } from "@/hooks/computes/useGetListComputeMarketplace";
import { formatBytesOrGB, formatFloat } from "@/utils/customFormat";
import { MACHINE_TYPES_LIST } from "../../../ComputesMarketplaceV2/types";
import "./Index.scss";
import IconGlobal from "@/assets/icons/IconGlobal";
import { openNewTab } from "@/utils/openNewTab";

export type TProps = {
  cp: any;
  id: number | string | null;
  owner_id: number | string | null;
  config: any;
  service_type: string | null;
  remaining: string;
  onEdit: (id: number) => void;
  onDelete: (id: TComputeSupply) => void;
  ip: string;
}

export default function ComputeItem(props: TProps) {
  const [selectedCp, setSelectedCp] = useState<string>(props.cp?.compute_gpus?.[0]?.id ?? "");

  const computeList = useMemo(() => {
    let results: DataSelect[] = [];
    if (props.cp?.compute_gpus) {
      results = [
        {
          label: "",
          options: props.cp.compute_gpus.map((item: any) => ({
            label: item?.gpu_name,
            value: item?.id,
          })),
        },
      ];
    }
    return results;
  }, [props.cp?.compute_gpus]);

  const currentCp = useMemo(() => {
    return props.cp?.compute_gpus?.find((item: any) => item?.id === selectedCp);
  }, [selectedCp, props.cp?.compute_gpus]);

  const tooltipPrefix = useMemo(() => {
    return "tooltip-" + (props.cp?.id ?? Math.random().toString().substring(2, 8)) + "-";
  }, [props.cp?.id]);

  const status = useMemo(() => {
    if (props.cp?.is_using_cpu) {
      return props.cp?.status === "rented_bought" ||
        props.cp?.status === "in_marketplace"
        ? "Available"
        : props.cp?.status === "pending"
          ? "In Use"
          : "Paused"
    }

    if (!props.cp?.is_using_cpu && props.cp?.compute_gpus.length > 0) {
      if (currentCp?.being_rented) {
        return "Being rented";
      }
      return currentCp?.status === "rented_bought" ||
        currentCp?.status === "in_marketplace"
        ? "Available"
        : currentCp?.status === "pending"
          ? "In Use"
          : "Paused"
    }

    return "Paused";

  }, [currentCp, props.cp?.is_using_cpu, props.cp?.status, props.cp?.compute_gpus]);

  const defaultCp = useMemo(() => {
    const currentCp = props.cp?.compute_gpus?.find((i: any) => i?.id === selectedCp);
    if (!currentCp) {
      return {
        label: "No computes are avail",
        value: "",
      }
    }
    return {
      label: currentCp?.gpu_name,
      value: currentCp?.id,
    }
  }, [props.cp.compute_gpus, selectedCp]);

  return (
    <div className="p-computes-list-v2-compute">
      <div className="p-computes-list-v2-compute__inner">
        <div className="badges">
          <span className="badge" id={tooltipPrefix + "compute-id"}>
            {props.id ?? "?"}&nbsp;
            <IconTinyEdit style={{ transform: "translateY(1px)" }} />
          </span>
          <Tooltip place="top" positionStrategy="fixed" content="Compute ID"
            anchorSelect={"#" + tooltipPrefix + "compute-id"} />
          <span className="badge" id={tooltipPrefix + "provider-id"}>
            {props.owner_id ?? "?"}&nbsp;
            <IconTinyEdit style={{ transform: "translateY(1px)" }} />
          </span>
          <Tooltip place="top" positionStrategy="fixed" content="Provider ID"
            anchorSelect={"#" + tooltipPrefix + "provider-id"} />
          {currentCp?.datacenter && (
            <span className="badge badge--green">{currentCp.datacenter}</span>
          )}
          <span className="badge badge--location"><IconGlobal />{currentCp?.location_name ?? "Unknown"}</span>
          <span className="badge badge--purple">
            {
              currentCp?.machine_type
                ? MACHINE_TYPES_LIST[currentCp?.machine_type as keyof typeof MACHINE_TYPES_LIST]
                : MACHINE_TYPES_LIST["virtual-machines"]
            }
          </span>
          <span
            onClick={() => openNewTab(`https://${props.ip}`)}
            className="badge clickable" id={tooltipPrefix + "ip"}>
            {props.ip ?? "?"}
          </span>
          <Tooltip place="top" positionStrategy="fixed" content="IP"
            anchorSelect={"#" + tooltipPrefix + "ip"} />
          <span className="badge badge--black">Service: {props.service_type ?? "full"}</span>
        </div>
        <div className="columns">
          <div className="column column--gpu">
            <Select
              className="p-computes-list-v2-compute__select"
              data={computeList}
              onChange={(val) => setSelectedCp(val.value)}
              defaultValue={defaultCp}
            />
            <div className="split">
              <div className="left">
                <div className="tflops" id={tooltipPrefix + "tflops"}>
                  <strong>{currentCp?.gpu_tflops ? formatFloat(parseFloat(currentCp?.gpu_tflops)) : "?"}</strong> <span className="unit">TFLOPS</span>
                </div>
                <Tooltip place="left" positionStrategy="fixed" content="Total GPU TeraFLOPs"
                  anchorSelect={"#" + tooltipPrefix + "tflops"} />
                <div className="cuda" id={tooltipPrefix + "cuda"}>
                  Max CUDA: {currentCp?.max_cuda_version ?? "?"}
                </div>
                <Tooltip place="left" positionStrategy="fixed" content="Maximum CUDA Version Supported"
                  anchorSelect={"#" + tooltipPrefix + "cuda"} />
              </div>
              <div className="right">
                <div className="gpu-ram" id={tooltipPrefix + "gpu-ram"}>{formatBytesOrGB(currentCp?.memory) ?? ""}</div>
                <Tooltip place="top" positionStrategy="fixed" content="Per GPU RAM"
                  anchorSelect={"#" + tooltipPrefix + "gpu-ram"} />
                <div className="gpu-bw" id={tooltipPrefix + "gpu-bw"}>{formatBytesOrGB(currentCp?.per_gpu_memory_bandwidth) ?? "?"} GB/s</div>
                <Tooltip place="bottom" positionStrategy="fixed" content="Per GPU Memory Bandwidth"
                  anchorSelect={"#" + tooltipPrefix + "gpu-bw"} />
              </div>
            </div>
          </div>
          <div className="column column--cpu">
            <div className="motherboard" id={tooltipPrefix + "motherboard"}>{currentCp?.motherboard ?? "?"}</div>
            <Tooltip place="top-start" positionStrategy="fixed" content="Motherboard"
              anchorSelect={"#" + tooltipPrefix + "motherboard"} />
            <div className="pcie">{currentCp?.number_of_pcie_per_gpu ?? "?"}</div>
            <div className="cpu" id={tooltipPrefix + "cpu"}>{props?.config?.cpu ?? "?"}</div>
            <Tooltip place="bottom-start" positionStrategy="fixed" content="CPU"
              anchorSelect={"#" + tooltipPrefix + "cpu"} />
            <div className="cpu-ram">
              <span>{currentCp?.eff_out_of_total_nu_of_cpu_virtual_cores ?? "?"} CPU</span>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <span>{currentCp?.eff_out_of_total_system_ram ?? "?"} GB</span>
            </div>
          </div>
          <div className="column column--network">
            <div className="upload" id={tooltipPrefix + "upload"}>
              <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.28704 6.37988L8.3337 2.33322L12.3804 6.37988" stroke="#40405B" strokeWidth="1.5"
                  strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.3335 13.667V2.44699" stroke="#40405B" strokeWidth="1.5" strokeMiterlimit="10"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <strong>{currentCp?.internet_up_speed ?? "?"} Mbps</strong>
            </div>
            <Tooltip place="top-start" positionStrategy="fixed" content="Internet Upload Speed (Shared)"
              anchorSelect={"#" + tooltipPrefix + "upload"} />
            <div className="download" id={tooltipPrefix + "download"}>
              <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.38 9.62012L8.33329 13.6668L4.28662 9.62012" stroke="#40405B" strokeWidth="1.5"
                  strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.3335 2.33301V13.553" stroke="#40405B" strokeWidth="1.5" strokeMiterlimit="10"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <strong>{currentCp?.internet_down_speed ?? "?"} Mbps</strong>
            </div>
            <Tooltip place="bottom-start" positionStrategy="fixed" content="Internet Download Speed (Shared)"
              anchorSelect={"#" + tooltipPrefix + "download"} />
            <div className="reliability">
              Remaining: <strong>{props.remaining ?? "?"} hour(s)</strong>
            </div>
          </div>
          <div className="column column--action align-end">
            <div className="action">
              <button
                className="btn column--action--edit"
                onClick={() => props.onEdit(props.cp?.id)}
              >
                <IconEdit />
              </button>
              <button
                className="btn column--action--delete"
                onClick={() => props.onDelete(props.cp)}
              >
                <IconDelete />
              </button>
            </div>
            <div className="status">
              <p className={currentCp?.being_rented ? "being-rented" : status}>{status}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
