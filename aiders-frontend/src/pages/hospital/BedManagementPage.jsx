import { useEffect, useState } from "react";
import HospitalHeader from "../../components/hospital/HospitalHeader";
import BedCard from "../../components/hospital/BedCard";
import useHospitalStore from "../../store/useHospitalStore";
import { useAuthStore } from "../../store/useAuthStore";


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
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      if (user?.userId) {
        await fetchBedInfo();
      }
    };

    initializeData();
  }, [user]);

  useEffect(() => {
    console.log('🔍 BedManagementPage - bedInfo:', bedInfo);
    
    // 실제 API 응답 구조에 맞게 데이터 변환
    const transformedBeds = [
      {
        id: 1,
        name: '일반병동',
        category: 'GENERAL',
        type: 'GENERAL',
        totalBeds: bedInfo?.generalTotalBed || 0,
        currentPatients: (bedInfo?.generalTotalBed || 0) - (bedInfo?.generalAvailableBed || 0),
        status: bedInfo?.generalIsAvailable ? 'available' : 'disabled',
        isAvailable: bedInfo?.generalIsAvailable,
        isExist: bedInfo?.generalIsExist
      },
      {
        id: 2,
        name: '소아병동',
        category: 'PEDIATRIC',
        type: 'PEDIATRIC',
        totalBeds: bedInfo?.pediatricTotalBed || 0,
        currentPatients: (bedInfo?.pediatricTotalBed || 0) - (bedInfo?.pediatricAvailableBed || 0),
        status: bedInfo?.pediatricIsAvailable ? 'available' : 'disabled',
        isAvailable: bedInfo?.pediatricIsAvailable,
        isExist: bedInfo?.pediatricIsExist
      },
      {
        id: 3,
        name: '외상센터',
        category: 'TRAUMA',
        type: 'TRAUMA',
        totalBeds: bedInfo?.traumaTotalBed || 0,
        currentPatients: (bedInfo?.traumaTotalBed || 0) - (bedInfo?.traumaAvailableBed || 0),
        status: bedInfo?.traumaIsAvailable ? 'available' : 'disabled',
        isAvailable: bedInfo?.traumaIsAvailable,
        isExist: bedInfo?.traumaIsExist
      },
      {
        id: 4,
        name: '신생아실',
        category: 'NEONATAL',
        type: 'NEONATAL',
        totalBeds: bedInfo?.neonatalTotalBed || 0,
        currentPatients: (bedInfo?.neonatalTotalBed || 0) - (bedInfo?.neonatalAvailableBed || 0),
        status: bedInfo?.neonatalIsAvailable ? 'available' : 'disabled',
        isAvailable: bedInfo?.neonatalIsAvailable,
        isExist: bedInfo?.neonatalIsExist
      }
    ];
    
    console.log('🔍 BedManagementPage - 변환된 beds:', transformedBeds);
    // isExist가 false인 병상은 제외하고 표시
    const visibleBeds = transformedBeds.filter(bed => bed.isExist !== false);
    setBeds(visibleBeds);
  }, [bedInfo]);

  const handleBedUpdate = async (bedType, updateType, value) => {
    try {
      if (updateType === 'current') {
        // 현재 환자 수 변경 (수동 증감) - value는 이제 delta값 (+1 또는 -1)
        console.log('🔍 BedManagementPage - 환자 수 변경 요청:', {
          bedType,
          delta: value
        });

        let result = { success: true };
        
        if (value > 0) {
          // 환자 수 증가 (+1) → 가용 병상 감소
          console.log('📈 환자 수 증가 (가용 병상 감소) API 호출:', bedType);
          result = await decreaseBedManually(bedType);
        } else if (value < 0) {
          // 환자 수 감소 (-1) → 가용 병상 증가
          console.log('📉 환자 수 감소 (가용 병상 증가) API 호출:', bedType);
          result = await increaseBedManually(bedType);
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
        const currentBed = beds.find(b => b.type === bedType);
        
        if (bedType === 'GENERAL') {
          updateData.generalTotalBed = value;
          updateData.generalAvailableBed = Math.max(0, value - (currentBed?.currentPatients || 0));
        } else if (bedType === 'PEDIATRIC') {
          updateData.pediatricTotalBed = value;
          updateData.pediatricAvailableBed = Math.max(0, value - (currentBed?.currentPatients || 0));
        } else if (bedType === 'TRAUMA') {
          updateData.traumaTotalBed = value;
          updateData.traumaAvailableBed = Math.max(0, value - (currentBed?.currentPatients || 0));
        } else if (bedType === 'NEONATAL') {
          updateData.neonatalTotalBed = value;
          updateData.neonatalAvailableBed = Math.max(0, value - (currentBed?.currentPatients || 0));
        }
        
        console.log('🔍 BedManagementPage - 베드 업데이트 데이터:', updateData);

        const result = await updateBedInfo(updateData);
        if (!result?.success) {
          alert('베드 정보 업데이트에 실패했습니다: ' + (result?.error || '알 수 없는 오류'));
        }
      } else if (updateType === 'status') {
        // 상태 변경 (병상 운영 상태 업데이트)
        console.log('🔍 BedManagementPage - 병상 운영 상태 변경:', {
          bedType,
          newIsAvailable: value
        });
        
        const updateData = {};
        
        if (bedType === 'GENERAL') {
          updateData.generalIsAvailable = value;
        } else if (bedType === 'PEDIATRIC') {
          updateData.pediatricIsAvailable = value;
        } else if (bedType === 'TRAUMA') {
          updateData.traumaIsAvailable = value;
        } else if (bedType === 'NEONATAL') {
          updateData.neonatalIsAvailable = value;
        }
        
        console.log('🔍 BedManagementPage - 병상 상태 업데이트 데이터:', updateData);

        const result = await updateBedInfo(updateData);
        if (!result?.success) {
          alert('병상 운영 상태 변경에 실패했습니다: ' + (result?.error || '알 수 없는 오류'));
        }
      }
    } catch (error) {
      console.error('베드 업데이트 중 오류 발생:', error);
      alert('베드 업데이트 중 오류가 발생했습니다: ' + error.message);
    }
  };

  const handleExistToggle = async (bedKey, newIsExist) => {
    try {
      console.log('🔍 BedManagementPage - 병상 존재 여부 변경:', {
        bedKey,
        newIsExist
      });
      
      const updateData = {};
      updateData[`${bedKey}IsExist`] = newIsExist;
      
      console.log('🔍 BedManagementPage - 병상 존재 여부 업데이트 데이터:', updateData);

      const result = await updateBedInfo(updateData);
      if (!result?.success) {
        alert('병상 존재 여부 변경에 실패했습니다: ' + (result?.error || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('병상 존재 여부 업데이트 중 오류 발생:', error);
      alert('병상 존재 여부 업데이트 중 오류가 발생했습니다: ' + error.message);
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
              marginBottom: '24px',
              alignItems: 'center'
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
              
              {/* 편집 아이콘 */}
              <button
                onClick={() => setShowEditModal(true)}
                style={{
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '16px',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: '#6b7280',
                  transition: 'all 0.2s',
                  marginLeft: 'auto'
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
                ⚙️
              </button>
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
                maxHeight: 'calc(100vh - 400px)',
                overflowY: 'auto',
                paddingRight: '8px',
                marginTop: '24px'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '16px'
                }}>
                  {beds.map((bed) => (
                    <BedCard 
                      key={bed.id} 
                      bed={bed} 
                      onUpdate={handleBedUpdate}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      
      {/* 병상 존재 여부 편집 모달 */}
      {showEditModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={(e) => {
            // 모달 배경 클릭 시에는 아무 동작하지 않음 (모달 닫지 않음)
            e.stopPropagation();
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => {
              // 모달 콘텐츠 클릭 시 이벤트 전파 중단 (모달 닫지 않음)
              e.stopPropagation();
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: 0
              }}>
                병상 존재 여부 설정
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#f0f9ff',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#0369a1'
            }}>
              💡 병상이 존재하지 않으면 메인 화면에서 완전히 숨겨집니다.
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { type: 'GENERAL', name: '일반병동', key: 'general' },
                { type: 'PEDIATRIC', name: '소아병동', key: 'pediatric' },
                { type: 'TRAUMA', name: '외상센터', key: 'trauma' },
                { type: 'NEONATAL', name: '신생아실', key: 'neonatal' }
              ].map(({ type, name, key }) => {
                const currentBed = beds.find(b => b.type === type);
                const isExist = bedInfo?.[`${key}IsExist`];
                
                return (
                  <div key={type} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#374151'
                    }}>
                      {name}
                    </span>
                    
                    <button
                      onClick={() => handleExistToggle(key, !isExist)}
                      style={{
                        backgroundColor: isExist ? '#16a34a' : '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                      }}
                    >
                      {isExist ? '존재함' : '존재하지 않음'}
                    </button>
                  </div>
                );
              })}
            </div>
            
            <div style={{
              marginTop: '24px',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}