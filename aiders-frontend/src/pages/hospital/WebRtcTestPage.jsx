import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import HospitalHeader from "../../components/hospital/HospitalHeader";
import SockJS from "sockjs-client/dist/sockjs";
import Stomp from "stompjs";

const WebRtcTestPage = () => {
  const { user } = useAuthStore();
  const stompClientRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [hospitalId, setHospitalId] = useState('');

  // WebSocket 연결
  const connectWebSocket = () => {
    if (!hospitalId) {
      addMessage('❌ 병원 ID를 입력해주세요', 'error');
      return;
    }

    const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8080/ws";
    const SOCKET_URL = WS_BASE_URL.replace(/^ws:\/\//, 'http://').replace(/^wss:\/\//, 'https://');
    
    addMessage(`🔄 WebSocket 연결 시도: ${SOCKET_URL}`, 'info');

    try {
      const sock = new SockJS(SOCKET_URL);
      const stomp = Stomp.over(sock);
      
      stomp.debug = null;
      stomp.heartbeat.outgoing = 10000;
      stomp.heartbeat.incoming = 10000;

      const onConnect = () => {
        addMessage('✅ STOMP 연결 성공', 'success');
        setIsConnected(true);
        stompClientRef.current = stomp;
        
        const topic = `/topic/location/hospital/${hospitalId}`;
        addMessage(`📡 토픽 구독: ${topic}`, 'info');
        
        stomp.subscribe(topic, (message) => {
          try {
            const data = JSON.parse(message.body);
            
            // 📊 데이터 구조 상세 분석
            addMessage(`📥 수신된 데이터 상세 분석:`, 'success');
            addMessage(`🔍 전체 구조: ${JSON.stringify(data, null, 2)}`, 'data');
            addMessage(`📋 데이터 타입: ${typeof data}`, 'info');
            addMessage(`🔑 객체 키 목록: [${Object.keys(data).join(', ')}]`, 'info');
            addMessage(`📏 키 개수: ${Object.keys(data).length}개`, 'info');
            
            // 세션 관련 필드 확인
            const sessionFields = ['sessionId', 'session_id', 'callId', 'connectionId', 'webrtcId'];
            addMessage(`📞 세션/통화 관련 필드 확인:`, 'info');
            sessionFields.forEach(field => {
              if (data.hasOwnProperty(field)) {
                addMessage(`  ✅ ${field}: ${data[field]}`, 'success');
              } else {
                addMessage(`  ❌ ${field}: 없음`, 'error');
              }
            });
            
            // 메시지 타입/이벤트 확인
            const eventFields = ['type', 'event', 'action', 'messageType', 'eventType'];
            addMessage(`🎯 이벤트/액션 타입 확인:`, 'info');
            eventFields.forEach(field => {
              if (data.hasOwnProperty(field)) {
                addMessage(`  ✅ ${field}: ${data[field]}`, 'success');
                // 통화 종료 관련 이벤트 감지
                if (data[field] && String(data[field]).toLowerCase().includes('end')) {
                  addMessage(`  🔚 통화 종료 이벤트 감지!`, 'error');
                }
                if (data[field] && String(data[field]).toLowerCase().includes('disconnect')) {
                  addMessage(`  🔌 연결 해제 이벤트 감지!`, 'error');
                }
              } else {
                addMessage(`  ❌ ${field}: 없음`, 'error');
              }
            });
            
            // 각 필드별 상세 정보
            Object.entries(data).forEach(([key, value]) => {
              addMessage(`  📌 ${key}: ${value} (타입: ${typeof value})`, 'info');
            });
            
            // 구급차 관련 필드 확인
            const ambulanceFields = ['ambulanceId', 'ambulance_id', 'id', 'vehicleId'];
            const locationFields = ['latitude', 'longitude', 'lat', 'lng', 'x', 'y'];
            const statusFields = ['status', 'state', 'condition'];
            
            addMessage(`🚑 구급차 ID 필드 확인:`, 'info');
            ambulanceFields.forEach(field => {
              if (data.hasOwnProperty(field)) {
                addMessage(`  ✅ ${field}: ${data[field]}`, 'success');
              } else {
                addMessage(`  ❌ ${field}: 없음`, 'error');
              }
            });
            
            addMessage(`📍 위치 필드 확인:`, 'info');
            locationFields.forEach(field => {
              if (data.hasOwnProperty(field)) {
                addMessage(`  ✅ ${field}: ${data[field]}`, 'success');
              } else {
                addMessage(`  ❌ ${field}: 없음`, 'error');
              }
            });
            
            addMessage(`📊 상태 필드 확인:`, 'info');
            statusFields.forEach(field => {
              if (data.hasOwnProperty(field)) {
                addMessage(`  ✅ ${field}: ${data[field]}`, 'success');
              } else {
                addMessage(`  ❌ ${field}: 없음`, 'error');
              }
            });
            
          } catch (error) {
            addMessage(`❌ 메시지 파싱 오류: ${error.message}`, 'error');
            addMessage(`🔍 원본 메시지 타입: ${typeof message.body}`, 'info');
            addMessage(`📄 원본 메시지: ${message.body}`, 'data');
          }
        });
      };

      const onError = (error) => {
        addMessage(`❌ STOMP 연결 실패: ${error}`, 'error');
        setIsConnected(false);
        stompClientRef.current = null;
      };

      stomp.connect({}, onConnect, onError);
      
    } catch (error) {
      addMessage(`❌ STOMP 생성 실패: ${error.message}`, 'error');
    }
  };

  // WebSocket 연결 해제
  const disconnectWebSocket = () => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.disconnect();
      stompClientRef.current = null;
      setIsConnected(false);
      addMessage('🔌 WebSocket 연결 해제', 'info');
    }
  };

  // 테스트용 위치 데이터 전송 (구급차 시뮬레이션)
  const sendTestLocationData = () => {
    if (!stompClientRef.current?.connected) {
      addMessage('❌ WebSocket이 연결되지 않았습니다', 'error');
      return;
    }

    const testData = {
      ambulanceId: "TEST_AMB_001",
      hospitalId: hospitalId,
      latitude: 37.5665 + (Math.random() - 0.5) * 0.01, // 서울시청 근처 랜덤 위치
      longitude: 126.9780 + (Math.random() - 0.5) * 0.01,
      status: "communication_waiting",
      patientName: "테스트환자",
      ktasLevel: "3",
      timestamp: new Date().toISOString()
    };

    try {
      stompClientRef.current.send(
        "/pub/location/update",
        {},
        JSON.stringify(testData)
      );
      addMessage(`📤 테스트 데이터 전송:`, 'info');
      addMessage(JSON.stringify(testData, null, 2), 'data');
    } catch (error) {
      addMessage(`❌ 테스트 데이터 전송 실패: ${error.message}`, 'error');
    }
  };

  // 다른 토픽들도 구독해보기
  const subscribeToAllTopics = () => {
    if (!stompClientRef.current?.connected) {
      addMessage('❌ WebSocket이 연결되지 않았습니다', 'error');
      return;
    }

    // 가능한 모든 토픽 패턴 시도
    const topics = [
      `/topic/location/ambulance/${hospitalId}`,
      `/topic/location/hospital/${hospitalId}`,
      `/topic/location/all`,
      `/topic/test`,
      `/topic/location`,
      `/topic/ambulance`,
      `/topic/hospital`,
      `/queue/location/hospital/${hospitalId}`, // queue 방식도 시도
      `/user/queue/location`, // 개인 큐도 시도
    ];

    topics.forEach(topic => {
      try {
        stompClientRef.current.subscribe(topic, (message) => {
          addMessage(`🎯 [${topic}] 메시지 도착!`, 'success');
          addMessage(`원본 메시지: ${message.body}`, 'data');
          
          try {
            const data = JSON.parse(message.body);
            addMessage(`📥 [${topic}] JSON 파싱 성공:`, 'success');
            addMessage(JSON.stringify(data, null, 2), 'data');
          } catch (error) {
            addMessage(`⚠️ [${topic}] JSON이 아닌 데이터:`, 'info');
            addMessage(`내용: ${message.body}`, 'data');
          }
        });
        addMessage(`📡 토픽 구독 시도: ${topic}`, 'info');
      } catch (error) {
        addMessage(`❌ 토픽 구독 실패 (${topic}): ${error.message}`, 'error');
      }
    });
    
    addMessage(`🔍 총 ${topics.length}개 토픽 구독 완료`, 'success');
  };

  // 연결 진단 함수
  const diagnoseConnection = () => {
    addMessage('🔍 연결 상태 진단 시작', 'info');
    
    if (!stompClientRef.current) {
      addMessage('❌ STOMP 클라이언트가 없습니다', 'error');
      return;
    }
    
    if (!stompClientRef.current.connected) {
      addMessage('❌ STOMP가 연결되지 않았습니다', 'error');
      return;
    }
    
    addMessage('✅ STOMP 연결 상태: 정상', 'success');
    addMessage(`📍 현재 병원 ID: ${hospitalId}`, 'info');
    addMessage(`🌐 WebSocket URL: ${import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8080/ws"}`, 'info');
    
    // 단순 ping 메시지 전송
    try {
      stompClientRef.current.send('/app/ping', {}, JSON.stringify({
        message: 'ping test',
        hospitalId: hospitalId,
        timestamp: new Date().toISOString()
      }));
      addMessage('📤 Ping 메시지 전송', 'info');
    } catch (error) {
      addMessage(`❌ Ping 전송 실패: ${error.message}`, 'error');
    }
  };

  // 메시지 추가 함수
  const addMessage = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setMessages(prev => [...prev, { 
      message, 
      type, 
      timestamp 
    }]);
  };

  // 메시지 전체 삭제
  const clearMessages = () => {
    setMessages([]);
  };

  // 컴포넌트 언마운트 시 연결 해제
  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, []);

  // 메시지 타입별 스타일
  const getMessageStyle = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'data':
        return 'text-blue-700 bg-blue-50 border-blue-200 font-mono text-sm';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <HospitalHeader />
      
      <div className="pt-16 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              🔍 WebSocket 구급차 위치 조회 테스트
            </h1>

            {/* 연결 설정 */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    병원 ID
                  </label>
                  <input
                    type="text"
                    value={hospitalId}
                    onChange={(e) => setHospitalId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="병원 ID를 입력하세요"
                    disabled={isConnected}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={connectWebSocket}
                    disabled={isConnected || !hospitalId}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    🔗 연결
                  </button>
                  <button
                    onClick={disconnectWebSocket}
                    disabled={!isConnected}
                    className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    🔌 해제
                  </button>
                  <button
                    onClick={clearMessages}
                    className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    🗑️ 지우기
                  </button>
                </div>
              </div>
              
              {/* 추가 테스트 버튼들 */}
              {isConnected && (
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={sendTestLocationData}
                    className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    📤 테스트 데이터 전송
                  </button>
                  <button
                    onClick={subscribeToAllTopics}
                    className="px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    📡 모든 토픽 구독
                  </button>
                  <button
                    onClick={diagnoseConnection}
                    className="px-3 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    🔍 연결 진단
                  </button>
                </div>
              )}

              <div className="mt-4 flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm font-medium ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
                {hospitalId && (
                  <span className="text-sm text-gray-600">
                    (Topic: /topic/location/hospital/{hospitalId})
                  </span>
                )}
              </div>
            </div>

            {/* 메시지 로그 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">📋 메시지 로그</h3>
                <span className="text-sm text-gray-600">{messages.length}개 메시지</span>
              </div>
              
              <div className="h-96 overflow-y-auto space-y-2">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    메시지가 없습니다. WebSocket에 연결하여 데이터를 받아보세요.
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg ${getMessageStyle(msg.type)}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <pre className="whitespace-pre-wrap break-words">
                            {msg.message}
                          </pre>
                        </div>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          #{index + 1} - {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 사용 가이드 */}
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4">
              <div className="font-medium text-blue-800 mb-2">📋 사용 가이드</div>
              <ol className="list-decimal list-inside text-blue-700 space-y-1">
                <li>병원 ID를 입력합니다 (예: 1, 2, 3...)</li>
                <li>"연결" 버튼을 클릭하여 WebSocket에 연결합니다</li>
                <li>/topic/location/hospital/[병원ID] 토픽을 구독합니다</li>
                <li>구급차에서 전송하는 위치 데이터를 실시간으로 받습니다</li>
                <li>"해제" 버튼으로 연결을 끊을 수 있습니다</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebRtcTestPage;