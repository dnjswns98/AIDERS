import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import useFireStationStore from "../../../store/useFireStationStore";
import AddressSearchModal from "./AddressSearchModal";
import { getStatusText } from "../../../utils/statusUtils";

const DispatchFormModal = ({ isOpen, onClose, onDispatchSuccess, firestationInfo, initialAmbulanceId }) => {
  const {
    ambulances,
    dispatchAmbulance,
    isAmbulanceDispatching,
    fetchFirestationAmbulances,
    error: storeError,
    clearError,
    isLoading: storeLoading,
  } = useFireStationStore();

  const [formData, setFormData] = useState({
    ambulanceIds: [],
    priority: "normal",
    condition: "",
    notes: "",
  });

  const [locationData, setLocationData] = useState({
    address: "",
    latitude: null,
    longitude: null,
    landmark: ""
  });

  const [isMapModalOpen, setMapModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [localError, setLocalError] = useState(null);

  // 🔎 주소/키워드 검색 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimerRef = useRef(null);
  const searchInputRef = useRef(null);

  // 초기 선택 구급차 적용
  useEffect(() => {
    if (isOpen && initialAmbulanceId) {
      setFormData(prev => ({ ...prev, ambulanceIds: [initialAmbulanceId] }));
    }
  }, [isOpen, initialAmbulanceId]);

  const availableAmbulances = useMemo(() => {
    if (!ambulances) return [];
    return ambulances.filter(ambulance => {
      const status = (ambulance.status || "").toUpperCase();
      return status === "WAIT" || status === "STANDBY";
    });
  }, [ambulances]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) setValidationErrors(prev => ({ ...prev, [name]: "" }));
  }, [validationErrors]);

  const handleCheckboxChange = useCallback((ambulanceId) => {
    setFormData(prev => {
      const currentIds = prev.ambulanceIds;
      return currentIds.includes(ambulanceId)
        ? { ...prev, ambulanceIds: currentIds.filter(id => id !== ambulanceId) }
        : { ...prev, ambulanceIds: [...currentIds, ambulanceId] };
    });
    if (validationErrors.ambulanceIds) setValidationErrors(prev => ({ ...prev, ambulanceIds: "" }));
  }, [validationErrors]);

  const handleLocationChange = useCallback((e) => {
    const { name, value } = e.target;
    setLocationData(prev => ({ ...prev, [name]: value }));
  }, []);

  // 지도 모달에서 주소 선택 시 (landmark는 유지)
  const handleAddressSelect = useCallback((selectedAddress) => {
    setLocationData(prev => ({
      ...prev,
      address: selectedAddress.roadAddress || selectedAddress.jibunAddress,
      latitude: selectedAddress.latitude,
      longitude: selectedAddress.longitude,
    }));
    setMapModalOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    if (searchInputRef.current) searchInputRef.current.blur();
    if (validationErrors.address) setValidationErrors(prev => ({ ...prev, address: "" }));
  }, [validationErrors]);

  const validateForm = useCallback(() => {
    const errors = {};
    if (formData.ambulanceIds.length === 0) errors.ambulanceIds = "출동할 구급차를 한 대 이상 선택해주세요.";
    if (!locationData.address) errors.address = "지도에서 선택하거나, 검색 결과에서 주소를 선택해주세요.";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, locationData]);

  const handleClose = useCallback(() => {
    setFormData({ ambulanceIds: [], priority: "normal", condition: "", notes: "" });
    setLocationData({ address: "", latitude: null, longitude: null, landmark: "" });
    setValidationErrors({});
    setLocalError(null);
    setSearchQuery("");
    setSearchResults([]);
    clearError();
    onClose();
  }, [onClose, clearError]);

  const handleDispatchSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setLocalError("필수 입력 항목을 모두 채워주세요.");
      return;
    }
    setIsSubmitting(true);
    setLocalError(null);
    try {
      const dispatchData = {
        ambulanceIds: formData.ambulanceIds,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        address: locationData.address,
        condition: formData.condition || "상태 미입력",
      };

      await dispatchAmbulance(dispatchData);
      if (onDispatchSuccess) onDispatchSuccess();
      alert(`✅ 배차 완료!\n구급차 ID: ${formData.ambulanceIds.join(", ")}\n출동지: ${locationData.address}`);
      handleClose();
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || "배차 신청 중 오류가 발생했습니다.";
      setLocalError(errorMessage);
      alert(`❌ 배차 실패\n${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, formData, locationData, dispatchAmbulance, onDispatchSuccess, handleClose]);

  // =========================
  // 🔎 Kakao Places 키워드/주소 검색
  // =========================
  const runKeywordSearch = useCallback((query) => {
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      console.warn("Kakao Maps SDK가 로드되지 않았습니다. SDK 스크립트를 확인하세요.");
      return;
    }
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const places = new window.kakao.maps.services.Places();
    places.keywordSearch(
      query,
      (data, status) => {
        setIsSearching(false);
        if (status === window.kakao.maps.services.Status.OK && Array.isArray(data)) {
          setSearchResults(data.slice(0, 8));
        } else {
          setSearchResults([]);
        }
      },
      { page: 1, size: 8 }
    );
  }, []);

  // 입력 디바운스
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!isOpen) return;
    searchTimerRef.current = setTimeout(() => {
      runKeywordSearch(searchQuery);
    }, 350);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery, runKeywordSearch, isOpen]);

  // ✅ 검색 결과 선택 시: 주소/좌표 지정 + landmark 자동 채우기 + 검색창/목록/포커스 정리
  const handlePickResult = useCallback((place) => {
    const roadAddr = place.road_address_name;
    const jibunAddr = place.address_name;
    const addr = roadAddr || jibunAddr || place.place_name;
    const lat = parseFloat(place.y);
    const lng = parseFloat(place.x);
    const landmarkName = place.place_name || (searchQuery?.trim() || ""); // 🔹 선택 항목 이름 우선

    setLocationData({
      address: addr,
      latitude: lat,
      longitude: lng,
      landmark: landmarkName, // 🔹 자동 설정
    });

    setSearchQuery("");
    setSearchResults([]);
    if (searchInputRef.current) searchInputRef.current.blur();

    if (validationErrors.address) {
      setValidationErrors(prev => ({ ...prev, address: "" }));
    }
  }, [validationErrors, searchQuery]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[95vh] flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">신규 배차 신청</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-2xl" disabled={isSubmitting}>×</button>
            </div>
          </div>

          {(storeError || localError) && (
            <div className="p-4 bg-red-50 border-b border-red-200 text-sm text-red-700">
              <strong>오류:</strong> {storeError || localError}
            </div>
          )}

          <form id="dispatch-form" onSubmit={handleDispatchSubmit} className="p-6 space-y-4 overflow-y-auto">
            {/* ===== 출동 위치 영역 (지도선택 + 텍스트 검색) ===== */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">출동 위치 *</label>

              {/* 텍스트 검색 박스 */}
              <div className="relative">
                <div className="flex items-center space-x-2">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="주소 또는 키워드(가게/식당 이름 등)로 검색"
                    className={`flex-1 p-3 border rounded-lg ${validationErrors.address ? "border-red-300" : "border-gray-300"}`}
                  />
                  <button
                    type="button"
                    onClick={() => runKeywordSearch(searchQuery)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    disabled={isSearching}
                  >
                    {isSearching ? "검색중..." : "검색"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapModalOpen(true)}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                  >
                    🗺️ 지도에서 선택
                  </button>
                </div>

                {/* 검색 결과 드롭다운 */}
                {searchResults.length > 0 && (
                  <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-72 overflow-auto">
                    {searchResults.map((place) => (
                      <button
                        key={`${place.id}-${place.place_name}`}
                        type="button"
                        onClick={() => handlePickResult(place)}
                        className="w-full text-left p-3 hover:bg-gray-50"
                      >
                        <div className="font-medium text-gray-900">{place.place_name}</div>
                        <div className="text-sm text-gray-700">{place.road_address_name || place.address_name}</div>
                        {place.phone && <div className="text-xs text-gray-500 mt-0.5">☎ {place.phone}</div>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 최종 선택된 주소 표시 (읽기전용) */}
              <input
                type="text"
                value={locationData.address}
                readOnly
                placeholder="지도에서 위치를 선택하거나, 검색 결과에서 선택하세요."
                className={`mt-2 w-full p-3 border rounded-lg bg-gray-50 ${validationErrors.address ? "border-red-300" : "border-gray-300"}`}
              />
              {validationErrors.address && <p className="mt-1 text-sm text-red-600">{validationErrors.address}</p>}
            </div>

            <div>
              <label htmlFor="landmark" className="block text-sm font-medium text-gray-700 mb-2">주변 주요 건물 (Landmark)</label>
              <input
                id="landmark"
                name="landmark"
                type="text"
                value={locationData.landmark}
                onChange={handleLocationChange}
                placeholder="예: 홈플러스 뒷쪽, 강남역 2번 출구 앞"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">출동 구급차 *</label>
              <div className={`p-3 border rounded-lg ${validationErrors.ambulanceIds ? "border-red-300" : "border-gray-300"}`}>
                {availableAmbulances.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {availableAmbulances.map(ambulance => (
                      <label key={ambulance.userKey} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.ambulanceIds.includes(ambulance.ambulanceId)}
                          onChange={() => handleCheckboxChange(ambulance.ambulanceId)}
                          className="form-checkbox h-5 w-5 text-blue-600"
                        />
                        <span className="text-sm text-gray-900">{ambulance.userKey} ({getStatusText(ambulance.status)})</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-yellow-600">사용 가능한 구급차가 없습니다.</p>
                )}
              </div>
              {validationErrors.ambulanceIds && <p className="mt-1 text-sm text-red-600">{validationErrors.ambulanceIds}</p>}
            </div>

            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">환자 상태</label>
              <textarea
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                rows={3}
                placeholder="환자의 주요 증상, 상태 등을 입력하세요. (예: 60대 남성, 흉통 호소)"
                className={`w-full p-3 border rounded-lg ${validationErrors.condition ? "border-red-300" : "border-gray-300"}`}
              />
              {validationErrors.condition && <p className="mt-1 text-sm text-red-600">{validationErrors.condition}</p>}
            </div>
          </form>

          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              form="dispatch-form"
              className="px-6 py-3 bg-red-600 text-white hover:bg-red-700 rounded-lg disabled:bg-red-300 flex items-center"
              disabled={isSubmitting || storeLoading || formData.ambulanceIds.length === 0}
            >
              배차 신청
            </button>
          </div>
        </div>
      </div>

      {/* 지도 선택 모달 */}
      <AddressSearchModal
        isOpen={isMapModalOpen}
        onClose={() => setMapModalOpen(false)}
        onAddressSelect={handleAddressSelect}
        center={firestationInfo ? { lat: firestationInfo.latitude, lng: firestationInfo.longitude } : null}
      />
    </>
  );
};

export default DispatchFormModal;
