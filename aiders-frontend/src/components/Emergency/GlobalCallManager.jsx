import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useWebRtc } from '../../context/WebRtcContext';
import PipVideoCall from '../webRTC/PipVideoCall';

const GlobalCallManager = () => {
  const { isCallActive, isPipMode, setPipMode } = useWebRtc();
  const location = useLocation();

  const fullScreenCallPath = '/emergency/dashboard';

  useEffect(() => {
    if (!isCallActive) return;

    const shouldBePip = location.pathname !== fullScreenCallPath;
    if (shouldBePip && !isPipMode) {
      setPipMode(true);
    } else if (!shouldBePip && isPipMode) {
      setPipMode(false);
    }
  }, [location.pathname, isCallActive, isPipMode, setPipMode, fullScreenCallPath]);

  return isCallActive && isPipMode ? <PipVideoCall /> : null;
};

export default GlobalCallManager;