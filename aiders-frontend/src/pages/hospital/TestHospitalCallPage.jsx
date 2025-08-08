import React, { useState } from "react";
import WebRtcCall from "../../components/webRTC/WebRtcCall";
import { useAuthStore } from "../../store/useAuthStore";

export default function TestHospitalCallPage() {
  const { user } = useAuthStore();
  const [isCalling, setIsCalling] = useState(false);

  if (!user?.userKey || !user?.userId) {
    return <div>로그인된 병원 정보가 필요합니다.</div>;
  }

  const sessionId = 241;
  const hospitalId = user.userId;
  const userName = `hospital-${hospitalId}`;

  return (
    <div style={{ padding: 20 }}>
      {!isCalling ? (
        <button onClick={() => setIsCalling(true)}>
          화상 통화 시작 (병원 테스트)
        </button>
      ) : (
        <div style={{ width: "100%", height: "500px", position: "relative" }}>
          <WebRtcCall
            sessionId={sessionId}
            ambulanceId={sessionId}
            hospitalId={hospitalId}
            userName={userName}
            onLeave={() => setIsCalling(false)}
          />
          <button
            onClick={() => setIsCalling(false)}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: 4,
              padding: "6px 12px",
              zIndex: 10,
            }}
          >
            통화 종료
          </button>
        </div>
      )}
    </div>
  );
}