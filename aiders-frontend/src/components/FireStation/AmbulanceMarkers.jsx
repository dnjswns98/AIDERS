import React, { useEffect, useRef } from 'react';
import { getStatusText, getStatusColor } from '../../utils/statusUtils';

const AmbulanceMarkers = ({ map, ambulances = [], selectedAmbulance, firestationInfo, infoWindow }) => {
  const markersRef = useRef([]);

  // InfoWindow 준비 + 전역 close 함수 준비
  useEffect(() => {
    if (!map) return;
    if (!infoWindow.current) {
      infoWindow.current = new window.kakao.maps.InfoWindow({ zIndex: 100 });
    }
    // 지도를 클릭하면 인포윈도우 닫기
    const closer = window.kakao.maps.event.addListener(map, 'click', () => {
      infoWindow.current.close();
    });

    // 전역 닫기 함수(인포윈도우 내부 닫기 버튼에서 호출)
    window.__closeAmbulanceInfoWindow = () => infoWindow.current?.close();

    return () => {
      window.kakao.maps.event.removeListener(closer);
      window.__closeAmbulanceInfoWindow = undefined;
    };
  }, [map, infoWindow]);

  useEffect(() => {
    if (!map) return;

    // 기존 마커 제거
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    ambulances.forEach(raw => {
      const amb = normalizeAmbulance(raw);
      if (!isFinite(amb.lat) || !isFinite(amb.lng)) return;

      const isSelected = isSameId(selectedAmbulance, amb.id);
      const position = new window.kakao.maps.LatLng(amb.lat, amb.lng);
      const image = getAmbulanceMarkerImage(amb.status, isSelected);
      const marker = new window.kakao.maps.Marker({
        position,
        ...(image ? { image } : {}),
        zIndex: isSelected ? 10 : 1,
      });
      marker.setMap(map);

      // InfoWindow HTML (문자열)
      const html = `
        <div style="padding:15px; min-width:300px; max-width:360px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <div style="font-weight:bold; color:#2c5aa0; font-size:14px;">
              🚑 ${amb.number ?? `구급차 ${amb.number ?? ''}`}
            </div>
            <button onclick="window.__closeAmbulanceInfoWindow()" style="border:none; background:none; font-size:16px; cursor:pointer; color:#999;">×</button>
          </div>
          <div style="font-size:12px; line-height:1.5;">
            <div style="margin-bottom:4px;">
              <span style="color:#666;">상태:</span>
              <span style="font-weight:bold; color:${getStatusColor(amb.status)};">
                ${getStatusText(amb.status)}
              </span>
            </div>
            <div style="margin-bottom:4px;">
              <span style="color:#666;">소속:</span>
              <span style="font-weight:bold;">${firestationInfo?.name ?? '소방서'}</span>
            </div>
            <div style="margin-bottom:4px;">
              <span style="color:#666;">위치:</span> ${amb.lat.toFixed(4)}, ${amb.lng.toFixed(4)}
            </div>
            ${amb.patient ? `<div style="margin-bottom:4px;"><span style="color:#666;">환자:</span> ${amb.patient}</div>` : ''}
            ${amb.dest ? `<div style="margin-bottom:4px;"><span style="color:#666;">목적지:</span> ${amb.dest}</div>` : ''}
          </div>
        </div>
      `;

      window.kakao.maps.event.addListener(marker, 'click', () => {
        infoWindow.current.setContent(html);
        infoWindow.current.open(map, marker);
      });

      markersRef.current.push(marker);
    });
  }, [map, ambulances, selectedAmbulance, firestationInfo, infoWindow]);

  return null;
};

export default AmbulanceMarkers;

/* ----------------- helpers ------------------ */

// status → 색상 → SVG data URL
function getAmbulanceMarkerImage(status, isSelected) {
  if (!window.kakao?.maps) return null;

  const normalized = (status ?? 'UNKNOWN').toString().toUpperCase();
  let color = '#FDB813'; // default yellow
  if (normalized === 'WAIT') color = '#E53935';
  else if (normalized === 'DISPATCH') color = '#1E88E5';
  else if (normalized === 'TRANSFER') color = '#43A047';

  const size = isSelected ? 50 : 40;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="12" fill="${color}" />
      <circle cx="32" cy="32" r="18" fill="none" stroke="${color}" stroke-opacity="0.35" stroke-width="6"/>
    </svg>`;
  const url = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);

  return new window.kakao.maps.MarkerImage(
    url,
    new window.kakao.maps.Size(size, size),
    { offset: new window.kakao.maps.Point(size / 2, size / 2) } // 중심이 클릭 지점
  );
}

// 다양한 키를 하나로 정규화
function normalizeAmbulance(a = {}) {
  const id = a.id ?? a.ambulanceId ?? a.ambulance_id ?? a.no ?? null;
  const number = a.ambulanceNumber ?? a.number ?? a.name ?? null;
  const lat = toNum(a.latitude ?? a.lat);
  const lng = toNum(a.longitude ?? a.lng);
  return {
    id,
    number,
    lat,
    lng,
    status: a.status,
    patient: a.currentPatient ?? a.patient ?? null,
    dest: a.destination ?? a.dest ?? null,
    updated: a.lastUpdated ?? a.updatedAt ?? null,
  };
}
function toNum(v) { const n = Number(v); return Number.isFinite(n) ? n : NaN; }
function isSameId(sel, id) {
  if (!sel) return false;
  const selId = sel.id ?? sel.ambulanceId ?? sel.ambulance_id ?? null;
  return selId != null && id != null && String(selId) === String(id);
}
