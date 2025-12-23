import React from 'react';

interface TabContentProps {
  content?: JSX.Element | string;
  isActive: boolean;
  label: string;
}

const TabContent: React.FC<TabContentProps> = ({ content, isActive, label }) => {
  if (!isActive) return null;
  return (
    <div className="tab-content">
      {content}
    </div>
  );
};

export default TabContent;
