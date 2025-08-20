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

  const handleAvailableBedsChange = async (e, delta) => {
    e.stopPropagation();
    if (isUpdating) return;
    
    const availableBeds = bed.totalBeds - bed.currentPatients;
    const newAvailable = Math.max(0, Math.min(bed.totalBeds, availableBeds + delta));
    
    if (newAvailable === availableBeds) return;
    
    setIsUpdating(true);
    await onUpdate(bed.type, 'available', newAvailable);
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
    border: `2px solid ${bed.isAvailable === false ? '#9ca3af' : '#cbd5e1'}`,
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
          fontSize: compact ? '20px' : '20px',
          letterSpacing: '-0.025em'
        }}>
          {bed.name} / {bed.category}
          {bed.isAvailable === false && ' (운영중단)'}
        </span>
        
        {compact && (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={{
              fontSize: '20px',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: bed.isAvailable === false ? '#fef3c7' : 
                (bed.totalBeds > 0 && bed.totalBeds > bed.currentPatients) ? '#dcfce7' : '#fee2e2',
              color: bed.isAvailable === false ? '#92400e' :
                (bed.totalBeds > 0 && bed.totalBeds > bed.currentPatients) ? '#166534' : '#991b1b'
            }}>
              {bed.isAvailable === false ? '중단됨' :
                (bed.totalBeds > 0 && bed.totalBeds > bed.currentPatients) ? '여유' : '만실'}
            </span>
          </div>
        )}
        
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

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: compact ? '8px' : '0'
      }}>
        <span style={{
          fontSize: compact ? '20px' : '14px',
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
              onClick={(e) => handleAvailableBedsChange(e, -1)}
              disabled={(bed.totalBeds - bed.currentPatients) <= 0 || isUpdating}
              style={{
                backgroundColor: ((bed.totalBeds - bed.currentPatients) <= 0 || isUpdating) ? '#f9fafb' : '#dcfce7',
                color: ((bed.totalBeds - bed.currentPatients) <= 0 || isUpdating) ? '#d1d5db' : '#166534',
                border: `1px solid ${((bed.totalBeds - bed.currentPatients) <= 0 || isUpdating) ? '#e5e7eb' : '#bbf7d0'}`,
                borderRadius: '3px',
                width: '20px',
                height: '20px',
                fontSize: '12px',
                cursor: ((bed.totalBeds - bed.currentPatients) <= 0 || isUpdating) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              -
            </button>
            <span style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#16a34a',
              minWidth: '16px',
              textAlign: 'center'
            }}>
              {bed.totalBeds - bed.currentPatients}
            </span>
            <button
              onClick={(e) => handleAvailableBedsChange(e, 1)}
              disabled={(bed.totalBeds - bed.currentPatients) >= bed.totalBeds || bed.totalBeds <= 0 || isUpdating}
              style={{
                backgroundColor: ((bed.totalBeds - bed.currentPatients) >= bed.totalBeds || bed.totalBeds <= 0 || isUpdating) ? '#f9fafb' : '#dcfce7',
                color: ((bed.totalBeds - bed.currentPatients) >= bed.totalBeds || bed.totalBeds <= 0 || isUpdating) ? '#d1d5db' : '#166534',
                border: `1px solid ${((bed.totalBeds - bed.currentPatients) >= bed.totalBeds || bed.totalBeds <= 0 || isUpdating) ? '#e5e7eb' : '#bbf7d0'}`,
                borderRadius: '3px',
                width: '20px',
                height: '20px',
                fontSize: '12px',
                cursor: ((bed.totalBeds - bed.currentPatients) >= bed.totalBeds || bed.totalBeds <= 0 || isUpdating) ? 'not-allowed' : 'pointer',
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

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f0fdf4',
            padding: '8px 12px',
            borderRadius: '6px'
          }}>
            <span style={{
              fontSize: '12px',
              color: '#16a34a',
              fontWeight: '500'
            }}>
              이용가능
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <button
                onClick={(e) => handleAvailableBedsChange(e, -1)}
                disabled={(bed.totalBeds - bed.currentPatients) <= 0 || isUpdating}
                style={{
                  backgroundColor: ((bed.totalBeds - bed.currentPatients) <= 0 || isUpdating) ? '#f3f4f6' : '#dcfce7',
                  color: ((bed.totalBeds - bed.currentPatients) <= 0 || isUpdating) ? '#9ca3af' : '#16a34a',
                  border: `1px solid ${((bed.totalBeds - bed.currentPatients) <= 0 || isUpdating) ? '#d1d5db' : '#bbf7d0'}`,
                  borderRadius: '4px',
                  width: '24px',
                  height: '24px',
                  fontSize: '14px',
                  cursor: ((bed.totalBeds - bed.currentPatients) <= 0 || isUpdating) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if ((bed.totalBeds - bed.currentPatients) > 0 && !isUpdating) {
                    e.target.style.backgroundColor = '#bbf7d0';
                    e.target.style.color = '#15803d';
                  }
                }}
                onMouseLeave={(e) => {
                  if ((bed.totalBeds - bed.currentPatients) > 0 && !isUpdating) {
                    e.target.style.backgroundColor = '#dcfce7';
                    e.target.style.color = '#16a34a';
                  }
                }}
              >
                -
              </button>
              <span style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#15803d',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {bed.totalBeds - bed.currentPatients}
              </span>
              <button
                onClick={(e) => handleAvailableBedsChange(e, 1)}
                disabled={(bed.totalBeds - bed.currentPatients) >= bed.totalBeds || bed.totalBeds <= 0 || isUpdating}
                style={{
                  backgroundColor: ((bed.totalBeds - bed.currentPatients) >= bed.totalBeds || bed.totalBeds <= 0 || isUpdating) ? '#f3f4f6' : '#dcfce7',
                  color: ((bed.totalBeds - bed.currentPatients) >= bed.totalBeds || bed.totalBeds <= 0 || isUpdating) ? '#9ca3af' : '#16a34a',
                  border: `1px solid ${((bed.totalBeds - bed.currentPatients) >= bed.totalBeds || bed.totalBeds <= 0 || isUpdating) ? '#d1d5db' : '#bbf7d0'}`,
                  borderRadius: '4px',
                  width: '24px',
                  height: '24px',
                  fontSize: '14px',
                  cursor: ((bed.totalBeds - bed.currentPatients) >= bed.totalBeds || bed.totalBeds <= 0 || isUpdating) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if ((bed.totalBeds - bed.currentPatients) < bed.totalBeds && bed.totalBeds > 0 && !isUpdating) {
                    e.target.style.backgroundColor = '#bbf7d0';
                    e.target.style.color = '#15803d';
                  }
                }}
                onMouseLeave={(e) => {
                  if ((bed.totalBeds - bed.currentPatients) < bed.totalBeds && bed.totalBeds > 0 && !isUpdating) {
                    e.target.style.backgroundColor = '#dcfce7';
                    e.target.style.color = '#16a34a';
                  }
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