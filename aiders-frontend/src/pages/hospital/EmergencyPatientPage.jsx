import { useState, useEffect } from "react";
import HospitalHeader from "../../components/hospital/HospitalHeader";
import VideoCallManager from "../../components/hospital/VideoCallManager";
import WebRtcCall from "../../components/webRTC/WebRtcCall";
import useEmergencyStore from "../../store/useEmergencyStore";
import useWaitingAmbulanceStore from "../../store/useWaitingAmbulanceStore";
import { useAuthStore } from "../../store/useAuthStore";
import { startVideoCall, endVideoCall } from "../../api/api";
import useHospitalAlarmRefresh from "../../hooks/useHospitalAlarmRefresh";

const DraggablePipVideoContainer = ({ webRtcComponent }) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    // 헤더 부분에서만 드래그 가능
    if (e.target.closest('.drag-handle')) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const elementWidth = 320;
    const elementHeight = 240;
    
    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;
    
    // 경계 제한: 화면을 벗어나지 않도록
    newX = Math.max(0, Math.min(newX, windowWidth - elementWidth));
    newY = Math.max(0, Math.min(newY, windowHeight - elementHeight));
    
    setPosition({
      x: newX,
      y: newY
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <div
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: isDragging 
          ? '0 12px 35px rgba(0, 0, 0, 0.25)' 
          : '0 8px 25px rgba(0, 0, 0, 0.15)',
        width: '320px',
        height: '240px',
        zIndex: 1000,
        userSelect: 'none',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        transition: isDragging ? 'none' : 'all 0.2s ease',
        border: isDragging ? '2px solid #3b82f6' : '1px solid #e5e7eb',
        overflow: 'hidden'
      }}
    >
      <div
        className="drag-handle"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          borderBottom: '1px solid #e5e7eb',
          cursor: isDragging ? 'grabbing' : 'grab',
          backgroundColor: '#f8fafc'
        }}
        onMouseDown={handleMouseDown}
      >
        <h4
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}
        >
          화상통화 (PIP)
        </h4>
        <div style={{
          fontSize: '12px',
          color: '#6b7280'
        }}>
          드래그로 이동
        </div>
      </div>

      <div style={{ 
        height: '200px',
        pointerEvents: isDragging ? 'none' : 'auto'
      }}>
        {webRtcComponent}
      </div>
    </div>
  );
};

const DraggablePipVideo = ({ webRtcSessionId, hospitalId, onLeave, patientName, ktas }) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    // 헤더 부분에서만 드래그 가능
    if (e.target.closest('.drag-handle')) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const elementWidth = 320;
    const elementHeight = 240;
    
    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;
    
    // 경계 제한: 화면을 벗어나지 않도록
    newX = Math.max(0, Math.min(newX, windowWidth - elementWidth));
    newY = Math.max(0, Math.min(newY, windowHeight - elementHeight));
    
    setPosition({
      x: newX,
      y: newY
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <div
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: isDragging 
          ? '0 12px 35px rgba(0, 0, 0, 0.25)' 
          : '0 8px 25px rgba(0, 0, 0, 0.15)',
        width: '320px',
        height: '240px',
        zIndex: 1000,
        userSelect: 'none',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        transition: isDragging ? 'none' : 'all 0.2s ease',
        border: isDragging ? '2px solid #3b82f6' : '1px solid #e5e7eb',
        overflow: 'hidden'
      }}
    >
      <div
        className="drag-handle"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          borderBottom: '1px solid #e5e7eb',
          cursor: isDragging ? 'grabbing' : 'grab',
          backgroundColor: '#f8fafc'
        }}
        onMouseDown={handleMouseDown}
      >
        <h4
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}
        >
          화상통화
        </h4>
        <div style={{
          fontSize: '12px',
          color: '#6b7280'
        }}>
          드래그로 이동
        </div>
      </div>

      <div style={{ 
        height: '200px',
        pointerEvents: isDragging ? 'none' : 'auto'
      }}>
        <WebRtcCall
          sessionId={webRtcSessionId}
          hospitalId={hospitalId}
          onLeave={onLeave}
          patientName={patientName}
          ktas={ktas}
          renderMode="pip"
        />
      </div>
    </div>
  );
};

const AmbulanceList = ({ selectedAmbulance, onSelectAmbulance, onStartCall }) => {
  const { ambulances, isLoading, error, fetchWaitingAmbulances } =
    useWaitingAmbulanceStore();

  const { user } = useAuthStore();

  // WebSocket 알람 수신 시 자동 새로고침
  useHospitalAlarmRefresh(() => {
    if (user?.userId) {
      fetchWaitingAmbulances(user.userId);
    }
  }, ['MATCHING', 'REQUEST']); // 매칭 완료, 통화 요청 알람에만 반응

  useEffect(() => {
    if (user?.userId) {
      fetchWaitingAmbulances(user.userId);

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
        height: "100%",
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
              key={`ambulance-item-${ambulance.ambulanceNumber}-${ambulance.sessionId || ambulance.ambulanceId || ambulance.id}`}
              style={{
                padding: "16px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                transition: "all 0.2s",
              }}
            >
              <div
                onClick={() => onSelectAmbulance(ambulance)}
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
                    fontSize: "14px",
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
                      width: "8px",
                      height: "8px",
                      backgroundColor: ambulance.isInCall
                        ? "#10b981"
                        : "#f59e0b",
                      borderRadius: "50%",
                    }}
                  ></div>
                  <span
                    style={{
                      fontSize: "12px",
                      color: ambulance.isInCall ? "#10b981" : "#f59e0b",
                      fontWeight: "600",
                    }}
                  >
                    {ambulance.isInCall ? "연결중" : "대기중"}
                  </span>
                </div>
              </div>

              <div
                onClick={() => onSelectAmbulance(ambulance)}
                style={{
                  fontSize: "12px",
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
                  onClick={() => onSelectAmbulance(ambulance)}
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
                      alignSelf: "flex-start",
                    }}
                  >
                    {ambulance.ktas ? `KTAS ${ambulance.ktas}` : "미분류"}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartCall(ambulance);
                  }}
                  disabled={ambulance.isInCall}
                  style={{
                    backgroundColor: ambulance.isInCall ? "#9ca3af" : "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: ambulance.isInCall ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    minWidth: "70px",
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
                  {ambulance.isInCall ? "통화중" : "통화 시작"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const DetailInfoTab = () => {
  return (
    <div
      style={{
        height: "calc(100% - 160px)",
        padding: "20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center", color: "#6b7280" }}>
        <div style={{ fontSize: "24px", marginBottom: "12px" }}>🚧</div>
        <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>제작전</h3>
        <p style={{ fontSize: "14px", marginTop: "4px" }}>해당 기능은 현재 준비 중입니다.</p>
      </div>
    </div>
  );
};;

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
  const [webRtcSessionId, setWebRtcSessionId] = useState(null);
  const [webRtcComponent, setWebRtcComponent] = useState(null);
  const { user } = useAuthStore();

  const handleCallStatusChange = (isActive, ambulance) => {
    setIsCallActive(isActive);
    setCurrentCallAmbulance(ambulance);
  };

  const handleSelectAmbulance = (ambulance) => {
    selectAmbulance(ambulance);
  };

  const handleStartCall = async (ambulance) => {
    
    try {
      await startVideoCall({
        sessionId: ambulance.sessionId || ambulance.ambulanceId,
        hospitalId: parseInt(user?.userId)
      });
      
      const sessionId = ambulance.sessionId || ambulance.ambulanceId;
      setWebRtcSessionId(sessionId);
      setIsCallActive(true);
      setCurrentCallAmbulance(ambulance);
      
      // 구급차 선택
      handleSelectAmbulance(ambulance);
      
      // WebRTC 컴포넌트 생성
      const webRtcElement = (
        <WebRtcCall
          sessionId={sessionId}
          hospitalId={parseInt(user?.userId)}
          onLeave={handleEndCall}
          patientName={ambulance.patientName || ""}
          ktas={ambulance.ktas || ""}
        />
      );
      setWebRtcComponent(webRtcElement);
      
      // 구급차 상태를 연결중으로 업데이트
      const { updateAmbulanceCallStatus } = useWaitingAmbulanceStore.getState();
      updateAmbulanceCallStatus(sessionId, true);
      
    } catch (error) {
      console.error('[EmergencyPatient] 통화 시작 실패:', error);
      // alert('통화 시작에 실패했습니다: ' + error.message); // 사용자 경험을 위해 alert 대신 UI 피드백으로 처리
    }
  };

  const handleEndCall = async () => {
    
    try {
      if (currentCallAmbulance && user?.userId) {
        const sessionId = webRtcSessionId || currentCallAmbulance.sessionId || currentCallAmbulance.ambulanceId;
        
        // 병원측에서는 세션 삭제가 아닌 통화 종료 API 호출
        await endVideoCall({
          sessionId: sessionId,
          hospitalId: parseInt(user.userId)
        });
        
        // 구급차 상태를 대기중으로 복원
        const { updateAmbulanceCallStatus, fetchWaitingAmbulances } = useWaitingAmbulanceStore.getState();
        updateAmbulanceCallStatus(sessionId, false);
        
        // 목록 새로고침
        fetchWaitingAmbulances(user.userId);
      }
      
      setWebRtcSessionId(null);
      setIsCallActive(false);
      setCurrentCallAmbulance(null);
      setWebRtcComponent(null);
    } catch (error) {
      console.error('[EmergencyPatient] 통화 종료 처리 실패:', error);
      
      // 오류가 발생해도 로컬 상태는 초기화
      if (currentCallAmbulance) {
        const sessionId = webRtcSessionId || currentCallAmbulance.sessionId || currentCallAmbulance.ambulanceId;
        const { updateAmbulanceCallStatus } = useWaitingAmbulanceStore.getState();
        updateAmbulanceCallStatus(sessionId, false);
      }
      
      setWebRtcSessionId(null);
      setIsCallActive(false);
      setCurrentCallAmbulance(null);
      setWebRtcComponent(null);
      alert('통화 종료 처리 중 오류가 발생했습니다: ' + error.message);
    }
  };

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
          height: "calc(100vh - 64px)",
          backgroundColor: "#f9fafb",
          display: "flex",
          overflow: "hidden",
        }}
      >
        <AmbulanceList
          selectedAmbulance={selectedAmbulance}
          onSelectAmbulance={handleSelectAmbulance}
          onStartCall={handleStartCall}
        />

        {/* PIP 모드 - 상세정보 탭일 때만 표시 */}
        {isCallActive && activeTab === "detail" && webRtcComponent && (
          <DraggablePipVideoContainer webRtcComponent={webRtcComponent} />
        )}

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
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

          {activeTab === "video" && (
            <div
              style={{
                height: "calc(100% - 160px)",
                padding: "20px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
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
                    {currentCallAmbulance && (
                      <span style={{ fontSize: "14px", color: "#6b7280", marginLeft: "10px" }}>
                        (구급차 ID: {currentCallAmbulance.ambulanceId})
                      </span>
                    )}
                  </h3>
                  {isCallActive && (
                    <button
                      onClick={handleEndCall}
                      style={{
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        padding: "8px 16px",
                        fontSize: "14px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      통화 종료
                    </button>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  {isCallActive && webRtcComponent ? (
                    webRtcComponent
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        backgroundColor: "#f9fafb",
                        borderRadius: "8px",
                        border: "2px dashed #d1d5db",
                      }}
                    >
                      <div style={{ fontSize: "64px", marginBottom: "24px" }}>📹</div>
                      <h4
                        style={{
                          fontSize: "24px",
                          color: "#6b7280",
                          marginBottom: "12px",
                        }}
                      >
                        화상통화 대기중
                      </h4>
                      <p style={{ fontSize: "16px", color: "#9ca3af", textAlign: "center", lineHeight: "1.5" }}>
                        왼쪽 구급차 목록에서 "통화 시작" 버튼을 클릭하여<br />
                        화상통화를 시작하세요.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {activeTab === "detail" && (
            <DetailInfoTab />
          )}
        </div>
      </main>
    </>
  );
}