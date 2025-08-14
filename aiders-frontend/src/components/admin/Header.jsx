import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import styles from './Header.module.css';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logoSection}>
          <h1 className={styles.logoTitle}>
            AIDERS
          </h1>
        </div>

        <h2 className={styles.pageTitle}>
          관리자페이지
        </h2>

        <div className={styles.userSection}>
          <span className={styles.userInfo}>
            {user?.userType === 'admin' ? '관리자' : user?.name || '사용자'}로그인됨 ({user?.username})
          </span>
          <button
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}