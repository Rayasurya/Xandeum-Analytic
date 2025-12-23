import {useRentedModelList} from "@/hooks/settings/ml/useRentedModelList";
import styles from "./RentedModels.module.scss";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import ModelItem from "@/components/Model/Item";
import Pagination from "@/components/Pagination/Pagination";
import {useBooleanLoader} from "@/providers/LoaderProvider";
import React from "react";
import {TModelMarketplace} from "@/models/modelMarketplace";
import useDeleteModel from "@/hooks/settings/ml/useDeleteModel";

export default function RentedModels() {
  const rentedModels = useRentedModelList({page_size: 100, type: "rent"});
  const {deleteModel, status} = useDeleteModel();
  useBooleanLoader(rentedModels.loading, "Loading rented models...");
  useBooleanLoader(!!status, status ?? "");

  const models: TModelMarketplace[] = React.useMemo(() => {
    if (!rentedModels.listData || rentedModels.listData.results.length === 0) {
      return [];
    }

    const list: TModelMarketplace[] = [];
    const listIds: number[] = [];

    rentedModels.listData.results.forEach(h => {
      if (!h.model_marketplace || listIds.includes(h.model_marketplace.id)) {
        return;
      }

      listIds.push(h.id);
      list.push({ ...h.model_marketplace, history_id: h.id });
    });

    return list;
  }, [rentedModels.listData]);

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <h4 className={styles.title}>
          <strong>Rented Models</strong>
          {/*({rentedModels.listData?.count ?? 0} model{(rentedModels.listData?.count ?? 0) > 1 ? "s" : ""})*/}
        </h4>
      </div>
      {models.length === 0 && (
        <EmptyContent message="(Empty list)" />
      )}
      <div className={styles.list}>
        {models.map(m => {
          return (
            <ModelItem
              key={`key-${m.id}`}
              model={m}
              noPrice={true}
              onDelete={() => deleteModel(m.history_id ?? 0, m.ml_id ?? undefined, rentedModels.refresh)}
            />
          )
        })}
      </div>
      {(rentedModels.listData?.results.length ?? 0) > 100 && (
        <Pagination
          page={rentedModels.page}
          setPage={rentedModels.setPage}
          pageSize={100}
          total={rentedModels.listData?.results.length ?? 0}
          target={"rented-models/"}
        />
      )}
    </div>
  );
}
