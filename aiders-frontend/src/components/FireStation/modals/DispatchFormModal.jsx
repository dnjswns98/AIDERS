import React, { useState, useEffect, useMemo, useCallback } from "react";
import useFireStationStore from "../../../store/useFireStationStore";
import AddressSearchModal from "./AddressSearchModal";
import { getStatusText } from "../../../utils/statusUtils";

const DispatchFormModal = ({ isOpen, onClose, onDispatchSuccess, firestationInfo }) => {
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
        ambulanceId: "",
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

    const availableAmbulances = useMemo(() => {
        if (!ambulances) return [];
        return ambulances.filter(ambulance => {
            const status = (ambulance.status || '').toUpperCase();
            const isAvailable = status === 'WAIT';
            const isNotDispatching = !isAmbulanceDispatching(ambulance.id);
            return isAvailable && isNotDispatching;
        });
    }, [ambulances, isAmbulanceDispatching]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (validationErrors[name]) setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }, [validationErrors]);
    
    const handleLocationChange = useCallback((e) => {
        const { name, value } = e.target;
        setLocationData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleAddressSelect = useCallback((selectedAddress) => {
        setLocationData({
            address: selectedAddress.roadAddress || selectedAddress.jibunAddress,
            latitude: selectedAddress.latitude,
            longitude: selectedAddress.longitude,
            landmark: ""
        });
        setMapModalOpen(false);
        if (validationErrors.address) setValidationErrors(prev => ({ ...prev, address: "" }));
    }, [validationErrors]);

    const validateForm = useCallback(() => {
        const errors = {};
        if (!formData.ambulanceId) errors.ambulanceId = "출동할 구급차를 선택해주세요.";
        if (!locationData.address) errors.address = "지도에서 출동 위치를 지정해주세요.";
        // ✅ '환자 상태' 필수 조건 제거
        // if (!formData.condition) errors.condition = "환자의 상태를 입력해주세요.";
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData, locationData]);
    
    const handleClose = useCallback(() => {
        setFormData({ ambulanceId: "", priority: "normal", condition: "", notes: "" });
        setLocationData({ address: "", latitude: null, longitude: null, landmark: "" });
        setValidationErrors({});
        setLocalError(null);
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
            const selectedAmbulance = availableAmbulances.find(a => a.id === parseInt(formData.ambulanceId));
            const dispatchData = {
                ambulanceIds: [parseInt(formData.ambulanceId, 10)],
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                address: locationData.address,
                // ✅ '환자 상태'가 비어있으면 기본값("상태 미입력")으로 전송
                condition: formData.condition || "상태 미입력",
            };
            await dispatchAmbulance(dispatchData);
            await fetchFirestationAmbulances(firestationInfo.id);
            if (onDispatchSuccess) onDispatchSuccess();
            alert(`✅ 배차 완료!\n구급차: ${selectedAmbulance?.userKey}\n출동지: ${locationData.address}`);
            handleClose();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || '배차 신청 중 오류가 발생했습니다.';
            setLocalError(errorMessage);
            alert(`❌ 배차 실패\n${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    }, [
        validateForm, formData, locationData, availableAmbulances,
        dispatchAmbulance, onDispatchSuccess, handleClose, fetchFirestationAmbulances, firestationInfo
    ]);

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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">출동 위치 *</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={locationData.address}
                                    readOnly
                                    placeholder="지도에서 위치를 선택해주세요."
                                    className={`flex-1 p-3 border rounded-lg bg-gray-50 ${validationErrors.address ? 'border-red-300' : 'border-gray-300'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setMapModalOpen(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    🗺️ 지도에서 선택
                                </button>
                            </div>
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
                            <label htmlFor="ambulanceId" className="block text-sm font-medium text-gray-700 mb-2">출동 구급차 *</label>
                            <select
                                id="ambulanceId"
                                name="ambulanceId"
                                value={formData.ambulanceId}
                                onChange={handleInputChange}
                                className={`w-full p-3 border rounded-lg ${validationErrors.ambulanceId ? 'border-red-300' : 'border-gray-300'}`}
                            >
                                <option value="">대기중인 구급차를 선택하세요</option>
                                {availableAmbulances.map(ambulance => (
                                    <option key={ambulance.id} value={ambulance.id}>
                                        {ambulance.userKey} ({getStatusText(ambulance.status)})
                                    </option>
                                ))}
                            </select>
                            {availableAmbulances.length === 0 && (
                                <p className="mt-1 text-sm text-yellow-600">사용 가능한 구급차가 없습니다.</p>
                            )}
                            {validationErrors.ambulanceId && <p className="mt-1 text-sm text-red-600">{validationErrors.ambulanceId}</p>}
                        </div>
                        <div>
                            {/* ✅ 라벨에서 '*' 제거 */}
                            <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">환자 상태</label>
                            <textarea
                                id="condition"
                                name="condition"
                                value={formData.condition}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="환자의 주요 증상, 상태 등을 입력하세요. (예: 60대 남성, 흉통 호소)"
                                className={`w-full p-3 border rounded-lg ${validationErrors.condition ? 'border-red-300' : 'border-gray-300'}`}
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
                            disabled={isSubmitting || storeLoading || availableAmbulances.length === 0}
                        >
                            배차 신청
                        </button>
                    </div>
                </div>
            </div>
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