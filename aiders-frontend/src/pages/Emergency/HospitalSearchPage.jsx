
import React, { useState, useEffect } from 'react';
import HospitalCard from '../../components/Emergency/HospitalCard';
import TransportControls from '../../components/Emergency/TransportControls';
import CallDialog from '../../components/Emergency/CallDialog';
import KakaoMapModal from '../../components/Emergency/modals/KakaoMapModal';

function HospitalSearchPage() {
  const [isSearching, setIsSearching] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [transportStatus, setTransportStatus] = useState('ready');
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [selectedCallHospital, setSelectedCallHospital] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapHospitalAddress, setMapHospitalAddress] = useState(null);

  const hospitals = [
    {
      id: 1,
      name: '서울대학교병원',
      distance: '2.3km',
      eta: '8분',
      availableBeds: 3,
      specialists: '응급의학과 전문의 2명',
      phone: '02-2072-3441',
      address: '서울특별시 종로구 대학로 101',
      status: 'available'
    },
    {
      id: 2,
      name: '삼성서울병원',
      distance: '3.7km',
      eta: '12분',
      availableBeds: 5,
      specialists: '응급의학과 전문의 3명',
      phone: '02-3410-2114',
      address: '서울특별시 강남구 일원로 81',
      status: 'available'
    },
    {
      id: 3,
      name: '아산병원',
      distance: '4.2km',
      eta: '15분',
      availableBeds: 2,
      specialists: '응급의학과 전문의 2명',
      phone: '02-3010-3114',
      address: '서울특별시 송파구 올림픽로43길 88',
      status: 'limited'
    },
    {
      id: 4,
      name: '열린 이비인후과',
      distance: '0.5km',
      eta: '2분',
      availableBeds: 1,
      specialists: '이비인후과 전문의 1명',
      phone: '054-474-7582',
      address: '경북 구미시 인동가산로 17 2층',
      status: 'available'
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSearching(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleHospitalSelect = (id) => {
    setSelectedHospital(id);
  };

  const handleTransportStart = () => {
    setTransportStatus('started');
  };

  const handleTransportComplete = () => {
    setTransportStatus('completed');
  };

  const handleCallHospital = (hospital) => {
    setSelectedCallHospital(hospital);
    setShowCallDialog(true);
  };

  const handleShowMap = (address) => {
    setMapHospitalAddress(address);
    setShowMapModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 상태 표시 영역 */}
      <div className="bg-red-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="font-semibold">KTAS 3 - 응급 환자</span>
          </div>
          <div className="text-sm">
            {isSearching ? '병원 검색 중...' : '매칭 완료'}
          </div>
        </div>
      </div>

      {/* 매칭 상태 표시 */}
      {isSearching ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-600">최적의 병원을 찾고 있습니다...</p>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* 매칭된 병원 리스트 */}
          <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-bold mb-4 text-gray-800">
                매칭된 병원 ({hospitals.length}개)
              </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hospitals.map((hospital) => (
                <HospitalCard
                  key={hospital.id}
                  hospital={hospital}
                  isSelected={selectedHospital === hospital.id}
                  onSelect={handleHospitalSelect}
                  onCallClick={handleCallHospital}
                  onShowMap={handleShowMap}
                />
              ))}
            </div>
          </div>

          {/* 이송 관련 기능 */}
          {selectedHospital && (
            <TransportControls
              transportStatus={transportStatus}
              onTransportStart={handleTransportStart}
              onTransportComplete={handleTransportComplete}
            />
          )}

          {/* 하단 정보 영역 */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
              <span>
                마지막 업데이트: {new Date().toLocaleTimeString('ko-KR')}
              </span>
              <button className="text-blue-600 hover:text-blue-800 cursor-pointer">
                <i className="fas fa-sync-alt mr-1"></i>새로고침
              </button>
            </div>
            <div className="border-t pt-3">
              <h4 className="font-semibold text-gray-800 mb-2">긴급 연락처</h4>
              <div className="flex space-x-4 text-sm">
                <button className="text-red-600 hover:text-red-800 cursor-pointer">
                  <i className="fas fa-phone mr-1"></i>119 (응급실)
                </button>
                <button className="text-blue-600 hover:text-blue-800 cursor-pointer">
                  <i className="fas fa-headset mr-1"></i>상황실
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCallDialog && (
        <CallDialog
          hospital={selectedCallHospital}
          onClose={() => setShowCallDialog(false)}
        />
      )}

      {showMapModal && mapHospitalAddress && (
        <KakaoMapModal
          hospitalAddress={mapHospitalAddress}
          onClose={() => setShowMapModal(false)}
        />
      )}
    </div>
  );
}

export default HospitalSearchPage;
