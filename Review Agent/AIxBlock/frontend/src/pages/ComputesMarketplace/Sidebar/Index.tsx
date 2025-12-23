import { memo, useEffect, useMemo, useState } from "react";
import IconSearch from "@/assets/icons/iconSearch";
import InputBase from "@/components/InputBase/InputBase";
import { useGetListCatalog } from "@/hooks/computes/useGetListCatalog";
import { useUserLayout } from "@/layouts/UserLayout";
import "./Index.scss";
import FilterOption from "../FilterOption/Index";
import Checkbox from "@/components/Checkbox/Checkbox";

const CPU_OPTIONS = [
  {
    label: "CPU Type",
    options: [
      { label: "ALL", value: "all" },
      { label: "Intel", value: "intel" },
      { label: "AMD", value: "amd" },
      { label: "ARM", value: "arm" },
    ],
  },
];

const RAM_OPTIONS = [
  {
    label: "RAM Capacity",
    options: [
      { label: "ALL", value: "all" },
      { label: "8GB", value: "8gb" },
      { label: "16GB", value: "16gb" },
      { label: "32GB", value: "32gb" },
      { label: "64GB", value: "64gb" },
    ],
  },
];

const DISK_OPTIONS = [
  {
    label: "Disk Type",
    options: [
      { label: "ALL", value: "all" },
      { label: "HDD", value: "hdd" },
      { label: "SSD", value: "ssd" },
      { label: "NVMe", value: "nvme" },
    ],
  },
];

const TYPE_MODEL = {
  label: "",
  options: [
    { label: "LABEL TOOL", value: "LABEL-TOOL" },
    { label: "STORAGE", value: "STORAGE" },
    { label: "JUPYTER NOTEBOOK", value: "JUPYTER-NOTEBOOK" },
    { label: "GPU", value: "GPU" },
  ],
};

const MemoizedSidebarMarketplace = (props?: {
  onSearchFilter: (e: any) => void;
  onCatalogFilter: (e: any) => void;
  onTypeFilter: (e: any) => void;
  onClearFilter: (e: any) => void;
}) => {
  const userLayout = useUserLayout();
  const [keySearch] = useState<string>("all");
  const { listData, loading, error } = useGetListCatalog({ type: "compute" });
  const [selectedCPUs, setSelectedCPUs] = useState<string[]>([]);
  const [selectedRAMs, setSelectedRAMs] = useState<string[]>([]);
  const [selectedDisks, setSelectedDisks] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const handleCPUChange = (value: string) => {
    const updatedCPUs = selectedCPUs.includes(value)
      ? selectedCPUs.filter(cpu => cpu !== value)
      : [...selectedCPUs, value];
    setSelectedCPUs(updatedCPUs);
    // Xử lý logic khi chọn các giá trị CPU
  };

  const handleRAMChange = (value: string) => {
    const updatedRAMs = selectedRAMs.includes(value)
      ? selectedRAMs.filter(ram => ram !== value)
      : [...selectedRAMs, value];
    setSelectedRAMs(updatedRAMs);
    // Xử lý logic khi chọn các giá trị RAM
  };

  const handleDiskChange = (value: string) => {
    const updatedDisks = selectedDisks.includes(value)
      ? selectedDisks.filter(disk => disk !== value)
      : [...selectedDisks, value];
    setSelectedDisks(updatedDisks);
    // Xử lý logic khi chọn các giá trị Disk
  };

  const handleTypeChange = (value: string) => {
    const updatedTypes = selectedTypes.includes(value)
      ? selectedTypes.filter(type => type !== value)
      : [...selectedTypes, value];
    setSelectedTypes(updatedTypes);
    // Xử lý logic khi chọn các loại TYPE
  };
  const options = useMemo(() => {
    const result: any = {};
    listData?.map((j: any) => {
      if (!result[j.tag]) {
        result[j.tag] = [];
      }
      result[j.tag].push({ field: j.name, val: j.id });
      return j;
    });
    const data = Object.keys(result).map((tag) => ({
      label: tag,
      options: result[tag],
    }));
    return data;
  }, [listData]);

  function onSelect(val: any) {
    props?.onCatalogFilter(val);
  }

  useEffect(() => {
    userLayout.setBreadcrumbs([{ label: "Computes Catalog" }]);
    return () => {
      userLayout.clearBreadcrumbs();
    };
  }, [userLayout]);

  const handleFilterSearch = (val: any) => {
    props?.onSearchFilter(val);
  };

  // const handleFilterType = (val: any) => {
  //   props?.onTypeFilter(val);
  // };

  const handleClearFilter = (val: any) => {
    props?.onClearFilter(val);
  };

  return (
    <div className="c-sidebar-mkp">
      {error && <div>{error}</div>}
      {loading && <div>Loading...</div>}
      <div className="c-sidebar-mkp__filters">
        {/* <Select
          className="c-sidebar-mkp__all custom-filter"
          data={FILTER_ALL}
          defaultValue={FILTER_ALL[0].options[0]}
          onChange={(val) => {
            setkeySearch(val.value);
          }}
        /> */}
        <button className=" custom-clear" onClick={handleClearFilter}>
          CLEAR
        </button>
        <div className="c-sidebar-mkp__search">
          <form action="">
            <button>
              <IconSearch />
            </button>
            <InputBase
              className="c-sidebar-mkp__search-input"
              allowClear={false}
              onChange={(val) => {
                handleFilterSearch({ [keySearch]: val.target.value });
              }}
            />
          </form>
        </div>
      </div>
      {options.length > 0 && (
        <div className="c-sidebar-mkp__options">
          {(options ?? []).map((item, index) => (
            <FilterOption
              key={`key-${index}`}
              options={item.options}
              label={item.label}
              onSelect={(val) => onSelect({ catalog_id: val.val })}
            />
          ))}
        </div>
      )}
      <div className="c-filter-opt">
        <label>TYPE</label>
        <div className="c-filter-opt__content">
          {TYPE_MODEL.options.map((option, index) => (
            <Checkbox
              key={`type-checkbox-${index}`}
              label={option.label}
              checked={selectedTypes.includes(option.value)}
              onChange={() => handleTypeChange(option.value)}
            />
          ))}
        </div>
      </div>
      <div className="c-filter-opt">
        <label>CPU</label>
        <div className="c-filter-opt__content">
          {CPU_OPTIONS[0].options.map((option, index) => (
            <Checkbox
              key={`cpu-checkbox-${index}`}
              label={option.label}
              checked={selectedCPUs.includes(option.value)}
              onChange={() => handleCPUChange(option.value)}
            />
          ))}
        </div>
      </div>

      <div className="c-filter-opt">
        <label>RAM</label>
        <div className="c-filter-opt__content">
          {RAM_OPTIONS[0].options.map((option, index) => (
            <Checkbox
              key={`ram-checkbox-${index}`}
              label={option.label}
              checked={selectedRAMs.includes(option.value)}
              onChange={() => handleRAMChange(option.value)}
            />
          ))}
        </div>
      </div>

      <div className="c-filter-opt">
        <label>DISK</label>
        <div className="c-filter-opt__content">
          {DISK_OPTIONS[0].options.map((option, index) => (
            <Checkbox
              key={`disk-checkbox-${index}`}
              label={option.label}
              checked={selectedDisks.includes(option.value)}
              onChange={() => handleDiskChange(option.value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const SidebarMarketplace = memo(MemoizedSidebarMarketplace);

export default SidebarMarketplace;
