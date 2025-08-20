import React, { useEffect, useState, useMemo } from 'react';
import useWaitingAmbulanceStore from '../../store/useWaitingAmbulanceStore';
import { useAuthStore } from '../../store/useAuthStore';
import useHospitalAlarmRefresh from '../../hooks/useHospitalAlarmRefresh';
import { getPatientInfo } from '../../api/api';

const WaitingAmbulanceList = ({ onStartCall, showCallButton = false, compact = false }) => {
  const { ambulances, isLoading, error, fetchWaitingAmbulances } = useWaitingAmbulanceStore();
  const { user } = useAuthStore();
  const [ambulanceDetails, setAmbulanceDetails] = useState({});

  // 서버에서 받은 구급차 목록을 그대로 사용
  const displayAmbulances = useMemo(() => {
    return ambulances || [];
  }, [ambulances]);
  
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
  }, ['MATCHING', 'REQUEST', 'COMPLETE']); // 매칭 완료, 통화 요청, 이송 완료 알람에 반응

  // 구급차 세부 정보 조회
  const fetchAmbulanceDetails = async (ambulances) => {
    if (!ambulances || ambulances.length === 0) {
      setAmbulanceDetails({});
      return;
    }

    const details = {};
    
    for (const ambulance of ambulances) {
      try {
        // sessionId를 ambulanceId로 사용해서 환자 정보 조회
        const patientInfo = await getPatientInfo(ambulance.sessionId);
        details[ambulance.sessionId] = {
          department: patientInfo?.department || "미기재",
          ktas: patientInfo?.ktas || ambulance.ktas,
          patientName: patientInfo?.name || ambulance.patientName
        };
      } catch (error) {
        console.warn(`구급차 ${ambulance.sessionId} 환자 정보 조회 실패:`, error);
        details[ambulance.sessionId] = {
          department: "미기재",
          ktas: ambulance.ktas,
          patientName: ambulance.patientName
        };
      }
    }
    
    setAmbulanceDetails(details);
  };

  useEffect(() => {
    if (user?.userId) {
      fetchWaitingAmbulances(user.userId);

      const intervalId = setInterval(() => fetchWaitingAmbulances(user.userId), 15000);

      return () => clearInterval(intervalId);
    }
  }, [fetchWaitingAmbulances, user?.userId]);

  // 구급차 목록이 변경될 때마다 세부 정보 조회
  useEffect(() => {
    if (displayAmbulances.length > 0) {
      fetchAmbulanceDetails(displayAmbulances);
    }
  }, [JSON.stringify(displayAmbulances?.map(amb => amb.sessionId))]);

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
        border: "2px solid #e5e7eb",
        borderRadius: "12px",
        padding: compact ? "12px" : "20px",
        overflow: "auto",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: compact ? "16px" : "20px",
          paddingBottom: compact ? "12px" : "16px",
          borderBottom: "2px solid #e5e7eb",
        }}
      >
        <h3
          style={{
            fontSize: "30px",
            fontWeight: "bold",
            color: "#1f2937",
            margin: 0,
            textAlign: "center",
          }}
        >
          이송중인 구급차
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
        ) : displayAmbulances.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}
          >
            현재 이송중인 구급차가 없습니다.
          </div>
        ) : (
          displayAmbulances.map((ambulance) => (
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
                    fontWeight: "700",
                    color: "#1f2937",
                    fontSize: compact ? "18px" : "20px",
                  }}
                >
{ambulance.ambulanceNumber}
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: compact ? "18px" : "20px",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      backgroundColor: ambulance.isInCall ? "#dcfce7" : "#fef3c7",
                      color: ambulance.isInCall ? "#166534" : "#92400e",
                      fontWeight: "600",
                      border: `1px solid ${ambulance.isInCall ? "#bbf7d0" : "#fde68a"}`,
                    }}
                  >
                    {ambulance.isInCall ? "연결중" : "대기중"}
                  </span>
                </div>
              </div>

              <div
                onClick={() => handleCallStart(ambulance)}
                style={{
                  fontSize: compact ? "16px" : "18px",
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
                  <span style={{ color: "#9ca3af", fontWeight: "bold" }}>진료과목:</span>{" "}
                  <strong>{ambulanceDetails[ambulance.sessionId]?.department || "조회중..."}</strong>
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <span style={{ color: "#9ca3af", fontWeight: "bold" }}>KTAS:</span>{" "}
                  <span
                    style={{
                      marginLeft: "4px",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: compact ? "16px" : "18px",
                      backgroundColor:
                        (ambulanceDetails[ambulance.sessionId]?.ktas || ambulance.ktas) <= 2
                          ? "#fee2e2"
                          : (ambulanceDetails[ambulance.sessionId]?.ktas || ambulance.ktas) <= 3
                          ? "#fef3c7"
                          : "#f3f4f6",
                      color:
                        (ambulanceDetails[ambulance.sessionId]?.ktas || ambulance.ktas) <= 2
                          ? "#991b1b"
                          : (ambulanceDetails[ambulance.sessionId]?.ktas || ambulance.ktas) <= 3
                          ? "#92400e"
                          : "#374151",
                      fontWeight: "600",
                    }}
                  >
                    {ambulanceDetails[ambulance.sessionId]?.ktas || ambulance.ktas ? 
                      `${ambulanceDetails[ambulance.sessionId]?.ktas || ambulance.ktas}등급` : 
                      "미기재"}
                  </span>
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
                      fontSize: compact ? "12px" : "14px",
                      color: "#9ca3af",
                    }}
                  >
                    등록시간:{" "}
                    {ambulance.createdAt
                      ? new Date(ambulance.createdAt).toLocaleString("ko-KR")
                      : "방금전"}
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
                      fontSize: compact ? "14px" : "16px",
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