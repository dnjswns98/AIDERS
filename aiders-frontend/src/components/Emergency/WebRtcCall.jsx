import React, { useRef, useEffect, useState, useCallback } from "react";
import { OpenVidu } from "openvidu-browser";
import { useWebRtc } from "../../context/WebRtcContext";
import { useLocation } from "react-router-dom";

const APPLICATION_SERVER_URL =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:5173/";

export default function WebRtcCall({ sessionName, userName, onLeave }) {
  // ★ 핵심: 각 마운트마다 독립적인 세션 관리
  const sessionContextRef = useRef(null);
  
  const { startCall, endCall, togglePipMode, localStream, remoteStream } =
    useWebRtc();
  const location = useLocation();

  const [isFullScreen, setIsFullScreen] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // 토큰 획득 함수
  const getToken = useCallback(async () => {
    try {
      if (process.env.NODE_ENV === "production") {
        const response = await fetch(`${APPLICATION_SERVER_URL}api/sessions/${sessionName}/connections`, {
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
        return new Promise((resolve) =>
          setTimeout(() => resolve("mock_token_dev"), 500)
        );
      }
    } catch (error) {
      console.error("Error getting token:", error);
      throw error;
    }
  }, [sessionName, userName]);

  // ★ 핵심: Closure를 이용한 독립적인 세션 생성 및 관리
  const createSessionContext = useCallback(() => {
    console.log("Creating new session context...");
    
    const context = {
      OV: null,
      session: null,
      publisher: null,
      subscribers: [],
      isActive: true,  // 이 컨텍스트가 활성 상태인지 추적
      isConnecting: false,
    };

    // 세션 정리 함수 (컨텍스트별로 독립적)
    context.cleanup = async () => {
      console.log("Cleaning up session context...");
      context.isActive = false;  // 비활성화 표시
      
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

  // 세션 참가 함수 (React 19 StrictMode + Closure 완전 대응)
  const joinSession = useCallback(async () => {
    console.log("Attempting to join session...");
    
    // 새로운 세션 컨텍스트 생성
    const sessionContext = createSessionContext();
    sessionContextRef.current = sessionContext;
    
    try {
      // 컨텍스트가 비활성화되었으면 중단
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

      // 컨텍스트 비활성화 체크
      if (!sessionContext.isActive) {
        console.log("Session context deactivated after session creation, aborting...");
        return;
      }

      // 이벤트 리스너 등록 (closure로 sessionContext 캡처)
      sessionContext.session.on("streamCreated", (event) => {
        console.log("Stream created event:", event);
        if (!sessionContext.isActive) return;  // 비활성 컨텍스트면 무시
        
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

      // 토큰 획득
      const token = await getToken();
      if (!token) {
        throw new Error("Failed to get authentication token");
      }

      // 컨텍스트 비활성화 체크
      if (!sessionContext.isActive) {
        console.log("Session context deactivated during token fetch, aborting...");
        return;
      }

      console.log("Connecting to session with token...");
      sessionContext.isConnecting = true;
      
      // ★ 핵심: 여기서 sessionContext.session을 사용 (절대 null이 될 수 없음)
      await sessionContext.session.connect(token, { clientData: userName });

      // 컨텍스트 비활성화 체크
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

      // 컨텍스트 비활성화 체크
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
        alert("카메라 또는 마이크 접근이 거부되었습니다. 브라우저 설정을 확인해주세요.");
      } else if (error.message && error.message.includes('connect')) {
        alert("세션 연결에 실패했습니다. 서버 상태를 확인해주세요.");
      } else {
        alert(`WebRTC 연결 중 오류가 발생했습니다: ${error.message || error}`);
      }
      
      // 에러 발생시 정리
      if (sessionContext.isActive) {
        await sessionContext.cleanup();
        endCall();
      }
    }
  }, [createSessionContext, getToken, startCall, userName, endCall]);

  // 세션 종료 함수 (현재 활성 컨텍스트만 정리)
  const leaveSession = useCallback(async () => {
    console.log("Leaving session...");
    
    const currentContext = sessionContextRef.current;
    if (currentContext) {
      await currentContext.cleanup();
      endCall();
      if (onLeave) {
        onLeave();
      }
    }
    
    sessionContextRef.current = null;
  }, [endCall, onLeave]);

  // localStream, remoteStream 변경됐을 때 비디오 srcObject 연결
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // ★ 핵심: React 19 StrictMode 완전 대응 - 컴포넌트 생명주기 관리
  useEffect(() => {
    console.log("Component mounted, initializing session...");
    
    // 세션 초기화
    joinSession();

    const handleBeforeUnload = () => {
      const currentContext = sessionContextRef.current;
      if (currentContext) {
        currentContext.cleanup();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // ★ cleanup 함수에서 현재 컨텍스트만 정리
    return () => {
      console.log("Component unmounting, cleaning up...");
      window.removeEventListener("beforeunload", handleBeforeUnload);
      
      const currentContext = sessionContextRef.current;
      if (currentContext) {
        currentContext.cleanup();
      }
      sessionContextRef.current = null;
    };
  }, []); // 빈 의존성 배열

  // PiP 모드 상태 관리
  useEffect(() => {
    if (togglePipMode) {
      if (location.pathname !== "/emergency/map") {
        togglePipMode(true);
      } else {
        togglePipMode(false);
      }
    }
  }, [location.pathname, togglePipMode]);

  // 전체 화면 토글
  const toggleFullScreen = () => {
    const elem = document.documentElement;

    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullScreen(false);
    }
  };

  return (
    <div className="web-rtc-call-container flex flex-col h-full">
      <div className="video-container flex-grow relative bg-gray-800 rounded-lg overflow-hidden">
        {/* Local Video */}
        <div className="local-video absolute bottom-4 right-4 w-1/4 h-1/4 bg-black rounded-lg overflow-hidden z-10 shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            나
          </div>
        </div>

        {/* Remote Video */}
        <div className="remote-video w-full h-full bg-black flex items-center justify-center">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-white text-lg">상대방을 기다리는 중...</div>
          )}
        </div>
      </div>

      <div className="controls flex justify-center gap-4 mt-4 p-4">
        <button
          onClick={leaveSession}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
          </svg>
          통화 종료
        </button>
        <button
          onClick={toggleFullScreen}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d={isFullScreen 
              ? "M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
              : "M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
            }/>
          </svg>
          {isFullScreen ? "전체 화면 종료" : "전체 화면"}
        </button>
      </div>
    </div>
  );
}
