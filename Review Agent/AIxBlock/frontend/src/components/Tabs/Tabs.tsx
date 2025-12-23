import React, { useEffect, useRef } from "react";
import {IconLockClosed, IconPlus, IconRefresh, IconThreeDot} from "@/assets/icons/Index";
import { TViewModel } from "@/models/view";
import DropdownItem, { TDropdownItem } from "../DropdownItem/DropdownItem";
import "./Tabs.scss";
import Dropdown2 from "../Dropdown2/Dropdown2";
import Spin from "../Spin/Spin";

type TTabsProps = {
  views: TViewModel[],
  loadingViews: boolean,
  currentView?: TViewModel | null,
  refresh: () => void,
  createView: () => void,
  switchView: (id: number) => void,
  closeView: (id: number) => void,
  renameView: (id: number) => void,
  duplicateView: (view: TViewModel) => void,
  makePublic: (view: TViewModel) => void,
  makePrivate: (view: TViewModel) => void,
};

const Tabs = ({views, loadingViews, currentView, createView, switchView, closeView, renameView, duplicateView, makePublic, makePrivate, refresh}: TTabsProps) => {
  const tabWrapperRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cEl = tabWrapperRef.current;
    const pEl = parentRef.current;

    if (cEl && pEl) {
      const childW = cEl.clientWidth;
      const parentW = pEl.clientWidth;

      if (childW >= parentW) {
        pEl.classList.add("scrollbar", "scrollbar-x");
      } else {
        pEl.classList.remove("scrollbar", "scrollbar-x");
      }
    }
  }, [views]);

  const renderDataTabItem = (v: TViewModel): TDropdownItem[] => {
    const actions: TDropdownItem[] = [
      {
        label: "Rename",
        handler: () => {
          document.dispatchEvent(new Event("mousedown"));
          setTimeout(() => renameView(v.id), 100);
        },
      },
      {
        label: "Duplicate",
        handler: () => {
          document.dispatchEvent(new Event("mousedown"));
          setTimeout(() => duplicateView(v), 100);
        },
      },
    ];

    if (v.is_private) {
      actions.push({
        label: "Make public",
        handler: () => {
          document.dispatchEvent(new Event("mousedown"));
          setTimeout(() => makePublic(v), 100);
        },
      });
    } else {
      actions.push({
        label: "Make private",
        handler: () => {
          document.dispatchEvent(new Event("mousedown"));
          setTimeout(() => makePrivate(v), 100);
        },
      });
    }

    const closeItem = {
      label: "Close",
      disabled: views.length <= 1,
      handler: (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        closeView(v.id);
      },
    };
    if (views.length > 1) {
      actions.push(closeItem);
    }
    return actions;
  };

  return (
    <div ref={parentRef} className="tab-parrent">
      <div ref={tabWrapperRef} className="tab-wrapper">
        <button
          disabled={loadingViews}
          className="tab-action--refresh"
          onClick={() => refresh()}
        >
          {loadingViews ? <Spin inline={true} loading={true} size="sm" /> : <IconRefresh/>}
        </button>
        {views.map((v, index) => (
          <div
            key={"view-" + v.id}
            className={`tab-item ${v.id === currentView?.id ? "active" : ""} ${v.id}`}
            onClick={() => switchView(v.id)}
          >
            <button
              className="tab-action--switch"
            >
              {v.data.title}
            </button>
            <span style={{marginLeft: -6, marginTop: 2}}>
              {v.is_private && <IconLockClosed/>}
            </span>
            <Dropdown2
              icon={<IconThreeDot/>}
              className="tab-action--more"
              arrow={true}
              placement={'bottom-start'}
            >
              <DropdownItem data={renderDataTabItem(v)}/>
            </Dropdown2>
          </div>
        ))}
        <button
          disabled={loadingViews}
          className="tab-action--create"
          onClick={() => createView()}
        >
          <IconPlus/>
        </button>
      </div>
    </div>
  );
};

export default Tabs;
