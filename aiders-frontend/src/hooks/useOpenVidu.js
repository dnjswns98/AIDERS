// src/hooks/useOpenVidu.js

import { useRef, useCallback, useState, useEffect } from "react";
import { OpenVidu } from "openvidu-browser";
import { useWebRtc } from "../context/WebRtcContext";
import { createAmbulanceToken, getHospitalToken } from "../api/api";

export const useOpenVidu = ({
  sessionId,
  ambulanceNumber,
  hospitalId,
  ktas,
  patientName,
  onError,
}) => {
  const sessionContextRef = useRef(null);
  const { startCall, endCall } = useWebRtc();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const operationLockRef = useRef(false);

  // 🔥 수정: 컴포넌트가 소멸될 때 leaveSession을 호출하는 useEffect 제거.
  // 이 로직은 WebRtcCall 컴포넌트에서 관리하는 것이 더 명확합니다.

  const getToken = useCallback(async () => {
    try {
      const isValidAmbulanceId =
        (typeof ambulanceNumber === "string" && ambulanceNumber.trim() !== "");

      if (isValidAmbulanceId) {
        const response = await createAmbulanceToken({
          sessionId,
          ambulanceNumber,
          hospitalId,
          ktas,
          patientName,
        });
        if (!response?.token) {
          throw new Error("앰뷸런스 토큰 응답에 토큰 값이 없습니다.");
        }
        return response.token;
      } else if (hospitalId) {
        const response = await getHospitalToken({ sessionId, hospitalId });
        if (!response?.token) {
          throw new Error("병원 토큰 응답에 토큰 값이 없습니다.");
        }
        return response.token;
      } else {
        throw new Error("Ambulance ID와 Hospital ID가 모두 유효하지 않습니다.");
      }
    } catch (error) {
      console.error("[getToken] 토큰 발급 에러:", error);
      throw error;
    }
  }, [sessionId, ambulanceNumber, hospitalId, ktas, patientName]);

  const createSessionContext = useCallback(() => {
    return {
      OV: null,
      session: null,
      publisher: null,
      subscribers: [],
      isActive: true, // 세션 컨텍스트의 활성 상태를 추적
      hasEventListeners: false,

      cleanup: async function () {
        if (!this.isActive) return;
        this.isActive = false; // 🔥 cleanup 시작 시 즉시 비활성화
        
        try {
          if (this.session) {
            // 모든 이벤트 리스너 제거
            this.session.off('streamCreated');
            this.session.off('streamDestroyed');
            this.session.off('exception');
            this.session.off('sessionDisconnected');

            // 연결 해제
            await this.session.disconnect();
          }
        } catch (error) {
          console.error("[cleanup] 세션 disconnect 중 오류:", error);
        } finally {
          // 모든 참조를 null로 설정
          this.publisher = null;
          this.subscribers = [];
          this.session = null;
          this.OV = null;
          this.hasEventListeners = false;
        }
      },
    };
  }, []);

  const handleError = useCallback(
    (error) => {
      let errorType = "GENERAL_ERROR";
      let errorMessage = `WebRTC 연결 중 오류가 발생했습니다: ${error.message}`;

      if (error.code === 1001 || error.message.includes("camera") || error.message.includes("microphone")) {
        errorType = "CAMERA_ACCESS_DENIED";
        errorMessage = "카메라 또는 마이크 접근이 거부되었습니다.";
      } else if (error.message.includes("connect") || error.message.includes("token")) {
        errorType = "CONNECTION_FAILED";
        errorMessage = "세션 연결에 실패했습니다.";
      }

      onError?.({
        type: errorType,
        message: errorMessage,
      });
    },
    [onError]
  );

  const setupEventListeners = useCallback(
    (sessionContext) => {
      if (!sessionContext.session || sessionContext.hasEventListeners) return;

      sessionContext.session.on("streamCreated", (event) => {
        if (!sessionContext.isActive) return; // 비활성화된 컨텍스트의 이벤트는 무시
        
        try {
          const subscriber = sessionContext.session.subscribe(event.stream, 'remote-video-container');
          subscriber.on('videoElementCreated', (e) => {
            const remote = e.element.srcObject;
            const local = sessionContext.publisher?.stream?.getMediaStream();
            if (remote && local) {
              startCall(local, remote);
            }
          });
          sessionContext.subscribers.push(subscriber);
        } catch (error) {
          console.error("[streamCreated] 구독 중 오류:", error);
        }
      });

      sessionContext.session.on("streamDestroyed", (event) => {
        if (!sessionContext.isActive) return;
        sessionContext.subscribers = sessionContext.subscribers.filter(
          (sub) => sub.stream.streamId !== event.stream.streamId
        );
      });

      sessionContext.session.on("exception", (exception) => {
        if (!sessionContext.isActive) return;
        handleError(new Error(`OpenVidu Exception: ${exception.message || 'Unknown error'}`));
      });

      sessionContext.session.on("sessionDisconnected", async () => {
        if (sessionContext.isActive) {
          await sessionContext.cleanup(); // cleanup을 호출하여 모든 리소스 정리
          setIsConnected(false);
          setIsConnecting(false);
          endCall();
        }
      });

      sessionContext.hasEventListeners = true;
    },
    [startCall, endCall, handleError]
  );

  const joinSession = useCallback(async () => {
    if (operationLockRef.current || isConnecting || isConnected) return;
    operationLockRef.current = true;
    setIsConnecting(true);
    
    // 이전 세션이 있다면 확실하게 정리
    if (sessionContextRef.current) {
        await sessionContextRef.current.cleanup();
    }
    
    const sessionContext = createSessionContext();
    sessionContextRef.current = sessionContext;

    try {
      sessionContext.OV = new OpenVidu();
      sessionContext.session = sessionContext.OV.initSession();
      setupEventListeners(sessionContext);

      const token = await getToken();
      await sessionContext.session.connect(token, { clientData: `${ambulanceNumber || hospitalId || ""}` });

      if (!sessionContext.isActive) throw new Error("세션이 연결 중에 비활성화됨");

      const publisher = await sessionContext.OV.initPublisher(undefined, {
        audioSource: undefined, videoSource: undefined,
        publishAudio: true, publishVideo: true,
        resolution: "640x480", frameRate: 30,
        insertMode: "APPEND", mirror: false,
      });

      sessionContext.publisher = publisher;
      
      const localStream = publisher.stream.getMediaStream();
      startCall(localStream, null);

      await sessionContext.session.publish(publisher);
      setIsConnected(true);

    } catch (error) {
      console.error("[joinSession] 연결 실패:", error);
      if (sessionContextRef.current) {
        await sessionContextRef.current.cleanup();
        sessionContextRef.current = null;
      }
      setIsConnected(false);
      endCall();
      handleError(error);
    } finally {
      setIsConnecting(false);
      operationLockRef.current = false;
    }
  }, [
    createSessionContext, setupEventListeners, getToken, startCall, endCall, handleError, ambulanceNumber, hospitalId
  ]);

  const leaveSession = useCallback(async () => {
    if (operationLockRef.current) return;
    operationLockRef.current = true;

    try {
      const sessionContext = sessionContextRef.current;
      if (sessionContext) {
        await sessionContext.cleanup();
        sessionContextRef.current = null;
      }
      endCall();
      setIsConnected(false);
      setIsConnecting(false);
    } catch (error) {
      console.error("[leaveSession] 종료 중 오류:", error);
    } finally {
      operationLockRef.current = false;
    }
  }, [endCall]);

  return {
    joinSession,
    leaveSession,
    isConnecting,
    isConnected,
  };
};