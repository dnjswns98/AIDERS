import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import useHospitalStore from "../../store/useHospitalStore";
import useNotificationStore from "../../store/useNotificationStore";
import NotificationModal from "./NotificationModal";

export default function HospitalHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { hospitalInfo } = useHospitalStore();
  const { getUnreadCount } = useNotificationStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const unreadCount = getUnreadCount();

  const menuItems = [
    { label: "상황판", icon: "📊", path: "/hospital/dashboard" },
    { label: "구급환자", icon: "🚑", path: "/hospital/emergency" },
    { label: "병상관리", icon: "🏥", path: "/hospital/beds" },
    { label: "알림", icon: "🔔", path: "/hospital/notifications" }
  ];

  // 현재 경로에 따라 activeMenu 설정
  const getCurrentMenu = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.label : "상황판";
  };

  const activeMenu = getCurrentMenu();

  // 병원 정보 상태 변화 추적
  useEffect(() => {
    console.log('🏥 HospitalHeader - hospitalInfo 상태 변화:', hospitalInfo);
  }, [hospitalInfo]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      borderBottom: '1px solid #e5e7eb',
      zIndex: 50,
      height: '64px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
        padding: '0 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#059669'
          }}>
            🏥 AIDER
          </h1>
        </div>

        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#1f2937'
          }}>
            {hospitalInfo?.name || '병원'}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6b7280'
          }}>
            응급의료센터
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          {/* 메뉴 드롭다운 */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#374151',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#e5e7eb';
                e.target.style.borderColor = '#9ca3af';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
                e.target.style.borderColor = '#d1d5db';
              }}
            >
              <span>{menuItems.find(item => item.label === activeMenu)?.icon}</span>
              <span>{activeMenu}</span>
              <span style={{ 
                fontSize: '12px',
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}>
                ▼
              </span>
            </button>
            
            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '0',
                marginTop: '4px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                zIndex: 100,
                minWidth: '140px'
              }}>
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.label === "알림") {
                        setNotificationModalOpen(true);
                      } else {
                        navigate(item.path);
                      }
                      setDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      backgroundColor: activeMenu === item.label ? '#f0f9ff' : 'transparent',
                      color: activeMenu === item.label ? '#0369a1' : '#374151',
                      border: 'none',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      borderRadius: item === menuItems[0] ? '8px 8px 0 0' : 
                                   item === menuItems[menuItems.length - 1] ? '0 0 8px 8px' : '0'
                    }}
                    onMouseOver={(e) => {
                      if (activeMenu !== item.label) {
                        e.target.style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (activeMenu !== item.label) {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    {item.label === "알림" && unreadCount > 0 && (
                      <span style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        padding: '1px 5px',
                        borderRadius: '8px',
                        minWidth: '16px',
                        textAlign: 'center',
                        marginLeft: '4px'
                      }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

            <span style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              담당의: {user?.username || '이국종'}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
            >
              로그아웃
            </button>
          </div>
      </div>
      
      {/* 알림 모달 */}
      <NotificationModal 
        isOpen={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
      />
    </header>
  );
}