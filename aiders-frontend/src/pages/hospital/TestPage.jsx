import HospitalHeader from "../../components/hospital/HospitalHeader";
import { useHospitalAlarm } from "../../context/HospitalAlarmContext";
import { useAuthStore } from "../../store/useAuthStore";
import { getAllAlarms, getMatchingAlarms, getRequestAlarms, getEditAlarms, deleteAllAlarms, deleteMatchingAlarm, deleteRequestAlarm, deleteEditAlarm } from "../../api/alarmAPI";

export default function TestPage() {
  const { user } = useAuthStore();
  const { stompClient, isConnected, connectionStatus } = useHospitalAlarm();

  const btnStyle = "block w-48 p-2 border border-gray-300 rounded";

  // 테스트 데이터 객체
  const testData = {
    ambulanceKey: "998버4200",
    patientName: "김테스트",
    ktas: 3,
    messages: {
      matching: "환자 김테스트가 병원에 자동 매칭되었습니다.",
      request: "구급차가 통화를 요청했습니다.",
      edit: "환자 정보가 수정되었습니다."
    }
  };
  // 연결 상태 확인
  function checkConnection() {
    console.log("🏥 병원 ID:", user?.userId);
    console.log("🔌 WebSocket 상태:", isConnected ? '✅ 연결됨' : '❌ 연결 안됨');
    console.log("🔌 상태 메시지:", connectionStatus);
  }
// 2-1 매칭 전송
  function sendMatching() {
    if (!stompClient?.connected) {
      console.error("❌ WebSocket이 연결되지 않았습니다!");
      console.log("🔌 연결 상태:", connectionStatus);
      return;
    }

    const alarm = {
      type: "MATCHING",
      ambulanceKey: testData.ambulanceKey,
      patientName: testData.patientName,
      ktas: testData.ktas,
      message: testData.messages.matching
    };
    
    try {
      stompClient.send("/pub/alarm/send", {}, JSON.stringify(alarm));
      console.log("🚀 MATCHING 알람 전송 완료");
    } catch (error) {
      console.error("❌ MATCHING 전송 실패:", error);
    }
  }
// 2-2 sendRequest
  function sendRequest() {
    if (!stompClient?.connected) {
      console.error("❌ WebSocket이 연결되지 않았습니다!");
      return;
    }

    const alarm = {
      type: "REQUEST",
      ambulanceKey: testData.ambulanceKey,
      message: testData.messages.request
    };
    
    try {
      stompClient.send("/pub/alarm/send", {}, JSON.stringify(alarm));
      console.log("🚀 REQUEST 알람 전송 완료");
    } catch (error) {
      console.error("❌ REQUEST 전송 실패:", error);
    }
  }
// 2-3 sendEdit
  function sendEdit() {
    if (!stompClient?.connected) {
      console.error("❌ WebSocket이 연결되지 않았습니다!");
      return;
    }

    const alarm = {
      type: "EDIT",
      ambulanceKey: testData.ambulanceKey,
      message: testData.messages.edit
    };
    
    try {
      stompClient.send("/pub/alarm/send", {}, JSON.stringify(alarm));
      console.log("🚀 EDIT 알람 전송 완료");
    } catch (error) {
      console.error("❌ EDIT 전송 실패:", error);
    }
  }

  // 조회 함수들
  //    3-1 
  async function getAllAlarmsData() {
    
    try {
      const alarms = await getAllAlarms(user.userId);
      console.log("📋 전체 알람 조회 결과:", alarms);
      console.log("📋 알람 개수:", alarms.length);
    } catch (error) {
      console.error("❌ 전체 알람 조회 실패:", error);
    }
  }

  async function getMatchingAlarmsData() {
    if (!user?.userId) {
      console.error("❌ 병원 ID가 없습니다!");
      return;
    }
    
    try {
      console.log("🎯 매칭 알람 조회 시작...");
      const alarms = await getMatchingAlarms(user.userId);
      console.log("🎯 매칭 알람 조회 결과:", alarms);
      console.log("🎯 매칭 알람 개수:", alarms.length);
    } catch (error) {
      console.error("❌ 매칭 알람 조회 실패:", error);
    }
  }

  async function getRequestAlarmsData() {
    if (!user?.userId) {
      console.error("❌ 병원 ID가 없습니다!");
      return;
    }
    
    try {
      console.log("📞 요청 알람 조회 시작...");
      const alarms = await getRequestAlarms(user.userId);
      console.log("📞 요청 알람 조회 결과:", alarms);
      console.log("📞 요청 알람 개수:", alarms.length);
    } catch (error) {
      console.error("❌ 요청 알람 조회 실패:", error);
    }
  }

  async function getEditAlarmsData() {
    if (!user?.userId) {
      console.error("❌ 병원 ID가 없습니다!");
      return;
    }
    
    try {
      console.log("✏️ 수정 알람 조회 시작...");
      const alarms = await getEditAlarms(user.userId);
      console.log("✏️ 수정 알람 조회 결과:", alarms);
      console.log("✏️ 수정 알람 개수:", alarms.length);
    } catch (error) {
      console.error("❌ 수정 알람 조회 실패:", error);
    }
  }

  // 삭제 함수들
  async function deleteAllAlarmsData() {
    if (!user?.userId) {
      console.error("❌ 병원 ID가 없습니다!");
      return;
    }
    
    try {
      console.log("🗑️ 전체 알람 삭제 시작...");
      await deleteAllAlarms(user.userId);
      console.log("✅ 전체 알람 삭제 완료");
    } catch (error) {
      console.error("❌ 전체 알람 삭제 실패:", error);
    }
  }

  async function deleteMatchingAlarmsData() {
    if (!user?.userId) {
      console.error("❌ 병원 ID가 없습니다!");
      return;
    }
    
    try {
      console.log("🗑️ 매칭 알람 삭제를 위해 먼저 조회...");
      const alarms = await getMatchingAlarms(user.userId);
      
      if (alarms.length === 0) {
        console.log("ℹ️ 삭제할 매칭 알람이 없습니다.");
        return;
      }
      
      console.log(`🗑️ ${alarms.length}개의 매칭 알람 삭제 시작...`);
      for (const alarm of alarms) {
        await deleteMatchingAlarm(alarm.id);
        console.log(`✅ 매칭 알람 삭제 완료: ID ${alarm.id}`);
      }
      console.log("✅ 모든 매칭 알람 삭제 완료");
    } catch (error) {
      console.error("❌ 매칭 알람 삭제 실패:", error);
    }
  }

  async function deleteRequestAlarmsData() {
    if (!user?.userId) {
      console.error("❌ 병원 ID가 없습니다!");
      return;
    }
    
    try {
      console.log("🗑️ 요청 알람 삭제를 위해 먼저 조회...");
      const alarms = await getRequestAlarms(user.userId);
      
      if (alarms.length === 0) {
        console.log("ℹ️ 삭제할 요청 알람이 없습니다.");
        return;
      }
      
      console.log(`🗑️ ${alarms.length}개의 요청 알람 삭제 시작...`);
      for (const alarm of alarms) {
        await deleteRequestAlarm(alarm.id);
        console.log(`✅ 요청 알람 삭제 완료: ID ${alarm.id}`);
      }
      console.log("✅ 모든 요청 알람 삭제 완료");
    } catch (error) {
      console.error("❌ 요청 알람 삭제 실패:", error);
    }
  }

  async function deleteEditAlarmsData() {
    if (!user?.userId) {
      console.error("❌ 병원 ID가 없습니다!");
      return;
    }
    
    try {
      console.log("🗑️ 수정 알람 삭제를 위해 먼저 조회...");
      const alarms = await getEditAlarms(user.userId);
      
      if (alarms.length === 0) {
        console.log("ℹ️ 삭제할 수정 알람이 없습니다.");
        return;
      }
      
      console.log(`🗑️ ${alarms.length}개의 수정 알람 삭제 시작...`);
      for (const alarm of alarms) {
        await deleteEditAlarm(alarm.id);
        console.log(`✅ 수정 알람 삭제 완료: ID ${alarm.id}`);
      }
      console.log("✅ 모든 수정 알람 삭제 완료");
    } catch (error) {
      console.error("❌ 수정 알람 삭제 실패:", error);
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <HospitalHeader />
      
      <div className="pt-16 p-6">
        <h1 className="text-2xl font-bold mb-6">WebSocket 테스트 페이지</h1>
        
        <div className="space-y-4">
          {/* 연결 상태 확인 */}
          <button onClick={checkConnection} className={btnStyle}>1. 연결 상태 확인</button>
          {/* 전송 */}
          <button onClick={sendMatching} className={btnStyle}>2-1. MATCHING 전송</button>
          <button onClick={sendRequest} className={btnStyle}>2-2. REQUEST 전송</button>
          <button onClick={sendEdit} className={btnStyle}>2-3. EDIT 전송</button>
          {/* 조회 */}
          <button onClick={getAllAlarmsData} className={btnStyle}>3-1. 전체 조회</button>
          <button onClick={getMatchingAlarmsData} className={btnStyle}>3-2. 매칭 조회</button>
          <button onClick={getRequestAlarmsData} className={btnStyle}>3-3. 요청 조회</button>
          <button onClick={getEditAlarmsData} className={btnStyle}>3-4. 수정 조회</button>
          {/* 삭제 */}
          <button onClick={deleteAllAlarmsData} className={btnStyle}>4-1. 전체 삭제</button>
          <button onClick={deleteMatchingAlarmsData} className={btnStyle}>4-2. 매칭 삭제</button>
          <button onClick={deleteRequestAlarmsData} className={btnStyle}>4-3. 요청 삭제</button>
          <button onClick={deleteEditAlarmsData} className={btnStyle}>4-4. 수정 삭제</button>
        </div>
      </div>
    </div>
  );
}