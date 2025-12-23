import {
    httpClient,
    HttpMethod
} from "workflow-blocks-common";
import { createAction, Property } from "workflow-blocks-framework";
import { aixblockAuth } from '../../..';

export const getComputes = createAction({
  name: "get_computes",
  auth: aixblockAuth,
  displayName: "Get computes",
  description: "Function to get computes user in aixblock platform",
  props: {
    search: Property.ShortText({
      displayName: "Search",
      description: "Search term",
      required: false,
    }),
    provider: Property.StaticDropdown({
      displayName: "Provider",
      description: "GPU Provider",
      required: false,
      options: {
        options: [
          { label: "NVIDIA", value: "nvidia" },
          { label: "AMD", value: "amd" },
        ],
      },
    }),
    serviceType: Property.StaticDropdown({
      displayName: "Service Type",
      description: "Type of service",
      required: false,
      options: {
        options: [
          { label: "Model Training", value: "model-training" },
        ],
      },
    }),
    gpusMachine: Property.StaticDropdown({
      displayName: "GPUs Machine",
      description: "Type of GPU machine",
      required: false,
      options: {
        options: [
          { label: "Any", value: "any" },
        ],
      },
    }),
    diskSize: Property.ShortText({
      displayName: "Disk Size (GB)",
      description: "Minimum disk size in GB",
      required: false,
    }),
    priceFrom: Property.ShortText({
      displayName: "Min Price",
      description: "Minimum price",
      required: false,
      defaultValue: "0",
    }),
    priceTo: Property.ShortText({
      displayName: "Max Price",
      description: "Maximum price",
      required: false,
      defaultValue: "1",
    }),
    pageSize: Property.ShortText({
      displayName: "Page Size",
      description: "Page size for paging",
      required: true,
      defaultValue: "20",
    }),
    page: Property.ShortText({
      displayName: "Page",
      description: "Page for paging",
      required: true,
      defaultValue: "1",
    }),
  },
  async run({ auth, propsValue }) {
    const response = await httpClient.sendRequest({
      method: HttpMethod.POST,
      url: `${auth.baseApiUrl}/api/compute_marketplace/list`,
      body: {
        search: propsValue.search || "",
        provider: propsValue.provider || "",
        location: {
          id: "",
          alpha2: "",
          alpha3: "",
          name: ""
        },
        service_type: propsValue.serviceType || "model-training",
        gpus_machine: propsValue.gpusMachine || "any",
        vcpu_model_training: "",
        disk_type: "",
        free_time: {
          from: "",
          to: ""
        },
        reliability: "",
        machine_options: [],
        cuda_version: "",
        driver_version: "",
        ubuntu_version: "",
        price: {
          from: propsValue.priceFrom || "0",
          to: propsValue.priceTo || "1"
        },
        gpu_count: "",
        tflops: "",
        per_gpu_ram: "",
        gpu_total_ram: "",
        gpu_ram_bandwidth: "",
        pcie_bandwidth: "",
        nvlink_bandwidth: "",
        cpu_cores: "",
        cpu_ram: "",
        cpu_ghz: "",
        disk_bandwidth: "",
        inet_up: "",
        inet_down: "",
        open_port: "",
        page: parseInt(propsValue.page) || 1,
        page_size: parseInt(propsValue.pageSize) || 20,
        disk_size: propsValue.diskSize || "40",
        dlp_score: ""
      },
      headers: {
        Authorization: `Token ${auth.apiToken}`,
      },
    });

    return response.body;
  },
});
