import HospitalHeader from "../../components/hospital/HospitalHeader";
import useBedStore from "../../store/useBedStore";

const BedCard = ({ bed }) => {
  const { updateTotalBeds, updateCurrentPatients, toggleBedStatus } = useBedStore();
  const isAvailable = bed.status === 'available';

  const handleStatusToggle = (e) => {
    e.stopPropagation();
    toggleBedStatus(bed.id);
  };

  const handleTotalBedsChange = (e, delta) => {
    e.stopPropagation();
    const newTotal = bed.totalBeds + delta;
    updateTotalBeds(bed.id, newTotal);
  };

  const handleCurrentPatientsChange = (e, delta) => {
    e.stopPropagation();
    const newCurrent = bed.currentPatients + delta;
    updateCurrentPatients(bed.id, newCurrent);
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
  const { beds, getStatistics } = useBedStore();
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

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginTop: '24px'
          }}>
            {beds.map((bed) => (
              <BedCard 
                key={bed.id} 
                bed={bed} 
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}