// components/VideoDisplay.jsx
import React from 'react';
import LocalVideo from './LocalVideo';
import RemoteVideo from './RemoteVideo';

const VideoDisplay = ({
  localVideoRef,
  remoteVideoRef,
  hasRemoteStream
}) => {
  return (
    <div className="video-display-container">
      {/* 메인 비디오 영역 - 크기 확대 */}
      <div className="main-video-area">
        <RemoteVideo 
          ref={remoteVideoRef} 
          hasRemoteStream={hasRemoteStream}
          id="remoteVideo"
        />
        {!hasRemoteStream && (
          <div className="waiting-message">
            상대방을 기다리는 중...
          </div>
        )}
      </div>
      
      {/* 로컬 비디오 - 작은 오버레이 */}
      <div className="local-video-overlay">
        <LocalVideo ref={localVideoRef} />
      </div>
      
      <style jsx>{`
        .video-display-container {
          position: relative;
          width: 100%;
          height: 400px; /* 기존보다 높이 증가 */
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 16px;
        }
        
        .main-video-area {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .main-video-area video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 12px;
        }
        
        .waiting-message {
          color: white;
          font-size: 16px;
          text-align: center;
        }
        
        .local-video-overlay {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 120px;
          height: 90px;
          border: 2px solid #fff;
          border-radius: 8px;
          overflow: hidden;
          background: #333;
        }
        
        .local-video-overlay video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>
    </div>
  );
};

export default VideoDisplay;
