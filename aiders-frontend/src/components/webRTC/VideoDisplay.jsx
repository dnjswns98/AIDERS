import React from 'react';
import LocalVideo from './LocalVideo';
import RemoteVideo from './RemoteVideo';

const VideoDisplay = ({ 
  localVideoRef, 
  remoteVideoRef, 
  hasRemoteStream 
}) => {
  return (
    <div className="video-container flex-grow relative bg-gray-800 rounded-lg overflow-hidden">
      <LocalVideo ref={localVideoRef} />
      <RemoteVideo 
        ref={remoteVideoRef} 
        hasRemoteStream={hasRemoteStream} 
        id = "remote-video-container"
      />
    </div>
  );
};

export default VideoDisplay;
