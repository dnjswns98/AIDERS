import { useState } from "react";

const BedCard = ({ bed, onUpdate, compact = false, readonly = false }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleTotalBedsChange = async (e, delta) => {
    e.stopPropagation();
    if (isUpdating) return;
    
    const newTotal = Math.max(0, bed.totalBeds + delta);
    if (newTotal === bed.totalBeds) return;
    
    setIsUpdating(true);
    await onUpdate(bed.type, 'total', newTotal);
    setIsUpdating(false);
  };

  const handleCurrentPatientsChange = async (e, delta) => {
    e.stopPropagation();
    if (isUpdating) return;
    
    // 경계값 체크
    if (delta > 0 && bed.currentPatients >= bed.totalBeds) return;
    if (delta < 0 && bed.currentPatients <= 0) return;
    
    // console.log('🔍 BedCard - 환자 수 변경:', {
    //   bedType: bed.type,
    //   currentPatients: bed.currentPatients,
    //   delta,
    //   totalBeds: bed.totalBeds
    // });
    
    setIsUpdating(true);
    await onUpdate(bed.type, 'current', delta); // delta만 전달
    setIsUpdating(false);
  };

  const handleStatusToggle = async (e) => {
    e.stopPropagation();
    if (isUpdating) return;
    
    setIsUpdating(true);
    await onUpdate(bed.type, 'status', !bed.isAvailable);
    setIsUpdating(false);
  };


  const cardStyle = compact ? {
    backgroundColor: bed.isAvailable === false ? '#f3f4f6' : '#f8fafc',
    borderRadius: '8px',
    border: `1px solid ${bed.isAvailable === false ? '#d1d5db' : '#e2e8f0'}`,
    padding: '12px',
    marginBottom: '8px',
    opacity: bed.isAvailable === false ? 0.6 : 1
  } : {
    backgroundColor: bed.isAvailable === false ? '#f3f4f6' : 'white',
    borderRadius: '8px',
    border: `1px solid ${bed.isAvailable === false ? '#d1d5db' : '#e5e7eb'}`,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minHeight: '200px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s',
    opacity: bed.isAvailable === false ? 0.6 : 1,
    position: 'relative'
  };

  return (
    <div 
      style={cardStyle}
      onMouseEnter={!compact ? (e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      } : undefined}
      onMouseLeave={!compact ? (e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      } : undefined}
    >
      

      {/* 병상명과 상태 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: compact ? '12px' : '16px',
        marginTop: compact ? '0' : '8px'
      }}>
        <span style={{
          fontWeight: '700',
          color: bed.isAvailable === false ? '#9ca3af' : '#1f2937',
          fontSize: compact ? '16px' : '20px',
          letterSpacing: '-0.025em'
        }}>
          {bed.name} / {bed.category}
          {bed.isAvailable === false && ' (운영중단)'}
        </span>
        
        {compact && (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={{
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: bed.isAvailable === false ? '#fef3c7' : 
                (bed.totalBeds > 0 && bed.totalBeds > bed.currentPatients) ? '#dcfce7' : '#fee2e2',
              color: bed.isAvailable === false ? '#92400e' :
                (bed.totalBeds > 0 && bed.totalBeds > bed.currentPatients) ? '#166534' : '#991b1b'
            }}>
              {bed.isAvailable === false ? '중단됨' :
                (bed.totalBeds > 0 && bed.totalBeds > bed.currentPatients) ? '여유있음' : '만실'}
            </span>
          </div>
        )}
        
        {/* 토글 스위치 - 오른쪽 상단 */}
        {!compact && !readonly && (
          <div
            onClick={handleStatusToggle}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '44px',
              height: '24px',
              backgroundColor: bed.isAvailable ? '#22c55e' : '#ef4444',
              borderRadius: '12px',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              border: '2px solid transparent',
              opacity: isUpdating ? 0.7 : 1
            }}
          >
            <div style={{
              position: 'absolute',
              top: '2px',
              left: bed.isAvailable ? '22px' : '2px',
              width: '16px',
              height: '16px',
              backgroundColor: 'white',
              borderRadius: '50%',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </div>
        )}
      </div>

      {/* 사용 현황 정보 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: compact ? '8px' : '0'
      }}>
        <span style={{
          fontSize: compact ? '13px' : '14px',
          color: '#6b7280'
        }}>
          사용: {bed.currentPatients}/{bed.totalBeds} | 여유: {bed.totalBeds - bed.currentPatients}개
        </span>
        
        {compact && !readonly && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <button
              onClick={(e) => handleCurrentPatientsChange(e, -1)}
              disabled={bed.currentPatients <= 0 || isUpdating}
              style={{
                backgroundColor: (bed.currentPatients <= 0 || isUpdating) ? '#f9fafb' : (bed.totalBeds > 0 && bed.totalBeds > bed.currentPatients ? '#dcfce7' : '#f3f4f6'),
                color: (bed.currentPatients <= 0 || isUpdating) ? '#d1d5db' : (bed.totalBeds > 0 && bed.totalBeds > bed.currentPatients ? '#166534' : '#6b7280'),
                border: `1px solid ${(bed.currentPatients <= 0 || isUpdating) ? '#e5e7eb' : (bed.totalBeds > 0 && bed.totalBeds > bed.currentPatients ? '#bbf7d0' : '#e5e7eb')}`,
                borderRadius: '3px',
                width: '20px',
                height: '20px',
                fontSize: '12px',
                cursor: (bed.currentPatients <= 0 || isUpdating) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              -
            </button>
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#1f2937',
              minWidth: '16px',
              textAlign: 'center'
            }}>
              {bed.currentPatients}
            </span>
            <button
              onClick={(e) => handleCurrentPatientsChange(e, 1)}
              disabled={bed.currentPatients >= bed.totalBeds || bed.totalBeds <= 0 || isUpdating}
              style={{
                backgroundColor: (bed.currentPatients >= bed.totalBeds || bed.totalBeds <= 0 || isUpdating) ? '#f9fafb' : (bed.totalBeds > 0 && bed.totalBeds > bed.currentPatients ? '#dcfce7' : '#f3f4f6'),
                color: (bed.currentPatients >= bed.totalBeds || bed.totalBeds <= 0 || isUpdating) ? '#d1d5db' : (bed.totalBeds > 0 && bed.totalBeds > bed.currentPatients ? '#166534' : '#6b7280'),
                border: `1px solid ${(bed.currentPatients >= bed.totalBeds || bed.totalBeds <= 0 || isUpdating) ? '#e5e7eb' : (bed.totalBeds > 0 && bed.totalBeds > bed.currentPatients ? '#bbf7d0' : '#e5e7eb')}`,
                borderRadius: '3px',
                width: '20px',
                height: '20px',
                fontSize: '12px',
                cursor: (bed.currentPatients >= bed.totalBeds || bed.totalBeds <= 0 || isUpdating) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              +
            </button>
          </div>
        )}
      </div>

      {/* 진행률 바 */}
      <div style={{
        height: '4px',
        backgroundColor: '#e5e7eb',
        borderRadius: '2px',
        overflow: 'hidden',
        marginBottom: compact ? '0' : '8px'
      }}>
        <div style={{
          height: '100%',
          width: `${bed.totalBeds > 0 ? (bed.currentPatients / bed.totalBeds) * 100 : 0}%`,
          backgroundColor: (bed.totalBeds - bed.currentPatients) > 0 ? '#10b981' : '#ef4444',
          transition: 'width 0.3s ease'
        }}/>
      </div>

      {!compact && (
        <>
          {/* 총 병상 수 조절 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f9fafb',
            padding: '8px 12px',
            borderRadius: '6px',
            marginBottom: '8px'
          }}>
            <span style={{
              fontSize: '12px',
              color: '#6b7280',
              fontWeight: '500'
            }}>
              총 병상
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <button
                onClick={(e) => handleTotalBedsChange(e, -1)}
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  width: '24px',
                  height: '24px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e5e7eb';
                  e.target.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.color = '#6b7280';
                }}
              >
                -
              </button>
              <span style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {bed.totalBeds}
              </span>
              <button
                onClick={(e) => handleTotalBedsChange(e, 1)}
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  width: '24px',
                  height: '24px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e5e7eb';
                  e.target.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.color = '#6b7280';
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* 실제 환자 수 조절 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f0f9ff',
            padding: '8px 12px',
            borderRadius: '6px'
          }}>
            <span style={{
              fontSize: '12px',
              color: '#0369a1',
              fontWeight: '500'
            }}>
              환자 수
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <button
                onClick={(e) => handleCurrentPatientsChange(e, -1)}
                style={{
                  backgroundColor: '#dbeafe',
                  color: '#0369a1',
                  border: '1px solid #bfdbfe',
                  borderRadius: '4px',
                  width: '24px',
                  height: '24px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#bfdbfe';
                  e.target.style.color = '#1e40af';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#dbeafe';
                  e.target.style.color = '#0369a1';
                }}
              >
                -
              </button>
              <span style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1e40af',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {bed.currentPatients}
              </span>
              <button
                onClick={(e) => handleCurrentPatientsChange(e, 1)}
                style={{
                  backgroundColor: '#dbeafe',
                  color: '#0369a1',
                  border: '1px solid #bfdbfe',
                  borderRadius: '4px',
                  width: '24px',
                  height: '24px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#bfdbfe';
                  e.target.style.color = '#1e40af';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#dbeafe';
                  e.target.style.color = '#0369a1';
                }}
              >
                +
              </button>
            </div>
          </div>

        </>
      )}
    </div>
  );
};

export default BedCard;