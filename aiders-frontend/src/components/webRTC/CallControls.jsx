import React from 'react';

const CallControls = ({ 
  onLeave, 
  onToggleFullScreen, 
  isFullScreen 
}) => {
  return (
    <div className="controls flex justify-center gap-4 mt-4 p-4">
      <button
        onClick={onLeave}
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
        </svg>
        통화 종료
      </button>
      
      <button
        onClick={onToggleFullScreen}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d={isFullScreen 
            ? "M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
            : "M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
          }/>
        </svg>
        {isFullScreen ? "전체 화면 종료" : "전체 화면"}
      </button>
    </div>
  );
};

export default CallControls;
