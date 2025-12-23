import React from "react";
import { Dropdown } from "antd";
import { observer } from "mobx-react";

import "./Entities.scss";
import { Pagination } from "../../common/Pagination/Pagination";
import { RegionTree } from "./RegionTree";
import { LabelList } from "./LabelList";
import { SortMenu, SortMenuIcon } from "./SortMenu";
import { Oneof } from "../../common/Oneof/Oneof";
import { Space } from "../../common/Space/Space";
import { Block, Elem } from "../../utils/bem";
import { RadioGroup } from "../../common/RadioGroup/RadioGroup";
import "./Entities.styl";
import { Button } from "../../common/Button/Button";
import { LsInvisible, LsTrash, LsVisible } from "../../assets/icons";
import { confirm } from "../../common/Modal/Modal";
import { Tooltip } from "../../common/Tooltip/Tooltip";

export default observer(({
  regionStore,
  annotation,
}) => {
  const { classifications, regions, view } = regionStore;
  const count = regions.length + (view === "regions" ? classifications.length : 0);
  const toggleVisibility = e => {
    e.preventDefault();
    e.stopPropagation();
    regionStore.toggleVisibility();
  };

  return (
    <Block name="entities">
      <Elem name="source">
        <Space spread>
          <RadioGroup
            size="small"
            value={view}
            style={{ width: 228 }}
            onChange={e => {
              regionStore.setView(e.target.value);
            }}
          >
            <RadioGroup.Button value="regions">Regions{count ?
              <Elem name="counter">&nbsp;{count}</Elem> : null}</RadioGroup.Button>
            <RadioGroup.Button value="labels">Labels</RadioGroup.Button>
          </RadioGroup>

          {annotation.editable && !annotation.readonly && (
            <Tooltip title="Delete All Regions">
              <Button
                look="danger"
                type="text"
                aria-label="Delete All Regions"
                icon={<LsTrash />}
                style={{
                  height: 36,
                  width: 36,
                  padding: 0,
                }}
                onClick={() => {
                  confirm({
                    title: "Removing all regions",
                    body: "Do you want to delete all annotated regions?",
                    buttonLook: "destructive",
                    onOk: () => annotation.deleteAllRegions(),
                  });
                }} />
            </Tooltip>
          )}
        </Space>
      </Elem>

      {count ? (
        <Elem name="header">
          <Space spread align={view === "regions" ? null : "end"}>
            {view === "regions" && (
              <Dropdown overlay={<SortMenu regionStore={regionStore} />} placement="bottomLeft">
                <Elem name="sort" onClick={e => e.preventDefault()}>
                  <Elem name="sort-icon"><SortMenuIcon
                    sortKey={regionStore.sort} /></Elem> {`Sorted by ${regionStore.sort[0].toUpperCase()}${regionStore.sort.slice(1)}`}
                </Elem>
              </Dropdown>
            )}

            <Space size="small" align="end">
              {regions.length > 0 ? (
                <Elem
                  name="visibility"
                  tag={Button}
                  size="small"
                  type="link"
                  style={{ padding: 0 }}
                  onClick={toggleVisibility}
                  mod={{ hidden: regionStore.isAllHidden }}
                >{regionStore.isAllHidden ? <LsInvisible /> : <LsVisible />}</Elem>
              ) : null}


            </Space>
          </Space>
        </Elem>
      ) : null}

      <div style={{ marginBottom: 8 }}>
        <Pagination
          size="small"
          currentPage={regionStore.page}
          pageSize={regionStore.pageSize}
          totalPages={regionStore.pageCount}
          pageSizeSelectable={true}
          pageSizeOptions={[10, 25, 50, 100, 150, 200, 250, 500, 1000, 2500]}
          onChange={(p, ps) => {
            regionStore.setPage(p);
            ps && regionStore.setPageSize(parseInt(ps));
          }}
        />
      </div>

      <Oneof value={view}>
        <Elem name="regions" case="regions">
          {count ? <RegionTree regionStore={regionStore} /> : <Elem name="empty">No Regions created yet</Elem>}
        </Elem>
        <Elem name="labels" case="labels">
          {count ? <LabelList regionStore={regionStore} /> : <Elem name="empty">No Labeled Regions created yet</Elem>}
        </Elem>
      </Oneof>
    </Block>
  );
});
