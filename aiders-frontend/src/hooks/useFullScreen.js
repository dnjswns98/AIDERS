import { useState, useCallback, useEffect } from 'react';

// 🔥 수정: 특정 요소를 전체화면으로 만들기 위해 ref를 인자로 받도록 변경
export const useFullScreen = (elementRef) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  const toggleFullScreen = useCallback(() => {
    // 🔥 수정: document 전체가 아닌, ref로 전달받은 요소를 대상으로 실행
    const elem = elementRef.current;
    if (!elem) return;

    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [elementRef]);

  return {
    isFullScreen,
    toggleFullScreen
  };
};