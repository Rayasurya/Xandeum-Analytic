const TimeIcon = ({ color = "#5050FF" }: { color?: string }) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.3337 9.99999C18.3337 14.6 14.6003 18.3333 10.0003 18.3333C5.40033 18.3333 1.66699 14.6 1.66699 9.99999C1.66699 5.39999 5.40033 1.66666 10.0003 1.66666C14.6003 1.66666 18.3337 5.39999 18.3337 9.99999Z"
        stroke={color}
        stroke-width="1.25"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M13.0914 12.65L10.5081 11.1083C10.0581 10.8417 9.69141 10.2 9.69141 9.675V6.25833"
        stroke={color}
        stroke-width="1.25"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}

export default TimeIcon
