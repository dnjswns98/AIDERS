import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { getAllAlarms, getMatchingAlarms, getRequestAlarms, getEditAlarms, deleteMatchingAlarm, deleteRequestAlarm, deleteEditAlarm, deleteAllAlarms } from '../../api/alarmAPI';

const NotificationModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  // 알람 데이터 로드
  const loadAlarms = async (type = 'all') => {
    if (!user?.userId) return;
    
    setLoading(true);
    try {
      let data = [];
      switch (type) {
        case 'all':
          data = await getAllAlarms(user.userId);
          break;
        case 'matching':
          data = await getMatchingAlarms(user.userId);
          break;
        case 'request':
          data = await getRequestAlarms(user.userId);
          break;
        case 'edit':
          data = await getEditAlarms(user.userId);
          break;
        default:
          data = await getAllAlarms(user.userId);
      }
      setAlarms(data);
    } catch (error) {
      console.error('알람 로드 실패:', error);
      setAlarms([]);
    } finally {
      setLoading(false);
    }
  };

  // 모달이 열릴 때와 탭이 변경될 때 데이터 로드
  useEffect(() => {
    if (isOpen) {
      loadAlarms(activeTab);
    }
  }, [isOpen, activeTab, user?.userId]);

  // 알람 삭제 함수
  const deleteAlarm = async (alarmId, alarmType) => {
    try {
      switch (alarmType) {
        case 'MATCHING':
          await deleteMatchingAlarm(alarmId);
          break;
        case 'REQUEST':
          await deleteRequestAlarm(alarmId);
          break;
        case 'EDIT':
          await deleteEditAlarm(alarmId);
          break;
        default:
          console.error('알 수 없는 알람 타입:', alarmType);
          return;
      }
      
      // 삭제 후 현재 탭의 데이터 다시 로드
      await loadAlarms(activeTab);
      console.log(`${getTypeLabel(alarmType)} 알람 삭제 완료: ID ${alarmId}`);
    } catch (error) {
      console.error('알람 삭제 실패:', error);
    }
  };

  // 전체 알람 삭제 함수
  const deleteAllAlarmsHandler = async () => {
    if (!user?.userId) return;
    
    if (alarms.length === 0) {
      alert('삭제할 알람이 없습니다.');
      return;
    }

    if (!confirm(`모든 알람 ${alarms.length}개를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteAllAlarms(user.userId);
      setAlarms([]);
      console.log('모든 알람 삭제 완료');
    } catch (error) {
      console.error('전체 알람 삭제 실패:', error);
      alert('알람 삭제 중 오류가 발생했습니다.');
    }
  };

  // 통계 계산
  const getStats = () => {
    const stats = {
      total: 0,
      matching: 0,
      request: 0,
      edit: 0
    };
    
    if (activeTab === 'all') {
      stats.total = alarms.length;
    } else {
      stats[activeTab] = alarms.length;
    }
    
    return stats;
  };

  const stats = getStats();

  const getTypeIcon = (type) => {
    switch (type) {
      case 'MATCHING':
        return '🎯';
      case 'REQUEST':
        return '📞';
      case 'EDIT':
        return '✏️';
      default:
        return '🔔';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'MATCHING':
        return '#10b981';
      case 'REQUEST':
        return '#f59e0b';
      case 'EDIT':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'MATCHING':
        return '매칭';
      case 'REQUEST':
        return '요청';
      case 'EDIT':
        return '수정';
      default:
        return '기타';
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'hidden'
      }}>
        {/* 모달 헤더 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '20px' }}>🔔</span>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
            }}>알림</h2>
            <span style={{
              backgroundColor: '#ef4444',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              padding: '2px 6px',
              borderRadius: '10px',
              minWidth: '18px',
              textAlign: 'center'
            }}>
              {alarms.length}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              color: '#6b7280',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
              e.target.style.color = '#374151';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#6b7280';
            }}
          >
            ✕
          </button>
        </div>

        {/* 탭 메뉴 */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: 'white'
        }}>
          {[
            { key: 'all', label: '전체', count: activeTab === 'all' ? alarms.length : 0 },
            { key: 'matching', label: '매칭', count: activeTab === 'matching' ? alarms.length : 0 },
            { key: 'request', label: '요청', count: activeTab === 'request' ? alarms.length : 0 },
            { key: 'edit', label: '수정', count: activeTab === 'edit' ? alarms.length : 0 }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: '12px 8px',
                border: 'none',
                backgroundColor: activeTab === tab.key ? '#eff6ff' : 'transparent',
                color: activeTab === tab.key ? '#0369a1' : '#6b7280',
                fontSize: '14px',
                fontWeight: activeTab === tab.key ? '600' : '500',
                cursor: 'pointer',
                borderBottom: activeTab === tab.key ? '2px solid #0369a1' : '2px solid transparent',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
              onMouseOver={(e) => {
                if (activeTab !== tab.key) {
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.color = '#374151';
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== tab.key) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#6b7280';
                }
              }}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span style={{
                  backgroundColor: activeTab === tab.key ? '#0369a1' : '#9ca3af',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  padding: '1px 5px',
                  borderRadius: '8px',
                  minWidth: '16px',
                  textAlign: 'center'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 알림 목록 */}
        <div style={{
          maxHeight: '400px',
          overflowY: 'auto',
          padding: '0'
        }}>
          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#9ca3af'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
              <p style={{ margin: 0, fontSize: '16px' }}>로딩 중...</p>
            </div>
          ) : alarms.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#9ca3af'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <p style={{ margin: 0, fontSize: '16px' }}>알림이 없습니다</p>
            </div>
          ) : (
            alarms.map((alarm, index) => (
              <div key={alarm.id}>
                <div
                  style={{
                    padding: '16px 24px',
                    backgroundColor: 'white',
                    transition: 'background-color 0.2s',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    <div style={{
                      fontSize: '20px',
                      marginTop: '2px'
                    }}>
                      {getTypeIcon(alarm.type)}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '4px'
                      }}>
                        <h4 style={{
                          fontSize: '15px',
                          fontWeight: '600',
                          color: '#1f2937',
                          margin: 0
                        }}>
                          {alarm.ambulanceKey} - {alarm.patientName || '환자'}
                        </h4>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{
                            fontSize: '12px',
                            color: '#6b7280'
                          }}>
                            {new Date(alarm.createdAt).toLocaleString()}
                          </span>
                          {alarm.ktas && (
                            <span style={{
                              fontSize: '11px',
                              padding: '1px 6px',
                              backgroundColor: alarm.ktas <= 2 ? '#ef4444' : alarm.ktas <= 3 ? '#f59e0b' : '#10b981',
                              color: 'white',
                              borderRadius: '8px',
                              fontWeight: 'bold'
                            }}>
                              KTAS {alarm.ktas}
                            </span>
                          )}
                          {/* 삭제 버튼 */}
                          {activeTab !== 'all' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAlarm(alarm.id, alarm.type);
                              }}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#9ca3af',
                                fontSize: '16px',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '24px',
                                height: '24px'
                              }}
                              onMouseOver={(e) => {
                                e.target.style.backgroundColor = '#fee2e2';
                                e.target.style.color = '#ef4444';
                              }}
                              onMouseOut={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = '#9ca3af';
                              }}
                              title="알람 삭제"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <p style={{
                        fontSize: '14px',
                        color: '#4b5563',
                        margin: 0,
                        lineHeight: '1.4'
                      }}>
                        {alarm.message}
                      </p>
                      
                      <div style={{
                        display: 'inline-block',
                        marginTop: '8px',
                        padding: '2px 8px',
                        backgroundColor: getTypeColor(alarm.type),
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: '500',
                        borderRadius: '12px'
                      }}>
                        {getTypeLabel(alarm.type)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 구분선 - 마지막 아이템이 아닐 때만 표시 */}
                {index < alarms.length - 1 && (
                  <div style={{
                    height: '1px',
                    backgroundColor: '#e5e7eb',
                    margin: '0 24px'
                  }} />
                )}
              </div>
            ))
          )}
        </div>

        {/* 모달 푸터 */}
        <div style={{
          padding: '16px 24px',
          backgroundColor: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* 전체 탭에서만 전체삭제 버튼 표시 */}
            {activeTab === 'all' && alarms.length > 0 && (
              <button
                onClick={deleteAllAlarmsHandler}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#ef4444';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#ef4444';
                }}
              >
                🗑️ 전체삭제
              </button>
            )}
          </div>
          
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#3b82f6',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;