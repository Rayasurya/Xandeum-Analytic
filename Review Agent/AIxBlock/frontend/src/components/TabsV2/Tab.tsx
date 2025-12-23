import React from 'react';
import { Tooltip } from 'react-tooltip';

interface TabProps {
  label: string;
  isActive: boolean;
  onClick: (label: string) => void;
  tabId: number;
}

const Tab: React.FC<TabProps> = ({ label, isActive, onClick, tabId }) => {
  const handleClick = () => {
    onClick(label);
  };

  return (
    <>
      <button
        className={`tab-button ${isActive ? 'active' : ''}`}
        onClick={handleClick}
        id={`tooltip-${tabId}`}
      >
        {label}
      </button>
      <Tooltip place="top" positionStrategy="fixed" content={label}
        anchorSelect={`#tooltip-${tabId}`} />
    </>
  );
};

export default Tab;
