import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import useHospitalStore from "../../store/useHospitalStore";
import useNotificationStore from "../../store/useNotificationStore";
import NotificationModal from "./NotificationModal";
import styles from './HospitalHeader.module.css';

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
    { label: "화상통화 테스트", icon: "📹", path: "/hospital/webrtc-test" },
    { label: "알림", icon: "🔔", path: "/hospital/notifications" }
  ];

  // 현재 경로에 따라 activeMenu 설정
  const getCurrentMenu = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.label : "구급환자";
  };

  const activeMenu = getCurrentMenu();

  // 병원 정보 상태 변화 추적
  useEffect(() => {
    // console.log('🏥 HospitalHeader - hospitalInfo 상태 변화:', hospitalInfo);
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
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logoSection}>
          <h1 className={styles.logoTitle}>
            🏥 AIDER
          </h1>
        </div>

        <div className={styles.hospitalInfo}>
          <div className={styles.hospitalName}>
            {hospitalInfo?.name || '병원'}
          </div>
          <div className={styles.hospitalType}>
            응급의료센터
          </div>
        </div>

        <div className={styles.userSection}>
          {/* 메뉴 드롭다운 */}
          <div ref={dropdownRef} className={styles.dropdownContainer}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={styles.dropdownButton}
            >
              <span>{menuItems.find(item => item.label === activeMenu)?.icon}</span>
              <span>{activeMenu}</span>
              <span className={`${styles.dropdownArrow} ${dropdownOpen ? styles.open : ''}`}>
                ▼
              </span>
            </button>
            
            {dropdownOpen && (
              <div className={styles.dropdownMenu}>
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.label === "알림") {
                        setNotificationModalOpen(true);
                      } else if (item.label === "상황판") {
                        // 상황판은 새 창으로 열기
                        window.open(item.path, '_blank', 'width=1200,height=800');
                      } else {
                        navigate(item.path);
                      }
                      setDropdownOpen(false);
                    }}
                    className={`${styles.menuItem} ${activeMenu === item.label ? styles.active : ''}`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    {item.label === "알림" && unreadCount > 0 && (
                      <span className={styles.notificationBadge}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

            <span className={styles.userInfo}>
              담당의: {user?.username || '이국종'}
            </span>
            <button
              onClick={handleLogout}
              className={styles.logoutButton}
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