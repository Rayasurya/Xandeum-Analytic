import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "@/providers/ApiProvider";
import { useBooleanLoader } from "@/providers/LoaderProvider";
import "./Index.scss";
import Table, { TTableColumn } from "@/components/Table/Table";
import { useListGpuCompute, TGpu } from "@/hooks/computes/useListGpuCompute";
import Button from "@/components/Button/Button";
import IconArrowRight from "@/assets/icons/IconArrowRight";
import { TOKEN_SYMBOL_DEFAULT } from "@/constants/projectConstants";
import InputBase from "@/components/InputBase/InputBase";

interface DataRow {
  id: string;
  stt: string;
  gpuName: string;
  gpuIndex: number;
  gpuId: string;
  inputValue: string;
}

interface GpuPriceData {
  compute_gpu_id: string;
  token_symbol: string;
  price: string;
}

const ComputeSetPrice: React.FC = () => {
  const { infrastructureId } = useParams();
  const { listData } = useListGpuCompute({
    infrastructure_id: infrastructureId,
  });

  const navigate = useNavigate();
  const api = useApi();
  const [error, setError] = useState("");
  const [gpuPrice, setGpuPrice] = useState<GpuPriceData[]>([]);
  const [computeId, setComputeId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [listRecommendPrices, setListRecommendPrices] = useState<{
    [k: string]: {
      price_from: string,
      price_to: string,
      unit: string
    }
  }>();
  const [errors, setErrors] = useState<{
    [compute_gpu_id: string]: {
      error: string
    }
  }>();

  useBooleanLoader(loading, "Processing...");

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

  const UpdatePrice = () => {
    try {
      const errors: {
        [compute_gpu_id: string]: {
          error: string
        }
      } = {};
      let hasError = false;
      if (data.length !== gpuPrice.length) {
        hasError = true;
        setError("Please input price for all GPUs");
      }
      data.forEach((item) => {
        if (item.id && !gpuPrice.find(i => i.compute_gpu_id === item.id)) {
          errors[item.id] = { error: "Price is required" };
          hasError = true;
        }
      });
      gpuPrice.forEach((item) => {
        if (!item.price) {
          errors[item.compute_gpu_id] = { error: "Price is required" };
          hasError = true;
        }
      });
      if (hasError) {
        setErrors(errors);
        return;
      }
      const ar = api.call("bulkCreatePriceGpu", {
        body: {
          gpu_price: gpuPrice,
        },
      });

      ar.promise
        .then(async (r) => {
          if (r.ok) {
            navigate(`/computes/${computeId}/availability`);
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
    } catch (error) {
      // Handle error
      console.error("Error while creating GPU computes:", error);
      throw new Error(
        "An error occurred while adding GPU computes. Please try again!"
      );
    }
  };

  // Initialize state for table data
  const [data, setData] = useState<DataRow[]>([]);
  useEffect(() => {
    if (
      listData &&
      listData.results &&
      listData.results[0]?.infrastructure.compute_gpus
    ) {
      setComputeId(listData.results[0].compute_marketplace.toString());
      const gpuIds: string[] = [];
      const mappedData: DataRow[] =
        listData.results[0].infrastructure.compute_gpus.map(
          (gpu: TGpu, index: number) => {
            gpuIds.push(gpu.id.toString());
            return {
              id: gpu.id.toString(),
              stt: String(index + 1),
              gpuName: gpu.gpu_name,
              gpuId: gpu.gpu_id,
              gpuIndex: gpu.gpu_index,
              inputValue: "",
            }
          }
        );
      setData(mappedData);
      getSuggestionPrices(gpuIds)
    }
  }, [getSuggestionPrices, listData]);

  // Define the columns of the table
  const columns: TTableColumn[] = [
    { label: "STT", dataKey: "stt" },
    { label: "Name", align: 'CENTER', dataKey: "gpuName" },
    // { label: "Index", dataKey: "gpuIndex" },
    // { label: "GPU ID", dataKey: "gpuId" },
    { label: "Price", align: 'CENTER', renderer: renderInput },
    // Add other columns if needed
  ];

  // Render input for the "Price" column
  function renderInput(dataRow: DataRow) {
    const priceRange = listRecommendPrices && listRecommendPrices[dataRow.id];

    return (
      <div className="c-compute-set-price__input-wrapper">
        <InputBase
          value={gpuPrice.find(i => i.compute_gpu_id === dataRow.id)?.price || ''}
          onChange={(e) => handleInputChange(e, dataRow)}
          placeholder="input price" allowClear={false} customRightItem={"hr"}
          error={errors && errors[dataRow.id] && errors[dataRow.id].error}
        />
        {(priceRange?.price_from || priceRange?.price_to) && <span className="c-compute-set-price__input-subtitle"><i>Recommended Price Per Hr Range Based on Market Analysis:</i>
          <b>{priceRange?.price_from !== priceRange?.price_to
            ? `${priceRange?.unit}${priceRange?.price_from} to ${priceRange?.unit}${priceRange?.price_to}`
            : `${priceRange?.unit}${priceRange?.price_from}`}</b></span>}

      </div>
    );
  }

  // Handle input change event
  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement>,
    dataRow: DataRow
  ) {
    const newData = data.map((item) => {
      if (item === dataRow) {
        return { ...item, inputValue: e.target.value };
      }
      return item;
    });
    setData(newData);

    // Update gpuPrice array
    const updatedGpuPrice = [...gpuPrice];
    const existingIndex = updatedGpuPrice.findIndex(
      (item) => item.compute_gpu_id === dataRow.id
    );
    if (existingIndex !== -1) {
      updatedGpuPrice[existingIndex] = {
        ...updatedGpuPrice[existingIndex],
        price: e.target.value,
      };
    } else if (
      listData &&
      updatedGpuPrice.length <
      listData.results[0].infrastructure.compute_gpus.length
    ) {
      // Only push if the number of elements in gpuPrice is less than the number of GPUs
      updatedGpuPrice.push({
        compute_gpu_id: dataRow.id,
        token_symbol: TOKEN_SYMBOL_DEFAULT,
        price: e.target.value,
      });
    }
    setGpuPrice(updatedGpuPrice);
  }

  return (
    <div className="c-compute-set-price">
      <div className="c-compute-set-price__content">
        <div className="c-compute-set-price__title">List Model Training </div>
        <Table columns={columns} data={data} />
        <div className="c-compute-set-price__footer">
          <Button
            type="primary"
            size="small"
            icon={<IconArrowRight />}
            className="btn-next"
            onClick={UpdatePrice}
          >
            Next
          </Button>
        </div>
        <span className="error">{error}</span>
      </div>
    </div>
  );
};

export default ComputeSetPrice;
