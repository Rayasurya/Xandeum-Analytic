// @flow

import React, { useState, memo, useCallback } from "react"
import Paper from "@mui/material/Paper"
import { makeStyles } from "@mui/styles"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import ExpandIcon from "../CustomIcon/IconExpandArrow"
import IconButton from "@mui/material/IconButton"
import Collapse from "@mui/material/Collapse"
import { grey } from "@mui/material/colors"
import classnames from "classnames"
import useEventCallback from "use-event-callback"
import Typography from "@mui/material/Typography"
import { useIconDictionary } from "../icon-dictionary.js"
import ResizePanel from "@seveibar/react-resize-panel"

import MUI_THEME from "../utils/muiTheme";
const theme = MUI_THEME;
const useStyles = makeStyles((theme) => ({
  container: {
    // borderBottom: "dashed 1px #dedeec",
    //"&:first-child": { borderTop: `1px solid ${grey[400]}` },
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "4px 16px",
    "& .iconContainer": {
      color: "#40405B",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "& .MuiSvgIcon-root": {
        width: 16,
        height: 16,
        color: "#40405B !important",
      },
    },
  },
  title: {
    fontSize: 11,
    flexGrow: 1,
    fontWeight: 800,
    paddingLeft: 0,
    color: "#40405B",
    marginBottom: "0 !important",
    "& span": {
      color: "#40405B",
      fontSize: 11,
    },
  },
  expandButton: {
    padding: "0 !important",
    width: 24,
    height: 24,
    "& .icon": {
      width: 15,
      height: 15,
      transition: "500ms transform",
      color: "#40405B",
      transform: "rotate(180deg)",
      "&.expanded": {
        transform: "rotate(90deg)",
      },
    },
  },
  expandedContent: {
    maxHeight: 300,
    overflowY: "auto",
    "&.noScroll": {
      overflowY: "visible",
      overflow: "visible",
      maxHeight: "initial",
    },
  },
  panelBase: {
    borderBottom: "dashed 1px #dedeec",
  },
}))

const getExpandedFromLocalStorage = (title) => {
  try {
    return JSON.parse(
      window.localStorage[`__REACT_WORKSPACE_SIDEBAR_EXPANDED_${title}`]
    )
  } catch (e) {
    return false
  }
}
const setExpandedInLocalStorage = (title, expanded) => {
  window.localStorage[`__REACT_WORKSPACE_SIDEBAR_EXPANDED_${title}`] =
    JSON.stringify(expanded)
}

export const SidebarBox = ({
  icon,
  title,
  subTitle,
  children,
  noScroll = false,
  expandedByDefault,
  expandable = true,
  actionIcon,
  onActionClick,
  className,
  actionIconClass,
}) => {
  const classes = useStyles()
  const content = (
    <div
      className={classnames(classes.expandedContent, noScroll && "noScroll")}
    >
      {children}
    </div>
  )

  // const [expanded, changeExpandedState] = useState(
  //   getExpandedFromLocalStorage(title)
  // )
  const [expanded, changeExpandedState] = useState(expandedByDefault)
  const changeExpanded = useCallback(
    (expanded) => {
      changeExpandedState(expanded)
      setExpandedInLocalStorage(title, expanded)
    },
    [changeExpandedState, title]
  )

  const toggleExpanded = useEventCallback(() => changeExpanded(!expanded))
  const customIconMapping = useIconDictionary()
  const TitleIcon = customIconMapping[title.toLowerCase()]
  return (
    <ThemeProvider theme={theme}>
      <div className={classes.container}>
        <div className={classnames(classes.header, className)}>
          {icon && (
            <div className="iconContainer">
              {icon || <TitleIcon className={classes.titleIcon} />}
            </div>
          )}
          <Typography className={classes.title}>
            {title} <span>{subTitle}</span>
          </Typography>
          {expandable && (
            <IconButton
              onClick={toggleExpanded}
              className={classes.expandButton}
            >
              <ExpandIcon
                className={classnames("icon", expanded && "expanded")}
              />
            </IconButton>
          )}
          {actionIcon && (
            <IconButton
              onClick={onActionClick}
              className={actionIconClass ?? classes.expandButton}
            >
              {actionIcon}
            </IconButton>
          )}
        </div>
        {noScroll ? (
          expanded ? (
            content
          ) : null
        ) : (
          <Collapse in={expanded}>
            {/* <ResizePanel direction="s" style={{ height: 200 }}> */}
            <div
              className={classnames(classes.panelBase, "panel")}
              style={{ display: "block", overflow: "hidden", minHeight: 300 }}
            >
              {content}
            </div>
            {/* </ResizePanel> */}
          </Collapse>
        )}
      </div>
    </ThemeProvider>
  )
}

export default memo(
  SidebarBox,
  (prev, next) => prev.title === next.title && prev.children === next.children
)
