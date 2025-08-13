import React from 'react';

// 🔥 수정: onRequestCall, showRequestButton props 추가
const CallControls = ({ 
  onLeave, 
  onToggleFullScreen, 
  isFullScreen, 
  canEndCall,
  onRequestCall,
  showRequestButton
}) => {
  return (
    <div className="controls flex justify-center gap-4 mt-4 p-4">
      {canEndCall && (
        <button
          onClick={onLeave}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
          </svg>
          통화 종료
        </button>
      )}
      
      {/* 🔥 추가: 구급차 사용자일 때만 '전화 요청' 버튼 표시 */}
      {showRequestButton && (
        <button
          onClick={onRequestCall}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
          전화 요청
        </button>
      )}

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