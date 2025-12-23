import ListingsLayout from "./ListingsLayout";
import {TComputeSupply, useGetListComputeMarketplace} from "@/hooks/computes/useGetListComputeMarketplace";
import {useNavigate} from "react-router-dom";
import {useApi} from "@/providers/ApiProvider";
import {confirmDialog, infoDialog} from "@/components/Dialog";
import React from "react";
import Pagination from "@/components/Pagination/Pagination";
import EmptyContent from "@/components/EmptyContent/EmptyContent";
import LeaseOutCompute from "../../LandingPage/LeaseOutCompute";
import {IconPlus} from "@/assets/icons/Index";
import Button from "@/components/Button/Button";
import ComputeItem from "./ComputeItem/Index";

export default function ListingComputes() {
  const {listData, loading, fetchData, page, setPage} = useGetListComputeMarketplace({page: 1, type: "supply"});
  const navigate = useNavigate();
  const api = useApi();

  const deleteCompute = (dataRow: TComputeSupply) => {
    confirmDialog({
      message: "Are you sure you want to delete this compute?",
      onSubmit: async () => {
        const isCannotDelete = dataRow?.compute_gpus?.some((c) => c.being_rented);

        if (isCannotDelete) {
          infoDialog({
            message: "This compute is being rented.",
          });

          return;
        }

        const ar = api.call("deleteCompute", {
          params: { id: dataRow.id.toString() },
        });

        const res = await ar.promise;

        if (res.ok) {
          fetchData();
        } else {
          const data = await res.json();

          if (Object.hasOwn(data, "detail")) {
            infoDialog({ message: "Server error: " + data["detail"] });
          } else {
            infoDialog({
              message: "An error occurred while deleting compute (" + res.statusText + "). Please try again!",
            });
          }
        }
      },
    });
  };

  return (
    <ListingsLayout
      rightContent={
        <Button onClick={() => navigate("/infrastructure/list-compute")}>
          <IconPlus />
          List my compute
        </Button>
      }
    >
      {
        loading
          ? <EmptyContent message="Loading listing computes..."/>
          : (listData?.results ?? []).length ? (
            <div>
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 24,
              }}>
                {
                  listData?.results?.map((cp, idx) => {
                    return (
                      <ComputeItem
                        cp={cp as any}
                        id={cp.id}
                        owner_id={cp.owner_id}
                        service_type={cp.compute_type}
                        onDelete={deleteCompute}
                        remaining={cp.remaining}
                        onEdit={(id) => navigate(`/infrastructure/list-compute/${id}`)}
                        config={cp.config}
                        ip={cp.ip_address}
                      />
                    );
                  })
                }
              </div>
              <Pagination
                page={page}
                pageSize={20}
                total={listData?.count ?? 0}
                setPage={setPage}
                target="infrastructure/compute-listings"
              />
            </div>
          ) : (
            <LeaseOutCompute contentOnly={true}/>
          )
      }
    </ListingsLayout>
  )
}
