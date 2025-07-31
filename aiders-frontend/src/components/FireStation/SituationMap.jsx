import { useEffect, useRef } from 'react';
import { getStatusText, getStatusColor } from '../../utils/statusUtils';

const statusColors = {
  'dispatched': 'blue',
  'transporting': 'green',
  'completed': 'purple',
  'returning': 'orange',
  'standby': 'gray',
  'maintenance': 'gray',
};

const getAmbulanceMarkerImage = (status, isSelected) => {
  if (!window.kakao || !window.kakao.maps) return null;
  const color = statusColors[status] || 'gray';
  const size = isSelected ? 48 : 32;
  const imgSrc = `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`;
  
  return new window.kakao.maps.MarkerImage(
    imgSrc,
    new window.kakao.maps.Size(size, size),
    {
      offset: new window.kakao.maps.Point(size / 2, size),
    }
  );
};

const getHospitalMarkerImage = () => {
  if (!window.kakao || !window.kakao.maps) return null;
  // 구글 지도 기본 병원 아이콘으로 변경하여 명확성 증대
  const imgSrc = 'https://maps.google.com/mapfiles/kml/shapes/hospitals.png'; 
  const imgSize = new window.kakao.maps.Size(32, 32);
  return new window.kakao.maps.MarkerImage(imgSrc, imgSize);
};

export default function SituationMap({ ambulances, hospitals, selectedAmbulance, center }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const ambulanceMarkers = useRef([]);
  const hospitalMarkers = useRef([]);
  const infoWindow = useRef(null);

  // 지도 초기화 및 업데이트 로직
  useEffect(() => {
    console.log("SituationMap useEffect triggered");
    if (!mapContainer.current) {
      console.log("mapContainer.current is null");
      return;
    }

    console.log("mapContainer.current exists:", mapContainer.current);
    console.log("mapContainer offsetWidth:", mapContainer.current.offsetWidth);
    console.log("mapContainer offsetHeight:", mapContainer.current.offsetHeight);

    const checkKakaoMap = () => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
        console.log("Kakao Map API loaded");
        // 지도 생성
        if (!map.current) {
          console.log("Creating new map instance");
          const options = {
            center: new window.kakao.maps.LatLng(center.lat, center.lng),
            level: 5,
          };
          map.current = new window.kakao.maps.Map(mapContainer.current, options);
          infoWindow.current = new window.kakao.maps.InfoWindow({ zIndex: 1 });
          // 지도가 로드된 후 relayout 호출
          window.kakao.maps.event.addListener(map.current, 'idle', () => {
            console.log("Map idle event fired, calling relayout");
            if (map.current) {
              map.current.relayout();
            }
          });
        }

        // 지도의 크기가 0이 아닌지 확인 후 relayout 호출 (초기 렌더링 시)
        if (mapContainer.current.offsetWidth > 0 && mapContainer.current.offsetHeight > 0 && !map.current.relayoutCalled) {
          console.log("Calling initial relayout");
          map.current.relayout();
          map.current.relayoutCalled = true; // 중복 호출 방지 플래그
        }

        // 지도 중심 이동
        const moveLatLon = new window.kakao.maps.LatLng(center.lat, center.lng);
        map.current.panTo(moveLatLon);

        // 구급차 마커 업데이트
        ambulanceMarkers.current.forEach(marker => marker.setMap(null));
        ambulanceMarkers.current = [];

        ambulances.forEach(ambulance => {
          // 대기 중이거나 정비 중이거나 이송 완료된 구급차는 마커를 표시하지 않음
          if (ambulance.status === 'standby' || ambulance.status === 'maintenance' || ambulance.status === 'completed') {
            return;
          }

          const isSelected = selectedAmbulance?.id === ambulance.id;
          const position = new window.kakao.maps.LatLng(ambulance.latitude, ambulance.longitude);
          const markerImage = getAmbulanceMarkerImage(ambulance.status, isSelected);
          
          if (!markerImage) return;

          const marker = new window.kakao.maps.Marker({
            position: position,
            image: markerImage,
            zIndex: isSelected ? 10 : 1,
          });

          marker.setMap(map.current);

          const content = `
            <div style="padding:5px; font-size:12px;">
              <strong>${ambulance.number}</strong><br/>
              상태: <span style="color: ${getStatusColor(ambulance.status)};">${getStatusText(ambulance.status)}</span><br/>
              환자: ${ambulance.patientInfo?.name || '없음'}<br/>
              주요증상: ${ambulance.condition || '없음'}<br/>
              신고시각: ${ambulance.callTime || '없음'}
            </div>
          `;

          window.kakao.maps.event.addListener(marker, 'click', () => {
            infoWindow.current.setContent(content);
            infoWindow.current.open(map.current, marker);
          });

          ambulanceMarkers.current.push(marker);
        });

        // 병원 마커 업데이트 (최초 1회만)
        if (hospitals && hospitalMarkers.current.length === 0) {
          hospitals.forEach(hospital => {
            const position = new window.kakao.maps.LatLng(hospital.latitude, hospital.longitude);
            const markerImage = getHospitalMarkerImage();

            if (!markerImage) return;

            const marker = new window.kakao.maps.Marker({
              position: position,
              image: markerImage,
            });

            marker.setMap(map.current);

            const content = `
              <div style="padding:5px; font-size:12px;">
                <strong>${hospital.name}</strong><br/>
                총 병상: ${hospital.beds}
              </div>
            `;

            window.kakao.maps.event.addListener(marker, 'click', () => {
              infoWindow.current.setContent(content);
              infoWindow.current.open(map.current, marker);
            });

            hospitalMarkers.current.push(marker);
          });
        }

      } else {
        console.log("Kakao Map API not yet loaded, retrying...");
        setTimeout(checkKakaoMap, 100);
      }
    };

    checkKakaoMap();

  }, [ambulances, hospitals, selectedAmbulance, center]);

  return (
    <div id="situation-map" ref={mapContainer} style={{ width: '100%', height: '100%' }} />
  );
}
