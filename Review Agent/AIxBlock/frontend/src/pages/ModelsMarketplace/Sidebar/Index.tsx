import { memo, useEffect, useMemo, useState } from "react";
import IconSearch from "@/assets/icons/iconSearch";
import InputBase from "@/components/InputBase/InputBase";
import { useGetListCatalog } from "@/hooks/computes/useGetListCatalog";
import { useUserLayout } from "@/layouts/UserLayout";
import FilterOption from "../FilterOption/Index";
import "./Index.scss";



const MemoizedSidebarMarketplace = (props?: {
  onSearchFilter: (e: any) => void;
  onCatalogFilter: (e: any) => void;
  onClearFilter: (e: any) => void;
}) => {
  const userLayout = useUserLayout();
  const [keySearch] = useState<string>("all");
  const { listData, loading, error } = useGetListCatalog({ type: "model" });
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
    userLayout.setBreadcrumbs([{ label: "Model catalog" }]);
    return () => {
      userLayout.clearBreadcrumbs();
      userLayout.clearBreadcrumbs();
    };
  }, [userLayout]);

  const handleFilterSearch = (val: any) => {
    props?.onSearchFilter(val);
  };

  

  const handleClearFilter = (val: any)=> {
    props?.onClearFilter(val);
  }

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
            setKeySearch(val.value);
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
    </div>
  );
};

const SidebarMarketplace = memo(MemoizedSidebarMarketplace);

export default SidebarMarketplace;
