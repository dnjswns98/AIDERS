import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import useFireStationStore from '../../store/useFireStationStore';
import useEmergencyStore from '../../store/useEmergencyStore';
import useBedStore from '../../store/useBedStore';
import { getPriorityColor, getPriorityText, getStatusText, getStatusColor } from "../../utils/statusUtils";

// 모달 컴포넌트들
import NewReportModal from "../../components/FireStation/modals/NewReportModal";
import EditReportModal from "../../components/FireStation/modals/EditReportModal";
import PatientModal from "../../components/FireStation/modals/PatientModal";
import DispatchFormModal from '../../components/FireStation/modals/DispatchFormModal';

const FireStationReports = () => {
  const { ambulances, user, updateReport } = useAppContext();
  const { 
    dispatchAmbulance, 
    isAmbulanceDispatching, 
    getDispatchProgress,
    todayStats,
    refreshTodayStats,
    error: storeError, 
    clearError,
    isLoading: storeLoading 
  } = useFireStationStore();
  const { getAvailableAmbulances } = useEmergencyStore();
  const { getHospitals } = useBedStore();

  // === 기본 상태 ===
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'dispatched', 'urgent', 'emergency'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('callTime'); // 'callTime', 'priority', 'status', 'address'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  // === 모달 상태 ===
  const [showNewReportModal, setShowNewReportModal] = useState(false);
  const [showEditReportModal, setShowEditReportModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // === UI 상태 ===
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedReportIds, setSelectedReportIds] = useState(new Set());

  // === 통계 상태 ===
  const [reportStats, setReportStats] = useState({
    total: 0,
    pending: 0,
    dispatched: 0,
    urgent: 0,
    emergency: 0,
    todayCount: 0,
    avgResponseTime: 0
  });

  // === 더미 데이터 초기화 (실제로는 API에서 가져와야 함) ===
  useEffect(() => {
    const initializeMockReports = () => {
      const mockReports = [
        {
          id: 1,
          reportNumber: 'R2024081101',
          address: '경북 구미시 송정대로 55 (원평동)',
          latitude: 36.145234,
          longitude: 128.394567,
          condition: '의식잃음, 호흡곤란, 안면창백',
          content: '60대 남성 환자, 갑작스런 의식 소실과 호흡곤란 증상 호소. 현재 반응 없음.',
          callTime: '2024-08-11T09:15:32',
          isDispatched: false,
          priority: 'emergency',
          reporterName: '김신고',
          reporterPhone: '010-1234-5678',
          patientInfo: {
            name: '김환자',
            ageRange: 'ELDERLY',
            sex: 1,
            estimatedAge: 65
          },
          location: '원평동 주민센터 앞',
          landmark: '하나은행 맞은편',
          accessInfo: '2층 엘리베이터 이용',
          createdAt: '2024-08-11T09:15:32',
          updatedAt: '2024-08-11T09:15:32'
        },
        {
          id: 2,
          reportNumber: 'R2024081102',
          address: '경북 구미시 고아읍 문화로 123',
          latitude: 36.155234,
          longitude: 128.424567,
          condition: '교통사고, 다발성 외상',
          content: '승용차와 오토바이 충돌사고. 오토바이 운전자 의식 있음, 다리 부상 추정.',
          callTime: '2024-08-11T09:25:15',
          isDispatched: true,
          priority: 'urgent',
          ambulanceId: 1,
          hospitalId: 2,
          dispatchTime: '2024-08-11T09:26:45',
          reporterName: '이목격',
          reporterPhone: '010-2345-6789',
          patientInfo: {
            name: '박환자',
            ageRange: 'ADULT',
            sex: 0,
            estimatedAge: 28
          },
          location: '고아읍사무소 사거리',
          landmark: 'GS25 편의점 앞',
          accessInfo: '차량 통행 주의',
          createdAt: '2024-08-11T09:25:15',
          updatedAt: '2024-08-11T09:26:45'
        },
        {
          id: 3,
          reportNumber: 'R2024081103',
          address: '경북 구미시 옥계동 456-7',
          latitude: 36.135234,
          longitude: 128.354567,
          condition: '복통, 고열',
          content: '70대 여성, 심한 복통과 고열 증상. 가족이 신고.',
          callTime: '2024-08-11T09:30:22',
          isDispatched: false,
          priority: 'normal',
          reporterName: '최가족',
          reporterPhone: '010-3456-7890',
          patientInfo: {
            name: '이환자',
            ageRange: 'ELDERLY',
            sex: 0,
            estimatedAge: 72
          },
          location: '옥계동 아파트 103동 502호',
          landmark: '옥계초등학교 건너편',
          accessInfo: '아파트 출입코드: 1234*',
          createdAt: '2024-08-11T09:30:22',
          updatedAt: '2024-08-11T09:30:22'
        },
        {
          id: 4,
          reportNumber: 'R2024081104',
          address: '경북 구미시 인동가산로 789',
          latitude: 36.125234,
          longitude: 128.384567,
          condition: '넘어짐, 머리외상',
          content: '80대 남성, 계단에서 넘어져 머리를 다침. 출혈 있음.',
          callTime: '2024-08-11T09:45:11',
          isDispatched: false,
          priority: 'urgent',
          reporterName: '정이웃',
          reporterPhone: '010-4567-8901',
          patientInfo: {
            name: '윤환자',
            ageRange: 'ELDERLY',
            sex: 1,
            estimatedAge: 83
          },
          location: '인동시장 2층 계단',
          landmark: '인동파출소 옆',
          accessInfo: '시장 뒷문으로 접근',
          createdAt: '2024-08-11T09:45:11',
          updatedAt: '2024-08-11T09:45:11'
        },
        {
          id: 5,
          reportNumber: 'R2024081105',
          address: '경북 구미시 형곡동 321-8',
          latitude: 36.115234,
          longitude: 128.394567,
          condition: '흉통, 호흡곤란',
          content: '50대 남성, 갑작스런 가슴 통증과 호흡곤란. 심장 질환 의심.',
          callTime: '2024-08-11T10:05:33',
          isDispatched: false,
          priority: 'emergency',
          reporterName: '장신고',
          reporterPhone: '010-5678-9012',
          patientInfo: {
            name: '한환자',
            ageRange: 'ADULT',
            sex: 1,
            estimatedAge: 54
          },
          location: '형곡동 주민센터',
          landmark: '농협 맞은편',
          accessInfo: '주차장 이용 가능',
          createdAt: '2024-08-11T10:05:33',
          updatedAt: '2024-08-11T10:05:33'
        }
      ];
      
      console.log('[Reports] 더미 신고 데이터 초기화:', mockReports.length, '건');
      setReports(mockReports);
    };

    initializeMockReports();
  }, []);

  // === 통계 계산 ===
  useEffect(() => {
    const calculateStats = () => {
      const today = new Date().toDateString();
      const todayReports = reports.filter(report => 
        new Date(report.callTime).toDateString() === today
      );

      const stats = {
        total: reports.length,
        pending: reports.filter(r => !r.isDispatched).length,
        dispatched: reports.filter(r => r.isDispatched).length,
        urgent: reports.filter(r => r.priority === 'urgent').length,
        emergency: reports.filter(r => r.priority === 'emergency').length,
        todayCount: todayReports.length,
        avgResponseTime: 0 // 실제로는 출동시간 - 신고시간 계산
      };

      // 평균 응답시간 계산 (출동 완료된 것들만)
      const dispatchedReports = reports.filter(r => r.isDispatched && r.dispatchTime);
      if (dispatchedReports.length > 0) {
        const totalResponseTime = dispatchedReports.reduce((sum, report) => {
          const callTime = new Date(report.callTime).getTime();
          const dispatchTime = new Date(report.dispatchTime).getTime();
          return sum + (dispatchTime - callTime);
        }, 0);
        stats.avgResponseTime = Math.round(totalResponseTime / dispatchedReports.length / 60000); // 분 단위
      }

      setReportStats(stats);
    };

    calculateStats();
  }, [reports]);

  // === 필터링 및 정렬 ===
  const processedReports = useMemo(() => {
    let filtered = [...reports];

    // 상태별 필터링
    switch (filterStatus) {
      case 'pending':
        filtered = filtered.filter(r => !r.isDispatched);
        break;
      case 'dispatched':
        filtered = filtered.filter(r => r.isDispatched);
        break;
      case 'urgent':
        filtered = filtered.filter(r => r.priority === 'urgent' || r.priority === 'emergency');
        break;
      case 'emergency':
        filtered = filtered.filter(r => r.priority === 'emergency');
        break;
      case 'all':
      default:
        // 전체 표시
        break;
    }

    // 검색어 필터링
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(report => 
        report.reportNumber.toLowerCase().includes(term) ||
        report.address.toLowerCase().includes(term) ||
        report.condition.toLowerCase().includes(term) ||
        report.content.toLowerCase().includes(term) ||
        report.patientInfo?.name?.toLowerCase().includes(term) ||
        report.reporterName.toLowerCase().includes(term)
      );
    }

    // 정렬
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'callTime':
          aValue = new Date(a.callTime).getTime();
          bValue = new Date(b.callTime).getTime();
          break;
        case 'priority':
          const priorityOrder = { emergency: 3, urgent: 2, normal: 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case 'status':
          aValue = a.isDispatched ? 1 : 0;
          bValue = b.isDispatched ? 1 : 0;
          break;
        case 'address':
          aValue = a.address.toLowerCase();
          bValue = b.address.toLowerCase();
          break;
        default:
          aValue = new Date(a.callTime).getTime();
          bValue = new Date(b.callTime).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [reports, filterStatus, searchTerm, sortBy, sortOrder]);

  // 필터링된 결과 업데이트
  useEffect(() => {
    setFilteredReports(processedReports);
  }, [processedReports]);

  // === 자동 새로고침 ===
  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(() => {
      refreshTodayStats();
      setLastRefreshTime(new Date());
    }, 30000); // 30초마다

    return () => clearInterval(interval);
  }, [isAutoRefresh, refreshTodayStats]);

  // === 에러 처리 ===
  useEffect(() => {
    if (storeError || localError) {
      const timer = setTimeout(() => {
        clearError();
        setLocalError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [storeError, localError, clearError]);

  // === 이벤트 핸들러들 ===

  // 신고 추가
  const handleNewReport = useCallback((newReportData) => {
    const newReport = {
      id: Date.now(),
      reportNumber: `R${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(reports.length + 1).padStart(2, '0')}`,
      ...newReportData,
      callTime: new Date().toISOString(),
      isDispatched: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setReports(prev => [newReport, ...prev]);
    setShowNewReportModal(false);
    
    console.log('[Reports] 새 신고 접수:', newReport);
    
    // 성공 알림
    alert(`✅ 신고 접수 완료!\n신고번호: ${newReport.reportNumber}\n주소: ${newReport.address}`);
  }, [reports.length]);

  // 신고 수정
  const handleEditReport = useCallback((updatedReport) => {
    setReports(prev => prev.map(report => 
      report.id === updatedReport.id 
        ? { ...report, ...updatedReport, updatedAt: new Date().toISOString() }
        : report
    ));
    setShowEditReportModal(false);
    setSelectedReport(null);
    
    console.log('[Reports] 신고 수정:', updatedReport);
    alert('✅ 신고 정보가 수정되었습니다.');
  }, []);

  // 배차 신청 처리
  const handleDispatchRequest = useCallback((reportData) => {
    // 배차 가능 여부 확인
    const availableAmbulances = ambulances.filter(ambulance => {
      const status = ambulance.currentStatus || ambulance.status;
      const isAvailable = status === 'WAIT' || status === 'standby';
      const isNotDispatching = !isAmbulanceDispatching(ambulance.id);
      return isAvailable && isNotDispatching;
    });

    if (availableAmbulances.length === 0) {
      alert('❌ 현재 대기 중인 구급차가 없습니다.\n잠시 후 다시 시도해주세요.');
      return;
    }

    if (!reportData.latitude || !reportData.longitude) {
      alert('❌ 출동 위치 좌표가 없습니다.\n신고 정보를 다시 확인해주세요.');
      return;
    }

    setSelectedReport(reportData);
    setShowDispatchModal(true);
  }, [ambulances, isAmbulanceDispatching]);

  // 배차 신청 성공 콜백
  const handleDispatchSuccess = useCallback(({ ambulanceId, hospitalId, reportId }) => {
    console.log('[Reports] 배차 신청 성공:', { ambulanceId, hospitalId, reportId });
    
    // 신고 상태 업데이트
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { 
            ...report, 
            isDispatched: true, 
            ambulanceId: ambulanceId,
            hospitalId: hospitalId,
            dispatchTime: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } 
        : report
    ));
    
    // 모달 닫기
    setShowDispatchModal(false);
    setSelectedReport(null);
    
    // 성공 알림
    const report = reports.find(r => r.id === reportId);
    if (report) {
      alert(`✅ 배차 완료!\n신고번호: ${report.reportNumber}\n구급차: ${ambulanceId}번\n주소: ${report.address}`);
    }
  }, [reports]);

  // 개별 선택 토글
  const toggleReportSelection = useCallback((reportId) => {
    setSelectedReportIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  }, []);

  // 전체 선택 토글
  const toggleAllSelection = useCallback(() => {
    if (selectedReportIds.size === filteredReports.length) {
      setSelectedReportIds(new Set());
    } else {
      setSelectedReportIds(new Set(filteredReports.map(r => r.id)));
    }
  }, [selectedReportIds.size, filteredReports]);

  // 일괄 배차 신청
  const handleBulkDispatch = useCallback(() => {
    const selectedReports = filteredReports.filter(r => 
      selectedReportIds.has(r.id) && !r.isDispatched
    );

    if (selectedReports.length === 0) {
      alert('배차 가능한 신고를 선택해주세요.');
      return;
    }

    if (confirm(`선택된 ${selectedReports.length}건의 신고에 대해 일괄 배차를 진행하시겠습니까?`)) {
      // 일괄 배차 로직 (추후 구현)
      console.log('[Reports] 일괄 배차 신청:', selectedReports);
      alert('일괄 배차 기능은 추후 구현 예정입니다.');
    }
  }, [filteredReports, selectedReportIds]);

  // 신고 삭제
  const handleDeleteReport = useCallback((reportId) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    if (report.isDispatched) {
      alert('❌ 이미 출동 지시된 신고는 삭제할 수 없습니다.');
      return;
    }

    if (confirm(`정말로 신고를 삭제하시겠습니까?\n신고번호: ${report.reportNumber}\n주소: ${report.address}`)) {
      setReports(prev => prev.filter(r => r.id !== reportId));
      console.log('[Reports] 신고 삭제:', reportId);
      alert('✅ 신고가 삭제되었습니다.');
    }
  }, [reports]);

  // 정렬 변경
  const handleSortChange = useCallback((newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  }, [sortBy]);

  // 배차 가능 여부 확인
  const canDispatch = useCallback((report) => {
    if (report.isDispatched) return false;
    if (isAmbulanceDispatching(report.ambulanceId)) return false;
    
    const availableAmbulances = ambulances.filter(ambulance => {
      const status = ambulance.currentStatus || ambulance.status;
      const isAvailable = status === 'WAIT' || status === 'standby';
      const isNotDispatching = !isAmbulanceDispatching(ambulance.id);
      return isAvailable && isNotDispatching;
    });
    
    return availableAmbulances.length > 0;
  }, [ambulances, isAmbulanceDispatching]);

  // 배차 진행률 표시
  const getDispatchProgressInfo = useCallback((ambulanceId) => {
    if (!ambulanceId) return null;
    return getDispatchProgress(ambulanceId);
  }, [getDispatchProgress]);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* === 헤더 === */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <span className="mr-3">📞</span>
              신고 접수 관리
            </h1>
            <p className="text-gray-600 mt-1">119 신고 접수 및 배차 관리 시스템</p>
            {lastRefreshTime && (
              <p className="text-sm text-gray-500 mt-1">
                마지막 업데이트: {lastRefreshTime.toLocaleTimeString()}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {/* 자동 새로고침 토글 */}
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isAutoRefresh 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isAutoRefresh ? '⏸️ 자동새로고침' : '▶️ 자동새로고침'}
            </button>
            
            {/* 필터 토글 */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔍 필터
            </button>
            
            {/* 일괄 작업 토글 */}
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                showBulkActions 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              📋 일괄작업
            </button>
            
            {/* 신고 접수 버튼 */}
            <button
              onClick={() => setShowNewReportModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <span className="mr-2">📞</span>
              신고 접수
            </button>
          </div>
        </div>
      </div>

      {/* === 에러 표시 === */}
      {(storeError || localError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <div>
                <p className="text-red-800 font-medium">오류가 발생했습니다</p>
                <p className="text-red-700 text-sm mt-1">
                  {storeError || localError}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                clearError();
                setLocalError(null);
              }}
              className="text-red-600 hover:text-red-800 text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* === 통계 카드 === */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-xl">📞</span>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">전체 신고</p>
              <p className="text-lg font-bold text-gray-900">{reportStats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-xl">⏳</span>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">대기 중</p>
              <p className="text-lg font-bold text-yellow-600">{reportStats.pending}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-xl">🚑</span>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">출동 완료</p>
              <p className="text-lg font-bold text-green-600">{reportStats.dispatched}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-xl">⚡</span>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">긴급</p>
              <p className="text-lg font-bold text-orange-600">{reportStats.urgent}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-xl">🚨</span>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">최긴급</p>
              <p className="text-lg font-bold text-red-600">{reportStats.emergency}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-xl">📅</span>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">오늘 신고</p>
              <p className="text-lg font-bold text-purple-600">{reportStats.todayCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <span className="text-xl">⏱️</span>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">평균응답</p>
              <p className="text-lg font-bold text-indigo-600">{reportStats.avgResponseTime}분</p>
            </div>
          </div>
        </div>
      </div>

      {/* === 필터 및 검색 === */}
      <div className="bg-white rounded-lg shadow border mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* 상태 필터 */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: '전체', count: reportStats.total, color: 'gray' },
                { key: 'pending', label: '대기중', count: reportStats.pending, color: 'yellow' },
                { key: 'dispatched', label: '출동완료', count: reportStats.dispatched, color: 'green' },
                { key: 'urgent', label: '긴급', count: reportStats.urgent, color: 'orange' },
                { key: 'emergency', label: '최긴급', count: reportStats.emergency, color: 'red' }
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setFilterStatus(filter.key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                    filterStatus === filter.key
                      ? `bg-${filter.color}-600 text-white`
                      : `bg-white text-${filter.color}-700 border border-${filter.color}-200 hover:bg-${filter.color}-50`
                  }`}
                >
                  {filter.label}
                  <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                    filterStatus === filter.key 
                      ? 'bg-white bg-opacity-20' 
                      : 'bg-gray-100'
                  }`}>
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
            
            {/* 검색 및 정렬 */}
            <div className="flex items-center space-x-3">
              {/* 검색 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="신고번호, 주소, 환자명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
              
              {/* 정렬 */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="callTime-desc">최신 신고순</option>
                <option value="callTime-asc">오래된 신고순</option>
                <option value="priority-desc">높은 우선순위순</option>
                <option value="priority-asc">낮은 우선순위순</option>
                <option value="status-asc">대기 우선</option>
                <option value="status-desc">출동완료 우선</option>
                <option value="address-asc">주소 가나다순</option>
                <option value="address-desc">주소 역순</option>
              </select>
            </div>
          </div>
        </div>

        {/* 확장 필터 */}
        {showFilters && (
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">신고 시간</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">전체</option>
                  <option value="today">오늘</option>
                  <option value="yesterday">어제</option>
                  <option value="week">이번 주</option>
                  <option value="month">이번 달</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">환자 연령대</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">전체</option>
                  <option value="NEWBORN">신생아</option>
                  <option value="INFANT">유아</option>
                  <option value="KIDS">아동</option>
                  <option value="TEENAGER">청소년</option>
                  <option value="ADULT">성인</option>
                  <option value="ELDERLY">노인</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">지역</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">전체</option>
                  <option value="원평동">원평동</option>
                  <option value="고아읍">고아읍</option>
                  <option value="옥계동">옥계동</option>
                  <option value="인동">인동</option>
                  <option value="형곡동">형곡동</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 일괄 작업 */}
        {showBulkActions && (
          <div className="p-4 bg-blue-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedReportIds.size === filteredReports.length && filteredReports.length > 0}
                    onChange={toggleAllSelection}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">
                    전체 선택 ({selectedReportIds.size}/{filteredReports.length})
                  </span>
                </label>
              </div>
              
              {selectedReportIds.size > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBulkDispatch}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    일괄 배차 ({selectedReportIds.size}건)
                  </button>
                  <button
                    onClick={() => setSelectedReportIds(new Set())}
                    className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    선택 해제
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* === 신고 목록 테이블 === */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {showBulkActions && (
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedReportIds.size === filteredReports.length && filteredReports.length > 0}
                      onChange={toggleAllSelection}
                    />
                  </th>
                )}
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSortChange('callTime')}
                >
                  <div className="flex items-center">
                    신고정보
                    {sortBy === 'callTime' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  환자정보
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSortChange('address')}
                >
                  <div className="flex items-center">
                    위치정보
                    {sortBy === 'address' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  환자상태
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSortChange('priority')}
                >
                  <div className="flex items-center">
                    우선순위
                    {sortBy === 'priority' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSortChange('status')}
                >
                  <div className="flex items-center">
                    상태
                    {sortBy === 'status' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map(report => {
                const dispatchProgress = getDispatchProgressInfo(report.ambulanceId);
                const isDispatching = isAmbulanceDispatching(report.ambulanceId);
                
                return (
                  <tr 
                    key={report.id} 
                    className={`hover:bg-gray-50 ${
                      report.priority === 'emergency' ? 'bg-red-25 border-l-4 border-red-500' :
                      report.priority === 'urgent' ? 'bg-orange-25 border-l-4 border-orange-500' :
                      ''
                    }`}
                  >
                    {showBulkActions && (
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedReportIds.has(report.id)}
                          onChange={() => toggleReportSelection(report.id)}
                          disabled={report.isDispatched}
                        />
                      </td>
                    )}
                    
                    {/* 신고정보 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {report.reportNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(report.callTime).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          신고자: {report.reporterName}
                        </div>
                      </div>
                    </td>
                    
                    {/* 환자정보 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {report.patientInfo?.name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {report.patientInfo?.ageRange} / {report.patientInfo?.sex === 1 ? '남성' : '여성'}
                          {report.patientInfo?.estimatedAge && ` (${report.patientInfo.estimatedAge}세)`}
                        </div>
                      </div>
                    </td>
                    
                    {/* 위치정보 */}
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm text-gray-900 truncate" title={report.address}>
                          📍 {report.address}
                        </div>
                        {report.location && (
                          <div className="text-xs text-gray-500 truncate" title={report.location}>
                            📍 {report.location}
                          </div>
                        )}
                        {report.landmark && (
                          <div className="text-xs text-gray-500 truncate" title={report.landmark}>
                            🏢 {report.landmark}
                          </div>
                        )}
                        {report.accessInfo && (
                          <div className="text-xs text-blue-600 truncate" title={report.accessInfo}>
                            ℹ️ {report.accessInfo}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* 환자상태 */}
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm text-gray-900 truncate" title={report.condition}>
                          {report.condition}
                        </div>
                        {report.content && (
                          <div className="text-xs text-gray-500 truncate mt-1" title={report.content}>
                            {report.content}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* 우선순위 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(report.priority)}`}>
                        {getPriorityText(report.priority)}
                      </span>
                    </td>
                    
                    {/* 상태 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          report.isDispatched 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.isDispatched ? '출동 완료' : '대기 중'}
                        </span>
                        
                        {/* 배차 진행률 */}
                        {isDispatching && dispatchProgress && (
                          <div className="text-xs">
                            <div className="text-blue-600 font-medium">
                              배차 진행 중... {dispatchProgress.progress}%
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                              <div 
                                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                style={{ width: `${dispatchProgress.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        {/* 구급차 정보 */}
                        {report.isDispatched && report.ambulanceId && (
                          <div className="text-xs text-gray-600">
                            구급차: {report.ambulanceId}번
                          </div>
                        )}
                        
                        {/* 출동 시간 */}
                        {report.dispatchTime && (
                          <div className="text-xs text-gray-500">
                            출동: {new Date(report.dispatchTime).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* 작업 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <div className="flex flex-wrap gap-1">
                        {/* 상세보기 */}
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setShowPatientModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 border border-blue-300 rounded hover:bg-blue-50"
                        >
                          상세
                        </button>
                        
                        {/* 수정 (출동 전에만) */}
                        {!report.isDispatched && (
                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              setShowEditReportModal(true);
                            }}
                            className="text-green-600 hover:text-green-900 text-xs px-2 py-1 border border-green-300 rounded hover:bg-green-50"
                          >
                            수정
                          </button>
                        )}
                        
                        {/* 배차 */}
                        {!report.isDispatched && !isDispatching && (
                          <button
                            onClick={() => handleDispatchRequest(report)}
                            disabled={!canDispatch(report)}
                            className={`text-xs px-2 py-1 border rounded ${
                              canDispatch(report)
                                ? 'text-red-600 hover:text-red-900 border-red-300 hover:bg-red-50'
                                : 'text-gray-400 border-gray-300 cursor-not-allowed'
                            }`}
                          >
                            배차
                          </button>
                        )}
                        
                        {/* 배차 중 */}
                        {isDispatching && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 border border-blue-300 rounded">
                            배차중
                          </span>
                        )}
                        
                        {/* 삭제 (출동 전에만) */}
                        {!report.isDispatched && !isDispatching && (
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="text-red-600 hover:text-red-900 text-xs px-2 py-1 border border-red-300 rounded hover:bg-red-50"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 데이터 없음 */}
        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <span className="text-4xl block mb-4">📝</span>
              {searchTerm ? (
                <div>
                  <div className="font-medium">검색 결과가 없습니다</div>
                  <div className="text-sm mt-1">'{searchTerm}'에 대한 신고를 찾을 수 없습니다.</div>
                </div>
              ) : filterStatus === 'all' ? (
                '신고가 없습니다.'
              ) : filterStatus === 'pending' ? (
                '대기 중인 신고가 없습니다.'
              ) : filterStatus === 'dispatched' ? (
                '출동 완료된 신고가 없습니다.'
              ) : filterStatus === 'urgent' ? (
                '긴급 신고가 없습니다.'
              ) : filterStatus === 'emergency' ? (
                '최긴급 신고가 없습니다.'
              ) : (
                '해당 조건의 신고가 없습니다.'
              )}
            </div>
          </div>
        )}
      </div>

      {/* === 페이지네이션 (추후 구현) === */}
      {filteredReports.length > 0 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            총 {reports.length}건 중 {filteredReports.length}건 표시
          </div>
          
          {/* 간단한 통계 요약 */}
          <div className="text-sm text-gray-600 space-x-4">
            <span>대기: {reportStats.pending}건</span>
            <span>출동완료: {reportStats.dispatched}건</span>
            <span>평균응답: {reportStats.avgResponseTime}분</span>
          </div>
        </div>
      )}

      {/* === 모달들 === */}
      <NewReportModal
        isOpen={showNewReportModal}
        onClose={() => setShowNewReportModal(false)}
        onSubmit={handleNewReport}
      />

      <EditReportModal
        isOpen={showEditReportModal}
        onClose={() => {
          setShowEditReportModal(false);
          setSelectedReport(null);
        }}
        reportData={selectedReport}
        onSubmit={handleEditReport}
      />

      <PatientModal
        isOpen={showPatientModal}
        onClose={() => {
          setShowPatientModal(false);
          setSelectedReport(null);
        }}
        patientData={selectedReport}
      />

      <DispatchFormModal
        isOpen={showDispatchModal}
        onClose={() => {
          setShowDispatchModal(false);
          setSelectedReport(null);
        }}
        report={selectedReport}
        onDispatchSuccess={handleDispatchSuccess}
      />
    </div>
  );
};

export default FireStationReports;
