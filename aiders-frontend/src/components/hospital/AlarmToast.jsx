import { useHospitalAlarm } from '../../context/HospitalAlarmContext';

const AlarmToast = () => {
  const { 
    currentToast, 
    isToastVisible, 
    handleToastClick, 
    hideCurrentToast,
    getAlarmTypeIcon,
    getAlarmTypeText,
    getAlarmTypeColor 
  } = useHospitalAlarm();

  if (!currentToast) return null;

  const getKtasColor = (ktas) => {
    if (!ktas) return '#6b7280';
    if (ktas <= 2) return '#ef4444'; // 빨강 - 위험
    if (ktas <= 3) return '#f59e0b'; // 주황 - 주의  
    return '#10b981'; // 초록 - 안전
  };

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: isToastVisible ? '24px' : '-100px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        transition: 'bottom 0.3s ease-in-out',
        cursor: 'pointer'
      }}
      onClick={handleToastClick}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e5e7eb',
          padding: '16px 20px',
          minWidth: '320px',
          maxWidth: '400px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: isToastVisible ? 'slideUp 0.3s ease-out' : 'slideDown 0.3s ease-in'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.boxShadow = '0 25px 30px -5px rgba(0, 0, 0, 0.15), 0 15px 15px -5px rgba(0, 0, 0, 0.06)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
        }}
      >
        {/* 알람 타입 아이콘 */}
        <div
          style={{
            fontSize: '24px',
            backgroundColor: getAlarmTypeColor(currentToast.type) + '20',
            borderRadius: '12px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '40px',
            height: '40px'
          }}
        >
          {getAlarmTypeIcon(currentToast.type)}
        </div>

        {/* 알람 정보 */}
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px'
          }}>
            {/* 알람 타입 */}
            <span
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: getAlarmTypeColor(currentToast.type),
                backgroundColor: getAlarmTypeColor(currentToast.type) + '15',
                padding: '2px 8px',
                borderRadius: '8px'
              }}
            >
              {getAlarmTypeText(currentToast.type)}
            </span>

            {/* KTAS 등급 */}
            {currentToast.ktas && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: 'white',
                  backgroundColor: getKtasColor(currentToast.ktas),
                  padding: '2px 6px',
                  borderRadius: '6px'
                }}
              >
                KTAS {currentToast.ktas}
              </span>
            )}
          </div>

          {/* 구급차 번호 */}
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '2px'
          }}>
            🚑 {currentToast.ambulanceKey}
            {currentToast.patientName && (
              <span style={{ fontWeight: '400', color: '#6b7280' }}>
                {' - '}{currentToast.patientName}
              </span>
            )}
          </div>

          {/* 메시지 */}
          {currentToast.message && (
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              lineHeight: '1.4'
            }}>
              {currentToast.message}
            </div>
          )}
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            hideCurrentToast();
          }}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#9ca3af',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#f3f4f6';
            e.target.style.color = '#374151';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#9ca3af';
          }}
        >
          ✕
        </button>
      </div>

      {/* 애니메이션 키프레임 */}
      <style>{`
        @keyframes slideUp {
          from {
            bottom: -100px;
            opacity: 0;
          }
          to {
            bottom: 24px;
            opacity: 1;
          }
        }
        
        @keyframes slideDown {
          from {
            bottom: 24px;
            opacity: 1;
          }
          to {
            bottom: -100px;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AlarmToast;