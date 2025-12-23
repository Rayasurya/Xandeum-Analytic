// @flow

import React, { setState, memo } from "react"
import { makeStyles } from "@mui/styles"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import SidebarBoxContainer from "../SidebarBoxContainer"
import HistoryIcon from "@mui/icons-material/History"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import IconButton from "@mui/material/IconButton"
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction"
import UndoIcon from "@mui/icons-material/Undo"
import moment from "moment"
import { grey } from "@mui/material/colors"
import isEqual from "lodash/isEqual"
import Box from "@mui/material/Box"

import MUI_THEME from "../utils/muiTheme";
const theme = MUI_THEME;
const useStyles = makeStyles((theme) => ({
  emptyText: {
    fontSize: 14,
    fontWeight: "bold",
    color: grey[500],
    textAlign: "center",
    padding: 20,
  },
}))

const listItemTextStyle = { paddingLeft: 0 }

export const HistorySidebarBox = ({
  history,
  onRestoreHistory,
}: {
  history: Array<{ name: string, time: Date }>,
}) => {
  const classes = useStyles()

  return (
    <ThemeProvider theme={theme}>
      <SidebarBoxContainer
        title="History"
        icon={<HistoryIcon style={{ color: grey[700] }} />}
      >
        <List style={{ padding: 0 }}>
          {history.length === 0 && (
            <div className={classes.emptyText}>No History Yet</div>
          )}
          {history.map(({ name, time }, i) => (
            <ListItem button dense key={i}>
              <ListItemText
                style={{...listItemTextStyle, marginTop: 0, marginBottom: 0}}
                primary={name}
                primaryTypographyProps={{
                  style: {
                    marginTop: 0,
                    marginBottom: 0,
                  },
                }}
                secondary={<span style={{ color: "rgba(0,0,0,.5)" }}>{moment(time).format("LT")}</span>}
                secondaryTypographyProps={{
                  style: {
                    marginBottom: 0,
                  },
                }}
              />
              {i === 0 && (
                <ListItemSecondaryAction onClick={() => onRestoreHistory()}>
                  <IconButton style={{ color: "#111" }}>
                    <UndoIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
        </List>
      </SidebarBoxContainer>
    </ThemeProvider>
  )
}

export default memo(HistorySidebarBox, (prevProps, nextProps) =>
  isEqual(
    prevProps.history.map((a) => [a.name, a.time]),
    nextProps.history.map((a) => [a.name, a.time])
  )
)
