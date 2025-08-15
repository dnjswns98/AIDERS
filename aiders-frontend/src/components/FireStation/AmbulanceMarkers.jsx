import React, { useEffect, useRef } from 'react';
import { getStatusText, getStatusColor } from '../../utils/statusUtils';

const AmbulanceMarkers = ({ map, ambulances, selectedAmbulance, firestationInfo, infoWindow }) => {
  const ambulanceMarkers = useRef([]);

  useEffect(() => {
    if (!map) return;

    // 기존 마커 제거
    ambulanceMarkers.current.forEach(marker => marker.setMap(null));
    ambulanceMarkers.current = [];

    if (Array.isArray(ambulances)) {
      ambulances.forEach((ambulance) => {
        if (!ambulance || typeof ambulance.latitude !== 'number' || typeof ambulance.longitude !== 'number') {
          // 유효한 위치 정보가 없는 구급차는 건너뜜
          return;
        }

        const isSelected = selectedAmbulance?.id === ambulance.id;
        const position = new window.kakao.maps.LatLng(ambulance.latitude, ambulance.longitude);
        const markerImage = getAmbulanceMarkerImage(ambulance.status, isSelected);

        if (!markerImage) {
          return;
        }

        const marker = new window.kakao.maps.Marker({
          position: position,
          image: markerImage,
          zIndex: isSelected ? 10 : 1,
        });

        marker.setMap(map);

        const stationId = ambulance.firestation_id || ambulance.firestationId || ambulance.stationId || 'N/A';
        
        // 🔽 수정된 부분: 정보창 내용을 DOM 요소로 직접 생성하고 이벤트 리스너를 추가합니다.
        const content = document.createElement('div');
        content.style.cssText = 'padding:10px; min-width:200px;';
        content.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-weight:bold; color:#2c5aa0; font-size:14px; white-space: normal; overflow-wrap: break-word;">
              🚑 ${ambulance.ambulanceNumber || `구급차 ${ambulance.id}`}
            </div>
            <button class="close-btn" style="border: none; background: none; font-size: 16px; cursor: pointer; color: #999;">×</button>
          </div>
          <div style="font-size:12px; line-height:1.4; white-space: normal; overflow-wrap: break-word;">
            <div style="margin-bottom:4px;">
              <span style="color:#666;">상태:</span> 
              <span style="font-weight:bold; color:${getStatusColor(ambulance.status)};">
                ${getStatusText(ambulance.status)}
              </span>
            </div>
            <div style="margin-bottom:4px;">
              <span style="color:#666;">소속:</span> 
              <span style="font-weight:bold;">
                ${firestationInfo?.name || '소방서'} (ID: ${stationId})
              </span>
            </div>
            <div style="margin-bottom:4px;">
              <span style="color:#666;">위치:</span> 
              ${ambulance.latitude.toFixed(4)}, ${ambulance.longitude.toFixed(4)}
            </div>
            ${ambulance.currentPatient ? `
              <div style="margin-bottom:4px;">
                <span style="color:#666;">환자:</span> ${ambulance.currentPatient}
              </div>
            ` : ''}
            ${ambulance.destination ? `
              <div style="margin-bottom:4px;">
                <span style="color:#666;">목적지:</span> ${ambulance.destination}
              </div>
            ` : ''}
            ${ambulance.lastUpdated ? `
              <div style="color:#999; font-size:10px; margin-top:8px; border-top:1px solid #eee; padding-top:4px;">
                마지막 업데이트: ${new Date(ambulance.lastUpdated).toLocaleString('ko-KR')}
              </div>
            ` : ''}
          </div>
        `;
        
        // 닫기 버튼에 이벤트 리스너를 추가합니다.
        const closeBtn = content.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.onclick = () => infoWindow.current.close();
        }

        window.kakao.maps.event.addListener(marker, 'click', () => {
          infoWindow.current.setContent(content);
          infoWindow.current.open(map, marker);
        });

        ambulanceMarkers.current.push(marker);
      });
    }
  }, [map, ambulances, selectedAmbulance, firestationInfo, infoWindow]);

  // 이 함수는 이전과 동일하며, 편의상 여기에 포함했습니다.
  const getAmbulanceMarkerImage = (status, isSelected) => {
    if (!window.kakao || !window.kakao.maps) return null;
    
    const normalizedStatus = status?.toUpperCase() || 'UNKNOWN';
    let color = 'gray';
    
    switch (normalizedStatus) {
      case 'WAIT':
        color = 'red';
        break;
      case 'DISPATCH':
        color = 'blue';
        break;
      case 'TRANSFER':
        color = 'green';
        break;
      default:
        color = 'yellow';
    }
    
    const size = isSelected ? 48 : 32;
    const imgSrc = `https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_${color}.png`;
    
    return new window.kakao.maps.MarkerImage(
      imgSrc,
      new window.kakao.maps.Size(size, size),
      {
        offset: new window.kakao.maps.Point(size / 2, size),
      }
    );
  };

  return null;
};

export default AmbulanceMarkers;