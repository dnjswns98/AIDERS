import React, { useState, useEffect, useRef } from 'react';

const AddressSearchModal = ({ isOpen, onClose, onAddressSelect }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const geocoder = useRef(null);

  const [selectedAddress, setSelectedAddress] = useState({ roadAddress: '', jibunAddress: '' });

  useEffect(() => {
    if (isOpen && mapContainer.current) {
      const checkKakaoMap = () => {
        if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
          if (!map.current) {
            const options = {
              center: new window.kakao.maps.LatLng(36.145, 128.39), // 구미시청 근처
              level: 3,
            };
            map.current = new window.kakao.maps.Map(mapContainer.current, options);
            geocoder.current = new window.kakao.maps.services.Geocoder();
            marker.current = new window.kakao.maps.Marker({
              position: map.current.getCenter(),
              map: map.current
            });

            window.kakao.maps.event.addListener(map.current, 'click', (mouseEvent) => {
              const latlng = mouseEvent.latLng;
              marker.current.setPosition(latlng);
              searchAddrFromCoords(latlng, (result, status) => {
                if (status === window.kakao.maps.services.Status.OK) {
                  const roadAddr = result[0].road_address ? result[0].road_address.address_name : '';
                  const jibunAddr = result[0].address.address_name;
                  setSelectedAddress({ roadAddress: roadAddr, jibunAddress: jibunAddr });
                }
              });
            });
          }
        } else {
          setTimeout(checkKakaoMap, 100);
        }
      };
      checkKakaoMap();
    }
  }, [isOpen]);

  const searchAddrFromCoords = (coords, callback) => {
    geocoder.current.coord2Address(coords.getLng(), coords.getLat(), callback);
  };

  const handleConfirm = () => {
    onAddressSelect(selectedAddress.roadAddress || selectedAddress.jibunAddress);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <h2 className="text-xl font-bold mb-4">지도에서 위치 선택</h2>
        <div ref={mapContainer} style={{ width: '100%', height: '400px' }} className="mb-4 rounded-md" />
        <div className="bg-gray-100 p-3 rounded-md text-sm mb-4">
          <p><strong>도로명:</strong> {selectedAddress.roadAddress || '주소를 찾을 수 없습니다.'}</p>
          <p><strong>지번:</strong> {selectedAddress.jibunAddress || '주소를 찾을 수 없습니다.'}</p>
        </div>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md">취소</button>
          <button onClick={handleConfirm} disabled={!selectedAddress.roadAddress && !selectedAddress.jibunAddress} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md disabled:bg-gray-400">주소 선택</button>
        </div>
      </div>
    </div>
  );
};

export default AddressSearchModal;
