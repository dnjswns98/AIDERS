import React from 'react';

export default function VideoDisplay({
  localVideoRef,
  remoteVideoRef,
  hasRemoteStream,
}) {
  return (
    <div className="relative w-full h-full bg-black">
      {/* Remote Video */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Local Video (🔥 스타일 수정) */}
      <div className="absolute bottom-28 md:bottom-24 right-4 w-1/3 max-w-sm border-2 border-white rounded-lg overflow-hidden z-10 shadow-lg">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      </div>

      {!hasRemoteStream && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <p className="text-white text-lg animate-pulse">상대방을 기다리는 중...</p>
        </div>
      )}
    </div>
  );
}