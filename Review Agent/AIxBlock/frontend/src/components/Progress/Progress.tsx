import React from "react";
import "./Progress.scss";

interface ProgressProps {
  percent: number;
  strokeColor?: string;
  className?: string;
}

const Progress: React.FC<ProgressProps> = ({
  percent,
  strokeColor,
  className,
}) => {
  return (
    <div className={`progress ${className ? className : ""}`}>
      {" "}
      <div
        className="progress-bar"
        style={{ width: `${percent}%`, background: strokeColor }}
      ></div>
    </div>
  );
};

export default Progress;
