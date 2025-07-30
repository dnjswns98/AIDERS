import { useRef, useCallback } from 'react';
import { OpenVidu } from 'openvidu-browser';
import { useWebRtc } from '../context/WebRtcContext';

export const useOpenVidu = ({ sessionName, userName, onError }) => {
  const sessionContextRef = useRef(null);
  const { startCall, endCall } = useWebRtc();

  // 토큰 획득 함수
  const getToken = useCallback(async () => {
    try {
      if (process.env.NODE_ENV === "production") {
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL || ''}/api/sessions/${sessionName}/connections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metadata: JSON.stringify({ clientData: userName })
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.token;
      } else {
        // 개발 환경에서는 백엔드 연동 후 실제 토큰 사용
        return new Promise((resolve) =>
          setTimeout(() => resolve("mock_token_dev"), 500)
        );
      }
    } catch (error) {
      console.error("Error getting token:", error);
      throw error;
    }
  }, [sessionName, userName]);

  // 세션 컨텍스트 생성
  const createSessionContext = useCallback(() => {
    console.log("Creating new session context...");
    
    const context = {
      OV: null,
      session: null,
      publisher: null,
      subscribers: [],
      isActive: true,
      isConnecting: false,
    };

    // 세션 정리 함수 (컨텍스트별로 독립적)
    context.cleanup = async () => {
      console.log("Cleaning up session context...");
      context.isActive = false;
      
      try {
        // 구독자들 정리
        context.subscribers.forEach((subscriber) => {
          if (subscriber?.stream) {
            try {
              subscriber.stream.disposeWebRtcPeer();
            } catch (err) {
              console.warn("Error disposing subscriber:", err);
            }
          }
        });
        context.subscribers = [];

        // 퍼블리셔 정리
        if (context.publisher?.stream) {
          try {
            context.publisher.stream.disposeWebRtcPeer();
          } catch (err) {
            console.warn("Error disposing publisher:", err);
          }
          context.publisher = null;
        }

        // 세션 연결 해제
        if (context.session && context.isConnecting) {
          try {
            await context.session.disconnect();
          } catch (err) {
            console.warn("Error disconnecting session:", err);
          }
        }
        
        context.session = null;
        context.OV = null;
        context.isConnecting = false;
        
      } catch (error) {
        console.error("Error in context cleanup:", error);
      }
    };

    return context;
  }, []);

  // 세션 참가 함수
  const joinSession = useCallback(async () => {
    console.log("Attempting to join session...");
    
    const sessionContext = createSessionContext();
    sessionContextRef.current = sessionContext;
    
    try {
      if (!sessionContext.isActive) {
        console.log("Session context deactivated during initialization, aborting...");
        return;
      }

      // OpenVidu 및 세션 생성
      sessionContext.OV = new OpenVidu();
      sessionContext.session = sessionContext.OV.initSession();

      if (!sessionContext.session) {
        throw new Error("Failed to initialize OpenVidu session");
      }

      if (!sessionContext.isActive) {
        console.log("Session context deactivated after session creation, aborting...");
        return;
      }

      // 이벤트 리스너 등록
      sessionContext.session.on("streamCreated", (event) => {
        console.log("Stream created event:", event);
        if (!sessionContext.isActive) return;
        
        const subscriber = sessionContext.session.subscribe(event.stream, undefined);
        sessionContext.subscribers.push(subscriber);
        
        if (subscriber.stream && subscriber.stream.hasVideo) {
          startCall(
            sessionContext.publisher?.stream?.getMediaStream(),
            subscriber.stream.getMediaStream()
          );
        }
        console.log("New subscriber added");
      });

      sessionContext.session.on("streamDestroyed", (event) => {
        console.log("Stream destroyed event:", event);
        if (!sessionContext.isActive) return;
        
        const index = sessionContext.subscribers.indexOf(event.stream.streamManager);
        if (index > -1) {
          sessionContext.subscribers.splice(index, 1);
        }
        console.log("Subscriber removed");
      });

      sessionContext.session.on("exception", (exception) => {
        console.warn("OpenVidu session exception:", exception);
      });

      sessionContext.session.on("sessionDisconnected", (event) => {
        console.log("Session disconnected:", event);
        sessionContext.isConnecting = false;
        if (sessionContext.isActive) {
          endCall();
        }
      });

      // 토큰 획득 및 연결
      const token = await getToken();
      if (!token) {
        throw new Error("Failed to get authentication token");
      }

      if (!sessionContext.isActive) {
        console.log("Session context deactivated during token fetch, aborting...");
        return;
      }

      console.log("Connecting to session with token...");
      sessionContext.isConnecting = true;
      await sessionContext.session.connect(token, { clientData: userName });

      if (!sessionContext.isActive) {
        console.log("Session context deactivated after connection, cleaning up...");
        await sessionContext.cleanup();
        return;
      }

      // 퍼블리셔 생성
      console.log("Creating publisher...");
      sessionContext.publisher = await sessionContext.OV.initPublisher(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: true,
        publishVideo: true,
        resolution: "640x480",
        frameRate: 30,
        insertMode: "APPEND",
        mirror: false,
      });

      if (!sessionContext.publisher) {
        throw new Error("Failed to create publisher");
      }

      if (!sessionContext.isActive) {
        console.log("Session context deactivated during publisher creation, aborting...");
        return;
      }

      // localStream 세팅
      const localMediaStream = sessionContext.publisher.stream?.getMediaStream();
      if (localMediaStream) {
        startCall(localMediaStream, null);
      }

      // 퍼블리셔 발행
      console.log("Publishing stream...");
      await sessionContext.session.publish(sessionContext.publisher);
      console.log("Successfully joined session and published stream");

    } catch (error) {
      console.error("Error in joinSession:", error);
      
      if (error.code === 1001) {
        onError?.({ 
          type: 'CAMERA_ACCESS_DENIED',
          message: "카메라 또는 마이크 접근이 거부되었습니다. 브라우저 설정을 확인해주세요."
        });
      } else if (error.message && error.message.includes('connect')) {
        onError?.({ 
          type: 'CONNECTION_FAILED',
          message: "세션 연결에 실패했습니다. 서버 상태를 확인해주세요."
        });
      } else {
        onError?.({ 
          type: 'GENERAL_ERROR',
          message: `WebRTC 연결 중 오류가 발생했습니다: ${error.message || error}`
        });
      }
      
      if (sessionContext.isActive) {
        await sessionContext.cleanup();
        endCall();
      }
    }
  }, [createSessionContext, getToken, startCall, userName, endCall, onError]);

  // 세션 종료 함수
  const leaveSession = useCallback(async () => {
    console.log("Leaving session...");
    
    const currentContext = sessionContextRef.current;
    if (currentContext) {
      await currentContext.cleanup();
      endCall();
    }
    
    sessionContextRef.current = null;
  }, [endCall]);

  return {
    joinSession,
    leaveSession,
    sessionContext: sessionContextRef.current
  };
};
