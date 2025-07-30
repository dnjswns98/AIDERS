import React, { forwardRef } from 'react';

const LocalVideo = forwardRef((props, ref) => {
  return (
    <div className="local-video absolute bottom-4 right-4 w-1/4 h-1/4 bg-black rounded-lg overflow-hidden z-10 shadow-lg">
      <video
        ref={ref}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
        나
      </div>
    </div>
  );
});

LocalVideo.displayName = 'LocalVideo';

export default LocalVideo;
