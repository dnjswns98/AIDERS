// src/pages/Emergency/AmbulanceDashboardPage.jsx
import React, {
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import AmbulanceLayout from "../../components/Emergency/Layout/AmbulanceLayout";
import MapDisplay from "../../components/Emergency/MapDisplay";
import HospitalCard from "../../components/Emergency/HospitalCard";
import useEmergencyStore from "../../store/useEmergencyStore";
import { useAuthStore } from "../../store/useAuthStore";
import useLiveAmbulanceLocation from "../../hooks/useLiveAmbulanceLocation";
import useWebRtcStore from "../../store/useWebRtcStore";
import Stomp from "stompjs";
import SockJS from "sockjs-client";
import WebRtcCall from "../../components/webRTC/WebRtcCall";

export default function AmbulanceDashboardPage() {
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const stompClientRef = useRef(null);
  const connectionTimeoutRef = useRef(null);

  // 중복 클릭 방지 상태
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);

  const { user, accessToken } = useAuthStore();
  const {
    selectedAmbulance,
    selectMyAmbulance,
    matchedHospitals,
    patientInfo,
    patientDetails,
    setEditMode,
  } = useEmergencyStore();

  const { isCallActive, callInfo, endCall, setPipMode } = useWebRtcStore();
  const { ambulanceLocation, hospitalDistanceInfo } = useLiveAmbulanceLocation(
    user?.userId
  );

  useEffect(() => {
    setPipMode(false);
  }, [setPipMode]);

  useEffect(() => {
    if (!selectedAmbulance && user?.userId) {
      selectMyAmbulance();
    }
  }, [user?.userId, selectedAmbulance, selectMyAmbulance]);

  // 전체 상태 디버깅
  useEffect(() => {
    console.log("🔍 [전체 상태 디버깅]");
    console.log("👤 user:", user);
    console.log("🔑 accessToken:", !!accessToken);
    console.log("🚑 selectedAmbulance:", selectedAmbulance);
    console.log("🏥 matchedHospitals:", matchedHospitals);
    console.log("📱 isCallActive:", isCallActive);
    console.log("📞 callInfo:", callInfo);
    console.log("🚫 isRequestInProgress:", isRequestInProgress);

    console.log("🖥️ [UI 상태]", {
      willShowButton: !isCallActive || !callInfo,
      willShowWebRTC: isCallActive && callInfo,
    });
  }, [
    user,
    accessToken,
    selectedAmbulance,
    matchedHospitals,
    isCallActive,
    callInfo,
    isRequestInProgress,
  ]);

  // 버튼 활성화 상태 체크
  const isButtonDisabled = useMemo(() => {
    const disabled =
      !matchedHospitals[0] ||
      !user?.userKey ||
      !accessToken ||
      isRequestInProgress;
    console.log("🔘 버튼 비활성화 상태:", {
      disabled,
      hasMatchedHospital: !!matchedHospitals[0],
      hasUserKey: !!user?.userKey,
      hasAccessToken: !!accessToken,
      isRequestInProgress,
    });
    return disabled;
  }, [matchedHospitals, user?.userKey, accessToken, isRequestInProgress]);

  // WebSocket 정리 함수
  const cleanupWebSocket = useCallback(() => {
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }

    if (stompClientRef.current && stompClientRef.current.connected) {
      try {
        stompClientRef.current.disconnect(() => {
          console.log("🔌 WebSocket 연결 정리 완료");
        });
      } catch (error) {
        console.error("WebSocket 정리 중 오류:", error);
      }
    }

    stompClientRef.current = null;
  }, []);

  const handleRequestCall = useCallback(() => {
    console.log("🔘🔘🔘 전화 요청 버튼 클릭됨 - 함수 시작");

    // 중복 실행 방지
    if (isRequestInProgress) {
      console.log("⚠️ 이미 요청이 진행 중입니다.");
      return;
    }

    // 필수 조건 체크
    if (!matchedHospitals[0]) {
      console.log("❌ 매칭된 병원 없음");
      alert("매칭된 병원 정보가 없습니다.");
      return;
    }

    if (!user?.userKey) {
      console.log("❌ 사용자 키 없음:", user);
      alert("사용자 정보가 없습니다.");
      return;
    }

    if (!accessToken) {
      console.log("❌ 액세스 토큰 없음");
      alert("인증 토큰이 없습니다. 다시 로그인해주세요.");
      return;
    }

    console.log("✅ 모든 필수 정보 확인됨, WebSocket 연결 시작");

    // 진행 상태 설정
    setIsRequestInProgress(true);

    // 기존 연결 정리
    cleanupWebSocket();

    // WebSocket URL 설정
    const WS_BASE_URL = (
      import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8080/ws"
    )
      .replace(/^ws:\/\//, "http://")
      .replace(/^wss:\/\//, "https://");

    const fullUrl = `${WS_BASE_URL}?token=${accessToken}`;

    console.log("🔗 WebSocket URL:", fullUrl);

    try {
      const socket = new SockJS(fullUrl);
      const stompClient = Stomp.over(socket);

      stompClient.debug = null;
      stompClientRef.current = stompClient;

      // 연결 타임아웃 설정
      connectionTimeoutRef.current = setTimeout(() => {
        console.error("❌ WebSocket 연결 타임아웃");
        setIsRequestInProgress(false);
        cleanupWebSocket();
        alert("서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요.");
      }, 10000);

      stompClient.connect(
        {
          Authorization: `Bearer ${accessToken}`,
        },
        (frame) => {
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
          }

          console.log("📞 전화 요청을 위해 WebSocket 연결 성공", frame);

          const requestAlarm = {
            type: "REQUEST",
            ambulanceKey: user.userKey,
            hospitalId:
              matchedHospitals[0].hospitalId || matchedHospitals[0].id,
            message: isCallActive
              ? `구급차(${user.userKey})에서 긴급 추가 알림을 요청했습니다.`
              : `구급차(${user.userKey})에서 통화를 요청했습니다.`,
            timestamp: new Date().toISOString(),
          };

          console.log(
            "📤 전송할 알림 메시지:",
            JSON.stringify(requestAlarm, null, 2)
          );

          try {
            stompClient.send(
              "/pub/alarm/send",
              {},
              JSON.stringify(requestAlarm)
            );
            console.log("📤 전화 요청 알림 전송 완료");

            const alertMessage = isCallActive
              ? "병원에 긴급 추가 알림을 전송했습니다."
              : "병원에 통화를 요청했습니다. 잠시만 기다려주세요.";

            alert(alertMessage);

            // 전송 후 연결 정리
            setTimeout(() => {
              setIsRequestInProgress(false);
              cleanupWebSocket();
            }, 1000);
          } catch (sendError) {
            console.error("❌ 메시지 전송 실패:", sendError);
            alert("메시지 전송에 실패했습니다.");
            setIsRequestInProgress(false);
            cleanupWebSocket();
          }
        },
        (error) => {
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
          }

          console.error("❌ 전화 요청 WebSocket 연결 실패:", error);
          setIsRequestInProgress(false);
          cleanupWebSocket();

          let errorMessage = "병원에 통화 요청을 보내는 데 실패했습니다.";
          if (
            error.toString().includes("401") ||
            error.toString().includes("Unauthorized")
          ) {
            errorMessage = "인증이 만료되었습니다. 다시 로그인해주세요.";
          } else if (error.toString().includes("404")) {
            errorMessage = "서버를 찾을 수 없습니다. 관리자에게 문의하세요.";
          } else if (error.toString().includes("timeout")) {
            errorMessage =
              "서버 응답 시간이 초과되었습니다. 다시 시도해주세요.";
          }

          alert(errorMessage);
        }
      );
    } catch (error) {
      console.error("❌ WebSocket 생성 중 오류:", error);
      setIsRequestInProgress(false);
      cleanupWebSocket();
      alert("WebSocket 연결 중 오류가 발생했습니다: " + error.message);
    }
  }, [
    user,
    matchedHospitals,
    accessToken,
    isRequestInProgress,
    isCallActive,
    cleanupWebSocket,
  ]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      cleanupWebSocket();
    };
  }, [cleanupWebSocket]);

  // 강력한 클릭 핸들러
  const handleButtonClick = useCallback(
    (event) => {
      console.log("🖱️ handleButtonClick 호출됨", {
        event,
        target: event.target,
        currentTarget: event.currentTarget,
        disabled: isButtonDisabled,
        isRequestInProgress,
      });

      event.stopPropagation();
      event.preventDefault();

      if (!isButtonDisabled && !isRequestInProgress) {
        handleRequestCall();
      } else {
        console.log("🔘 버튼이 비활성화되어 클릭이 무시됨");
      }
    },
    [handleRequestCall, isButtonDisabled, isRequestInProgress]
  );

  // 테스트용 함수들
  const testButtonClick = useCallback(() => {
    console.log("🧪🧪🧪 테스트 버튼 클릭됨");
    console.log("🧪 현재 상태:", {
      user: user,
      accessToken: !!accessToken,
      matchedHospital: !!matchedHospitals[0],
      selectedAmbulance: !!selectedAmbulance,
      isButtonDisabled,
      isCallActive,
      callInfo,
      isRequestInProgress,
    });
    alert("테스트 버튼이 정상적으로 클릭됩니다!");
  }, [
    user,
    accessToken,
    matchedHospitals,
    selectedAmbulance,
    isButtonDisabled,
    isCallActive,
    callInfo,
    isRequestInProgress,
  ]);

  const forceEndCall = useCallback(() => {
    console.log("🔚 강제 통화 종료");
    endCall();
    setIsRequestInProgress(false); // 요청 상태도 초기화
    cleanupWebSocket();
    alert("통화를 강제로 종료했습니다.");
  }, [endCall, cleanupWebSocket]);

  const goToPatientInput = () => {
    const status = selectedAmbulance?.status?.toLowerCase();
    if (status === "wait" || status === "standby") {
      alert("출동 지시를 받은 후 환자 정보를 입력할 수 있습니다.");
      return;
    }
    setEditMode(true);
    navigate("/emergency/patient-input", { state: { isEditMode: true } });
  };

  const matchedHospital = useMemo(
    () => matchedHospitals[0],
    [matchedHospitals]
  );

  if (!selectedAmbulance) {
    return (
      <AmbulanceLayout>
        <p>구급차 정보 로딩 중...</p>
      </AmbulanceLayout>
    );
  }

  return (
    <AmbulanceLayout>
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 환자 정보 섹션 */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">환자 정보</h2>
              <button
                onClick={goToPatientInput}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
              >
                정보 입력/수정
              </button>
            </div>
            <div className="text-sm space-y-2">
              <p>
                <strong>이름:</strong> {patientInfo?.name || "-"}
              </p>
              <p>
                <strong>KTAS:</strong> {patientDetails?.ktasLevel || "-"}
              </p>
              <p>
                <strong>주요 증상:</strong>{" "}
                {patientDetails?.chiefComplaint ||
                  patientDetails?.medicalRecord ||
                  "-"}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">병원 매칭</h2>
            {matchedHospital ? (
              <HospitalCard hospital={matchedHospital} simple />
            ) : (
              <p className="text-gray-500">매칭 대기 중...</p>
            )}
          </div>
        </div>

        {/* 지도 섹션 */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">실시간 위치</h2>
            <button
              onClick={() => navigate("/emergency/map")}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-xs hover:bg-gray-300 transition-colors"
            >
              전체화면
            </button>
          </div>
          <div className="flex-grow">
            <MapDisplay
              hospital={matchedHospital}
              ambulanceLocation={ambulanceLocation}
              distanceInfo={hospitalDistanceInfo}
            />
          </div>
        </div>

        {/* 화상 통화 섹션 */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md flex flex-col">
          <h2 className="text-xl font-bold mb-4">화상 통화</h2>
          <div className="flex-grow h-full min-h-[300px] bg-gray-200 rounded-lg flex items-center justify-center">
            {isCallActive && callInfo ? (
              // 화상통화가 활성화된 경우
              <div className="w-full h-full relative">
                <WebRtcCall
                  sessionId={String(callInfo.sessionId)}
                  ambulanceNumber={callInfo.ambulanceNumber}
                  hospitalId={callInfo.hospitalId}
                  patientName={callInfo.patientName}
                  ktas={callInfo.ktas}
                  onLeave={endCall}
                  // 🔥 추가 props 전달
                  onRequestCall={handleRequestCall}
                  isRequestInProgress={isRequestInProgress}
                  userRole="ambulance"
                  showRequestButton={true}
                />

                {/* 🔥 통화 중 하단 컨트롤 패널 */}
              </div>
            ) : (
              // 화상통화가 비활성화된 경우 - 기존 버튼 표시
              <div className="text-center space-y-4 w-full relative">
                <p className="text-gray-500 mb-4">
                  병원과 화상 통화가 필요하신가요?
                </p>

                {/* 개발자 도구 */}
              </div>
            )}
          </div>
          {/* 현재 UI 상태를 명확히 표시 */}화{" "}
        </div>
      </div>
    </AmbulanceLayout>
  );
}
