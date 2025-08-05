import { useEffect, useState } from "react";
import HospitalHeader from "../../components/hospital/HospitalHeader";
import useHospitalStore from "../../store/useHospitalStore";
import { useAuthStore } from "../../store/useAuthStore";

const BedCard = ({ bed, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const isAvailable = bed.status !== 'disabled';

  const handleStatusToggle = async (e) => {
    e.stopPropagation();
    setIsUpdating(true);
    
    // 상태 토글 API 호출 (department status update)
    const newStatus = isAvailable ? 'disabled' : 'available';
    await onUpdate(bed.type, 'status', newStatus);
    
    setIsUpdating(false);
  };

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
    
    const newCurrent = Math.max(0, Math.min(bed.totalBeds, bed.currentPatients + delta));
    if (newCurrent === bed.currentPatients) return;
    
    setIsUpdating(true);
    await onUpdate(bed.type, 'current', newCurrent);
    setIsUpdating(false);
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      minHeight: '200px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
      e.currentTarget.style.transform = 'translateY(-1px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}>
      
      {/* 카테고리와 상태 토글 스위치 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{
          backgroundColor: '#f3f4f6',
          color: '#374151',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          [{bed.category}]
        </span>
        
        {/* ON/OFF 토글 스위치 */}
        <div
          onClick={handleStatusToggle}
          style={{
            width: '44px',
            height: '24px',
            backgroundColor: isAvailable ? '#22c55e' : '#ef4444',
            borderRadius: '12px',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            padding: '2px'
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: 'white',
              borderRadius: '50%',
              position: 'absolute',
              left: isAvailable ? '22px' : '2px',
              transition: 'left 0.3s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}
          />
        </div>
      </div>

      {/* 병상명 */}
      <div style={{
        fontSize: '18px',
        fontWeight: '600',
        color: '#1f2937',
        lineHeight: '1.4',
        flex: 1
      }}>
        {bed.name}
      </div>

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
          실제 환자
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
    </div>
  );
};

export default function BedManagementPage() {
  const { user } = useAuthStore();
  const { 
    loading, 
    error, 
    bedInfo, 
    fetchBedInfo, 
    updateBedInfo,
    createInitialBedInfo,
    decreaseBedManually, 
    increaseBedManually 
  } = useHospitalStore();

  const [beds, setBeds] = useState([]);

  useEffect(() => {
    const initializeData = async () => {
      if (user?.userId) {
        await fetchBedInfo();
      }
    };

    initializeData();
  }, [user]);

  useEffect(() => {
    // bedInfo가 있든 없든 기본 베드 구조는 항상 표시
    const transformedBeds = [
      {
        id: 1,
        name: '중환자실 (ICU)',
        category: 'ICU',
        type: 'ICU',
        totalBeds: bedInfo?.icuTotal || 0,
        currentPatients: bedInfo?.icuUsed || 0,
        status: 'available'
      },
      {
        id: 2,
        name: '응급실 (ER)',
        category: 'ER',
        type: 'EMERGENCY',
        totalBeds: bedInfo?.emergencyTotal || 0,
        currentPatients: bedInfo?.emergencyUsed || 0,
        status: 'available'
      },
      {
        id: 3,
        name: '일반병동',
        category: 'WARD',
        type: 'GENERAL',
        totalBeds: bedInfo?.generalTotal || 0,
        currentPatients: bedInfo?.generalUsed || 0,
        status: 'available'
      }
    ];
    setBeds(transformedBeds);
  }, [bedInfo]);

  const handleBedUpdate = async (bedType, updateType, value) => {
    try {
      if (updateType === 'current') {
        // 현재 환자 수 변경 (수동 증감)
        const currentBed = beds.find(b => b.type === bedType);
        if (!currentBed) {
          console.error('베드 정보를 찾을 수 없습니다:', bedType);
          return;
        }

        let result;
        if (value > currentBed.currentPatients) {
          result = await increaseBedManually(bedType);
        } else if (value < currentBed.currentPatients) {
          result = await decreaseBedManually(bedType);
        } else {
          return; // 변화 없음
        }

        if (!result?.success) {
          alert('베드 환자 수 변경에 실패했습니다: ' + (result?.error || '알 수 없는 오류'));
        }
      } else if (updateType === 'total') {
        // 총 베드 수 변경 (베드 정보 업데이트)
        if (value < 0) {
          alert('베드 수는 0보다 작을 수 없습니다.');
          return;
        }

        const updateData = {};
        if (bedType === 'ICU') {
          updateData.icuTotal = value;
        } else if (bedType === 'EMERGENCY') {
          updateData.emergencyTotal = value;
        } else if (bedType === 'GENERAL') {
          updateData.generalTotal = value;
        }

        const result = await updateBedInfo(updateData);
        if (!result?.success) {
          alert('베드 정보 업데이트에 실패했습니다: ' + (result?.error || '알 수 없는 오류'));
        }
      } else if (updateType === 'status') {
        // 상태 변경 (진료과 상태 업데이트)
        console.log('Status update:', bedType, value);
        // TODO: department API 연결
      }
    } catch (error) {
      console.error('베드 업데이트 중 오류 발생:', error);
      alert('베드 업데이트 중 오류가 발생했습니다: ' + error.message);
    }
  };

  // 통계 계산
  const getStatistics = () => {
    const totalBeds = beds.reduce((sum, bed) => sum + bed.totalBeds, 0);
    const totalPatients = beds.reduce((sum, bed) => sum + bed.currentPatients, 0);
    const availableBeds = totalBeds - totalPatients;
    
    return { totalBeds, totalPatients, availableBeds };
  };

  const stats = getStatistics();

  return (
    <>
      <HospitalHeader />
      
      <main style={{ 
        paddingTop: '64px', 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb',
        padding: '64px 24px 24px 24px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            marginBottom: '32px'
          }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              병상관리
            </h1>
            <p style={{
              color: '#6b7280',
              fontSize: '16px',
              marginBottom: '16px'
            }}>
              병상 현황 및 관리 페이지입니다. 총 병상과 실제 환자 수를 조절할 수 있습니다.
            </p>
            
            {/* 통계 정보 */}
            <div style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                minWidth: '120px'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>총 병상</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{stats.totalBeds}</div>
              </div>
              <div style={{
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                minWidth: '120px'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>총 환자</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0369a1' }}>{stats.totalPatients}</div>
              </div>
              <div style={{
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                minWidth: '120px'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>이용 가능</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>{stats.availableBeds}</div>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: '#6b7280' 
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <div style={{ fontSize: '18px', fontWeight: '500' }}>베드 정보를 불러오는 중...</div>
            </div>
          ) : error ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: '#ef4444' 
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
              <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>오류가 발생했습니다</div>
              <div style={{ fontSize: '14px' }}>{error}</div>
              <button 
                onClick={() => fetchBedInfo()}
                style={{
                  marginTop: '16px',
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                다시 시도
              </button>
            </div>
          ) : (
            <>
              {beds.every(bed => bed.totalBeds === 0 && bed.currentPatients === 0) && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px',
                  marginBottom: '20px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '8px',
                  border: '1px solid #f59e0b'
                }}>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: '#92400e', marginBottom: '4px' }}>
                    ℹ️ 베드 데이터가 비어있습니다
                  </div>
                  <div style={{ fontSize: '14px', color: '#92400e' }}>
                    아래 카드의 +/- 버튼을 사용해서 베드 정보를 설정해주세요.
                  </div>
                </div>
              )}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
                marginTop: '24px'
              }}>
                {beds.map((bed) => (
                  <BedCard 
                    key={bed.id} 
                    bed={bed} 
                    onUpdate={handleBedUpdate}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}