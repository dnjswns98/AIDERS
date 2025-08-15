import React, { useEffect, useRef } from 'react';

const getHospitalMarkerImage = () => {
  if (!window.kakao || !window.kakao.maps) return null;
  
  // 안정적인 카카오 기본 마커 이미지로 변경
  const imgSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png';
  const imgSize = new window.kakao.maps.Size(32, 32);
  
  return new window.kakao.maps.MarkerImage(imgSrc, imgSize);
};

const HospitalMarkers = ({ map, hospitals, infoWindow }) => {
  const hospitalMarkers = useRef([]);

  useEffect(() => {
    if (!map) return;

    hospitalMarkers.current.forEach(marker => marker.setMap(null));
    hospitalMarkers.current = [];

    if (Array.isArray(hospitals)) {
      hospitals.forEach((hospital, index) => {
        if (!hospital) {
          return;
        }

        if (typeof hospital.latitude !== 'number' || typeof hospital.longitude !== 'number') {
          return;
        }

        const position = new window.kakao.maps.LatLng(hospital.latitude, hospital.longitude);
        const markerImage = getHospitalMarkerImage();

        if (!markerImage) {
          return;
        }

        const marker = new window.kakao.maps.Marker({
          position: position,
          image: markerImage,
        });

        marker.setMap(map);

        const hospitalContent = `
          <div style="padding:10px; min-width:180px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="font-weight:bold; color:#e74c3c; font-size:14px; white-space: normal; overflow-wrap: break-word;">
                🏥 ${hospital.name || `병원 ${hospital.id}`}
              </div>
              <button onclick="infoWindow.current.close()" style="border: none; background: none; font-size: 16px; cursor: pointer; color: #999;">×</button>
            </div>
            <div style="font-size:12px; line-height:1.4; white-space: normal; overflow-wrap: break-word;">
              ${hospital.address ? `
                <div style="margin-bottom:4px;">
                  <span style="color:#666;">주소:</span> ${hospital.address}
                </div>
              ` : ''}
              ${hospital.phone ? `
                <div style="margin-bottom:4px;">
                  <span style="color:#666;">전화:</span> ${hospital.phone}
                </div>
              ` : ''}
              <div style="margin-bottom:4px;">
                <span style="color:#666;">위치:</span>
                ${hospital.latitude.toFixed(4)}, ${hospital.longitude.toFixed(4)}
              </div>
              ${hospital.availableBeds ? `
                <div style="margin-bottom:4px;">
                  <span style="color:#666;">병상:</span>
                  <span style="font-weight:bold; color:#27ae60;">${hospital.availableBeds}개 이용 가능</span>
                </div>
              ` : ''}
            </div>
          </div>
        `;

        window.kakao.maps.event.addListener(marker, 'click', () => {
          infoWindow.current.setContent(`<div class="info-window-content">${hospitalContent}</div>`);
          infoWindow.current.open(map, marker);
        });

        hospitalMarkers.current.push(marker);
      });
    }
  }, [map, hospitals, infoWindow]);

  return null;
};

export default HospitalMarkers;