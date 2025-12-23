import {createTheme} from "@mui/material/styles";

const MUI_THEME = createTheme({
  typography: {
    fontFamily: "Montserrat, sans-serif",
    fontSize: 12,
  },
  components: {
    MuiDialogTitle: {
      defaultProps: {
        sx: {
          fontSize: 14,
          fontWeight: 700,
          paddingTop: "10px",
          paddingBottom: "10px",
        },
      },
    },
    MuiBackdrop: {
      defaultProps: {
        sx: {
          backdropFilter: "blur(2px)",
          backgroundColor: "rgba(0,0,0,.7)",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        sx: {
          minWidth: 32,
        },
      },
    },
  },
})

export default MUI_THEME;