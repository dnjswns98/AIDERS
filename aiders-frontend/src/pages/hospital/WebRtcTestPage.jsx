import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import HospitalHeader from "../../components/hospital/HospitalHeader";
import WebRtcCall from "../../components/webRTC/WebRtcCall"; // WebRtcCall 컴포넌트 import

const WebRtcTestPage = () => {
  const { user } = useAuthStore();
  const [sessionId, setSessionId] = useState('');
  const [isCalling, setIsCalling] = useState(false);

  const handleStartCall = () => {
    if (!sessionId) {
      alert('세션 ID(구급차 ID)를 입력해주세요.');
      return;
    }
    setIsCalling(true);
  };

  const handleEndCall = () => {
    setIsCalling(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <HospitalHeader />
      
      <div className="pt-16 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* 테스트 타이틀 */}
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              📹 WebRTC 화상통화 테스트
            </h1>

            {/* default :  isCalling == false  */}
            {isCalling ? (
              <div className="bg-black rounded-lg overflow-hidden aspect-video">
                <WebRtcCall
                  sessionId={sessionId}
                  hospitalId={user?.userId}
                  onLeave={handleEndCall}
                />
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      세션 ID (구급차 ID) 입력
                    </label>
                    <input
                      type="text"
                      value={sessionId}
                      // 이식 후 수정부분
                      // 여기다가 통화버튼시 클릭하면 반환되는 AMB sessionId 받기
                      onChange={(e) => setSessionId(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="연결할 세션 ID를 입력하세요"
                    />
                  </div>
                </div>
                <div className="flex justify-center mt-6 space-x-4">
                  <button
                    onClick={handleStartCall} // isCalling => true
                    disabled={!sessionId}     // disabled => false로 설정
                    className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    📞 통화 시작
                  </button>
                </div>
              </div>
            )}

            {/* 사용 가이드 */}
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4">
              <div className="font-medium text-blue-800 mb-2">📋 사용 가이드</div>
              <ol className="list-decimal list-inside text-blue-700 space-y-1">
                <li>연결할 구급차의 ID를 입력합니다</li>
                <li>"통화 시작" 버튼을 클릭합니다</li>
                <li>구급차 측에서 통화를 수락하면 연결됩니다</li>
                <li>"PiP 모드" 버튼으로 작은 화면 모드를 켜고 끌 수 있습니다</li>
                <li>"통화 종료" 버튼으로 통화를 종료합니다</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebRtcTestPage;