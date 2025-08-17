import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import useHospitalStore from "../../store/useHospitalStore";
import NotificationModal from "./NotificationModal";
import styles from './HospitalHeader.module.css';

export default function HospitalHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { hospitalInfo } = useHospitalStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  const menuItems = [
    { label: "상황판", icon: "📊", path: "/hospital/dashboard" },
    { label: "구급환자", icon: "🚑", path: "/hospital/emergency" },
    { label: "병상관리", icon: "🏥", path: "/hospital/beds" },
    { label: "진료과목", icon: "🏥", path: "/hospital/departments" },
    // { label: "화상통화 테스트", icon: "📹", path: "/hospital/webrtc-test" }
  ];

  const getCurrentMenu = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.label : "구급환자";
  };

  const activeMenu = getCurrentMenu();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    // 토스트 클릭 시 NotificationModal 열기
    const handleOpenNotificationModal = () => {
      setNotificationModalOpen(true);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('openNotificationModal', handleOpenNotificationModal);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('openNotificationModal', handleOpenNotificationModal);
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
            <Link to="/hospital" className={styles.logoTitle}>
              🏥 AIDERS
            </Link>
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
                      if (item.label === "상황판") {
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
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setNotificationModalOpen(true)}
            className={styles.alarmButton}
            title="알림 보기"
          >
            🔔
          </button>
          
          <button
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            로그아웃
          </button>
        </div>
      </div>
      
      <NotificationModal 
        isOpen={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
      />
    </header>
  );
}