import React from "react"
import { styled } from "@mui/styles"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import IconButton from "@mui/material/IconButton"
import { iconMapping } from "../icon-mapping.js"
import { useIconDictionary } from "../icon-dictionary"
import Tooltip from "@mui/material/Tooltip"

const theme = createTheme({
  palette: {
    white: {
      main: "#fff",
    },
  },
})
const Container = styled("div")(({ theme }) => ({
  width: 50,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#fff",
  flexShrink: 0,
  borderRight: "0.5px solid #A0A3BD",
  boxShadow: "0 32px 64px 0 rgba(17, 17, 17, 0.08)",
}))

type Props = {
  items: Array<{|
    name: string,
    helperText: string,
    icon?: ?React.Node,
    onClick: Function,
  |}>,
  isLoadingImage: boolean,
}

const emptyAr = []

export const IconSidebar = ({
  items = emptyAr,
  onClickItem,
  selectedTools = emptyAr,
  isLoadingImage = false,
}: Props) => {
  const customIconMapping = useIconDictionary()
  let previousIsSeparator = false;

  return (
    <ThemeProvider theme={theme}>
      <Container>
        {items.map((item, idx) => {
          const key = "icon-sidebar-" + idx;

          if (item.name === "-") {
            if (previousIsSeparator) return null;

            previousIsSeparator = true;

            return (
              <div key={key} style={{
                height: 0,
                borderTop: "solid 1px rgba(255,255,255,.1)",
              }} />
            );
          }
          previousIsSeparator = false;
          const isSelected = item.selected || selectedTools.includes(item.name.toLowerCase()) || selectedTools.some((s) => item.children && item.children.map((c) => c.name.toLowerCase()).includes(s));
          let NameIcon =
            customIconMapping[item.name.toLowerCase()] ||
            iconMapping[item.name.toLowerCase()] ||
            iconMapping["help"]
          const isSetFillActive = ["auto-annotate", "create-point", "brush", "polyline"].includes(item.name);
          const SvgStyled  = styled("span")(() => ({
            "& svg": {
              width: "16px",
              height: "16px",
              marginTop: "4px",
              marginBottom: "4px",
              "& path, & circle": {
                fill: isSetFillActive ? isSelected ? "#2A46FF" : "#4E4B66" : "",
                stroke: !isSetFillActive && isSelected ? "#2A46FF" : "",
              }
            }
          }))
          const buttonPart = (
            <IconButton
              key={key}
              color={isSelected ? "primary" : "default"}
              disabled={Boolean(item.disabled) || isLoadingImage}
              onClick={item.onClick && !isLoadingImage ? item.onClick : () => onClickItem(item)}
              className="w-100"
            >
              {item.icon || <SvgStyled><NameIcon selected={isSelected} /></SvgStyled>}
            </IconButton>
          )

          if (!item.helperText) return buttonPart;
          if(item.children){

            return <div className="d-flex justify-content-center align-items-center position-relative left-side-tool-parent-item">
              {buttonPart}
              <div className="position-absolute left-side-tool-child-item">
                {item.children.map((child, index) => {
                  const key = "icon-sidebar-" + (child.name === "-" ? Math.random().toString().substring(2, 16) : child.name);
                  const isSelected = child.selected || selectedTools.includes(child.name.toLowerCase());
                  let NameIcon =
                    customIconMapping[child.name.toLowerCase()] ||
                    iconMapping[child.name.toLowerCase()] ||
                    iconMapping["help"]
                  const isSetFillActive = ["auto-annotate", "create-point", "brush"].includes(child.name);
                  const SvgStyled  = styled("span")(() => ({
                    "& svg": {
                      width: "16px",
                      height: "16px",
                      marginTop: "4px",
                      marginBottom: "4px",
                      "& path, & circle": {
                        fill: isSetFillActive ? isSelected ? "#2A46FF" : "#FFFFFF" : "",
                        stroke: !isSetFillActive && isSelected ? "#2A46FF" : "#FFFFFF",
                      }
                    }
                  }))
                  return (
                    <IconButton
                      key={key}
                      color={isSelected ? "primary" : "white"}
                      disabled={Boolean(child.disabled)}
                      onClick={child.onClick ? child.onClick : () => onClickItem(child)}
                      className="d-flex align-items-center"
                    >
                      {child.icon || <SvgStyled><NameIcon selected={isSelected} /></SvgStyled>}
                      <p className="help-text">{child.helperText}</p>
                    </IconButton>
                  )
                })}
              </div>
            </div>

          }
          return (
            <Tooltip key={key + "-tooltip"} title={item.helperText} placement="right">
              {buttonPart}
            </Tooltip>
          )
        })}
      </Container>
    </ThemeProvider>
  )
}

export default IconSidebar
