import { grey, blue, orange, purple } from "@mui/material/colors"

export default {
  container: {
    fontSize: 11,
    fontWeight: "bold",
    color: "rgba(255,255,255,.7)",
    "& .icon": {
      marginTop: 4,
      width: 16,
      height: 16,
    },
    "& .icon2": {
      opacity: 0.5,
      width: 16,
      height: 16,
      transition: "200ms opacity",
      color: "#40405b",
      "&:hover": {
        cursor: "pointer",
        opacity: 1,
      },
    },
  },
  row: {
    padding: 4,
    cursor: "pointer",
    "&.header:hover": {
      backgroundColor: "rgba(255,255,255,.1)",
    },
    "&.highlighted": {
      backgroundColor: "rgba(255,255,255,.1)",
      color: "rgba(255,255,255,1)",
      "& *": {
        fontWeight: 700,
      },
    },
    "&:hover": {
      backgroundColor: "rgba(255,255,255,.1)",
      color: "rgba(255,255,255,1)",
    },
  },
  chip: {
    display: "flex",
    flexDirection: "row",
    padding: 2,
    borderRadius: 2,
    paddingLeft: 4,
    paddingRight: 4,
    alignItems: "center",
    "& .color": {
      borderRadius: 5,
      width: 10,
      height: 10,
      marginRight: 4,
    },
    "& .text": {},
  },
}
