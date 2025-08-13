import { useState, useEffect } from 'react';
import HospitalHeader from "../../components/hospital/HospitalHeader";
import useHospitalAlarmStore from '../../store/useHospitalAlarmStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useHospitalAlarm } from '../../context/HospitalAlarmContext';

export default function NotificationPage() {
  const { user } = useAuthStore();
  const { isConnected, connectionStatus } = useHospitalAlarm();
  const {
    allAlarms,
    matchingAlarms,
    requestAlarms,
    editAlarms,
    loading,
    error,
    setHospitalId,
    fetchAllAlarms,
    fetchMatchingAlarms,
    fetchRequestAlarms,
    fetchEditAlarms,
    deleteMatchingAlarm,
    deleteRequestAlarm,
    deleteEditAlarm,
    deleteAllAlarms,
    refreshAllAlarms
  } = useHospitalAlarmStore();

  const [activeTab, setActiveTab] = useState('all');

  const getAlarmTypeText = (type) => {
    switch (type) {
      case 'MATCHING': return '매칭 완료';
      case 'REQUEST': return '통화 요청';
      case 'EDIT': return '정보 수정';
      default: return type;
    }
  };

  const getAlarmTypeColor = (type) => {
    switch (type) {
      case 'MATCHING': return 'bg-green-100 text-green-800 border-green-200';
      case 'REQUEST': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EDIT': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      let result;
      switch (type) {
        case 'MATCHING':
          result = await deleteMatchingAlarm(id);
          break;
        case 'REQUEST':
          result = await deleteRequestAlarm(id);
          break;
        case 'EDIT':
          result = await deleteEditAlarm(id);
          break;
      }
      
      if (result.success) {
        alert(result.message);
      }
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('모든 알림을 삭제하시겠습니까?')) return;
    
    try {
      const result = await deleteAllAlarms();
      if (result.success) {
        alert(result.message);
      }
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };


  useEffect(() => {
    if (user?.hospitalId) {
      setHospitalId(user.hospitalId);
      fetchAllAlarms(user.hospitalId);
      fetchMatchingAlarms(user.hospitalId);
      fetchRequestAlarms(user.hospitalId);
      fetchEditAlarms(user.hospitalId);
    }
  }, [user?.hospitalId]);

  const getCurrentAlarms = () => {
    switch (activeTab) {
      case 'matching': return matchingAlarms;
      case 'request': return requestAlarms;
      case 'edit': return editAlarms;
      default: return allAlarms;
    }
  };

  const getTabCount = (tab) => {
    switch (tab) {
      case 'matching': return matchingAlarms.length;
      case 'request': return requestAlarms.length;
      case 'edit': return editAlarms.length;
      default: return allAlarms.length;
    }
  };

  return (
    <>
      <HospitalHeader />
      
      <main className="pt-16 min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg">
            {/* 헤더 */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    🔔 알림 관리
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    실시간 알림 수신 상태: 
                    <span className={`ml-1 font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                      {connectionStatus}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={refreshAllAlarms}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={loading}
                  >
                    🔄 새로고침
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    disabled={loading}
                  >
                    🗑️ 전체 삭제
                  </button>
                </div>
              </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="border-b border-gray-200">
              <div className="flex justify-between items-center px-6 py-2">
                <nav className="flex space-x-8">
                  {[
                    { key: 'all', label: '병원전체', count: getTabCount('all'), icon: '📋', color: 'blue' },
                    { key: 'matching', label: '매칭완료', count: getTabCount('matching'), icon: '🎯', color: 'green' },
                    { key: 'request', label: '전화요청', count: getTabCount('request'), icon: '📞', color: 'orange' },
                    { key: 'edit', label: '수정알림', count: getTabCount('edit'), icon: '✏️', color: 'yellow' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.key
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="mr-1">{tab.icon}</span>
                      {tab.label}
                      {tab.count > 0 && (
                        <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium ${
                          activeTab === tab.key
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
                
                {/* 탭별 조회 버튼 */}
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      switch (activeTab) {
                        case 'all':
                          await fetchAllAlarms();
                          break;
                        case 'matching':
                          await fetchMatchingAlarms();
                          break;
                        case 'request':
                          await fetchRequestAlarms();
                          break;
                        case 'edit':
                          await fetchEditAlarms();
                          break;
                      }
                    }}
                    disabled={loading}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
                  >
                    🔄 조회
                  </button>
                </div>
              </div>
            </div>

            {/* 알림 목록 */}
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">로딩 중...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">오류: {error}</p>
                </div>
              ) : getCurrentAlarms().length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">
                    {activeTab === 'all' ? '📭' : 
                     activeTab === 'matching' ? '🎯' : 
                     activeTab === 'request' ? '📞' : '✏️'}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {activeTab === 'all' ? '알림이 없습니다' :
                     activeTab === 'matching' ? '매칭 완료 알림이 없습니다' :
                     activeTab === 'request' ? '전화 요청 알림이 없습니다' :
                     '수정 알림이 없습니다'}
                  </h3>
                  <p className="text-gray-600">
                    {activeTab === 'all' ? '새로운 알림이 오면 여기에 표시됩니다.' :
                     activeTab === 'matching' ? '구급차 매칭이 완료되면 알림이 표시됩니다.' :
                     activeTab === 'request' ? '통화 요청이 오면 알림이 표시됩니다.' :
                     '환자 정보 수정 알림이 오면 표시됩니다.'}
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={async () => {
                        switch (activeTab) {
                          case 'all': await fetchAllAlarms(); break;
                          case 'matching': await fetchMatchingAlarms(); break;
                          case 'request': await fetchRequestAlarms(); break;
                          case 'edit': await fetchEditAlarms(); break;
                        }
                      }}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                    >
                      🔄 새로고침
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {getCurrentAlarms().map((alarm) => (
                    <div key={alarm.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getAlarmTypeColor(alarm.type)}`}>
                              {getAlarmTypeText(alarm.type)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(alarm.createdAt)}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {alarm.ambulanceKey && (
                              <p className="text-sm">
                                <span className="font-medium text-gray-700">구급차:</span> {alarm.ambulanceKey}
                              </p>
                            )}
                            {alarm.patientName && (
                              <p className="text-sm">
                                <span className="font-medium text-gray-700">환자:</span> {alarm.patientName}
                              </p>
                            )}
                            {alarm.ktas && (
                              <p className="text-sm">
                                <span className="font-medium text-gray-700">KTAS:</span> {alarm.ktas}등급
                              </p>
                            )}
                            {alarm.message && (
                              <p className="text-sm text-gray-600 mt-2">{alarm.message}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(alarm.type, alarm.id)}
                          className="ml-4 px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-800 rounded-md transition-colors flex items-center gap-1"
                          disabled={loading}
                          title="알림 삭제"
                        >
                          🗑️ <span className="text-xs">삭제</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}