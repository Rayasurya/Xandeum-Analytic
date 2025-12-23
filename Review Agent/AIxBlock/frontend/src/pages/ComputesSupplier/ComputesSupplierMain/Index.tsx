import { useNavigate } from "react-router-dom";
import IconTypeSolid from "@/assets/icons/IconTypeSolid";
import { confirmDialog, infoDialog } from "@/components/Dialog";
import Select from "@/components/Select/Select";
import { STATUS_COMPUTE } from "@/constants/projectConstants";
import {
  TComputeSupply,
} from "@/hooks/computes/useGetListComputeMarketplace";
import { useApi } from "@/providers/ApiProvider";
import { useBooleanLoader } from "@/providers/LoaderProvider";
import EmptyComputesSupplier from "../EmptyComputesSupplier";
import ComputeItem from "./ComputeItem/Index";
import "./Index.scss";

type ComputesSupplierMainProps = {
  showBtnAdd?: boolean;
  data: TComputeSupply[] | undefined;
  loading: boolean;
  refetch: () => Promise<void>;
};

const pageSize = 10;

const ComputesSupplierMain = (props: ComputesSupplierMainProps) => {
  const { showBtnAdd = true, data, loading, refetch } = props;
  const navigate = useNavigate();

  useBooleanLoader(loading, "Loading list supply...");
  const api = useApi();

  const deleteCompute = (dataRow: TComputeSupply) => {
    confirmDialog({
      message: "Are you sure you want to delete this compute supplier?",
      onSubmit: async () => {
        const isCannotDelete = dataRow?.compute_gpus?.some(
          (c) => c.being_rented === true
        );
        if (isCannotDelete) {
          infoDialog({
            message: "Cannot delete compute because this compute is rented.",
          });
          return;
        }
        const ar = api.call("deleteCompute", {
          params: { id: dataRow.id.toString() },
        });
        const res = await ar.promise;

        if (res.ok) {
          refetch();
        } else {
          const data = await res.json();
          if (Object.hasOwn(data, "detail")) {
            infoDialog({ message: "Server error: " + data["detail"] });
          } else {
            infoDialog({
              message:
                "An error ocurred while delete compute supplier (" +
                res.statusText +
                "). Please try again!",
            });
          }
          return;
        }
      },
    });
  };

  return (data ?? []).length ? (
    <div className="p-computes-supplier">
      <div className="p-computes-supplier__header">
        {/* <div className="p-computes-supplier__block__left">
          <div className="p-computes-supplier__block__input">
            <IconSearch className="p-computes-supplier__block__float-icon" />
            <InputBase placeholder="Search asset" />
          </div>
          <div className="p-computes-supplier__block">
            <IconClock /> <span>Total hrs served: </span>482 hrs
          </div>
          <div className="p-computes-supplier__block">
            <IconDollar /> <span>Total earnings: </span>234$
          </div>
        </div> */}

        <div className="p-computes-supplier__actions">
          <div className="p-computes-supplier__select_wrapper">
            <Select
              className="p-computes-supplier__select"
              classNameWidth="computes-supplier__select--auto"
              placeholderText="Status"
              data={STATUS_COMPUTE}
              onChange={(val) => { }}
              iconWithLabel={<IconTypeSolid />}
            />
          </div>
          {/* {showBtnAdd && (
            <Button
              type="primary"
              iconPosition="right"
              icon={<IconCirclePlus />}
              onClick={() => navigate("/computes-supplier/add")}
            >
              Add New Compute
            </Button>
          )} */}
        </div>
      </div>
      <div className="computes-list">
        {
          data?.map((cp, idx) => {
            return (
              <ComputeItem
                cp={cp as any}
                id={cp.id}
                owner_id={cp.owner_id}
                service_type={cp.compute_type}
                onDelete={deleteCompute}
                remaining={cp.remaining}
                onEdit={(id) => navigate(`/computes-supplier/${id}`)}
                config={cp.config}
                ip={cp.ip_address}
              />
            );
          })
        }
      </div>

      {/* <Table
        className="computes-list"
        columns={[
          {
            label: "Sr Number",
            align: "CENTER",
            renderer: (_dataRow: TComputeSupply, idx) => (
              <span>{(idx ?? 0) + 1}</span>
            ),
          },
          {
            label: "IP Port",
            noWrap: true,
            renderer: (dataRow: TComputeSupply) => (
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(
                    `http://${dataRow.ip_address}:${dataRow.port}`,
                    ""
                  );
                }}
              >
                {dataRow.ip_address}
              </a>
            ),
          },
          {
            label: "Compute ID",
            noWrap: true,
            renderer: (dataRow: TComputeSupply) => (
              <span>{dataRow.id ? dataRow.id : "-"}</span>
            ),
          },
          {
            label: "Compute Info",
            noWrap: true,
            renderer: (dataRow: TComputeSupply) => {
              try {
                const config =
                  typeof dataRow.config === "object"
                    ? dataRow.config
                    : JSON.parse(dataRow.config);
                return (
                  <div className="computes-list__multiple-row">
                    <div className="compose-row">
                      <span className="computes-list__model">
                        {dataRow.is_using_cpu ? "CPU" : "NVIDIA"}
                      </span>
                      <div className="computes-list__multiple-row">
                        <span className="subtitle">{`Os : ${config.os ?? "NA"
                          }`}</span>
                        <span className="subtitle">
                          {`Ram : ${formatRAM(config.ram ?? 0)}`}
                        </span>
                        <span className="subtitle">
                          {`Disk : ${config.diskType} ${formatRAM(
                            config.disk ?? 0
                          )}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              } catch (error) {
                return <span>NA</span>;
              }
            },
          },
          {
            label: "Price Unit",
            noWrap: true,
            renderer: (dataRow: TComputeSupply) => {
              const price = dataRow.is_using_cpu
                ? dataRow.cpu_price?.price
                : dataRow.compute_gpus[0]?.prices[0]?.price;
              return <span>{`${price ? "$" + price + "/hr" : "NA"}`}</span>;
            },
          },
          {
            label: "Availability",
            align: "CENTER",
            noWrap: true,
            renderer: (_dataRow: TComputeSupply) => (
              <button className="c-table__action">
                <IconCalendar />
              </button>
            ),
          },
          {
            label: "Total hrs served",
            noWrap: true,
            renderer: (_dataRow: TComputeSupply) => <span>12 days 48 m</span>,
          },
          {
            label: "Total hrs earnings",
            noWrap: true,
            renderer: (_dataRow: TComputeSupply) => <span>482</span>,
          },
          {
            label: "Status",
            renderer: (dataRow: TComputeSupply) => (
              <span
                className={`computes-list__status ${dataRow.status === "rented_bought" ||
                  dataRow.status === "in_marketplace"
                  ? "available"
                  : dataRow.status === "pending"
                    ? "used"
                    : "pause"
                  }`}
              >
                {dataRow.status === "rented_bought" ||
                  dataRow.status === "in_marketplace"
                  ? "Available"
                  : dataRow.status === "pending"
                    ? "In Use"
                    : "Paused"}
              </span>
            ),
          },
          {
            label: "Actions",
            align: "LEFT",
            noWrap: true,
            renderer: (dataRow: TComputeSupply) => (
              <TableActions
                actions={[
                  {
                    icon: "EDIT",
                    onClick: () => navigate(`/computes-supplier/${dataRow.id}`),
                  },
                  {
                    icon: "DELETE",
                    onClick: () => deleteCompute(dataRow),
                  },
                ]}
              />
            ),
          },
        ]}
        data={listData?.results ?? []}
      /> */}
      {/* <Pagination
        page={Number(currentPage ?? 1)}
        pageSize={pageSize}
        total={count}
        setPage={setPage}
        target="computes-supplier"
      /> */}
    </div>
  ) : (
    <EmptyComputesSupplier />
  );
};

export default ComputesSupplierMain;
