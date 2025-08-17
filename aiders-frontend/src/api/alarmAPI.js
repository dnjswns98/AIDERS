// src/api/alarmAPI.js - 병원 알람 관련 API 모듈

import { apiClient, withErrorHandling, logger } from './api.js';

// ======================================================================
// 🔔 알람 조회 API
// ======================================================================

/**
 * 병원의 전체 알림 목록 조회
 */
export const getAllAlarms = withErrorHandling(async (hospitalId) => {
  if (!hospitalId) {
    throw new Error('Hospital ID가 필요합니다.');
  }
  
  logger.info(`전체 알림 조회: 병원 ${hospitalId}`);
  const response = await apiClient.get(`/api/v1/alarm/${hospitalId}`);
  return response.data || [];
}, 'getAllAlarms');

/**
 * 매칭 알림 목록 조회
 */
export const getMatchingAlarms = withErrorHandling(async (hospitalId) => {
  if (!hospitalId) {
    throw new Error('Hospital ID가 필요합니다.');
  }
  
  logger.info(`매칭 알림 조회: 병원 ${hospitalId}`);
  const response = await apiClient.get(`/api/v1/alarm/matching/${hospitalId}`);
  return response.data || [];
}, 'getMatchingAlarms');

/**
 * 통화 요청 알림 목록 조회
 */
export const getRequestAlarms = withErrorHandling(async (hospitalId) => {
  if (!hospitalId) {
    throw new Error('Hospital ID가 필요합니다.');
  }
  
  logger.info(`통화 요청 알림 조회: 병원 ${hospitalId}`);
  const response = await apiClient.get(`/api/v1/alarm/request/${hospitalId}`);
  return response.data || [];
}, 'getRequestAlarms');

/**
 * 수정 알림 목록 조회
 */
export const getEditAlarms = withErrorHandling(async (hospitalId) => {
  if (!hospitalId) {
    throw new Error('Hospital ID가 필요합니다.');
  }
  
  logger.info(`수정 알림 조회: 병원 ${hospitalId}`);
  const response = await apiClient.get(`/api/v1/alarm/edit/${hospitalId}`);
  return response.data || [];
}, 'getEditAlarms');

// ======================================================================
// 🗑️ 알람 삭제 API
// ======================================================================

/**
 * 매칭 알림 삭제
 */
export const deleteMatchingAlarm = withErrorHandling(async (alarmId) => {
  if (!alarmId) {
    throw new Error('알림 ID가 필요합니다.');
  }
  
  logger.info(`매칭 알림 삭제: ${alarmId}`);
  const response = await apiClient.delete(`/api/v1/alarm/matching/${alarmId}`);
  return { success: true, message: '매칭 알림이 삭제되었습니다.' };
}, 'deleteMatchingAlarm');

/**
 * 통화 요청 알림 삭제
 */
export const deleteRequestAlarm = withErrorHandling(async (alarmId) => {
  if (!alarmId) {
    throw new Error('알림 ID가 필요합니다.');
  }
  
  logger.info(`통화 요청 알림 삭제: ${alarmId}`);
  const response = await apiClient.delete(`/api/v1/alarm/request/${alarmId}`);
  return { success: true, message: '통화 요청 알림이 삭제되었습니다.' };
}, 'deleteRequestAlarm');

/**
 * 수정 알림 삭제
 */
export const deleteEditAlarm = withErrorHandling(async (alarmId) => {
  if (!alarmId) {
    throw new Error('알림 ID가 필요합니다.');
  }
  
  logger.info(`수정 알림 삭제: ${alarmId}`);
  const response = await apiClient.delete(`/api/v1/alarm/edit/${alarmId}`);
  return { success: true, message: '수정 알림이 삭제되었습니다.' };
}, 'deleteEditAlarm');

/**
 * 병원의 모든 알림 삭제
 */
export const deleteAllAlarms = withErrorHandling(async (hospitalId) => {
  if (!hospitalId) {
    throw new Error('Hospital ID가 필요합니다.');
  }
  
  logger.info(`모든 알림 삭제: 병원 ${hospitalId}`);
  const response = await apiClient.delete(`/api/v1/alarm/hospital/${hospitalId}`);
  return { success: true, message: '모든 알림이 삭제되었습니다.' };
}, 'deleteAllAlarms');

/**
 * 특정 구급차의 모든 알림 삭제
 */
export const deleteAlarmsByAmbulanceKey = withErrorHandling(async (ambulanceKey) => {
  if (!ambulanceKey) {
    throw new Error('구급차 키가 필요합니다.');
  }
  
  console.log(`🗑️ [API] 구급차 알림 삭제 시작: ${ambulanceKey}`);
  logger.info(`구급차 알림 삭제: ${ambulanceKey}`);
  const response = await apiClient.delete(`/api/v1/alarm/all/${ambulanceKey}`);
  console.log(`✅ [API] 구급차 알림 삭제 API 응답:`, response.data);
  return { success: true, message: '구급차 알림이 삭제되었습니다.' };
}, 'deleteAlarmsByAmbulanceKey');

// ======================================================================
// 📤 알람 전송 API
// ======================================================================

/**
 * 병원에 알람 전송 (WebSocket 방식)
 * 실제로는 STOMP 클라이언트가 필요하므로, 테스트용으로는 REST API 사용
 */
export const sendAlarmToHospital = withErrorHandling(async (alarmData) => {
  if (!alarmData || !alarmData.type || !alarmData.ambulanceKey) {
    throw new Error('알람 타입과 구급차 키가 필요합니다.');
  }

  const { type, ambulanceKey, patientName, ktas, message } = alarmData;
  
  // 알람 타입 검증
  const validTypes = ['MATCHING', 'REQUEST', 'EDIT'];
  if (!validTypes.includes(type)) {
    throw new Error(`유효하지 않은 알람 타입입니다: ${type}`);
  }
  
  const body = {
    type: type, // "MATCHING" | "REQUEST" | "EDIT"
    ambulanceKey: ambulanceKey, // "998버4200"
    patientName: patientName || null,
    ktas: ktas ? parseInt(ktas) : null,
    message: message || null,
    createdAt: new Date().toISOString()
  };

  logger.info(`병원 알람 전송: ${type}`, { ambulanceKey, patientName });
  
  // 테스트용으로는 REST API 사용 (실제로는 WebSocket /pub/alarm/send 사용해야 함)
  const response = await apiClient.post('/pub/alarm/send', body);
  return response.data;
}, 'sendAlarmToHospital');

// ======================================================================
// 📤 내보내기
// ======================================================================

export default {
  // 조회
  getAllAlarms,
  getMatchingAlarms,
  getRequestAlarms,
  getEditAlarms,
  
  // 삭제
  deleteMatchingAlarm,
  deleteRequestAlarm,
  deleteEditAlarm,
  deleteAllAlarms,
  deleteAlarmsByAmbulanceKey,
  
  // 전송
  sendAlarmToHospital
};