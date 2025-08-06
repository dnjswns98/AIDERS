import React, { forwardRef } from 'react';

const RemoteVideo = forwardRef(({ hasRemoteStream, id }, ref) => {
  return (
    <div id={id} className="remote-video w-full h-full bg-black flex items-center justify-center">
      {hasRemoteStream ? (
        <video
          ref={ref}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="text-white text-lg">상대방을 기다리는 중...</div>
      )}
    </div>
  );
});

RemoteVideo.displayName = 'RemoteVideo';

export default RemoteVideo;
