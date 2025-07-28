import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

export default function HospitalHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
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
            서울대병원
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
    </header>
  );
}