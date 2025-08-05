import { useEffect, useState } from "react";
import HospitalHeader from "../../components/hospital/HospitalHeader";
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

const BedItem = ({ bed, onDecrease, onIncrease }) => {
  const handleDecrease = () => {
    if (bed.currentPatients > 0) {
      onDecrease(bed.type);
    }
  };

  const handleIncrease = () => {
    if (bed.currentPatients < bed.totalBeds) {
      onIncrease(bed.type);
    }
  };

  const available = bed.totalBeds - bed.currentPatients;

  return (
    <div style={{
      padding: '12px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      marginBottom: '8px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <span style={{
          fontWeight: '600',
          color: '#374151',
          fontSize: '14px'
        }}>[{bed.category}] {bed.name}</span>
        <span style={{
          fontSize: '12px',
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: available > 0 ? '#dcfce7' : '#fee2e2',
          color: available > 0 ? '#166534' : '#991b1b'
        }}>
          {available > 0 ? '여유있음' : '만실'}
        </span>
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <span style={{
          fontSize: '13px',
          color: '#6b7280'
        }}>
          사용: {bed.currentPatients}/{bed.totalBeds} | 여유: {available}개
        </span>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <button
            onClick={handleDecrease}
            disabled={bed.currentPatients <= 0}
            style={{
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              border: '1px solid #e5e7eb',
              borderRadius: '3px',
              width: '20px',
              height: '20px',
              fontSize: '12px',
              cursor: 'pointer',
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
            onClick={handleIncrease}
            disabled={bed.currentPatients >= bed.totalBeds}
            style={{
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              border: '1px solid #e5e7eb',
              borderRadius: '3px',
              width: '20px',
              height: '20px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            +
          </button>
        </div>
      </div>
      
      <div style={{
        height: '4px',
        backgroundColor: '#e5e7eb',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${bed.totalBeds > 0 ? (bed.currentPatients / bed.totalBeds) * 100 : 0}%`,
          backgroundColor: available > 0 ? '#10b981' : '#ef4444',
          transition: 'width 0.3s ease'
        }}/>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { 
    loading, 
    error, 
    bedInfo, 
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

  useEffect(() => {
    const initializeData = async () => {
      if (user?.userId) {
        // 병원 ID 설정
        setHospitalId(user.userId);
        
        // 베드 정보와 알림 조회
        await Promise.all([
          fetchBedInfo(),
          fetchAllAlarms(user.userId)
        ]);
      }
    };

    initializeData();
  }, [user]);

  useEffect(() => {
    if (bedInfo) {
      // 백엔드 데이터를 프론트엔드 형식으로 변환
      const transformedBeds = [
        {
          id: 1,
          name: '중환자실',
          category: 'ICU',
          type: 'ICU',
          totalBeds: bedInfo.icuTotal || 0,
          currentPatients: bedInfo.icuUsed || 0
        },
        {
          id: 2,
          name: '응급실',
          category: 'ER',
          type: 'EMERGENCY',
          totalBeds: bedInfo.emergencyTotal || 0,
          currentPatients: bedInfo.emergencyUsed || 0
        },
        {
          id: 3,
          name: '일반병동',
          category: 'WARD',
          type: 'GENERAL',
          totalBeds: bedInfo.generalTotal || 0,
          currentPatients: bedInfo.generalUsed || 0
        }
      ];
      setBeds(transformedBeds);
    }
  }, [bedInfo]);

  const handleDecreaseBed = async (bedType) => {
    const result = await decreaseBedManually(bedType);
    if (!result.success) {
      alert('베드 감소에 실패했습니다: ' + result.error);
    }
  };

  const handleIncreaseBed = async (bedType) => {
    const result = await increaseBedManually(bedType);
    if (!result.success) {
      alert('베드 증가에 실패했습니다: ' + result.error);
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
              <h3 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: 0
              }}>병상 현황</h3>
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
                  <BedItem 
                    key={bed.id} 
                    bed={bed} 
                    onDecrease={handleDecreaseBed}
                    onIncrease={handleIncreaseBed}
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
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: 0
              }}>실시간 위치</h3>
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
                  서울대병원 중심 실시간 구급차 위치
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