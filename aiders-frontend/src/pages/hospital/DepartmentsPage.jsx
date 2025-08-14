import { useEffect, useState } from "react";
import HospitalHeader from "../../components/hospital/HospitalHeader";
import { getHospitalDepartments, updateHospitalDepartment } from "../../api/api";
import useHospitalAlarmRefresh from "../../hooks/useHospitalAlarmRefresh";

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const departmentList = [
    { code: 'im', name: '내과', icon: '💊' },
    { code: 'gs', name: '일반외과', icon: '🔪' },
    { code: 'nr', name: '신경외과', icon: '🧠' },
    { code: 'ns', name: '신경과', icon: '🧠' },
    { code: 'os', name: '정형외과', icon: '🦴' },
    { code: 'ts', name: '흉부외과', icon: '🫁' },
    { code: 'ps', name: '성형외과', icon: '✨' },
    { code: 'ob', name: '산부인과', icon: '👶' },
    { code: 'pd', name: '소아과', icon: '🧸' },
    { code: 'op', name: '안과', icon: '👁️' },
    { code: 'ent', name: '이비인후과', icon: '👂' },
    { code: 'dr', name: '피부과', icon: '🫧' },
    { code: 'ur', name: '비뇨기과', icon: '🫧' },
    { code: 'psy', name: '정신과', icon: '🧘' },
    { code: 'dt', name: '치과', icon: '🦷' }
  ];

  // WebSocket 알람 수신 시 자동 새로고침
  useHospitalAlarmRefresh(() => {
    fetchDepartments();
  }, ['EDIT']); // 정보 수정 알람에 반응

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getHospitalDepartments();
      setDepartments(data);
    } catch (err) {
      console.error('진료과목 조회 실패:', err);
      setError(err.message || '진료과목 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailable = async (departmentCode, currentValue) => {
    try {
      const updateData = {
        departmentCode: departmentCode.toUpperCase(),
        isAvailable: !currentValue
      };
      
      await updateHospitalDepartment(updateData);
      
      // 상태 업데이트
      setDepartments(prev => ({
        ...prev,
        [`${departmentCode}IsAvailable`]: !currentValue
      }));
    } catch (err) {
      console.error('진료과목 상태 변경 실패:', err);
      alert('진료과목 상태 변경에 실패했습니다: ' + (err.message || '알 수 없는 오류'));
    }
  };

  const handleToggleExist = async (departmentCode, currentValue) => {
    try {
      const updateData = {
        departmentCode: departmentCode.toUpperCase(),
        isExist: !currentValue
      };
      
      await updateHospitalDepartment(updateData);
      
      // 상태 업데이트
      setDepartments(prev => ({
        ...prev,
        [`${departmentCode}IsExist`]: !currentValue
      }));
    } catch (err) {
      console.error('진료과목 존재 여부 변경 실패:', err);
      alert('진료과목 존재 여부 변경에 실패했습니다: ' + (err.message || '알 수 없는 오류'));
    }
  };

  const getStatistics = () => {
    if (!departments) return { total: 0, existing: 0, available: 0 };
    
    let existing = 0;
    let available = 0;
    
    departmentList.forEach(dept => {
      const isExist = departments[`${dept.code}IsExist`];
      const isAvailable = departments[`${dept.code}IsAvailable`];
      
      if (isExist) existing++;
      if (isExist && isAvailable) available++;
    });
    
    return { total: departmentList.length, existing, available };
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
              진료과목 관리
            </h1>
            <p style={{
              color: '#6b7280',
              fontSize: '16px',
              marginBottom: '16px'
            }}>
              병원의 진료과목 운영 상태를 관리할 수 있습니다.
            </p>
            
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
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>전체 진료과</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{stats.total}</div>
              </div>
              <div style={{
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                minWidth: '120px'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>운영 중</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0369a1' }}>{stats.existing}</div>
              </div>
              <div style={{
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                minWidth: '120px'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>진료 가능</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>{stats.available}</div>
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
              <div style={{ fontSize: '18px', fontWeight: '500' }}>진료과목 정보를 불러오는 중...</div>
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
                onClick={fetchDepartments}
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
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {departmentList.map((dept) => {
                const isExist = departments?.[`${dept.code}IsExist`];
                const isAvailable = departments?.[`${dept.code}IsAvailable`];
                
                return (
                  <div
                    key={dept.code}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      opacity: isExist ? 1 : 0.6
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '16px'
                    }}>
                      <span style={{ fontSize: '24px', marginRight: '12px' }}>{dept.icon}</span>
                      <div>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#1f2937',
                          margin: 0
                        }}>
                          {dept.name}
                        </h3>
                        <p style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          margin: 0
                        }}>
                          {dept.code.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* 운영 상태 토글 */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>진료과 운영</span>
                        <button
                          onClick={() => handleToggleExist(dept.code, isExist)}
                          style={{
                            position: 'relative',
                            width: '48px',
                            height: '24px',
                            backgroundColor: isExist ? '#16a34a' : '#d1d5db',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            outline: 'none'
                          }}
                        >
                          <div
                            style={{
                              position: 'absolute',
                              top: '2px',
                              left: isExist ? '26px' : '2px',
                              width: '20px',
                              height: '20px',
                              backgroundColor: 'white',
                              borderRadius: '50%',
                              transition: 'all 0.2s',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                            }}
                          />
                        </button>
                      </div>
                      
                      {/* 진료 가능 상태 토글 */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ 
                          fontSize: '14px', 
                          color: isExist ? '#374151' : '#9ca3af',
                          fontWeight: '500'
                        }}>
                          진료 가능
                        </span>
                        <button
                          onClick={() => handleToggleAvailable(dept.code, isAvailable)}
                          disabled={!isExist}
                          style={{
                            position: 'relative',
                            width: '48px',
                            height: '24px',
                            backgroundColor: (isExist && isAvailable) ? '#16a34a' : '#d1d5db',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: isExist ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s',
                            outline: 'none',
                            opacity: isExist ? 1 : 0.4
                          }}
                        >
                          <div
                            style={{
                              position: 'absolute',
                              top: '2px',
                              left: (isExist && isAvailable) ? '26px' : '2px',
                              width: '20px',
                              height: '20px',
                              backgroundColor: 'white',
                              borderRadius: '50%',
                              transition: 'all 0.2s',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                            }}
                          />
                        </button>
                      </div>
                      
                      {/* 상태 표시 텍스트 */}
                      <div style={{
                        padding: '8px 12px',
                        backgroundColor: isExist ? (isAvailable ? '#dcfce7' : '#fef3c7') : '#f3f4f6',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: isExist ? (isAvailable ? '#166534' : '#92400e') : '#6b7280'
                      }}>
                        {!isExist ? '미운영' : (isAvailable ? '진료 가능' : '진료 불가')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default DepartmentsPage;