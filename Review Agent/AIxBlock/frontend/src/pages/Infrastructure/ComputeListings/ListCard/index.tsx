import {useCallback, useEffect, useMemo, useState} from "react";
import IconArrowRight from "@/assets/icons/IconArrowRight";
import Button from "@/components/Button/Button";
import Table from "@/components/Table/Table";
import "./index.scss";
import {
  TGpu,
  useListGpuCompute,
} from "@/hooks/computes/useListGpuCompute";
import { useApi } from "@/providers/ApiProvider";
import Alert from "@/components/Alert/Alert";
import { TOKEN_SYMBOL_DEFAULT } from "@/constants/projectConstants";
import { TComputeMarketplace } from "@/models/computeMarketplace";
import { SERVER_INFORMATION } from "@/components/ComputeForm/ComputeForm";
import { formatBytes } from "@/utils/customFormat";

const TOKEN_SYMBOL = TOKEN_SYMBOL_DEFAULT;
interface DataRow {
  id: string;
  stt: string;
  gpuName: string;
  inputValue: string;
  checked: boolean;
  type: "create" | "edit";
}

type ListCardProps = {
  setStep: () => void;
  data?: TComputeMarketplace;
  computeId?: string;
  infrastructureId?: string;
};

export const ListCard = ({
  data,
  infrastructureId,
  computeId,
  setStep,
}: ListCardProps) => {
  const api = useApi();
  const [checkAll, setCheckAll] = useState(false);
  const [gpus, setGpus] = useState<DataRow[]>([]);
  const [error, setError] = useState("");

  const [listRecommendPrices, setListRecommendPrices] = useState<{
    [k: string]: {
      price_from: string,
      price_to: string,
      unit: string
    }
  }>();

  const { listData } = useListGpuCompute({
    infrastructure_id: infrastructureId,
  });
  const { ip_address, config = {}, is_using_cpu, cpu_price } = (data as any) ?? {};
  const { cpu, diskType, os, ram } = config as SERVER_INFORMATION;
  const [cpuState, setCpuState] = useState({
    stt: "1",
    inputValue: cpu_price?.price,
  });

  useEffect(() => {
    setCpuState({ ...cpuState, inputValue: cpu_price?.price })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cpu_price?.price]);

  const handleCheckItem = (id: string, checked: boolean) => {
    const updatedGpus = gpus.map((gpu) =>
      gpu.id === id ? { ...gpu, checked } : gpu
    );
    setGpus(updatedGpus);

    const checkStatusCheckAll = updatedGpus.every((gpu) => gpu.checked);
    setCheckAll(checkStatusCheckAll);
  };

  const handleCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedGpus = gpus.map((gpu) => ({
      ...gpu,
      checked: e.target.checked,
    }));
    setGpus(updatedGpus);
    setCheckAll(e.target.checked);
  };

  const handleInputValueChange = (id: string, value: string) => {
    if (is_using_cpu) {
      setCpuState({ ...cpuState, inputValue: value});
      return;
    }
    const updatedGpus = gpus.map((gpu) =>
      gpu.id === id ? { ...gpu, inputValue: value, checked: true } : gpu
    );
    setGpus(updatedGpus);
  };


  const getSuggestionPrices = useCallback((gpuIds: string[]) => {
    try {
      const queryAllSuggestion = gpuIds.map(id => {
        return new Promise((resolve, reject) => {
          const ar = api.call("getRecommendPrice", {
            query: new URLSearchParams({
              compute_gpu_id: id,
            })
          })
          ar.promise.then(async (r) => {
            const res = await r.json();
            resolve({ ...res, compute_gpu_id: id });
          }).catch((e) => {
            reject(e)
          });
        });
      })
      Promise.all(queryAllSuggestion).then((responses) => {
        const listRecommend: { [key: string]: { price_from: string, price_to: string, unit: string } } = {};
        responses.forEach((res: any) => {
          listRecommend[res.compute_gpu_id] = {
            price_from: res.price_from,
            price_to: res.price_to,
            unit: res.unit ?? "$",
          };
        });
        setListRecommendPrices(listRecommend);
      });
    } catch (error) {
      console.log("error", error);
    }
  }, [api]);

  const updatePrice = () => {
    try {
      if (is_using_cpu) {
        const ar = api.call("updateCpuPrice", {
          body: {
            "token_symbol": TOKEN_SYMBOL_DEFAULT,
            "price": cpuState.inputValue,
            "compute_marketplace_id": Number(computeId),
          }
        });
        ar.promise.then((res) => {
          if (res.ok) {
            setStep();
          } else {
            setError(res.statusText);
          }
        })
      } else {
        const dataCreate = gpus.filter(
          (g) => g.type === "create" && g.checked && g.inputValue
        );
        const dataEdit = gpus.filter(
          (g) => g.type === "edit" && g.checked && g.inputValue
        );
        const createPrice = dataCreate.length
          ? api.call("bulkCreatePriceGpu", {
            body: {
              gpu_price: dataCreate.map((d) => ({
                compute_gpu_id: d.id,
                token_symbol: TOKEN_SYMBOL,
                price: d.inputValue,
                compute_marketplace_id: computeId,
              })),
              compute_marketplace_id: computeId,
            },
          })
          : null;
        const editPrice = dataEdit.length
          ? api.call("bulkUpdatePriceGpu", {
            body: {
              gpu_price: dataEdit.map((d) => ({
                compute_gpu_id: d.id,
                token_symbol: TOKEN_SYMBOL,
                price: d.inputValue,
                compute_marketplace_id: computeId,
              })),
              compute_marketplace_id: computeId,
            },
          })
          : null;
        Promise.all([createPrice?.promise, editPrice?.promise])
          .then(async (r) => {
            const fail = r.find((s) => s && !s.ok);
            if (fail) {
              const res = await fail.json();
              setError(res && res[0]?.error);
            } else {
              setStep();
            }
          })
          .catch((e) => {
            let msg = "";
            if (e instanceof Error) {
              msg += " " + e.message + ".";
            } else {
              msg = "An error occurred while adding infrastructure.";
            }
            setError(msg + " Please try again!");
          });
      }
    } catch (error) {
      setError("Error while creating GPU computes:" + error);
    }
  };

  useEffect(() => {
    if (
      listData &&
      listData.results &&
      listData.results[0]?.infrastructure &&
      listData.results[0]?.infrastructure.compute_gpus &&
      listData.results.length === 1 &&
      listData.results[0]?.infrastructure_id === infrastructureId
    ) {
      const gpuIds: string[] = [];
      const mappedData: DataRow[] =
        listData.results[0].infrastructure.compute_gpus.map(
          (gpu: TGpu, index: number) => {
            gpuIds.push(gpu.id.toString());
            return ({
              stt: String(index + 1),
              id: gpu.id.toString(),
              gpuName: gpu.gpu_name,
              inputValue: gpu.prices[0]?.price.toString() ?? "",
              checked: false,
              type: gpu.prices.length ? "edit" : "create",
            })
          }
        );
      setGpus(mappedData);
      getSuggestionPrices(gpuIds)
    }
  }, [getSuggestionPrices, infrastructureId, listData]);

  const errorNode = useMemo(() => {
    if (error) {
      return (
        <Alert message={error} type="Danger" style={{ marginBottom: 16 }} />
      );
    }
  }, [error]);

  const emptyGpus = useMemo(() => {
    if (!gpus.length) {
      return <Alert message="There is no GPU on this compute" />;
    }
  }, [gpus]);

  const checkDisableBtn = () => {
    if (is_using_cpu) {
      return !cpuState.inputValue;
    }
    if (gpus.every((g) => !g.checked)) {
      return false;
    }
    return !!gpus.length && !gpus.some((g) => g.checked && g.inputValue);
  };

  return (
    <div className="list-card">
      <div className="list-card-title">Server Information</div>
      <div className="list-card-infor">
        {ip_address && (
          <span className="list-card-infor-item">
            <b>IP Port: </b>
            <span>{ip_address}</span>
          </span>
        )}
        {cpu && (
          <span className="list-card-infor-item">
            <b>CPU: </b>
            <span>{cpu}</span>
          </span>
        )}
        {ram && (
          <span className="list-card-infor-item">
            <b>RAM: </b>
            <span>{formatBytes(Number(ram))}</span>
          </span>
        )}
        {diskType && (
          <span className="list-card-infor-item">
            <b>DISKTYPE: </b>
            <span>{diskType}</span>
          </span>
        )}
        {os && (
          <span className="list-card-infor-item">
            <b>OS: </b>
            <span>{os}</span>
          </span>
        )}
      </div>
      <div className="list-card-title">List GPUs</div>
      {errorNode}
      {is_using_cpu ? (
        <Table columns={[
          { label: "STT", align: "CENTER", dataKey: "stt" },
          {
            label: "Name", renderer: () => (
              <span>{cpu}</span>
            )
          },
          {
            label: "Price", renderer: (dataRow) => (
              <div className="price">
                <input
                  placeholder="Input number"
                  type="number"
                  value={dataRow.inputValue}
                  onChange={(e) =>
                    handleInputValueChange(dataRow.id, e.target.value)
                  }
                />
                <span className="prefix">hrs</span>
              </div>
            ),
          }
        ]} data={[cpuState]}
          className="table-list-card"
        />
      ) : gpus.length ? (
        <Table
          columns={[
            {
              label: (
                <input
                  className="input-checkbox"
                  type="checkbox"
                  checked={checkAll}
                  onChange={handleCheckAll}
                />
              ),
              align: "CENTER",
              renderer: (dataRow) => (
                <input
                  className="input-checkbox"
                  type="checkbox"
                  checked={dataRow.checked}
                  onChange={(e) =>
                    handleCheckItem(dataRow.id, e.target.checked)
                  }
                />
              ),
            },
            { label: "STT", align: "CENTER", dataKey: "stt" },
            {
              label: "Name",
              align: "CENTER",
              noWrap: true,
              dataKey: "gpuName",
            },
            {
              label: "Price",
              align: "CENTER",
              renderer: (dataRow) => {
                const priceRange = listRecommendPrices && listRecommendPrices[dataRow.id];
                return (
                  <div className="list-card__input-wrapper">
                    <div className="price">
                      <input
                        placeholder="Input number"
                        type="number"
                        value={dataRow.inputValue}
                        onChange={(e) =>
                          handleInputValueChange(dataRow.id, e.target.value)
                        }
                      />
                      <span className="prefix">hr</span>
                    </div>
                    {(priceRange?.price_from || priceRange?.price_to) &&
                      <span className="list-card__input-subtitle"><i>Recommended Price Per Hr Range Based on Market Analysis:</i>
                        <b>{priceRange?.price_from !== priceRange?.price_to
                          ? `${priceRange?.unit}${priceRange?.price_from} to ${priceRange?.unit}${priceRange?.price_to}`
                          : `${priceRange?.unit}${priceRange?.price_from}`}</b></span>}
                  </div>
                )
              },
            },
          ]}
          data={gpus}
          className="table-list-card"
        />
      ) : (
        emptyGpus
      )}
      <div className="list-card-btn-next">
        <Button onClick={updatePrice} disabled={checkDisableBtn()}>
          Next <IconArrowRight />
        </Button>
      </div>
    </div>
  );
};

export default ListCard;
