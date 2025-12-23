// @flow

import {contrastColor} from "contrast-color";
import React, {useState, memo, useMemo, useCallback} from "react"
import SidebarBoxContainer from "../SidebarBoxContainer"
import { makeStyles } from "@mui/styles"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { styled } from "@mui/material/styles"
import TrashIcon from "../CustomIcon/IconTrashBin"
import VisibleIcon from "../CustomIcon/IconVisibility"
import VisibleOffIcon from "../CustomIcon/IconVisibilityOff"
import ExpandMore from "../CustomIcon/IconExpandArrow"
import styles from "./styles"
import classnames from "classnames"
import isEqual from "lodash/isEqual"
import { filter, get, groupBy } from "lodash"
import { Box, Collapse, IconButton, Input, TextField } from "@mui/material"
import { SearchOutlined } from "@mui/icons-material"

import MUI_THEME from "../utils/muiTheme";
const theme = MUI_THEME;
const useStyles = makeStyles((theme) => styles)

const HeaderSep = styled("div")(({ theme }) => ({
  borderTop: `1px solid rgba(0,0,0,.1)`,
  marginTop: 2,
  marginBottom: 2,
}))

const Chip = ({ color, text }) => {
  const classes = useStyles()
  return (
    <span className={classes.chip} style={{ backgroundColor: color }}>
      <div className="color" />
      <div className="text" style={{ color: contrastColor({bgColor: color}) }}>{text}</div>
    </span>
  )
}

const ChildChip = ({ color, text, index }) => {
  const classes = useStyles()
  return (
		<span className={classes.childChip}>
      <div className="child-text">#{index + 1}</div>
      <div className="child-color" style={{ backgroundColor: color }} />
      <div className="child-text">{text}</div>
    </span>
  )
}

const RowLayout = ({
  header,
  highlighted,
  order,
  classification,
  area,
  tags,
  trash,
  lock,
  visible,
  onClick,
  expandable,
  expanded,
  toggleExpanded,
}) => {
  const classes = useStyles()
  // const [mouseOver, changeMouseOver] = useState(false)
  return (
    <div
      // onMouseEnter={() => changeMouseOver(true)}
      // onMouseLeave={() => changeMouseOver(false)}
      className={classnames(classes.row, { header, highlighted })}
    >
      {expandable && (
        <IconButton onClick={toggleExpanded} className={classes.expandButton}>
          <ExpandMore className={classnames("icon", expanded && "expanded")} />
        </IconButton>
      )}
      <div
        onClick={onClick}
        className={classes.tagWrapper}
        {...(!classification && { style: { color: "#40405b" } })}
      >
        {classification ?? order}
      </div>
      <div className={"action"}>
        {trash}
        {lock}
        {visible}
      </div>
    </div>
  )
}

const Row = ({
  region: r,
  highlighted,
  onSelectRegion,
  onDeleteRegion,
  onChangeRegion,
  visible,
  locked,
  color,
  cls,
  index,
}) => {
  return (
    <RowLayout
      header={false}
      expandable={false}
      expanded={false}
      toggleExpanded={null}
      highlighted={highlighted}
      onClick={() => onSelectRegion(r)}
      order={`#${index + 1}`}
      classification={
        <ChildChip index={index} text={cls || <em>(no label)</em>} color={color || "#ddd"} />
      }
      area=""
      trash={
        <IconButton onClick={() => onDeleteRegion(r)} className="action-button">
          <TrashIcon className="icon" />
        </IconButton>
      }
      lock={null}
      visible={
        r?.visible || r?.visible === undefined ? (
          <IconButton
            onClick={() => {
              onChangeRegion({ ...r, visible: false })
            }}
            className="action-button"
          >
            <VisibleIcon className="icon2" />
          </IconButton>
        ) : (
          <IconButton
            onClick={() => {
              onChangeRegion({ ...r, visible: true })
            }}
            className="action-button"
          >
            <VisibleOffIcon className="icon2" />
          </IconButton>
        )
      }
    />
  )
}

const MemoRow = memo(
  Row,
  (prevProps, nextProps) =>
    prevProps?.highlighted === nextProps?.highlighted &&
    prevProps?.visible === nextProps?.visible &&
    prevProps?.locked === nextProps?.locked &&
    prevProps?.id === nextProps?.id &&
    prevProps?.index === nextProps?.index &&
    prevProps?.cls === nextProps?.cls &&
    prevProps?.color === nextProps?.color &&
    prevProps?.expandable === nextProps?.expandable &&
    prevProps?.expanded === nextProps?.expanded &&
    prevProps?.onExpand === nextProps?.onExpand &&
    prevProps?.child === nextProps?.child
)

const Group = ({
  group,
  highlighted,
  onSelectRegion,
  onDeleteRegion,
  onChangeRegion,
  toggleExpanded,
  visible = true,
  locked = false,
  color,
  cls,
  index,
  expandable,
  expanded,
  child,
  onChildSelect,
  onChildDelete,
  onChildChange,
  selectedRegionId,
}) => {
  const [isExpand, setIsExpand] = useState(expanded)

  const handleToggleExpand = useCallback(() => {
    const nextExpand = !isExpand
    toggleExpanded(nextExpand)
    setIsExpand(nextExpand)
  }, [expanded, toggleExpanded, setIsExpand, isExpand])

  const classes = useStyles()
  return (
    <div className={classes.groupWrapper}>
      <RowLayout
        header={false}
        expandable={expandable}
        expanded={isExpand}
        toggleExpanded={handleToggleExpand}
        highlighted={highlighted}
        onClick={() => onSelectRegion(group)}
        order={`#${index + 1}`}
        classification={<Chip text={cls || <em>(no label)</em>} color={color || "#ddd"} />}
        area=""
        trash={
          <IconButton
            onClick={() => onDeleteRegion(group)}
            className="action-button"
          >
            <TrashIcon className="icon" />
          </IconButton>
        }
        lock={null}
        visible={
          visible ? (
            <IconButton
              onClick={() => onChangeRegion({ ...group, visible: false })}
              className="action-button"
            >
              <VisibleIcon className="icon2" />
            </IconButton>
          ) : (
            <IconButton
              onClick={() => onChangeRegion({ ...group, visible: true })}
              className="action-button"
            >
              <VisibleOffIcon className="icon2" />
            </IconButton>
          )
        }
      />
      <Collapse in={isExpand}>
        <div className={classes.childContainer}>
          {child.map((r, i) => (
            <MemoRow
              key={r?.id ?? "region-selector-sidebar-box-" + i}
              {...r}
              region={r}
              index={i}
              onSelectRegion={onChildSelect}
              onDeleteRegion={onChildDelete}
              onChangeRegion={onChildChange}
              highlighted={r?.id === selectedRegionId}
            />
          ))}
        </div>
      </Collapse>
    </div>
  )
}

const MemoGroup = memo(
  Group,
  (prevProps, nextProps) =>
    prevProps?.highlighted === nextProps?.highlighted &&
    prevProps?.visible === nextProps?.visible &&
    prevProps?.locked === nextProps?.locked &&
    prevProps?.id === nextProps?.id &&
    prevProps?.index === nextProps?.index &&
    prevProps?.cls === nextProps?.cls &&
    prevProps?.color === nextProps?.color &&
    prevProps?.expandable === nextProps?.expandable &&
    prevProps?.expanded === nextProps?.expanded &&
    prevProps?.toggleExpanded === nextProps?.toggleExpanded &&
    prevProps?.child === nextProps?.child &&
    prevProps?.onChildSelect === nextProps?.onChildSelect &&
    prevProps?.onChildDelete === nextProps?.onChildDelete &&
    prevProps?.onChildChange === nextProps?.onChildChange &&
    prevProps?.selectedRegionId === nextProps?.selectedRegionId
)

const emptyArr = []

export const AllAnnotationBox = ({
  regions = emptyArr,
  regionVisible = true,
  onDeleteRegion,
  onChangeRegion,
  onSelectRegion,
  onChangeAllRegion,
  onDeleteRegionGroup,
  onChangeRegionGroup,
}) => {
  const [searchText, setSearchText] = useState("")
  const groupLabel = useMemo(() => {
    const groupObject = groupBy(
      filter(
        regions,
        (region) =>
          region.cls?.indexOf(searchText) !== -1
      ),
      "cls"
    )
    return Object.values(groupObject).map((group) => {
      return {
        cls: get(group, "0.cls"),
        color: get(group, "0.color"),
        locked: filter(group, (g) => g.locked).length !== 0,
        visible: filter(group, (g) => g.visible ?? true).length !== 0,
        child: group,
      }
    })
  }, [regions, searchText])

  const selectedRegionId = useMemo(() => {
    return regions.find(r => r?.highlighted)?.id;
  }, [regions]);

  const handleSearchTextChange = useCallback(
    (e) => {
      setSearchText(e.target?.value ?? "")
    },
    [searchText]
  )

  const classes = useStyles()
  return (
    <ThemeProvider theme={theme}>
      <SidebarBoxContainer
        title={`All Annotations (${regions.length ?? 0})`}
        subTitle=""
        expandedByDefault={true}
        expandable={false}
        className={classes.header}
        actionIconClass={classes.customIcon}
        actionIcon={
          regionVisible ? (
            <VisibleIcon className="icon2" />
          ) : (
            <VisibleOffIcon className="icon2" />
          )
        }
        onActionClick={onChangeAllRegion}
      >
        <div className={classes.container}>
          <Box className="search-box" sx={{}}>
            <SearchOutlined className="icon" />
            <TextField
              placeholder={"Find Something"}
              variant={"outlined"}
              onChange={handleSearchTextChange}
            />
          </Box>
          <Box>
            {groupLabel.map((group, index) => (
              <MemoGroup
                key={"region-group-box-" + index}
                {...{
                  group: group,
                  highlighted: false,
                  expandable: true,
                  expanded: false,
                  onChangeRegion: onChangeRegionGroup,
                  onDeleteRegion: onDeleteRegionGroup,
                  onSelectRegion: () => {},
                  toggleExpanded: () => {},
                  visible: group.visible,
                  locked: group.locked,
                  color: group.color,
                  cls: group.cls,
                  index: index,
                  child: group.child,
                  onChildSelect: onSelectRegion,
                  onChildDelete: onDeleteRegion,
                  onChildChange: onChangeRegion,
                  selectedRegionId,
                }}
              />
            ))}
          </Box>
        </div>
      </SidebarBoxContainer>
    </ThemeProvider>
  )
}

const mapUsedRegionProperties = (r) => [
  r?.id,
  r?.color,
  r?.locked,
  r?.visible,
  r?.highlighted,
]

export default memo(AllAnnotationBox, (prevProps, nextProps) =>
  isEqual(
    (prevProps.regions || emptyArr).map(mapUsedRegionProperties),
    (nextProps.regions || emptyArr).map(mapUsedRegionProperties)
  )
    && prevProps.regionVisible === nextProps.regionVisible
)
