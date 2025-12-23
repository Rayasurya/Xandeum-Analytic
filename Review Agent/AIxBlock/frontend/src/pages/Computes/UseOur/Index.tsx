import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import IconShield from "@/assets/icons/IconShield";
import IconRefreshCircle from "@/assets/icons/iconRefreshCircle";
import Button from "@/components/Button/Button";
import { useApi } from "@/providers/ApiProvider";
import "./Index.scss";
interface ComputeData {
  ip_address: string;
  infrastructure_id?: string;
  client_id?: string;
  client_secret?: string;
  compute_type?: string;
}
const UseOur = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ComputeData>();
  const { call } = useApi();
  // const [loading, setLoading] = useState(false);

  //Todo: integrate api
  // async function createCompute() {
  //   try {
  //     setLoading(true);
  //     const res = await fetch(
  //       window.APP_SETTINGS.hostname + `api/compute_marketplace/user/create`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           ...data,
  //         }),
  //       }
  //     );

  //     if (!res.ok) {
  //       throw new Error("Failed to create compute.");
  //     }
  //     setLoading(false);
  //     navigate("/computes");
  //   } catch (error) {
  //     setLoading(false);
  //     return error;
  //   }
  // }

  const handleIpConfig = useCallback(async () => {
    const tokenWorker = call("getTokenWorker").promise;
    const secretId = call("getSecretId").promise;

    const [apiTokenGet, apiClientGet] = await Promise.all([
      tokenWorker,
      secretId,
    ]);
    const resToken = await apiTokenGet?.json();
    const token = resToken?.token;
    const resClient = await apiClientGet?.json();
    const ipAddress = window.APP_SETTINGS.ip_compute;

    setData({
      ...data,
      ip_address: ipAddress,
      infrastructure_id: token,
      client_id: resClient.client_id,
      client_secret: resClient.client_secret,
      compute_type: "full",
    });
  }, [call, data]);

  useEffect(() => {
    handleIpConfig();
  }, [handleIpConfig]);
  return (
    <div className="c-useour">
      <div className="c-useour__status">
        <IconShield />
        <span>Setup finished</span>
      </div>
      <div className="c-useour__wrapper">
        <div className="c-useour__head">
          <h4>
            Use our infrastructure <br />
            (GPU, cloud storage)
          </h4>
        </div>
        <div className="c-useour__content">
          <div className="c-useour__item">
            <span className="c-useour__item-title">Price:</span>
            <span className="c-useour__item-value">(Coming soon)</span>
          </div>
        </div>
        <div className="c-useour__action">
          <Button
            type="dark"
            size="medium"
            onClick={() => navigate("/computes/add/")}
          >
            Set Up Again
            <IconRefreshCircle />
          </Button>
          {/* <Button
            type="primary"
            size="small"
            className="c-useour__action--next"
            onClick={() => createCompute()}
          >
            Confirm
          </Button> */}
        </div>
      </div>
    </div>
  );
};

export default UseOur;
