import React from 'react';

interface SidebarToggleButtonProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarToggleButton: React.FC<SidebarToggleButtonProps> = ({ collapsed, toggleSidebar }) => {
  return (
    <button
      onClick={toggleSidebar}
      className="flex items-center justify-center gap-2 p-3 border-t border-blue-700 text-muted-foreground hover:bg-blue-900 hover:text-muted-foreground transition-colors duration-200"
      aria-label="Toggle sidebar"
    >
      {!collapsed ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Collapse</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span>Expand</span>
        </>
      )}
    </button>
  );
};

export default SidebarToggleButton;
