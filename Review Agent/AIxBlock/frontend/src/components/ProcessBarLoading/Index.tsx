import React, { memo, useEffect, useState } from "react";
import "./Index.scss";

type TProgressBarProps = {
  isLoading: boolean;
}

const LoadingBar: React.FC<TProgressBarProps> = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      setProgress(0);
      timer = setInterval(() => {
        setProgress((prev) => Math.min(prev + Math.random() * 10, 100));
      }, 300);
    } else {
      setProgress(100);
      timer = setTimeout(() => setProgress(0), 300);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  return (
    <div className={`c-progress-bar ${isLoading ? 'c-progress-bar--active' : ''}`}>
      <div className="c-progress-bar__indicator" style={{ width: `${progress}%` }}></div>
    </div>
  );
}

const ProgressBarLoading = memo(LoadingBar);

export default ProgressBarLoading;
