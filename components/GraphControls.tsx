import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrosshairs } from '@fortawesome/free-solid-svg-icons';

interface GraphControlsProps {
  onSidebarOpen: () => void;
  onCenterGraph: () => void;
}

const GraphControls: React.FC<GraphControlsProps> = ({
  onSidebarOpen,
  onCenterGraph,
}) => {
  return (
    <div className="flex space-x-4 p-2">
      {/* <button onClick={onSidebarOpen}>Abrir Sidebar</button> */}
      <button onClick={onCenterGraph} className="p-2 bg-gray-200 rounded-full">
        <FontAwesomeIcon icon={faCrosshairs} />
      </button>
    </div>
  );
};

export default GraphControls;
