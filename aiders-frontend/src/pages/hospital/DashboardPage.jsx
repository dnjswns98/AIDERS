import { useEffect, useState } from "react";
import HospitalHeader from "../../components/hospital/HospitalHeader";
import BedCard from "../../components/hospital/BedCard";
import useHospitalStore from "../../store/useHospitalStore";
import useHospitalAlarmStore from "../../store/useHospitalAlarmStore";
import { useAuthStore } from "../../store/useAuthStore";

const ambulanceData = [
  {
    id: 1,
    vehicleNumber: "서울응급01호",
    patientInfo: "남성, 65세",
    condition: "심근경색 의심",
    eta: "5분",
    distance: "2.3km",
    priority: "응급"
  },
  {
    id: 2,
    vehicleNumber: "서울응급02호", 
    patientInfo: "여성, 45세",
    condition: "교통사고",
    eta: "12분",
    distance: "4.1km",
    priority: "긴급"
  },
  {
    id: 3,
    vehicleNumber: "서울응급03호",
    patientInfo: "남성, 28세", 
    condition: "의식잃음",
    eta: "8분",
    distance: "3.2km",
    priority: "응급"
  }
];

const InitialSetupModal = ({ onSave, onCancel }) => {
  const [generalTotal, setGeneralTotal] = useState(20);
  const [pediatricTotal, setPediatricTotal] = useState(10);
  const [traumaTotal, setTraumaTotal] = useState(5);
  const [neonatalTotal, setNeonatalTotal] = useState(5);

  const handleSave = () => {
    const data = {
      generalTotalBed: generalTotal,
      generalAvailableBed: generalTotal,
      pediatricTotalBed: pediatricTotal,
      pediatricAvailableBed: pediatricTotal,
      traumaTotalBed: traumaTotal,
      traumaAvailableBed: traumaTotal,
      neonatalTotalBed: neonatalTotal,
      neonatalAvailableBed: neonatalTotal
    };
    console.log('🔍 초기 설정 데이터:', data);
    onSave(data);
  };

  return (
    <div style={{
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
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          marginBottom: '16px',
          textAlign: 'center',
          color: '#1f2937'
        }}>병상 정보 초기 설정</h3>
        
        <p style={{
          color: '#6b7280',
          marginBottom: '24px',
          textAlign: 'center',
          fontSize: '14px'
        }}>
          병원의 병상 정보가 없습니다. 초기 병상 수를 설정해주세요.
        </p>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
            일반병동
          </label>
          <input
            type="number"
            min="0"
            value={generalTotal}
            onChange={(e) => setGeneralTotal(parseInt(e.target.value) || 0)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
            소아병동
          </label>
          <input
            type="number"
            min="0"
            value={pediatricTotal}
            onChange={(e) => setPediatricTotal(parseInt(e.target.value) || 0)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
            외상센터
          </label>
          <input
            type="number"
            min="0"
            value={traumaTotal}
            onChange={(e) => setTraumaTotal(parseInt(e.target.value) || 0)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
            신생아실
          </label>
          <input
            type="number"
            min="0"
            value={neonatalTotal}
            onChange={(e) => setNeonatalTotal(parseInt(e.target.value) || 0)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            설정 완료
          </button>
        </div>
      </div>
    </div>
  );
};


export default function DashboardPage() {
  const { user } = useAuthStore();
  const { 
    loading, 
    error, 
    hospitalInfo,
    hospitalLocation,
    departmentStatus,
    bedInfo, 
    fetchHospitalInfo,
    fetchHospitalLocation,
    fetchDepartmentStatus,
    fetchBedInfo, 
    decreaseBedManually, 
    increaseBedManually 
  } = useHospitalStore();
  
  const {
    allAlarms,
    fetchAllAlarms,
    setHospitalId
  } = useHospitalAlarmStore();

  const [beds, setBeds] = useState([]);
  const [isInitialSetup, setIsInitialSetup] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      console.log('🔍 DashboardPage - 초기화 시작');
      console.log('🔍 DashboardPage - 사용자 정보:', {
        userId: user?.userId,
        username: user?.username,
        userType: user?.userType,
        fullUser: user
      });
      
      if (user?.userId) {
        console.log('🔍 병원 ID 설정:', user.userId);
        // 병원 ID 설정
        setHospitalId(user.userId);
        
        // 병원 정보, 위치, 진료과, 베드 정보, 알림 조회
        const [hospitalResult, locationResult, departmentResult, bedResult] = await Promise.all([
          fetchHospitalInfo(),
          fetchHospitalLocation(),
          fetchDepartmentStatus(),
          fetchBedInfo(),
          fetchAllAlarms(user.userId)
        ]);
        
        console.log('📊 DashboardPage API 조회 결과들:');
        console.log('  🏥 병원 정보:', hospitalResult);
        console.log('  📍 위치 정보:', locationResult);
        console.log('  🏥 진료과 정보:', departmentResult);
        console.log('  🛏️ 베드 정보:', bedResult);
        
        // 기본값으로 초기화된 경우 초기 설정 모드로 전환
        if (bedResult?.isDefault) {
          setIsInitialSetup(true);
        }
      }
    };

    initializeData();
  }, [user]);

  useEffect(() => {
    console.log('🏥 DashboardPage - hospitalInfo 상태 변화:', hospitalInfo);
  }, [hospitalInfo]);

  useEffect(() => {
    console.log('📍 DashboardPage - hospitalLocation 상태 변화:', hospitalLocation);
  }, [hospitalLocation]);

  useEffect(() => {
    console.log('🏥 DashboardPage - departmentStatus 상태 변화:', departmentStatus);
  }, [departmentStatus]);

  useEffect(() => {
    console.log('🔍 bedInfo useEffect 실행 - bedInfo:', bedInfo);
    
    if (bedInfo) {
      console.log('🔍 bedInfo 상세 정보 (실제 API 필드):', {
        generalTotalBed: bedInfo.generalTotalBed,
        generalAvailableBed: bedInfo.generalAvailableBed,
        pediatricTotalBed: bedInfo.pediatricTotalBed,
        pediatricAvailableBed: bedInfo.pediatricAvailableBed,
        traumaTotalBed: bedInfo.traumaTotalBed,
        traumaAvailableBed: bedInfo.traumaAvailableBed,
        neonatalTotalBed: bedInfo.neonatalTotalBed,
        neonatalAvailableBed: bedInfo.neonatalAvailableBed
      });
      
      // 실제 API 응답 구조에 맞게 데이터 변환
      const transformedBeds = [
        {
          id: 1,
          name: '일반병동',
          category: 'GENERAL',
          type: 'GENERAL',
          totalBeds: bedInfo.generalTotalBed || 0,
          currentPatients: (bedInfo.generalTotalBed || 0) - (bedInfo.generalAvailableBed || 0),
          status: bedInfo.generalIsAvailable ? 'available' : 'disabled'
        },
        {
          id: 2,
          name: '소아병동',
          category: 'PEDIATRIC',
          type: 'PEDIATRIC',
          totalBeds: bedInfo.pediatricTotalBed || 0,
          currentPatients: (bedInfo.pediatricTotalBed || 0) - (bedInfo.pediatricAvailableBed || 0),
          status: bedInfo.pediatricIsAvailable ? 'available' : 'disabled'
        },
        {
          id: 3,
          name: '외상센터',
          category: 'TRAUMA',
          type: 'TRAUMA',
          totalBeds: bedInfo.traumaTotalBed || 0,
          currentPatients: (bedInfo.traumaTotalBed || 0) - (bedInfo.traumaAvailableBed || 0),
          status: bedInfo.traumaIsAvailable ? 'available' : 'disabled'
        },
        {
          id: 4,
          name: '신생아실',
          category: 'NEONATAL',
          type: 'NEONATAL',
          totalBeds: bedInfo.neonatalTotalBed || 0,
          currentPatients: (bedInfo.neonatalTotalBed || 0) - (bedInfo.neonatalAvailableBed || 0),
          status: bedInfo.neonatalIsAvailable ? 'available' : 'disabled'
        }
      ];
      
      console.log('🔍 변환된 beds 데이터:', transformedBeds);
      setBeds(transformedBeds);
    } else {
      console.log('🔍 bedInfo가 null/undefined입니다');
    }
  }, [bedInfo]);

  const handleBedUpdate = async (bedType, updateType, value) => {
    try {
      if (updateType === 'current') {
        // 현재 환자 수 변경 (수동 증감) - value는 이제 delta값 (+1 또는 -1)
        console.log('🔍 DashboardPage - 환자 수 변경 요청:', {
          bedType,
          delta: value,
          valueType: typeof value
        });

        let result = { success: true };
        
        if (value > 0) {
          // 환자 수 증가 (+1) → 가용 병상 감소
          console.log('📈 환자 수 증가 (가용 병상 감소) API 호출:', bedType);
          result = await decreaseBedManually(bedType);
          console.log('📈 환자 수 증가 결과:', result);
        } else if (value < 0) {
          // 환자 수 감소 (-1) → 가용 병상 증가  
          console.log('📉 환자 수 감소 (가용 병상 증가) API 호출:', bedType);
          result = await increaseBedManually(bedType);
          console.log('📉 환자 수 감소 결과:', result);
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
        
        console.log('🔍 베드 업데이트 데이터:', updateData);

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

  const handleInitialSetup = async (initialData) => {
    // 필드명 변환
    const convertedData = {
      generalTotalBed: initialData.generalTotalBed || 0,
      generalAvailableBed: initialData.generalAvailableBed || 0,
      pediatricTotalBed: initialData.pediatricTotalBed || 0,
      pediatricAvailableBed: initialData.pediatricAvailableBed || 0,
      traumaTotalBed: initialData.traumaTotalBed || 0,
      traumaAvailableBed: initialData.traumaAvailableBed || 0,
      neonatalTotalBed: initialData.neonatalTotalBed || 0,
      neonatalAvailableBed: initialData.neonatalAvailableBed || 0
    };
    
    const result = await updateBedInfo(convertedData);
    if (result.success) {
      setIsInitialSetup(false);
      alert('병상 정보가 설정되었습니다.');
    } else {
      alert('병상 정보 설정에 실패했습니다: ' + result.error);
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
      
      {isInitialSetup && (
        <InitialSetupModal
          onSave={handleInitialSetup}
          onCancel={() => setIsInitialSetup(false)}
        />
      )}
      
      <main style={{ 
        paddingTop: '64px', 
        height: '100vh',
        backgroundColor: '#f3f4f6',
        margin: '0'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '380px 1fr 400px',
          gap: '0',
          height: 'calc(100vh - 64px)',
          width: '100vw'
        }}>
          {/* 좌측: 병상정보 */}
          <div style={{
            backgroundColor: 'white',
            borderRight: '1px solid #e5e7eb',
            padding: '20px',
            paddingTop: '36px',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <div style={{
                fontSize: '20px',
                marginRight: '8px'
              }}>🏥</div>
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: 0
                }}>병상 현황</h3>
                {hospitalInfo && (
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: '2px 0 0 0'
                  }}>
                    {hospitalInfo.name}
                  </p>
                )}
              </div>
            </div>

            {/* 전체 통계 */}
            <div style={{
              padding: '12px',
              backgroundColor: '#f0f9ff',
              borderRadius: '8px',
              border: '1px solid #bfdbfe',
              marginBottom: '16px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '13px',
                marginBottom: '4px'
              }}>
                <span style={{ color: '#0369a1', fontWeight: '600' }}>전체 현황</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#0369a1'
              }}>
                <span>총 병상: {stats.totalBeds}</span>
                <span>총 환자: {stats.totalPatients}</span>
                <span>여유: {stats.availableBeds}</span>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 280px)',
              overflowY: 'auto'
            }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  베드 정보를 불러오는 중...
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#ef4444' }}>
                  오류: {error}
                </div>
              ) : beds.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  베드 정보가 없습니다.
                </div>
              ) : (
                beds.map((bed) => (
                  <BedCard 
                    key={bed.id} 
                    bed={bed} 
                    onUpdate={handleBedUpdate}
                    compact={true}
                  />
                ))
              )}
            </div>
          </div>

          {/* 중앙: 지도 */}
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '20px',
            paddingTop: '36px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <div style={{
                fontSize: '24px',
                marginRight: '12px'
              }}>🗺️</div>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: 0
                }}>실시간 위치</h3>
                {hospitalInfo && (
                  <p style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    margin: '4px 0 0 0'
                  }}>
                    📍 {hospitalInfo.address}
                  </p>
                )}
                {hospitalLocation && (
                  <p style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    margin: '2px 0 0 0'
                  }}>
                    🌐 위도: {hospitalLocation.latitude}, 경도: {hospitalLocation.longitude}
                  </p>
                )}
              </div>
            </div>
            
            <div style={{
              flex: 1,
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed #cbd5e1',
              minHeight: '600px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '64px',
                  marginBottom: '16px'
                }}>🗺️</div>
                <p style={{
                  color: '#64748b',
                  fontSize: '16px',
                  margin: 0
                }}>
                  지도 API 연동 예정
                </p>
                <p style={{
                  color: '#94a3b8',
                  fontSize: '14px',
                  marginTop: '8px'
                }}>
                  {hospitalInfo ? `${hospitalInfo.name} 중심 실시간 구급차 위치` : '실시간 구급차 위치'}
                </p>
              </div>
            </div>
          </div>

          {/* 우측: 구급차 정보 */}
          <div style={{
            backgroundColor: 'white',
            borderLeft: '1px solid #e5e7eb',
            padding: '20px',
            paddingTop: '36px',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <div style={{
                fontSize: '20px',
                marginRight: '8px'
              }}>🚑</div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: 0
              }}>접수된 구급차</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {allAlarms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  현재 접수된 구급차가 없습니다.
                </div>
              ) : (
                allAlarms.slice(0, 10).map((alarm) => (
                <div key={alarm.id} style={{
                  padding: '12px',
                  backgroundColor: '#fefefe',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <span style={{
                      fontWeight: '600',
                      color: '#1f2937',
                      fontSize: '14px'
                    }}>{alarm.ambulanceKey || '구급차'}</span>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: alarm.type === 'MATCHING' ? '#fee2e2' : '#fef3c7',
                      color: alarm.type === 'MATCHING' ? '#991b1b' : '#92400e',
                      fontWeight: '600'
                    }}>
                      {alarm.type === 'MATCHING' ? '매칭' : alarm.type === 'REQUEST' ? '통화요청' : '수정'}
                    </span>
                  </div>
                  
                  <div style={{
                    fontSize: '13px',
                    lineHeight: '1.4',
                    color: '#4b5563'
                  }}>
                    <div style={{ marginBottom: '6px' }}>
                      <strong>메시지:</strong> {alarm.message || '알림 내용 없음'}
                    </div>
                    <div style={{ marginBottom: '6px' }}>
                      <strong>시간:</strong> {new Date(alarm.createdAt).toLocaleString('ko-KR')}
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '12px',
                    padding: '8px',
                    backgroundColor: '#ecfdf5',
                    borderRadius: '6px'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#065f46'
                    }}>
                      🚨 {alarm.type === 'MATCHING' ? '매칭 완료' : alarm.type === 'REQUEST' ? '통화 요청' : '정보 수정'}
                    </span>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}