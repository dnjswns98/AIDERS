import { create } from 'zustand';

// 초기 알림 데이터
const initialNotifications = [
  {
    id: 1,
    type: 'emergency',
    title: '긴급 환자 접수',
    message: '서울응급01호 - 안영희(65세) 호흡곤란 환자 5분 후 도착 예정',
    time: '13:20',
    timestamp: new Date('2024-01-15T13:20:00'),
    isRead: false,
    priority: 'high' // high, medium, low
  },
  {
    id: 2,
    type: 'bed',
    title: '병상 부족 알림',
    message: 'ICU 일반병실 만실 - 추가 환자 수용 불가',
    time: '13:15',
    timestamp: new Date('2024-01-15T13:15:00'),
    isRead: false,
    priority: 'high'
  },
  {
    id: 3,
    type: 'emergency',
    title: '응급환자 치료 완료',
    message: '안영희(65세) 환자 응급처치 완료 - 중환자실 이송',
    time: '13:10',
    timestamp: new Date('2024-01-15T13:10:00'),
    isRead: false,
    priority: 'medium'
  },
  {
    id: 4,
    type: 'system',
    title: '시스템 점검 안내',
    message: '오늘 24:00~02:00 시스템 정기점검 예정',
    time: '12:30',
    timestamp: new Date('2024-01-15T12:30:00'),
    isRead: true,
    priority: 'low'
  },
  {
    id: 5,
    type: 'emergency',
    title: '구급차 배차 완료',
    message: '서울응급02호가 교통사고 현장으로 출동했습니다',
    time: '12:15',
    timestamp: new Date('2024-01-15T12:15:00'),
    isRead: true,
    priority: 'medium'
  },
  {
    id: 6,
    type: 'bed',
    title: '병상 상태 변경',
    message: '외과 중환자실 1병상 사용 가능으로 변경됨',
    time: '11:45',
    timestamp: new Date('2024-01-15T11:45:00'),
    isRead: true,
    priority: 'low'
  },
  {
    id: 7,
    type: 'emergency',
    title: '대량 환자 발생 알림',
    message: '다중추돌사고 발생 - 5명의 환자 동시 이송 예정',
    time: '11:30',
    timestamp: new Date('2024-01-15T11:30:00'),
    isRead: true,
    priority: 'high'
  },
  {
    id: 8,
    type: 'system',
    title: '병원 정보 시스템 업데이트',
    message: 'HIS 시스템 ver 2.1.5 업데이트 완료',
    time: '10:00',
    timestamp: new Date('2024-01-15T10:00:00'),
    isRead: true,
    priority: 'low'
  }
];

const useNotificationStore = create((set, get) => ({
  // 알림 목록
  notifications: initialNotifications,

  // 새 알림 추가
  addNotification: (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now(),
      timestamp: new Date(),
      time: new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isRead: false
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications]
    }));
  },

  // 알림 읽음 처리
  markAsRead: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    }));
  },

  // 모든 알림 읽음 처리
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(notification => ({
        ...notification,
        isRead: true
      }))
    }));
  },

  // 알림 삭제
  deleteNotification: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.filter(notification => 
        notification.id !== notificationId
      )
    }));
  },

  // 읽지 않은 알림 개수
  getUnreadCount: () => {
    return get().notifications.filter(notification => !notification.isRead).length;
  },

  // 타입별 알림 개수
  getCountByType: (type) => {
    return get().notifications.filter(notification => notification.type === type).length;
  },

  // 필터링된 알림 목록 가져오기
  getFilteredNotifications: (filter) => {
    const notifications = get().notifications;
    
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'emergency':
        return notifications.filter(n => n.type === 'emergency');
      case 'bed':
        return notifications.filter(n => n.type === 'bed');
      case 'system':
        return notifications.filter(n => n.type === 'system');
      case 'high':
        return notifications.filter(n => n.priority === 'high');
      case 'medium':
        return notifications.filter(n => n.priority === 'medium');
      case 'low':
        return notifications.filter(n => n.priority === 'low');
      default:
        return notifications;
    }
  },

  // 알림 통계
  getStatistics: () => {
    const notifications = get().notifications;
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      emergency: notifications.filter(n => n.type === 'emergency').length,
      bed: notifications.filter(n => n.type === 'bed').length,
      system: notifications.filter(n => n.type === 'system').length,
      high: notifications.filter(n => n.priority === 'high').length,
      medium: notifications.filter(n => n.priority === 'medium').length,
      low: notifications.filter(n => n.priority === 'low').length
    };
  },

  // 최근 알림 가져오기 (최대 n개)
  getRecentNotifications: (limit = 5) => {
    return get().notifications
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  },

  // 긴급 알림만 가져오기
  getEmergencyNotifications: () => {
    return get().notifications.filter(n => 
      n.type === 'emergency' && n.priority === 'high' && !n.isRead
    );
  }
}));

export default useNotificationStore;