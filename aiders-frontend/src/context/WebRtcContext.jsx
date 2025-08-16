import React, { createContext, useContext } from 'react';
import useWebRtcStore from '../store/useWebRtcStore';

const WebRtcContext = createContext(null);

export const useWebRtc = () => {
    const context = useContext(WebRtcContext);
    if (!context) {
        throw new Error('useWebRtc must be used within a WebRtcProvider');
    }
    return context;
};

export const WebRtcProvider = ({ children }) => {
    // Zustand 스토어의 모든 상태와 액션을 가져옵니다.
    const store = useWebRtcStore();

    // 컨텍스트를 통해 스토어의 모든 값을 그대로 전달합니다.
    // 이제 모든 WebRTC 관련 상태는 Zustand 스토어에서 중앙 관리됩니다.
    return (
        <WebRtcContext.Provider value={store}>
            {children}
        </WebRtcContext.Provider>
    );
};
