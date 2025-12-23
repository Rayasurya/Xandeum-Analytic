import {Suspense, useCallback, useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import ComputeForm2, {
  GPU,
  GPUInfo,
  SERVER_INFORMATION,
} from "@/components/ComputeForm2/ComputeForm2";
import { BodyUser } from "@/hooks/computes/useCreateUserComputeMkp";
import { useApi } from "@/providers/ApiProvider";
import { useBooleanLoader } from "@/providers/LoaderProvider";
import "./Index.scss";
import { useUserLayout } from "@/layouts/UserLayout";
import { useAuth } from "@/providers/AuthProvider";
import Modal from "@/components/Modal/Modal";
import IconSuccess from "@/assets/icons/IconSuccess";
import AppLoading from "@/components/AppLoading/AppLoading";
import countries from "../../ComputesMarketplaceV2/countries.json";
import ComputeTypes from "./ComputeTypes";
import useUrlQuery from "@/hooks/useUrlQuery";

const AddHost = () => {
  const navigate = useNavigate();
  const api = useApi();
  const { user } = useAuth()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useBooleanLoader(loading, "Processing...");
  const userLayout = useUserLayout();
  const [isOpenModalAddComputeDone, setIsOpenModalAddComputeDone] = useState<boolean>(false);
  const [computeType, setComputeType] = useState<"label-tool" | "storage" | "model-training">("model-training");
  const q = useUrlQuery();
  const project = useMemo(() => q.get("project") ?? "", [q]);

  useEffect(() => {
    userLayout.setBreadcrumbs([
      { label: "Host on your own infrastructure (Model Training, Cloud storage)" },
    ]);
    return () => {
      userLayout.clearBreadcrumbs();
    };
  }, [userLayout]);

  //
  // Commented due to unused warning
  //
  // async function createGpuCompute(
  //   compute_mkp_id: number,
  //   infrastructure_id: string,
  //   gpu: GPU[],
  //   cuda: GPUInfo[]
  // ) {
  //
  //   const convertedGPUList: ConvertedGPU[] = gpu.map((gpu: GPU) => {
  //     return {
  //       infrastructure_id: infrastructure_id,
  //       gpu_name: gpu.name,
  //       gpu_index: gpu.id,
  //       gpu_memory: gpu.memory,
  //       power_consumption: gpu.power_consumption,
  //       branch_name: gpu.name.toLowerCase().indexOf("nvidia") > -1 ? "NVIDIA" : "OTHER",
  //       gpu_id: gpu.uuid,
  //       status: "created",
  //       compute_marketplace: compute_mkp_id,
  //       serialno: gpu.serialno,
  //       power_usage: gpu.power_usage,
  //       memory_usage: gpu.memory_usage,
  //       owner_id: user?.id || 1,
  //     };
  //   });
  //
  //   try {
  //     const ar = api.call("createBulkComputeGpu", {
  //       body: {
  //         compute_gpus: [...convertedGPUList],
  //         cuda: cuda
  //       },
  //     });
  //
  //     ar.promise
  //       .then(async (r) => {
  //         if (r.ok) {
  //           setIsOpenModalAddComputeDone(true);
  //           // navigate("/computes");
  //           // navigate(`/computes/set-price/${infrastructure_id}`);
  //         } else {
  //           const res = await r.json();
  //           // navigate("/computes");
  //           if (Object.hasOwn(res, "message")) {
  //             throw Error(res.message);
  //           } else if (Object.hasOwn(res, "detail")) {
  //             throw Error(res.detail);
  //           } else {
  //             throw Error("Can not add compute");
  //           }
  //         }
  //       })
  //       .catch((e) => {
  //         setLoading(false);
  //
  //         let msg = "";
  //
  //         if (e instanceof Error) {
  //           msg += " " + e.message + ".";
  //         } else {
  //           msg = "An error occurred while adding infrastructure.";
  //         }
  //
  //         setError(msg + " Please try again!");
  //       });
  //   } catch (error) {
  //     // Handle error
  //     console.error("Error while creating GPU computes:", error);
  //     throw new Error(
  //       "An error occurred while adding GPU computes. Please try again!"
  //     );
  //   }
  // }

  const createCompute = useCallback((values: BodyUser, gpuData: GPU[], serverInfo: SERVER_INFORMATION, cuda: GPUInfo[]) => {
    setError("");
    setLoading(true);

    const additionalInfo: {[k: string]: string | number | string[]} = {};

    if (values.location_id !== undefined) {
      const loc = countries.find(c => c.id.toString() === values.location_id);

      if (loc) {
        additionalInfo["location_id"] = loc.id;
        additionalInfo["location_alpha2"] = loc.alpha2;
        additionalInfo["location_name"] = loc.name; 
      }
    }

    if (values.machine_options !== undefined) {
      additionalInfo["machine_options"] = values.machine_options;
    }

    const convertedGPUList = gpuData.map((gpu: GPU) => {
      return {
        infrastructure_id: values.infrastructure_id,
        gpu_name: gpu.name,
        gpu_index: gpu.id,
        gpu_memory: gpu.memory,
        power_consumption: gpu.power_consumption,
        branch_name: gpu.name.toLowerCase().indexOf("nvidia") > -1 ? "NVIDIA" : "OTHER",
        gpu_id: gpu.uuid,
        status: "created",
        serialno: gpu.serialno,
        power_usage: gpu.power_usage,
        memory_usage: gpu.memory_usage,
        owner_id: user?.id || 1,
      };
    });

    const ar = api.call("createComputeByUser", {
      body: {
        ...values,
        config: serverInfo,
        compute_gpus: [...convertedGPUList],
        cuda: cuda,
        ...additionalInfo,
        computeType,
      },
    });

    ar.promise
      .then(async (r) => {
        if (r.ok) {
          // const res = await r.json();
          // await createGpuCompute(res.id, res.infrastructure_id, gpuData, cuda); // res.id
          setIsOpenModalAddComputeDone(true);
        } else {
          const res = await r.json();

          if (Object.hasOwn(res, "message")) {
            throw Error(res.message);
          } else if (Object.hasOwn(res, "detail")) {
            throw Error(res.detail);
          } else {
            throw Error("Can not add compute");
          }
        }
      })
      .catch((e) => {
        setLoading(false);

        let msg = "";

        if (e instanceof Error) {
          msg += " " + e.message + ".";
        } else {
          msg = "An error occurred while adding infrastructure.";
        }

        setError(msg + " Please try again!");
      });
  }, [api, computeType, user?.id]);

  return (
    <div className="c-compute-add-host">
      {(project?.length ?? 0) === 0 && (
        <ComputeTypes
          types={[
            {
              label: "Server to self-host",
              activeChecker: () => computeType === "label-tool",
              onClick: () => setComputeType("label-tool"),
            },
            {
              label: "Storage",
              activeChecker: () => computeType === "storage",
              onClick: () => setComputeType("storage"),
            },
            {
              label: "Compute for model training and deploying",
              activeChecker: () => computeType === "model-training",
              onClick: () => setComputeType("model-training"),
            },
          ]}
        />
      )}
      <ComputeForm2
        errors={error}
        onSetupCompleted={(values, gpuData, serverInfo, cuda) => {
          createCompute(values, gpuData, serverInfo, cuda)
        }}
        initData={{
          // location_id: "",
        }}
        formType="SELF-HOST"
        computeType={computeType}
      />
      <Suspense fallback={<AppLoading/>}>
        <Modal
          title="Add compute completed"
          iconTitle={<IconSuccess />}
          submitText="Finish"
          closeOnOverlayClick={true}
          open={isOpenModalAddComputeDone}
          onClose={() => setIsOpenModalAddComputeDone(false)}
          onSubmit={() => navigate("/computes")}
        >
          Time for a quick musical interlude! We're setting up Docker containers and environments on the computes just for you. This process typically takes about 1 minute per compute, although timing can vary based on the internet connection from the GPU provider. We appreciate your patience!
        </Modal>
      </Suspense>
    </div>
  );
};

export default AddHost;
