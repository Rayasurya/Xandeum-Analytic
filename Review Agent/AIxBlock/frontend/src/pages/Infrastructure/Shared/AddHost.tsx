import {Suspense, useCallback, useState} from "react";
import {useNavigate} from "react-router-dom";
import ComputeForm2, {GPU, GPUInfo, SERVER_INFORMATION} from "@/components/ComputeForm2/ComputeForm2";
import {BodyUser} from "@/hooks/computes/useCreateUserComputeMkp";
import {useApi} from "@/providers/ApiProvider";
import {useBooleanLoader} from "@/providers/LoaderProvider";
import {useAuth} from "@/providers/AuthProvider";
import Modal from "@/components/Modal/Modal";
import IconSuccess from "@/assets/icons/IconSuccess";
import AppLoading from "@/components/AppLoading/AppLoading";
import styles from "./AddHost.module.scss";
import {infoDialog} from "@/components/Dialog";

export type TProps = {
  computeType: "label-tool" | "storage" | "model-training";
}

const AddHost = ({computeType}: TProps) => {
  const navigate = useNavigate();
  const api = useApi();
  const {user} = useAuth()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useBooleanLoader(loading, "Processing...");
  const [isOpenModalAddComputeDone, setIsOpenModalAddComputeDone] = useState<boolean>(false);

  const createCompute = useCallback((values: BodyUser, gpuData: GPU[], serverInfo: SERVER_INFORMATION, cuda: GPUInfo[]) => {
    setError("");
    setLoading(true);

    const additionalInfo: { [k: string]: string | number | string[] } = {};

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
          infoDialog({
            title: "Installing",
            message: "Please stay tuned; we'll notify you once the installation is complete.",
            onCancel: () => setIsOpenModalAddComputeDone(true),
          });
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
    <div className={styles.container}>
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
          iconTitle={<IconSuccess/>}
          submitText="Finish"
          closeOnOverlayClick={true}
          open={isOpenModalAddComputeDone}
          onClose={() => setIsOpenModalAddComputeDone(false)}
          onSubmit={() => {
            if (computeType === "storage") {
              navigate("/infrastructure/storage/self-host");
            } else if (computeType === "label-tool") {
              navigate("/infrastructure/platform");
            } else if (computeType === "model-training") {
              navigate("/infrastructure/gpu/self-host");
            }
          }}
        >
          Time for a quick musical interlude! We're setting up Docker containers and environments on the computes just
          for you. This process typically takes about 1 minute per compute, although timing can vary based on the
          internet connection from the GPU provider. We appreciate your patience!
        </Modal>
      </Suspense>
    </div>
  );
};

export default AddHost;
