import { useState, useEffect, useCallback, useRef } from "react";
import { OpenVidu } from "openvidu-browser";
import { useWebRtc } from "../context/WebRtcContext";
import { createAmbulanceToken, getHospitalToken } from "../api/api";
import { useAuthStore } from "../store/useAuthStore";

export const useOpenVidu = ({
  sessionId,
  ambulanceNumber,
  hospitalId,
  ktas,
  patientName,
  onError,
}) => {
  const { setLocalStream, setSubscriber, endCall } = useWebRtc();
  const { user } = useAuthStore();

  // useRef 대신 useState를 사용하여 React가 상태 변화를 감지하도록 수정
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [subscribers, setSubscribers] = useState([]);

  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  // OpenVidu 객체는 ref로 유지하여 불필요한 재생성을 방지
  const OVRef = useRef(null);

  const getToken = useCallback(async () => {
    try {
      if (user.role === 'ambulance') {
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
      } else if (user.role === 'hospital') {
        const response = await getHospitalToken({ sessionId, hospitalId });
        if (!response?.token) {
          throw new Error("병원 토큰 응답에 토큰 값이 없습니다.");
        }
        return response.token;
      } else {
        throw new Error("알 수 없는 사용자 역할입니다.");
      }
    } catch (error) {
      console.error("[getToken] 토큰 발급 에러:", error);
      throw error;
    }
  }, [sessionId, ambulanceNumber, hospitalId, ktas, patientName, user.role]);

  const handleError = useCallback((error) => {
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
  }, [onError]);

  const leaveSession = useCallback(async () => {
    console.log("[leaveSession] 세션 종료 시작");
    
    try {
      // Publisher 정리
      if (publisher) {
        console.log("[leaveSession] Publisher 정리 중");
        if (publisher.stream) {
          publisher.stream.getMediaStream().getTracks().forEach(track => {
            track.stop();
            console.log("[leaveSession] 미디어 트랙 정지:", track.kind);
          });
        }
        setPublisher(null);
      }
      
      // Subscribers 정리
      if (subscribers.length > 0) {
        console.log("[leaveSession] Subscribers 정리 중");
        subscribers.forEach(sub => {
          if (sub.stream) {
            sub.stream.getMediaStream().getTracks().forEach(track => {
              track.stop();
            });
          }
        });
        setSubscribers([]);
      }
      
      // 세션 연결 해제
      if (session) {
        console.log("[leaveSession] 세션 연결 해제 중");
        await session.disconnect();
        setSession(null);
      }
      
      // OpenVidu 객체 정리
      OVRef.current = null;
      setIsConnected(false);
      setIsConnecting(false);
      
      // WebRTC 스토어 정리
      endCall();
      
      console.log("[leaveSession] 세션 종료 완료");
    } catch (error) {
      console.error("[leaveSession] 세션 종료 중 오류:", error);
      // 오류가 발생해도 상태 초기화는 진행
      OVRef.current = null;
      setSession(null);
      setPublisher(null);
      setSubscribers([]);
      setIsConnected(false);
      setIsConnecting(false);
      endCall();
    }
  }, [session, publisher, subscribers, endCall]);


  const joinSession = useCallback(async () => {
    if (isConnecting || isConnected) return;
    
    console.log("[joinSession] 새 세션 참여 시작");
    
    // 기존 세션이 있다면 먼저 정리
    if (session || publisher || OVRef.current) {
      console.log("[joinSession] 기존 세션 감지 - 먼저 정리");
      await leaveSession();
      // 정리 완료 대기
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsConnecting(true);
    
    OVRef.current = new OpenVidu();
    console.log("[joinSession] 새 OpenVidu 인스턴스 생성");
    const newSession = OVRef.current.initSession();

    newSession.on("streamCreated", (event) => {
      const subscriber = newSession.subscribe(event.stream, undefined);
      console.log("[streamCreated] 새로운 스트림이 생성되었습니다.", event.stream);
      // 'subscribers' 상태 배열을 업데이트하여 렌더링을 유발
      setSubscribers(prev => [...prev, subscriber]);
    });

    newSession.on("streamDestroyed", (event) => {
      console.log("[streamDestroyed] 스트림이 종료되었습니다.", event.stream);
      setSubscribers(prev => prev.filter(sub => sub.stream.streamId !== event.stream.streamId));
    });

    newSession.on("exception", (exception) => {
      console.warn("[exception] OpenVidu 예외 발생:", exception);
      handleError(new Error(`OpenVidu Exception: ${exception.message || 'Unknown error'}`));
    });

    newSession.on("sessionDisconnected", () => {
      console.log("[sessionDisconnected] 세션 연결이 끊겼습니다.");
      // 상태 초기화
      setSession(null);
      setPublisher(null);
      setSubscribers([]);
      setIsConnected(false);
      setIsConnecting(false);
      endCall();
    });
    
    try {
      const token = await getToken();
      await newSession.connect(token, { clientData: `${ambulanceNumber || hospitalId || ""}` });

      const newPublisher = await OVRef.current.initPublisherAsync(undefined, {
        audioSource: undefined, videoSource: undefined,
        publishAudio: true, publishVideo: true,
        resolution: "640x480", frameRate: 30,
        insertMode: "APPEND", mirror: false,
      });

      await newSession.publish(newPublisher);
      
      setLocalStream(newPublisher.stream.getMediaStream());
      setPublisher(newPublisher);
      setSession(newSession);
      setIsConnected(true);
      console.log("[joinSession] 세션 참여 및 발행 성공");

    } catch (error) {
      console.error("[joinSession] 세션 참여 실패:", error);
      handleError(error);
      await leaveSession();
    } finally {
      setIsConnecting(false);
    }
  }, [getToken, ambulanceNumber, hospitalId, handleError, setLocalStream, endCall, isConnecting, isConnected, leaveSession]);

  // 구독자(subscribers) 상태가 변경될 때마다 subscriber 객체를 스토어에 업데이트합니다.
  useEffect(() => {
    if (subscribers.length > 0) {
      setSubscriber(subscribers[0]);
      console.log("[useEffect] subscriber가 설정되었습니다.", subscribers[0]);
    } else {
      setSubscriber(null);
      console.log("[useEffect] subscriber가 제거되었습니다.");
    }
  }, [subscribers, setSubscriber]);
  
  return { joinSession, leaveSession, isConnecting, isConnected };
};