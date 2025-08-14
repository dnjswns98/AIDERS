import React, { useEffect } from 'react';
import useWaitingAmbulanceStore from '../../store/useWaitingAmbulanceStore';
import { useAuthStore } from '../../store/useAuthStore';
import useHospitalAlarmRefresh from '../../hooks/useHospitalAlarmRefresh';

const WaitingAmbulanceList = ({ onStartCall, showCallButton = false, compact = false }) => {
  const { ambulances, isLoading, error, fetchWaitingAmbulances } = useWaitingAmbulanceStore();
  const { user } = useAuthStore();
  
  const handleCallStart = (ambulance) => {
    if (onStartCall) {
      onStartCall({
        sessionId: ambulance.sessionId,
        ambulanceNumber: ambulance.ambulanceNumber,
        hospitalId: user?.userId,
        patientName: ambulance.patientName,
        ktas: ambulance.ktas
      });
    }
  };

  // WebSocket 알람 수신 시 자동 새로고침
  useHospitalAlarmRefresh(() => {
    if (user?.userId) {
      fetchWaitingAmbulances(user.userId);
    }
  }, ['MATCHING', 'REQUEST']); // 매칭 완료, 통화 요청 알람에만 반응

  useEffect(() => {
    if (user?.userId) {
      fetchWaitingAmbulances(user.userId);

      const intervalId = setInterval(() => fetchWaitingAmbulances(user.userId), 30000);

      return () => clearInterval(intervalId);
    }
  }, [fetchWaitingAmbulances, user?.userId]);

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>오류가 발생했습니다: {error}</div>;
  }

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "white",
        padding: compact ? "12px" : "20px",
        overflow: "auto",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: compact ? "16px" : "20px",
          paddingBottom: compact ? "12px" : "16px",
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
            fontSize: compact ? "16px" : "18px",
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
          gap: compact ? "8px" : "12px",
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
              key={ambulance.sessionId || ambulance.ambulanceId || ambulance.id}
              style={{
                padding: compact ? "12px" : "16px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                transition: "all 0.2s",
              }}
            >
              <div
                onClick={() => handleCallStart(ambulance)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <span
                  style={{
                    fontWeight: "600",
                    color: "#1f2937",
                    fontSize: compact ? "13px" : "14px",
                  }}
                >
                  구급차 : {ambulance.ambulanceNumber}
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
                      width: compact ? "6px" : "8px",
                      height: compact ? "6px" : "8px",
                      backgroundColor: ambulance.isInCall
                        ? "#10b981"
                        : "#f59e0b",
                      borderRadius: "50%",
                    }}
                  ></div>
                  <span
                    style={{
                      fontSize: compact ? "10px" : "12px",
                      color: ambulance.isInCall ? "#10b981" : "#f59e0b",
                      fontWeight: "600",
                    }}
                  >
                    {ambulance.isInCall ? "연결중" : "대기중"}
                  </span>
                </div>
              </div>

              <div
                onClick={() => handleCallStart(ambulance)}
                style={{
                  fontSize: compact ? "11px" : "12px",
                  color: "#6b7280",
                  marginBottom: "8px",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
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
                <div
                  onClick={() => handleCallStart(ambulance)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "4px",
                    flex: 1,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span
                    style={{
                      fontSize: compact ? "10px" : "11px",
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
                      fontSize: compact ? "10px" : "11px",
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
                      alignSelf: "flex-start",
                    }}
                  >
                    {ambulance.ktas ? `KTAS ${ambulance.ktas}` : "미분류"}
                  </span>
                </div>
                {showCallButton && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCallStart(ambulance);
                    }}
                    disabled={ambulance.isInCall}
                    style={{
                      backgroundColor: ambulance.isInCall ? "#9ca3af" : "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: compact ? "6px 8px" : "8px 12px",
                      fontSize: compact ? "10px" : "12px",
                      fontWeight: "600",
                      cursor: ambulance.isInCall ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                      minWidth: compact ? "50px" : "70px",
                    }}
                    onMouseEnter={(e) => {
                      if (!ambulance.isInCall) {
                        e.target.style.backgroundColor = "#2563eb";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!ambulance.isInCall) {
                        e.target.style.backgroundColor = "#3b82f6";
                      }
                    }}
                  >
                    {ambulance.isInCall ? "통화중" : "통화"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WaitingAmbulanceList;