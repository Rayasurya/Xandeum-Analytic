import React from "react";
import {IconArrowDown} from "@/assets/icons/Index";
import "./List.scss";

type TTModelTreeNode = {
  id: string,
  title: string,
  items: TTModelTreeNode[],
}

function TreeNode(props: {
  isCollapsible?: boolean,
  isExpanded?: boolean,
  depth: number,
  title?: string,
  onClick?: () => void
}) {
  const listOnClick = props.onClick;

  const classes = React.useMemo(() => {
    const list = [props.depth === 0 ? "c-list__title" : "c-list__items"];

    if (props.isExpanded) {
      list.push("c-list--expand");
    }

    if (props.isCollapsible) {
      list.push("c-list--collapsible");
    }

    return list.join(" ");
  }, [props.isCollapsible, props.isExpanded, props.depth]);

  const title = React.useMemo(() => {
    if (!props.title) {
      return null;
    }

    let icon = null;

    if (props.isCollapsible) {
      icon = <IconArrowDown />;
    }

    return (
      <div 
        className={classes} 
        onClick={() => {
          listOnClick && listOnClick();
        }}
        style={{ marginLeft: props.depth * 24 }}
        >
        {props.title}
        <div>
          {icon}
        </div>
      </div>
    );
  }, [props.isCollapsible, props.title, listOnClick, classes, props.depth]);

  return (
    title
  );
}

export default function Tree(props: {
  className?: string,
  items: TTModelTreeNode[],
  title?: string,
  onClick?: (id: string) => void
}) {
  const [expandedNodes, setExpandedNodes] = React.useState<{[key: string]: boolean}>({});

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prevState) => ({
      ...prevState,
      [nodeId]: !prevState[nodeId],
    }));
  };
  const TreeNodeOnClick = props.onClick;

  const renderTree = (treeData: TTModelTreeNode[], depth: number) => {
    return treeData.map((node) => (
      <div key={node.id}>
        <TreeNode
          isExpanded={expandedNodes[node.id]}
          isCollapsible={node.items.length > 0}
          title={node.title}
          depth={depth}
          onClick={() => {
            toggleNode(node.id);
            TreeNodeOnClick && TreeNodeOnClick(node.id);
          }}
        />
        {expandedNodes[node.id] && node.items && renderTree(node.items, depth + 1)}
      </div>
      ))
    };

  return (
    <div>
      {renderTree(props.items, 0)}
    </div>
  );
}
