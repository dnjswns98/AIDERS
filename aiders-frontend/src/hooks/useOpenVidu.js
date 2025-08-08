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

  useEffect(() => {
    return () => {
      leaveSession();
    };
  }, []);

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
      isActive: true,
      hasEventListeners: false,

      cleanup: async function () {
        if (!this.isActive) {
          return;
        }

        this.isActive = false;

        try {
          if (this.subscribers.length > 0) {
            this.subscribers.forEach((subscriber, index) => {
              try {
                if (subscriber?.stream) {
                  subscriber.stream.disposeWebRtcPeer();
                }
              } catch (e) {
              }
            });
            this.subscribers = [];
          }

          if (this.publisher?.stream) {
            try {
              this.publisher.stream.disposeWebRtcPeer();
            } catch (e) {
            }
            this.publisher = null;
          }

          if (this.session) {
            try {
              await this.session.disconnect();
            } catch (e) {
            }
            this.session = null;
          }

          this.OV = null;
          this.hasEventListeners = false;

        } catch (error) {
          console.error("[cleanup] 정리 중 예상치 못한 오류:", error);
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
      if (!sessionContext.session || sessionContext.hasEventListeners) {
        return;
      }


      sessionContext.session.on("streamCreated", (event) => {
        if (!sessionContext.isActive) {
          return;
        }


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
          } catch (error) {
            console.error("[streamCreated] 구독 중 오류:", error);
          }
        }
      });

      sessionContext.session.on("streamDestroyed", (event) => {
        if (!sessionContext.isActive) return;

        const index = sessionContext.subscribers.findIndex(
          (sub) => sub.stream.streamId === event.stream.streamId
        );
        if (index > -1) {
          sessionContext.subscribers.splice(index, 1);
        }
      });

      sessionContext.session.on("exception", (exception) => {
        handleError(new Error(`OpenVidu Exception: ${exception.message || 'Unknown error'}`));
      });

      sessionContext.session.on("sessionDisconnected", async (event) => {
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

  const joinSession = useCallback(async () => {

    if (operationLockRef.current) {
      return;
    }

    if (isConnecting || isConnected) {
      return;
    }

    if (sessionContextRef.current?.isActive && sessionContextRef.current?.session) {
      setIsConnected(true);
      return;
    }

    operationLockRef.current = true;
    setIsConnecting(true);

    try {

      if (sessionContextRef.current) {
        await sessionContextRef.current.cleanup();
      }

      const sessionContext = createSessionContext();
      sessionContextRef.current = sessionContext;

      sessionContext.OV = new OpenVidu();
      sessionContext.session = sessionContext.OV.initSession();

      if (!sessionContext.session) {
        throw new Error("OpenVidu 세션 초기화 실패");
      }

      setupEventListeners(sessionContext);

      const token = await getToken();
      if (!token || typeof token !== "string" || token.trim() === "") {
        throw new Error("유효하지 않은 토큰");
      }

      await sessionContext.session.connect(token, { 
        clientData: `${ambulanceNumber || hospitalId || ""}` 
      });

      if (!sessionContext.isActive) {
        throw new Error("세션이 연결 중에 비활성화됨");
      }


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

      const localStream = sessionContext.publisher.stream.getMediaStream();
      startCall(localStream, null);

      await sessionContext.session.publish(sessionContext.publisher);

      setIsConnected(true);

    } catch (error) {
      console.error("[joinSession] 연결 실패:", error);
      
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

  const leaveSession = useCallback(async () => {

    if (operationLockRef.current) {
      return;
    }

    operationLockRef.current = true;

    try {
      const sessionContext = sessionContextRef.current;
      if (sessionContext?.isActive) {
        await sessionContext.cleanup();
        endCall();
      } else {
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