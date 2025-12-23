import React from "react"

const Clone = (props) => {
  return (
    <svg
      width="24"
      height="23"
      viewBox="0 0 24 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="5.5"
        y="4.59375"
        width="18"
        height="18"
        rx="2"
        fill="white"
        style={{ fillOpacity: "unset !important" }}
      />
      <rect x="1" y="1.09375" width="17" height="17" rx="1.5" stroke="white" />
    </svg>
  )
}

export default Clone
