import React, { useEffect, useRef } from 'react';

const getHospitalMarkerImage = () => {
  if (!window.kakao || !window.kakao.maps) return null;
  
  const imgSrc = 'https://maps.google.com/mapfiles/kml/shapes/hospitals.png';
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
          <div style="padding:10px; min-width:180px; font-family:Arial, sans-serif;">
            <div style="font-weight:bold; color:#e74c3c; margin-bottom:8px; font-size:14px;">
              🏥 ${hospital.name || `병원 ${hospital.id}`}
            </div>
            <div style="font-size:12px; line-height:1.4;">
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
          infoWindow.current.setContent(hospitalContent);
          infoWindow.current.open(map, marker);
        });

        hospitalMarkers.current.push(marker);
      });
    }
  }, [map, hospitals, infoWindow]);

  return null;
};

export default HospitalMarkers;
