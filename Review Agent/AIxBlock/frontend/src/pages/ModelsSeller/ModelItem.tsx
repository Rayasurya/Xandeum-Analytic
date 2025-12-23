import React, {useMemo} from "react";
import "./ModelItem.scss";
import Button from "@/components/Button/Button";
import {formatFloat} from "@/utils/customFormat";
import {Tooltip} from "react-tooltip";
import IconTinyEdit from "@/assets/icons/IconTinyInfo";
import {IconSave} from "@/assets/icons/Index";
import {TOKEN_SYMBOL_DEFAULT} from "@/constants/projectConstants";

export type TCompute = {
  infrastructure_id?: string | null;
  ip_address?: string | null;
  is_using_cpu?: boolean | null;
  port?: string | null
}

export type TComputeGpu = {
  
}

export type TProps = {
  id: number,
  model_name: string,
  model_price: number,
  docker_image?: string | null,
  ip_address?: string | null,
  port?: string | null,
  model_source?: string | null,
  model_id?: string | null,
  related_compute_gpu?: TComputeGpu | null,
  related_compute?: TCompute | null,
  download_count?: number | null,
  like_count?: number | null,
  status?: string | null,
  total_user_rent?: number | null,
  gpu_name?: string | null,
  compute_id?: number | string | null,
  vendor_id?: number | string | null,
  datacenter?: string | null,
  location?: string | null,
  machine_type?: string | null,
  gpu_tflops?: string | null,
  max_cuda_version?: string | null,
  per_gpu_ram?: string | null,
  per_gpu_memory_bandwidth?: number | string | null,
  motherboard?: string | null,
  number_of_pcie_per_gpu?: string | null,
  cpu?: string | null,
  eff_out_of_total_nu_of_cpu_virtual_cores?: string | null,
  eff_out_of_total_system_ram?: string | null,
  internet_down_speed?: number | string | null,
  internet_up_speed?: number | string | null,
  reliability?: number | string | null,
  os?: string | null,
  ram?: string | null,
  diskSize?: string | null,
  diskType?: string | null,
  provider_id?: number | null,
  onEdit: () => void,
}

export default function ModelItem(props: TProps) {
  const tooltipPrefix = useMemo(() => {
    return "tooltip-" + (props.id ?? Math.random().toString().substring(2, 8)) + "-";
  }, [props.id]);

  return (
    <div className="models-list-item">
      <div className="models-list-item__inner">
        <div className="badges">
          <span className="badge" id={tooltipPrefix + "compute-id"}>
            {props.id}&nbsp;
            <IconTinyEdit style={{ transform: "translateY(1px)" }} />
          </span>
          <Tooltip place="top" positionStrategy="fixed" content="Model ID"
            anchorSelect={"#" + tooltipPrefix + "compute-id"} />
          <span className="badge" id={tooltipPrefix + "model-price"}>
            {props.model_price > 0 ? formatFloat(props.model_price) + " " + TOKEN_SYMBOL_DEFAULT : "Free"}&nbsp;
            <IconTinyEdit style={{transform: "translateY(1px)"}}/>
          </span>
          <Tooltip place="top" positionStrategy="fixed" content="Price"
                   anchorSelect={"#" + tooltipPrefix + "model-price"}/>
          
          {/* <span className="badge" id={tooltipPrefix + "provider-id"}>
            {props.provider_id ?? "??????"}&nbsp;
            <IconTinyEdit style={{transform: "translateY(1px)"}}/>
          </span>
          <Tooltip place="top" positionStrategy="fixed" content="Provider ID"
                   anchorSelect={"#" + tooltipPrefix + "provider-id"}/> */}
          {props.datacenter && <span className="badge badge--green">{props.datacenter}</span>}
          {props.location && <span className="badge">{props.location ?? "Unknown"}</span>}
          {props.related_compute &&
            <a href={`http://${props.related_compute.ip_address}:${props.related_compute.port}`} target="_blank" rel="noopener noreferrer" className="badge" style={{ textDecoration: 'none' }}>
              {`${props.related_compute.ip_address}:${props.related_compute.port}`}
            </a>
          }
          {props.model_source && (
            <span className="badge" id={tooltipPrefix + "model-source"}>
              {props.model_source === "DOCKER_HUB" ? "Docker Hub" : props.model_source === "GIT" ? "Git" : props.model_source === "ROBOFLOW" ? "Roboflow" :"Hugging Face"}
              <IconTinyEdit style={{ transform: "translateY(1px)" }} />
            </span>
          )}
          {props.model_source && (
            <Tooltip
              place="top"
              positionStrategy="fixed"
              content="Model Source"
              anchorSelect={"#" + tooltipPrefix + "model-source"}
            />
          )}
          
          {props.docker_image && (
            <span className="badge" id={tooltipPrefix + "docker-image"}>
              {props.docker_image}
              <IconTinyEdit style={{ transform: "translateY(1px)" }} />
            </span>
          )}
          {props.docker_image && (
            <Tooltip
              place="top"
              positionStrategy="fixed"
              content="Model Image"
              anchorSelect={"#" + tooltipPrefix + "docker-image"}
            />
          )}

        </div>
        <h2 style={{
          margin: 0,
          marginBottom: 16,
        }}>
          {props.model_name}
        </h2>
        <div className="columns">
          <div className="column column--gpu">
            <div className="name">{props.gpu_name ?? "-"}</div>
            {/* <div className="split">
              <div className="left">
                <div className="tflops" id={tooltipPrefix + "tflops"}>
                  <strong>{props.gpu_tflops ? formatFloat(parseFloat(props.gpu_tflops)) : "???"}</strong> <span
                  className="unit">TFLOPS</span>
                </div>
                <Tooltip place="left" positionStrategy="fixed" content="Total GPU TeraFLOPs"
                         anchorSelect={"#" + tooltipPrefix + "tflops"}/>
                <div className="cuda" id={tooltipPrefix + "cuda"}>
                  Max CUDA: {props.max_cuda_version ?? "???"}
                </div>
                <Tooltip place="left" positionStrategy="fixed" content="Maximum CUDA Version Supported"
                         anchorSelect={"#" + tooltipPrefix + "cuda"}/>
              </div>
              <div className="right">
                <div className="gpu-ram" id={tooltipPrefix + "gpu-ram"}>{props.per_gpu_ram ?? "???"} GB</div>
                <Tooltip place="top" positionStrategy="fixed" content="Per GPU RAM"
                         anchorSelect={"#" + tooltipPrefix + "gpu-ram"}/>
                <div className="gpu-bw" id={tooltipPrefix + "gpu-bw"}>{props.per_gpu_memory_bandwidth ?? "???"} GB/s
                </div>
                <Tooltip place="bottom" positionStrategy="fixed" content="Per GPU Memory Bandwidth"
                         anchorSelect={"#" + tooltipPrefix + "gpu-bw"}/>
              </div>
            </div> */}
          </div>
          <div className="column column--cpu">
            <div className="motherboard" id={tooltipPrefix + "download-count"}>Download: {props.download_count ?? "???"}</div>
            <Tooltip place="top-start" positionStrategy="fixed" content="Download"
                     anchorSelect={"#" + tooltipPrefix + "download"}/>
            <div className="motherboard">Like: {props.like_count ?? "???"}</div>
            <Tooltip place="top-start" positionStrategy="fixed" content="Download"
              anchorSelect={"#" + tooltipPrefix + "motherboard"} />
            {/* <div className="cpu" id={tooltipPrefix + "cpu"}>{props.cpu ?? "???"}</div>
            <Tooltip place="bottom-start" positionStrategy="fixed" content="CPU"
                     anchorSelect={"#" + tooltipPrefix + "cpu"}/> */}
            {/* <div className="cpu-ram">
              <span>{props.eff_out_of_total_nu_of_cpu_virtual_cores ?? "???"} CPU</span>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <span>{props.eff_out_of_total_system_ram ?? "???"} GB</span>
            </div> */}
          </div>
          <div className="column column--network">
            {/* <div className="upload" id={tooltipPrefix + "upload"}>
              <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.28704 6.37988L8.3337 2.33322L12.3804 6.37988" stroke="#40405B" strokeWidth="1.5"
                      strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8.3335 13.667V2.44699" stroke="#40405B" strokeWidth="1.5" strokeMiterlimit="10"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <strong>{props.internet_up_speed ?? "???"} Mbps</strong>
            </div>
            <Tooltip place="top-start" positionStrategy="fixed" content="Internet Upload Speed (Shared)"
                     anchorSelect={"#" + tooltipPrefix + "upload"}/>
            <div className="download" id={tooltipPrefix + "download"}>
              <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.38 9.62012L8.33329 13.6668L4.28662 9.62012" stroke="#40405B" strokeWidth="1.5"
                      strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8.3335 2.33301V13.553" stroke="#40405B" strokeWidth="1.5" strokeMiterlimit="10"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <strong>{props.internet_down_speed ?? "???"} Mbps</strong>
            </div>
            <Tooltip place="bottom-start" positionStrategy="fixed" content="Internet Download Speed (Shared)"
                     anchorSelect={"#" + tooltipPrefix + "download"}/> */}
            <div className="reliability">
              <strong>User rent: {props.total_user_rent ?? "0"}</strong>
            </div>
          </div>
          <div className="column column--rent">
            <div className="model-right">
             
              <Button
                type={props.status === "created" ? "white" : props.status === "in_marketplace" ? "primary": "warning"}
                iconPosition="right"
              >
                {props.status === "created" ? "Available" : props.status === "in_marketplace" ? "On Sale" : "Not Available"}
              </Button>

              <Button
                type="gradient"
                icon={<IconSave />}
                iconPosition="right"
                onClick={props.onEdit}
                className="btn-edit"
              >
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
