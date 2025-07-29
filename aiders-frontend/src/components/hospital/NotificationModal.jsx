import { useState } from 'react';
import useNotificationStore from '../../store/useNotificationStore';

const NotificationModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('all');
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    getFilteredNotifications,
    getStatistics 
  } = useNotificationStore();
  
  const stats = getStatistics();

  const filteredNotifications = getFilteredNotifications(activeTab);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'emergency':
        return '🚨';
      case 'bed':
        return '🏥';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'emergency':
        return '#ef4444';
      case 'bed':
        return '#f59e0b';
      case 'system':
        return '#6b7280';
      default:
        return '#3b82f6';
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
              {stats.unread}
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
            { key: 'all', label: '전체', count: stats.total },
            { key: 'unread', label: '읽지않음', count: stats.unread },
            { key: 'emergency', label: '응급', count: stats.emergency },
            { key: 'bed', label: '병상', count: stats.bed },
            { key: 'system', label: '시스템', count: stats.system }
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
          {filteredNotifications.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#9ca3af'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <p style={{ margin: 0, fontSize: '16px' }}>알림이 없습니다</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid #f3f4f6',
                  backgroundColor: notification.isRead ? 'white' : '#fefce8',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => {
                  if (!notification.isRead) {
                    markAsRead(notification.id);
                  }
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = notification.isRead ? '#f9fafb' : '#fef3c7';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = notification.isRead ? 'white' : '#fefce8';
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
                    {getTypeIcon(notification.type)}
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
                        {notification.title}
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
                          {notification.time}
                        </span>
                        {!notification.isRead && (
                          <div style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: '#ef4444',
                            borderRadius: '50%'
                          }} />
                        )}
                      </div>
                    </div>
                    
                    <p style={{
                      fontSize: '14px',
                      color: '#4b5563',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {notification.message}
                    </p>
                    
                    <div style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      padding: '2px 8px',
                      backgroundColor: getTypeColor(notification.type),
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: '500',
                      borderRadius: '12px'
                    }}>
                      {notification.type === 'emergency' ? '응급' :
                       notification.type === 'bed' ? '병상' :
                       notification.type === 'system' ? '시스템' : '기타'}
                    </div>
                  </div>
                </div>
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
          <button
            onClick={markAllAsRead}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #d1d5db',
              color: '#6b7280',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
              e.target.style.borderColor = '#9ca3af';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = '#d1d5db';
            }}
          >
            모두 읽음 처리
          </button>
          
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