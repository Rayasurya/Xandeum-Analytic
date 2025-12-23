interface IconHeartProps {
  isLike?: boolean;
}

const IconHeart: React.FC<IconHeartProps> = ({isLike}) => {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.25 4.15625C12.25 2.60313 10.9381 1.34375 9.32 1.34375C8.11063 1.34375 7.07187 2.0475 6.625 3.05187C6.17813 2.0475 5.13937 1.34375 3.92937 1.34375C2.3125 1.34375 1 2.60313 1 4.15625C1 8.66875 6.625 11.6562 6.625 11.6562C6.625 11.6562 12.25 8.66875 12.25 4.15625Z"
        fill={ isLike ? "blue" : undefined }
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconHeart;
