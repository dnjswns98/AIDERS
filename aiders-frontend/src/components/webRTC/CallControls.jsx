import React from 'react';

const CallControls = ({ 
  onLeave, 
  onToggleFullScreen, 
  isFullScreen, 
  canEndCall,
  onRequestCall,
  showRequestButton,
  // 🔥 새로 추가된 props
  isRequestInProgress = false,
  userRole = null,
  ambulanceNumber = null,
  hospitalName = null
}) => {
  return (
    <div className="controls flex flex-col gap-4 mt-4 p-4">
      
      {/* 컨트롤 버튼들 */}
      <div className="flex justify-center gap-3 flex-wrap">
        {/* 전화 요청 버튼 (구급차 사용자 전용) */}
        {showRequestButton && (
          <button
            onClick={onRequestCall}
            disabled={isRequestInProgress}
            className={`
              font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl min-w-[120px] justify-center
              ${isRequestInProgress 
                ? 'bg-orange-400 cursor-not-allowed text-white' 
                : 'bg-orange-500 hover:bg-orange-600 text-white'
              }
            `}
          >
            {isRequestInProgress ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                요청 중...
              </>
            ) : (
              <>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                추가 알림
              </>
            )}
          </button>
        )}
        
        {/* 전체화면 토글 버튼 */}
        <button
          onClick={onToggleFullScreen}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl min-w-[120px] justify-center"
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d={isFullScreen 
              ? "M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
              : "M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
            }/>
          </svg>
          {isFullScreen ? "창 모드" : "전체화면"}
        </button>
      </div>
      
      {/* 상태 메시지 */}
      {showRequestButton && (
        <div className="text-center text-xs text-white bg-black bg-opacity-30 rounded p-2">
          {isRequestInProgress ? (
            "⏳ 병원에 추가 알림을 전송하고 있습니다..."
          ) : (
            "💡 '추가 알림' 버튼으로 병원에 긴급 요청을 보낼 수 있습니다"
          )}
        </div>
      )}
    </div>
  );
};

export default CallControls;
