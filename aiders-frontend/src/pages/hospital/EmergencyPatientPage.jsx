import { useState, useEffect } from "react";
import HospitalHeader from "../../components/hospital/HospitalHeader";
import VideoCallManager from "../../components/hospital/VideoCallManager";
import useEmergencyStore from "../../store/useEmergencyStore";
import useWaitingAmbulanceStore from "../../store/useWaitingAmbulanceStore";
import { useAuthStore } from "../../store/useAuthStore";

const AmbulanceList = ({ selectedAmbulance, onSelectAmbulance }) => {
  const { ambulances, isLoading, error, fetchWaitingAmbulances } =
    useWaitingAmbulanceStore();

  // 컴포넌트 마운트 시 대기 중인 구급차 데이터 로드
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.userId) {
      console.log("[AmbulanceList] Fetching for hospital:", user.userId);
      fetchWaitingAmbulances(user.userId);

      // 30초마다 목록을 새로고침
      const intervalId = setInterval(
        () => fetchWaitingAmbulances(user.userId),
        30000
      );
      return () => clearInterval(intervalId);
    }
  }, [fetchWaitingAmbulances, user?.userId]);
  return (
    <div
      style={{
        width: "320px",
        backgroundColor: "white",
        borderRight: "2px solid #e5e7eb",
        padding: "20px",
        overflow: "auto",
        height: "calc(100vh - 64px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "20px",
          paddingBottom: "16px",
          borderBottom: "2px solid #e5e7eb",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            marginRight: "8px",
          }}
        >
          🚑
        </div>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "#1f2937",
            margin: 0,
          }}
        >
          대기중인 구급차
        </h3>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {isLoading ? (
          <div
            style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}
          >
            로딩 중...
          </div>
        ) : error ? (
          <div
            style={{ textAlign: "center", padding: "20px", color: "#ef4444" }}
          >
            오류가 발생했습니다: {error}
          </div>
        ) : ambulances.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}
          >
            현재 대기중인 구급차가 없습니다.
          </div>
        ) : (
          ambulances.map((ambulance) => (
            <div
              key={ambulance.id}
              onClick={() => onSelectAmbulance(ambulance)}
              style={{
                padding: "16px",
                backgroundColor:
                  selectedAmbulance?.id === ambulance.id
                    ? "#eff6ff"
                    : "#f8fafc",
                border:
                  selectedAmbulance?.id === ambulance.id
                    ? "2px solid #3b82f6"
                    : "1px solid #e2e8f0",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (selectedAmbulance?.id !== ambulance.id) {
                  e.target.style.backgroundColor = "#f1f5f9";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedAmbulance?.id !== ambulance.id) {
                  e.target.style.backgroundColor = "#f8fafc";
                }
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontWeight: "600",
                    color: "#1f2937",
                    fontSize: "14px",
                  }}
                >
                  구급차 ID: {ambulance.ambulanceId}
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      backgroundColor: ambulance.isInCall
                        ? "#ef4444"
                        : "#10b981",
                      borderRadius: "50%",
                    }}
                  ></div>
                  <span
                    style={{
                      fontSize: "12px",
                      color: ambulance.isInCall ? "#ef4444" : "#10b981",
                      fontWeight: "600",
                    }}
                  >
                    {ambulance.isInCall ? "통화중" : "대기중"}
                  </span>
                </div>
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  marginBottom: "8px",
                }}
              >
                <div style={{ marginBottom: "2px" }}>
                  <strong>환자명:</strong>{" "}
                  {ambulance.patientName || (
                    <span style={{ color: "#9ca3af" }}>DB에서 조회 필요</span>
                  )}
                </div>
                <div style={{ marginBottom: "2px" }}>
                  <strong>KTAS:</strong>{" "}
                  {ambulance.ktas ? (
                    `${ambulance.ktas}등급`
                  ) : (
                    <span style={{ color: "#9ca3af" }}>DB에서 조회 필요</span>
                  )}
                </div>
                <div>
                  <strong>세션:</strong> {ambulance.sessionId || "생성중"}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >

                <span
                  style={{
                    fontSize: "11px",
                    color: "#9ca3af",
                  }}
                >
                  등록시간:{" "}
                  {ambulance.createdAt
                    ? new Date(ambulance.createdAt).toLocaleString("ko-KR")
                    : "방금전"}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    backgroundColor:
                      ambulance.ktas <= 2
                        ? "#fee2e2"
                        : ambulance.ktas <= 3
                        ? "#fef3c7"
                        : "#f3f4f6",
                    color:
                      ambulance.ktas <= 2
                        ? "#991b1b"
                        : ambulance.ktas <= 3
                        ? "#92400e"
                        : "#374151",
                    fontWeight: "600",
                  }}
                >
                  {ambulance.ktas ? `KTAS ${ambulance.ktas}` : "미분류"}
                </span>
                                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 카드 클릭 이벤트 방지!
                    // 여기에 통화 시작 로직(예: props로 받은 onStartCall(ambulance) 등)
                  }}
                >
                  통화 시작
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const VideoCallTab = ({
  selectedAmbulance,
  hospitalId,
  onCallStatusChange,
}) => {
  return (
    <div
      style={{
        height: "calc(100vh - 160px)",
        display: "flex",
        gap: "20px",
        padding: "20px",
      }}
    >
      {/* 메인 화상통화 영역 */}
      <div
        style={{
          flex: 2,
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            paddingBottom: "16px",
            borderBottom: "2px solid #e5e7eb",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#1f2937",
              margin: 0,
            }}
          >
            구급차 화상통화
          </h3>
        </div>

        {/* VideoCallManager - 실제 WebRTC 연결 */}
        <div style={{ flex: 1 }}>
          <VideoCallManager
            selectedAmbulance={selectedAmbulance}
            hospitalId={hospitalId}
            onCallStatusChange={onCallStatusChange}
            renderMode="full"
          />
        </div>
      </div>

      {/* 사이드 정보 패널 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* 환자 기본 정보 */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h4
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "#1f2937",
              marginBottom: "16px",
            }}
          >
            환자 정보
          </h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              fontSize: "14px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280" }}>성별/나이:</span>
              <span style={{ fontWeight: "600" }}>
                {selectedAmbulance?.patientInfo?.basicInfo ||
                  "선택된 구급차 없음"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280" }}>증상:</span>
              <span style={{ fontWeight: "600", color: "#ef4444" }}>
                {selectedAmbulance?.condition || "-"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280" }}>우선순위:</span>
              <span
                style={{
                  padding: "4px 8px",
                  backgroundColor:
                    selectedAmbulance?.priority === "응급"
                      ? "#fee2e2"
                      : selectedAmbulance?.priority === "긴급"
                      ? "#fef3c7"
                      : "#f3f4f6",
                  color:
                    selectedAmbulance?.priority === "응급"
                      ? "#991b1b"
                      : selectedAmbulance?.priority === "긴급"
                      ? "#92400e"
                      : "#374151",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                {selectedAmbulance?.priority || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* 구급차 정보 */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h4
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "#1f2937",
              marginBottom: "16px",
            }}
          >
            구급차 정보
          </h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              fontSize: "14px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280" }}>차량번호:</span>
              <span style={{ fontWeight: "600" }}>
                {selectedAmbulance?.vehicleNumber || "-"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280" }}>현재거리:</span>
              <span style={{ fontWeight: "600" }}>
                {selectedAmbulance?.distance || "-"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280" }}>도착예정:</span>
              <span style={{ fontWeight: "600", color: "#10b981" }}>
                {selectedAmbulance?.eta || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* 실시간 메모 */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            flex: 1,
          }}
        >
          <h4
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "#1f2937",
              marginBottom: "16px",
            }}
          >
            실시간 메모
          </h4>
          <textarea
            placeholder="통화 중 중요 사항을 기록하세요..."
            style={{
              width: "100%",
              height: "120px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "14px",
              resize: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
};

const DetailInfoTab = ({
  selectedAmbulance,
  newTreatment,
  setNewTreatment,
  addTreatmentRecord,
  hospitalId,
  isCallActive,
  currentCallAmbulance,
}) => {
  const patientDetails = selectedAmbulance?.patientDetails;

  return (
    <div
      style={{
        height: "calc(100vh - 160px)",
        display: "flex",
        gap: "20px",
        padding: "20px",
      }}
    >
      {/* 좌측 - 환자 상세 정보 */}
      <div
        style={{
          flex: 2,
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          overflow: "auto",
        }}
      >
        <h3
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "#1f2937",
            marginBottom: "24px",
            paddingBottom: "16px",
            borderBottom: "2px solid #e5e7eb",
          }}
        >
          환자 상세 정보
        </h3>

        {/* 기본 정보 */}
        <div style={{ marginBottom: "32px" }}>
          <h4
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "16px",
            }}
          >
            기본 정보
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              fontSize: "14px",
            }}
          >
            <div>
              <label
                style={{
                  color: "#6b7280",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                성명
              </label>
              <div style={{ fontWeight: "600" }}>
                {selectedAmbulance?.patientInfo?.name || "-"}
              </div>
            </div>
            <div>
              <label
                style={{
                  color: "#6b7280",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                성별/연령
              </label>
              <div style={{ fontWeight: "600" }}>
                {selectedAmbulance?.patientInfo?.basicInfo || "-"}
              </div>
            </div>
            <div>
              <label
                style={{
                  color: "#6b7280",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                KTAS 등급
              </label>
              <div
                style={{
                  fontWeight: "600",
                  color: "#f59e0b",
                  backgroundColor: "#fef3c7",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  display: "inline-block",
                }}
              >
                {patientDetails?.ktasLevel || "KTAS 등급 미정"}
              </div>
            </div>
            <div>
              <label
                style={{
                  color: "#6b7280",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                내원 경위
              </label>
              <div
                style={{
                  fontWeight: "600",
                  fontSize: "13px",
                  lineHeight: "1.4",
                }}
              >
                {patientDetails?.admissionRoute || "-"}
              </div>
            </div>
          </div>
        </div>

        {/* 활력징후 */}
        <div style={{ marginBottom: "32px" }}>
          <h4
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "16px",
            }}
          >
            활력징후
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              fontSize: "14px",
            }}
          >
            <div>
              <label
                style={{
                  color: "#6b7280",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                혈압
              </label>
              <div style={{ fontWeight: "600", color: "#ef4444" }}>
                {patientDetails?.vitalSigns?.bloodPressure || "-"}
              </div>
            </div>
            <div>
              <label
                style={{
                  color: "#6b7280",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                맥박
              </label>
              <div style={{ fontWeight: "600", color: "#ef4444" }}>
                {patientDetails?.vitalSigns?.pulse || "-"}
              </div>
            </div>
            <div>
              <label
                style={{
                  color: "#6b7280",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                호흡
              </label>
              <div style={{ fontWeight: "600", color: "#ef4444" }}>
                {patientDetails?.vitalSigns?.respiration || "-"}
              </div>
            </div>
            <div>
              <label
                style={{
                  color: "#6b7280",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                체온
              </label>
              <div style={{ fontWeight: "600" }}>
                {patientDetails?.vitalSigns?.temperature || "-"}
              </div>
            </div>
            <div>
              <label
                style={{
                  color: "#6b7280",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                산소포화도
              </label>
              <div style={{ fontWeight: "600", color: "#ef4444" }}>
                {patientDetails?.vitalSigns?.oxygenSaturation || "-"}
              </div>
            </div>
            <div>
              <label
                style={{
                  color: "#6b7280",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                의식상태
              </label>
              <div style={{ fontWeight: "600" }}>
                {patientDetails?.vitalSigns?.consciousness || "-"}
              </div>
            </div>
          </div>
        </div>

        {/* 현병력 */}
        <div style={{ marginBottom: "32px" }}>
          <h4
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "16px",
            }}
          >
            현병력 및 주증상
          </h4>
          <div style={{ fontSize: "14px" }}>
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  color: "#6b7280",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                주증상
              </label>
              <div style={{ fontWeight: "600", color: "#ef4444" }}>
                {patientDetails?.chiefComplaint || "-"}
              </div>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  color: "#6b7280",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                응급 지속 시간
              </label>
              <div style={{ fontWeight: "600" }}>
                {patientDetails?.duration || "-"}
              </div>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  color: "#6b7280",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                발병 상황
              </label>
              <div style={{ fontWeight: "600" }}>
                {patientDetails?.onsetSituation || "-"}
              </div>
            </div>
            <div>
              <label
                style={{
                  color: "#6b7280",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                동반 증상
              </label>
              <div style={{ fontWeight: "600" }}>
                {patientDetails?.accompanyingSymptoms || "-"}
              </div>
            </div>
          </div>
        </div>

        {/* 과거력 */}
        <div style={{ marginBottom: "32px" }}>
          <h4
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "16px",
            }}
          >
            과거력
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              fontSize: "14px",
            }}
          >
            <div>
              <label
                style={{
                  color: "#6b7280",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                고혈압
              </label>
              <div style={{ fontWeight: "600" }}>
                {patientDetails?.pastHistory?.hypertension || "-"}
              </div>
            </div>
            <div>
              <label
                style={{
                  color: "#6b7280",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                당뇨병
              </label>
              <div style={{ fontWeight: "600" }}>
                {patientDetails?.pastHistory?.diabetes || "-"}
              </div>
            </div>
            <div>
              <label
                style={{
                  color: "#6b7280",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                갑상선기능저하증
              </label>
              <div style={{ fontWeight: "600" }}>
                {patientDetails?.pastHistory?.hypothyroidism || "-"}
              </div>
            </div>
            <div>
              <label
                style={{
                  color: "#6b7280",
                  marginBottom: "4px",
                  display: "block",
                }}
              >
                골다공증
              </label>
              <div style={{ fontWeight: "600" }}>
                {patientDetails?.pastHistory?.osteoporosis || "-"}
              </div>
            </div>
          </div>
        </div>

        {/* 복용약물 */}
        <div style={{ marginBottom: "32px" }}>
          <h4
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "16px",
            }}
          >
            현재 복용 중인 약물
          </h4>
          <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
            {patientDetails?.medications?.map((medication, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "8px",
                  padding: "8px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "4px",
                }}
              >
                <strong>{medication.name}</strong> - {medication.frequency}{" "}
                {medication.indication && `(${medication.indication})`}
              </div>
            )) || <div style={{ color: "#6b7280" }}>복용약물 정보 없음</div>}
          </div>
        </div>

        {/* 가족력 */}
        <div style={{ marginBottom: "32px" }}>
          <h4
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "16px",
            }}
          >
            가족력
          </h4>
          <div style={{ fontSize: "14px" }}>
            <div style={{ marginBottom: "8px" }}>
              <strong>부:</strong>{" "}
              {patientDetails?.familyHistory?.father || "-"}
            </div>
            <div style={{ marginBottom: "8px" }}>
              <strong>모:</strong>{" "}
              {patientDetails?.familyHistory?.mother || "-"}
            </div>
            <div>
              <strong>형제자매:</strong>{" "}
              {patientDetails?.familyHistory?.siblings || "-"}
            </div>
          </div>
        </div>

        {/* 이송 정보 */}
        <div>
          <h4
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "16px",
            }}
          >
            이송 정보
          </h4>
          <div
            style={{
              backgroundColor: "#f0f9ff",
              border: "1px solid #bfdbfe",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "14px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <div>
                <strong>출동 시간:</strong>{" "}
                {patientDetails?.transportInfo?.dispatchTime || "-"}
              </div>
              <div>
                <strong>현장 도착:</strong>{" "}
                {patientDetails?.transportInfo?.arrivalTime || "-"}
              </div>
              <div>
                <strong>현장 출발:</strong>{" "}
                {patientDetails?.transportInfo?.departureTime || "-"}
              </div>
              <div>
                <strong>병원 도착:</strong>{" "}
                {patientDetails?.transportInfo?.hospitalArrival || "-"}
              </div>
            </div>
            <div
              style={{
                borderTop: "1px solid #bfdbfe",
                paddingTop: "8px",
                fontSize: "13px",
                color: "#0369a1",
              }}
            >
              <div>
                <strong>총 이송 거리:</strong>{" "}
                {patientDetails?.transportInfo?.totalDistance || "-"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 우측 - 처치 기록 및 화상통화 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* 축소된 화상통화 화면 */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            height: "280px",
          }}
        >
          <h4
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "#1f2937",
              marginBottom: "12px",
            }}
          >
            화상통화
          </h4>

          <div style={{ height: "240px" }}>
            <VideoCallManager
              selectedAmbulance={
                isCallActive ? currentCallAmbulance : selectedAmbulance
              }
              hospitalId={hospitalId}
              onCallStatusChange={() => {}} // DetailInfoTab는 읽기 전용
              renderMode="compact"
            />
          </div>
        </div>

        {/* 처치 기록 */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            flex: 1,
            overflow: "auto",
          }}
        >
          <h3
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#1f2937",
              marginBottom: "24px",
              paddingBottom: "16px",
              borderBottom: "2px solid #e5e7eb",
            }}
          >
            응급처치 기록
          </h3>

          {/* 타임라인 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {(selectedAmbulance?.treatmentRecords || []).map(
              (record, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "16px",
                    paddingBottom: "16px",
                    borderBottom:
                      index < selectedAmbulance?.treatmentRecords?.length - 1
                        ? "1px solid #f3f4f6"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#3b82f6",
                      color: "white",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "600",
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "4px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#1f2937",
                          fontSize: "14px",
                        }}
                      >
                        {record.action}
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                        }}
                      >
                        {record.time}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                      }}
                    >
                      {record.detail}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* 새 기록 추가 */}
          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              border: "1px dashed #d1d5db",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "12px",
              }}
            >
              새 처치 기록 추가
            </div>
            <textarea
              value={newTreatment}
              onChange={(e) => setNewTreatment(e.target.value)}
              placeholder="처치 내용을 입력하세요..."
              style={{
                width: "100%",
                height: "60px",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                padding: "8px",
                fontSize: "14px",
                resize: "none",
                marginBottom: "8px",
              }}
            />
            <button
              onClick={() => {
                if (newTreatment.trim() && selectedAmbulance) {
                  addTreatmentRecord(selectedAmbulance.id, {
                    action: "의료진 기록",
                    detail: newTreatment.trim(),
                  });
                  setNewTreatment("");
                }
              }}
              style={{
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                fontSize: "14px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              기록 추가
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function EmergencyPatientPage() {
  const [activeTab, setActiveTab] = useState("video");
  const {
    selectedAmbulance,
    selectAmbulance,
    addTreatmentRecord,
    fetchHospitalAmbulances,
  } = useEmergencyStore();
  const [newTreatment, setNewTreatment] = useState("");
  const [isCallActive, setIsCallActive] = useState(false);
  const [currentCallAmbulance, setCurrentCallAmbulance] = useState(null);
  const { user } = useAuthStore();

  const handleCallStatusChange = (isActive, ambulance) => {
    setIsCallActive(isActive);
    setCurrentCallAmbulance(ambulance);
  };

  // 페이지 마운트 시 병원 구급차 데이터 로드
  useEffect(() => {
    const { fetchAmbulances } = useEmergencyStore.getState();
    fetchAmbulances();
  }, []);

  return (
    <>
      <HospitalHeader />

      <main
        style={{
          paddingTop: "64px",
          minHeight: "100vh",
          backgroundColor: "#f9fafb",
          display: "flex",
        }}
      >
        {/* 왼쪽 구급차 목록 */}
        <AmbulanceList
          selectedAmbulance={selectedAmbulance}
          onSelectAmbulance={selectAmbulance}
        />

        {/* 오른쪽 메인 콘텐츠 */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* 페이지 제목 */}
          <div
            style={{
              padding: "24px 24px 0 24px",
            }}
          >
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#1f2937",
                marginBottom: "8px",
              }}
            >
              구급환자 관리
            </h1>
            <p
              style={{
                color: "#6b7280",
                fontSize: "16px",
                marginBottom: "16px",
              }}
            >
              구급차와의 화상통화 및 환자 상세 정보를 관리합니다.
            </p>
          </div>

          {/* 탭 네비게이션 */}
          <div
            style={{
              borderBottom: "2px solid #e5e7eb",
              margin: "0 24px 0 24px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "0",
              }}
            >
              <button
                onClick={() => setActiveTab("video")}
                style={{
                  padding: "20px 40px",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom:
                    activeTab === "video"
                      ? "3px solid #3b82f6"
                      : "3px solid transparent",
                  color: activeTab === "video" ? "#3b82f6" : "#6b7280",
                  fontWeight: activeTab === "video" ? "600" : "500",
                  fontSize: "18px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  flex: 1,
                }}
              >
                📹 화상전화
              </button>
              <button
                onClick={() => setActiveTab("detail")}
                style={{
                  padding: "20px 40px",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom:
                    activeTab === "detail"
                      ? "3px solid #3b82f6"
                      : "3px solid transparent",
                  color: activeTab === "detail" ? "#3b82f6" : "#6b7280",
                  fontWeight: activeTab === "detail" ? "600" : "500",
                  fontSize: "18px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  flex: 1,
                }}
              >
                📋 상세정보
              </button>
            </div>
          </div>

          {/* 탭 콘텐츠 */}
          {activeTab === "video" && (
            <VideoCallTab
              selectedAmbulance={selectedAmbulance}
              hospitalId={user?.userId}
              onCallStatusChange={handleCallStatusChange}
            />
          )}
          {activeTab === "detail" && (
            <DetailInfoTab
              selectedAmbulance={selectedAmbulance}
              newTreatment={newTreatment}
              setNewTreatment={setNewTreatment}
              addTreatmentRecord={addTreatmentRecord}
              hospitalId={user?.userId}
              isCallActive={isCallActive}
              currentCallAmbulance={currentCallAmbulance}
            />
          )}
        </div>
      </main>
    </>
  );
}
