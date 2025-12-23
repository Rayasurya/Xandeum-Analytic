import {formatBytes} from "@/utils/customFormat";
import Select, {DataSelect, SelectOption} from "../Select/Select";
import React, {useMemo} from "react";
import {TMarketplaceGpuListModel} from "@/models/marketplaceGpuList";
import {TMarketplaceGpuModel} from "@/models/marketplaceGpu";

export type TSelectedComputes = {
  cpus: string[];
  gpus: {compute_id: string, gpus_id: string}[];
};

export type TProps = {
  className?: string;
  computes: TMarketplaceGpuListModel;
  isLoading?: boolean;
  onChange?: (computes: TSelectedComputes) => void;
  onClose?: () => void;
  selected?: TSelectedComputes,
  isProcessing?: boolean;
  isRequired?: boolean;
  error?: string | null;
}

export default function ComputeSelect({className, computes, isLoading, onChange, onClose, selected, isProcessing, isRequired, error}: TProps) {
  const data: DataSelect[] = useMemo(() => {
    return computes.map((compute) => {
      const gpus =
        "compute_gpus" in compute && compute.compute_gpus.length > 0
          ? compute.compute_gpus.map(
            (gpu: TMarketplaceGpuModel) =>
              ({
                label: gpu.gpu_name,
                value: gpu.id.toString(),
                disabled: compute.is_available === false,
                data: {
                  compute_id: compute.compute_id,
                  compute_name: compute.compute_name,
                  gpu: gpu,
                  isAvailable: compute.is_available,
                },
              } as SelectOption)
          )
          : [
            {
              label: compute.compute_cpu?.cpu,
              value: compute.compute_id.toString(),
              disabled: compute.is_available === false,
              data: {
                compute_id: compute.compute_id,
                compute_name: compute.compute_name,
                cpu: compute.compute_cpu,
                isAvailable: compute.is_available,
              },
            } as SelectOption,
          ];

      return {
        label: compute.compute_name,
        options: gpus,
      };
    });
  }, [computes]);

  const selectedOptions = useMemo(() => {
    const list: SelectOption[] = [];
    const selectedCpus = selected?.cpus ?? [];
    const selectedGpus = selected?.gpus ?? [];

    data.forEach(compute => {
      compute.options.forEach(opt => {
        if (!opt.data) {
          return;
        }

        if ("cpu" in opt.data) {
          if (selectedCpus.includes(opt.value)) {
            list.push(opt);
          }
        } else if ("gpu" in opt.data) {
          if (selectedGpus.find(sg => sg.gpus_id === opt.value)) {
            list.push(opt);
          }
        }
      });
    });

    return list;
  }, [data, selected?.cpus, selected?.gpus]);

  return (
    <Select
      data={data}
      className={className}
      label="Your compute"
      isMultiple={true}
      type="checkbox"
      disabled={isProcessing}
      isRequired={isRequired}
      onMultipleChange={(opts) => {
        if (!onChange) {
          return;
        }

        const cpus: TSelectedComputes["cpus"] = [];
        const gpus: TSelectedComputes["gpus"] = [];

        opts
          .filter(opt => opt.data.isAvailable !== false)
          .forEach(opt => {
            if ("cpu" in opt.data) {
              cpus.push(opt.value);
            } else if ("compute_id" in opt.data) {
              gpus.push({compute_id: opt.data.compute_id.toString(), gpus_id: opt.value});
            }
          });

        onChange({cpus, gpus});
      }}
      placeholderText={data.length === 0 ? "" : "Please select at least one compute resource from the available options"}
      error={error ?? (isRequired && data.length === 0 ? "There are no computes available" : undefined)}
      isLoading={isLoading}
      defaultValue={selectedOptions}
      customRenderLabel={(item) => {
        return <div className="c-ml__select-model--select-item" style={{opacity: item.data?.isAvailable === false ? 0.3 : 1}}>
          {item.data.cpu ? <>
            <span>{item.data.cpu.cpu}</span>
            <span>Ram: {formatBytes(item.data.cpu.ram ?? 0)}</span>
            <span>Disk: {formatBytes(item.data.cpu.disk ?? 0)} {item.data.cpu.diskType ?? ""}</span>
          </> : <>
            <span>{item.data?.gpu?.gpu_name}{item.data.compute_name ? " / " + item.data.compute_name : ""}</span>
            {item.data?.gpu?.gpu_memory && (<span>vRam: {formatBytes(item.data?.gpu?.gpu_memory ?? 0) ?? ""}</span>)}
          </>}
          {item.data?.isAvailable === false && <span>(Incompatible)</span>}
        </div>
      }}
      onClickOutside={onClose}
    />
  );
}
