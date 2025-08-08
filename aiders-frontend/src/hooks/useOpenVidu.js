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

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      leaveSession();
    };
  }, []);

  // 토큰 발급 함수
  const getToken = useCallback(async () => {
    console.log("[getToken] 토큰 발급 시작");
    try {
      const isValidAmbulanceId =
        (typeof ambulanceNumber === "string" && ambulanceNumber.trim() !== "");

      if (isValidAmbulanceId) {
        console.log("[getToken] 앰뷸런스 토큰 요청");
        const response = await createAmbulanceToken({
          sessionId,
          ambulanceNumber,
          hospitalId,
          ktas,
          patientName,
        });
        console.log("_________",response)
        if (!response?.token) {
          throw new Error("앰뷸런스 토큰 응답에 토큰 값이 없습니다.");
        }
        console.log("[getToken] 앰뷸런스 토큰 발급 완료");
        return response.token;
      } else if (hospitalId) {
        console.log("[getToken] 병원 토큰 요청");
        const response = await getHospitalToken({ sessionId, hospitalId });
        if (!response?.token) {
          throw new Error("병원 토큰 응답에 토큰 값이 없습니다.");
        }
        console.log("[getToken] 병원 토큰 발급 완료");
        return response.token;
      } else {
        throw new Error("Ambulance ID와 Hospital ID가 모두 유효하지 않습니다.");
      }
    } catch (error) {
      console.error("[getToken] 토큰 발급 에러:", error);
      throw error;
    }
  }, [sessionId, ambulanceNumber, hospitalId, ktas, patientName]);

  // 세션 컨텍스트 생성
  const createSessionContext = useCallback(() => {
    return {
      OV: null,
      session: null,
      publisher: null,
      subscribers: [],
      isActive: true,
      hasEventListeners: false,

      cleanup: async function () {
        if (!this.isActive) {
          console.log("[cleanup] 이미 정리된 세션");
          return;
        }

        console.log("[cleanup] === 세션 정리 시작 ===");
        this.isActive = false;

        try {
          // Subscribers 정리
          if (this.subscribers.length > 0) {
            console.log(`[cleanup] ${this.subscribers.length}개 subscribers 정리`);
            this.subscribers.forEach((subscriber, index) => {
              try {
                if (subscriber?.stream) {
                  subscriber.stream.disposeWebRtcPeer();
                }
              } catch (e) {
                console.warn(`[cleanup] Subscriber ${index} 정리 중 오류:`, e);
              }
            });
            this.subscribers = [];
          }

          // Publisher 정리
          if (this.publisher?.stream) {
            console.log("[cleanup] Publisher 정리");
            try {
              this.publisher.stream.disposeWebRtcPeer();
            } catch (e) {
              console.warn("[cleanup] Publisher 정리 중 오류:", e);
            }
            this.publisher = null;
          }

          // 세션 연결 해제
          if (this.session) {
            console.log("[cleanup] 세션 연결 해제");
            try {
              await this.session.disconnect();
            } catch (e) {
              console.warn("[cleanup] 세션 연결 해제 중 오류:", e);
            }
            this.session = null;
          }

          // OpenVidu 인스턴스 정리
          this.OV = null;
          this.hasEventListeners = false;

          console.log("[cleanup] === 세션 정리 완료 ===");
        } catch (error) {
          console.error("[cleanup] 정리 중 예상치 못한 오류:", error);
        }
      },
    };
  }, []);

  // 에러 처리 핸들러
  const handleError = useCallback(
    (error) => {
      console.error("[handleError] 에러 발생:", error);
      
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

  // 세션 이벤트 리스너 설정
  const setupEventListeners = useCallback(
    (sessionContext) => {
      if (!sessionContext.session || sessionContext.hasEventListeners) {
        return;
      }

      console.log("[setupEventListeners] 이벤트 리스너 등록");

      sessionContext.session.on("streamCreated", (event) => {
        if (!sessionContext.isActive) {
          console.log("[streamCreated] 비활성 세션, 이벤트 무시");
          return;
        }

        console.log("[streamCreated] 새 스트림:", event.stream.streamId);

        const existingSubscriber = sessionContext.subscribers.find(
          (sub) => sub.stream.streamId === event.stream.streamId
        );

        if (!existingSubscriber) {
          try {
            const subscriber = sessionContext.session.subscribe(event.stream, 'remote-video-container');

            subscriber.on('vidieoElementCreated',(event)=>{
              const remote = event.element.srcObject;
              const local = sessionContext.publisher?.stream?.getMediaStream();

              if(remote && local){
                startCall(local,remote);
              }
            })


            sessionContext.subscribers.push(subscriber);
            console.log("[streamCreated] 새 구독자 추가");
            
            // 스트림 연결
            // console.log("subscriber.stream::::",subscriber.stream)
            // if (subscriber.stream?.hasVideo && sessionContext.publisher) {
            //   console.log("local!!:",sessionContext.publisher.stream.getMediaStream(),"||| remote!!!!:",subscriber.stream.getMediaStream())
            //   startCall(
            //     sessionContext.publisher.stream.getMediaStream(),
            //     subscriber.stream.getMediaStream()
            //   );
            // }
          } catch (error) {
            console.error("[streamCreated] 구독 중 오류:", error);
          }
        }
      });

      sessionContext.session.on("streamDestroyed", (event) => {
        if (!sessionContext.isActive) return;

        console.log("[streamDestroyed] 스트림 제거:", event.stream.streamId);
        const index = sessionContext.subscribers.findIndex(
          (sub) => sub.stream.streamId === event.stream.streamId
        );
        if (index > -1) {
          sessionContext.subscribers.splice(index, 1);
        }
      });

      sessionContext.session.on("exception", (exception) => {
        console.warn("[OpenVidu Exception]", exception);
        handleError(new Error(`OpenVidu Exception: ${exception.message || 'Unknown error'}`));
      });

      sessionContext.session.on("sessionDisconnected", async (event) => {
        console.log("[sessionDisconnected] 세션 연결 해제 이벤트");
        if (sessionContext.isActive) {
          setIsConnected(false);
          setIsConnecting(false);
          await sessionContext.cleanup();
          endCall();
        }
      });

      sessionContext.hasEventListeners = true;
    },
    [startCall, endCall, handleError]
  );

  // 세션 참가 함수
  const joinSession = useCallback(async () => {
    console.log("[joinSession] 호출됨 - isConnecting:", isConnecting, "isConnected:", isConnected);

    // 중복 실행 방지
    if (operationLockRef.current) {
      console.log("[joinSession] 작업 진행 중, 중복 실행 방지");
      return;
    }

    if (isConnecting || isConnected) {
      console.log("[joinSession] 이미 연결 중이거나 연결됨");
      return;
    }

    // 기존 활성 세션 확인
    if (sessionContextRef.current?.isActive && sessionContextRef.current?.session) {
      console.log("[joinSession] 기존 활성 세션 재사용");
      setIsConnected(true);
      return;
    }

    operationLockRef.current = true;
    setIsConnecting(true);

    try {
      console.log("[joinSession] 새 세션 연결 시작");

      // 기존 세션 정리
      if (sessionContextRef.current) {
        await sessionContextRef.current.cleanup();
      }

      // 새 세션 컨텍스트 생성
      const sessionContext = createSessionContext();
      sessionContextRef.current = sessionContext;

      // OpenVidu 초기화
      sessionContext.OV = new OpenVidu();
      sessionContext.session = sessionContext.OV.initSession();

      if (!sessionContext.session) {
        throw new Error("OpenVidu 세션 초기화 실패");
      }

      // 이벤트 리스너 설정
      setupEventListeners(sessionContext);

      // 토큰 발급 및 세션 연결
      const token = await getToken();
      if (!token || typeof token !== "string" || token.trim() === "") {
        throw new Error("유효하지 않은 토큰");
      }

      console.log("[joinSession] 세션 연결 시도");
      await sessionContext.session.connect(token, { 
        clientData: `${ambulanceNumber || hospitalId || ""}` 
      });

      if (!sessionContext.isActive) {
        throw new Error("세션이 연결 중에 비활성화됨");
      }

      console.log("[joinSession] 세션 연결 성공");

      // Publisher 생성 및 설정
      console.log("[joinSession] Publisher 생성");
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
        throw new Error("Publisher 생성 실패");
      }

      // 로컬 스트림 시작
      const localStream = sessionContext.publisher.stream.getMediaStream();
      startCall(localStream, null);

      // Publisher 퍼블리시
      console.log("[joinSession] Publisher 퍼블리시");
      await sessionContext.session.publish(sessionContext.publisher);

      setIsConnected(true);
      console.log("[joinSession] 세션 연결 완료");

    } catch (error) {
      console.error("[joinSession] 연결 실패:", error);
      
      // 실패 시 정리
      if (sessionContextRef.current?.isActive) {
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
    isConnecting,
    isConnected,
    createSessionContext,
    setupEventListeners,
    getToken,
    startCall,
    endCall,
    handleError,
    ambulanceNumber,
    hospitalId,
  ]);

  // 세션 종료 함수
  const leaveSession = useCallback(async () => {
    console.log("[leaveSession] 호출됨");

    if (operationLockRef.current) {
      console.log("[leaveSession] 다른 작업 진행 중");
      return;
    }

    operationLockRef.current = true;

    try {
      const sessionContext = sessionContextRef.current;
      if (sessionContext?.isActive) {
        console.log("[leaveSession] 활성 세션 정리 시작");
        await sessionContext.cleanup();
        endCall();
      } else {
        console.log("[leaveSession] 정리할 활성 세션 없음");
      }

      sessionContextRef.current = null;
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
    sessionContext: sessionContextRef.current,
    isConnecting,
    isConnected,
  };
};
