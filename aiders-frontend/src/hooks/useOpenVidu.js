import { useRef, useCallback } from "react";
import { OpenVidu } from "openvidu-browser";
import { useWebRtc } from "../context/WebRtcContext";
import { createAmbulanceToken, getHospitalToken } from "../api/api";

export const useOpenVidu = ({
  sessionId,
  ambulanceId,
  hospitalId,
  ktas,
  patientName,
  onError,
}) => {
  const sessionContextRef = useRef(null);
  const { startCall, endCall } = useWebRtc();

  // ──────────────────────────────────────────────────────────────────────────
  // 토큰 획득 함수
  const getToken = useCallback(
    async () => {
      try {
        if (ambulanceId !== null) {
          // 구급차용 토큰 요청
          const response = await createAmbulanceToken({
            sessionId,
            ambulanceId,
          });
          return response.token;
        } else {
          // 병원용 토큰 요청
          const response = await getHospitalToken({ sessionId, hospitalId });
          return response.token;
        }
      } catch (error) {
        console.error("Error getting token:", error);
        throw error;
      }
    },
    // 의존성 배열에 모두 포함
    [sessionId, ambulanceId, hospitalId, ktas, patientName]
  );

  // ──────────────────────────────────────────────────────────────────────────
  // 세션 컨텍스트 생성 (매 joinSession 시마다 새로 만듦)
  const createSessionContext = useCallback(() => {
    const context = {
      OV: null,
      session: null,
      publisher: null,
      subscribers: [],
      isActive: true,
      isConnecting: false,
      // 세션 정리 함수
      cleanup: async function () {
        this.isActive = false;
        // 1) 구독자 정리
        this.subscribers.forEach((sub) => {
          try {
            sub.stream.disposeWebRtcPeer();
          } catch (e) {
            console.warn("Error disposing subscriber:", e);
          }
        });
        this.subscribers = [];
        // 2) 퍼블리셔 정리
        if (this.publisher?.stream) {
          try {
            this.publisher.stream.disposeWebRtcPeer();
          } catch (e) {
            console.warn("Error disposing publisher:", e);
          }
          this.publisher = null;
        }
        // 3) 세션 연결 해제
        if (this.session && this.isConnecting) {
          try {
            await this.session.disconnect();
          } catch (e) {
            console.warn("Error disconnecting session:", e);
          }
        }
        this.session = null;
        this.OV = null;
        this.isConnecting = false;
      },
    };
    return context;
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // 세션 참가 함수
  const joinSession = useCallback(async () => {
    console.log("Attempting to join session...");
    const ctx = createSessionContext();
    sessionContextRef.current = ctx;

    try {
      // 이미 비활성화된 컨텍스트면 중단
      if (!ctx.isActive) return;

      // 1) OpenVidu 인스턴스 및 세션 초기화
      ctx.OV = new OpenVidu();
      ctx.session = ctx.OV.initSession();
      if (!ctx.session) {
        throw new Error("Failed to initialize OpenVidu session");
      }
      if (!ctx.isActive) return;

      // 2) 이벤트 리스너 등록
      ctx.session.on("streamCreated", (event) => {
        if (!ctx.isActive) return;
        const subscriber = ctx.session.subscribe(event.stream, undefined);
        ctx.subscribers.push(subscriber);
        if (subscriber.stream?.hasVideo) {
          startCall(
            ctx.publisher.stream.getMediaStream(),
            subscriber.stream.getMediaStream()
          );
        }
      });
      ctx.session.on("streamDestroyed", (event) => {
        if (!ctx.isActive) return;
        const idx = ctx.subscribers.indexOf(event.stream.streamManager);
        if (idx > -1) ctx.subscribers.splice(idx, 1);
      });
      ctx.session.on("exception", (ex) =>
        console.warn("OpenVidu exception:", ex)
      );
      ctx.session.on("sessionDisconnected", () => {
        ctx.isConnecting = false;
        if (ctx.isActive) endCall();
      });

      // 3) 토큰 획득
      const token = await getToken();
      if (!token) throw new Error("Failed to get authentication token");
      if (!ctx.isActive) {
        await ctx.cleanup();
        return;
      }

      // 4) 세션 연결
      ctx.isConnecting = true;
      await ctx.session.connect(token, { clientData: ambulanceId });
      if (!ctx.isActive) {
        await ctx.cleanup();
        return;
      }

      // 5) 퍼블리셔 생성 (미디어 권한 및 SDP 검증)
      ctx.publisher = await ctx.OV.initPublisher(
        undefined,
        {
          audioSource: undefined,
          videoSource: undefined,
          publishAudio: true,
          publishVideo: true,
          resolution: "640x480",
          frameRate: 30,
          insertMode: "APPEND",
          mirror: false,
        },
        (initErr) => {
          if (initErr) {
            console.error("Publisher init failed:", initErr);
            onError?.({
              type: "CAMERA_ACCESS_DENIED",
              message: "카메라/마이크 접근이 거부되었습니다.",
            });
          }
        }
      );
      if (!ctx.publisher) throw new Error("Failed to create publisher");
      if (!ctx.isActive) return;

      // 로컬 스트림 시작
      const localStream = ctx.publisher.stream.getMediaStream();
      startCall(localStream, null);

      // 6) 퍼블리셔 발행
      console.log("Publishing stream...");
      await ctx.session.publish(ctx.publisher);
      console.log("Successfully joined and published");
    } catch (error) {
      console.error("Error in joinSession:", error);
      // 에러 타입 분기
      if (error.code === 1001) {
        onError?.({
          type: "CAMERA_ACCESS_DENIED",
          message: "카메라 또는 마이크 접근이 거부되었습니다.",
        });
      } else if (error.message.includes("connect")) {
        onError?.({
          type: "CONNECTION_FAILED",
          message: "세션 연결에 실패했습니다.",
        });
      } else {
        onError?.({
          type: "GENERAL_ERROR",
          message: `WebRTC 연결 중 오류가 발생했습니다: ${error.message}`,
        });
      }
      // 정리
      if (ctx.isActive) {
        await ctx.cleanup();
        endCall();
      }
    }
  }, [createSessionContext, getToken, startCall, endCall, onError]);

  // ──────────────────────────────────────────────────────────────────────────
  // 세션 종료 함수
  const leaveSession = useCallback(async () => {
    console.log("Leaving session...");
    const ctx = sessionContextRef.current;
    if (ctx) {
      await ctx.cleanup();
      endCall();
    }
    sessionContextRef.current = null;
  }, [endCall]);

  return {
    joinSession,
    leaveSession,
    sessionContext: sessionContextRef.current,
  };
};
