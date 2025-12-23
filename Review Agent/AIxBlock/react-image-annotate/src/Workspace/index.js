import {contrastColor} from "contrast-color";
import React, {useEffect, useMemo} from "react"
import { styled } from "@mui/styles"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import Header from "../Header"
import IconSidebar from "../IconSidebar"
import RightSidebar from "../RightSidebar"
import useDimensions from "../utils/use-dimensions"
import WorkContainer from "../WorkContainer"
import { IconDictionaryContext } from "../icon-dictionary.js"

const emptyAr = []
const emptyObj = {}
import MUI_THEME from "../utils/muiTheme";
const theme = MUI_THEME;

const Container = styled("div")(({}) => ({
  display: "flex",
  width: "100%",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
  maxWidth: "100vw",
}))
const SidebarsAndContent = styled("div")(({}) => ({
  display: "flex",
  flexGrow: 1,
  width: "100%",
  height: "calc(100vh - 300px)",
  overflow: "hidden",
  maxWidth: "100vw",
  background: "#fff",
}))

const LabelsContainer = styled("div")(({}) => ({
  position: "absolute",
  left: 16,
  top: 16,
  right: 16,
  zIndex: 4,
  height: 40,
  display: "flex",
  gap: 6,
  overflowX: "auto",
  paddingTop: 2,
  paddingRight: 2,
  paddingBottom: 4,
  paddingLeft: 2,
  "&::-webkit-scrollbar": {
    height: 8,
  },
  "&::-webkit-scrollbar-track": {
    borderRadius: 4,
    boxShadow: "inset 0 0 1px rgba(0,0,0,0.2)",
  },
  "&::-webkit-scrollbar-thumb": {
    borderRadius: 4,
    boxShadow: "inset 0 0 6px rgba(0,0,0,0.5)",
  },
}))

const Label = styled("div")(({}) => ({
  alignItems: "center",
  display: "inline-flex",
  padding: "4px 8px",
  color: "#ffffff",
  borderRadius: 8,
  cursor: "pointer",
  opacity: .5,
  transition: "linear opacity, border-color, border-width 250ms",
  fontSize: 11,
  whiteSpace: "nowrap",
  borderTop: "solid 1px transparent",
  borderLeft: "solid 1px transparent",
  borderRight: "solid 1px transparent",
  borderBottom: "solid 1px #000000",
  "&:hover, &.active": {
    opacity: 1,
    borderBottomWidth: 4,
  },
  "&:focus": {
    outline: "solid 2px rgba(255, 0, 0, .3)",
  },
}))

const Workspace = ({
  style = emptyObj,
  iconSidebarItems = emptyAr,
  selectedTools = ["select"],
  headerItems = emptyAr,
  rightSidebarItems = emptyAr,
  onClickHeaderItem,
  onClickIconSidebarItem,
  headerLeftSide = null,
  iconDictionary = emptyObj,
  rightSidebarExpanded,
  hideHeader = false,
  hideHeaderText = false,
  children,
  footer,
  // showTasks = true,
  isFullscreen = false,
  isExpand = false,
  regionClsList = [],
  clsColorsList = {},
  selectedCls = "",
  dispatch = () => void 0,
  regions = [],
  isLoadingImage = false,
  skeletonList = {},
}) => {
  const [sidebarAndContentRef, sidebarAndContent] = useDimensions()

  const selectedRegion = useMemo(() => {
    return regions.find(r => r.highlighted);
  }, [regions]);

  const highlightCls = useMemo(() => {
    if (typeof selectedRegion === "object" && typeof selectedRegion.cls === "string") {
      return selectedRegion.cls;
    }

    return selectedCls;
  }, [selectedCls, selectedRegion]);

  useEffect(() => {
    if (typeof selectedRegion !== "object" || typeof selectedRegion.cls !== "string") {
      return;
    }

    const ele = document.querySelector('[data-ria-label="' + selectedRegion.cls + '"]');

    if (ele) {
      ele.scrollIntoView({inline: "center"});
    }
  }, [selectedRegion]);

  const iconSidebar = useMemo(() => {
    if (iconSidebarItems.length === 0) {
      return null;
    }

    return (
      <IconSidebar
        onClickItem={onClickIconSidebarItem}
        selectedTools={selectedTools}
        items={iconSidebarItems}
        isLoadingImage={isLoadingImage}
      />
    );
  }, [isLoadingImage, iconSidebarItems, onClickIconSidebarItem, selectedTools]);

  const labels = useMemo(() => {
    let clsList = []

    if (selectedTools.includes("create-skeleton")) {
      clsList = regionClsList.filter((c) => c in skeletonList)
    } else {
      clsList =
        selectedRegion?.type === "skeleton"
          ? regionClsList.filter((c) => c === selectedRegion.cls)
          : regionClsList
    }

    return (
      <LabelsContainer>
        {clsList.map((c, idx) => {
          const bgColor = clsColorsList[c] ?? "#FF0000"
          let color = contrastColor({ bgColor })

          return (
            <Label
              key={"label-" + idx}
              data-ria-label={c}
              className={c === highlightCls && !isLoadingImage ? "active" : ""}
              tabIndex={0}
              style={{
                backgroundColor: bgColor,
                color,
                borderTopColor: color,
                borderLeftColor: color,
                borderRightColor: color,
              }}
              onClick={() => {
                if (isLoadingImage) {
                  return
                }

                if (selectedRegion) {
                  if (selectedRegion.type !== "skeleton") {
                    if (selectedRegion.cls === c) {
                      dispatch({
                        type: "CHANGE_REGION",
                        region: {
                          ...selectedRegion,
                          cls: null,
                          color: "#FF0000",
                        },
                      })
                      dispatch({ type: "UNSELECT_REGION" })
                    } else {
                      dispatch({
                        type: "CHANGE_REGION",
                        region: { ...selectedRegion, cls: c },
                      })
                      dispatch({ type: "UNSELECT_REGION" })
                    }
                  }
                } else if (selectedCls === c) {
                  dispatch({ type: "SELECT_CLASSIFICATION", cls: null })
                } else {
                  dispatch({ type: "SELECT_CLASSIFICATION", cls: c })
                }
              }}
              onKeyUp={e => {
                if (e.key === "Delete") {
                  console.log("Delete " + c);
                }
              }}
            >
              {c}
            </Label>
          )
        })}
        {selectedRegion?.type === "skeleton" && (
          <small
            style={{
              display: "inline-flex",
              alignItems: "center",
              fontStyle: "italic",
            }}
          >
            Change the label is not allowed for the skeleton region
          </small>
        )}
      </LabelsContainer>
    )
  }, [
    selectedRegion,
    regionClsList,
    clsColorsList,
    highlightCls,
    isLoadingImage,
    selectedCls,
    dispatch,
    selectedTools,
    skeletonList,
    selectedRegion?.cls,
  ])

  return (
    <ThemeProvider theme={theme}>
      <IconDictionaryContext.Provider value={iconDictionary}>
        <Container style={style}>
          {!hideHeader && (
            <Header
              hideHeaderText={hideHeaderText}
              leftSideContent={headerLeftSide}
              onClickItem={onClickHeaderItem}
              items={headerItems}
            />
          )}
          <SidebarsAndContent ref={sidebarAndContentRef}>
            {iconSidebar}
            <WorkContainer>
              {labels}
              {children}
            </WorkContainer>
            {rightSidebarItems.length === 0 ? null : (
              <RightSidebar
                initiallyExpanded={rightSidebarExpanded}
                // showTasks={showTasks && !isFullscreen}
                isExpand={isExpand && !isFullscreen}
                canExpandCollapse={selectedTools.indexOf("brush") === -1}
              >
                {rightSidebarItems}
              </RightSidebar>
            )}
          </SidebarsAndContent>
          {footer && (
            <div style={{ height: 135, border: "solid 1px #dedede" }}>
              {footer}
            </div>
          )}
        </Container>
      </IconDictionaryContext.Provider>
    </ThemeProvider>
  )
}

export default Workspace;
