import HospitalHeader from "../../components/hospital/HospitalHeader";
import useBedStore from "../../store/useBedStore";

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

const BedItem = ({ bed }) => {
  const { updateCurrentPatients } = useBedStore();
  
  const handlePatientChange = (delta) => {
    const newCurrent = bed.currentPatients + delta;
    updateCurrentPatients(bed.id, newCurrent);
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
            onClick={() => handlePatientChange(-1)}
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
            onClick={() => handlePatientChange(1)}
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
  const { beds, getStatistics } = useBedStore();
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
              {beds.map((bed) => (
                <BedItem key={bed.id} bed={bed} />
              ))}
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
              {ambulanceData.map((ambulance) => (
                <div key={ambulance.id} style={{
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
                    }}>{ambulance.vehicleNumber}</span>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: ambulance.priority === '응급' ? '#fee2e2' : '#fef3c7',
                      color: ambulance.priority === '응급' ? '#991b1b' : '#92400e',
                      fontWeight: '600'
                    }}>
                      {ambulance.priority}
                    </span>
                  </div>
                  
                  <div style={{
                    fontSize: '13px',
                    lineHeight: '1.4',
                    color: '#4b5563'
                  }}>
                    <div style={{ marginBottom: '6px' }}>
                      <strong>환자:</strong> {ambulance.patientInfo}
                    </div>
                    <div style={{ marginBottom: '6px' }}>
                      <strong>증상:</strong> {ambulance.condition}
                    </div>
                    <div style={{ marginBottom: '6px' }}>
                      <strong>거리:</strong> {ambulance.distance}
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
                      🕐 도착예정: {ambulance.eta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}