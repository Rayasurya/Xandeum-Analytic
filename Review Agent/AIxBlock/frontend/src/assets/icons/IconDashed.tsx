

const IconDashed = ({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="43" height="6" viewBox="0 0 43 6" fill="none" {...props}>
      <path d="M3 2.99805H40" stroke="currentColor" strokeDasharray="3 3" />
      <path d="M0 6.00098C1.65685 6.00098 3 4.65783 3 3.00098C3 1.34412 1.65685 0.000976562 0 0.000976562V6.00098Z" fill="currentColor" />
      <path d="M43 -0.00195312C41.3431 -0.00195327 40 1.34119 40 2.99805C40 4.6549 41.3431 5.99805 43 5.99805L43 -0.00195312Z" fill="currentColor" />
    </svg>
  );
};

export default IconDashed;
