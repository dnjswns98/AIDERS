import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

// 🔽 실제 DB에 있는 userKey(차량번호)와 일치하도록 수정하고, id를 고유 숫자로 유지합니다.
// LoginForm.jsx의 테스트 계정 정보를 참고했습니다.
const initialAmbulances = [
    { id: 1, number: "998버4200", status: "standby", location: "강남소방서", latitude: 37.5102929, longitude: 127.06684, condition: "정상", callTime: "-", patientInfo: { name: '' } },
    { id: 2, number: "998버4201", status: "standby", location: "강남소방서", latitude: 37.5102929, longitude: 127.06684, condition: "정상", callTime: "-", patientInfo: { name: '' } },
    { id: 3, number: "998버4202", status: "dispatched", location: "테헤란로 일대", latitude: 37.505, longitude: 127.055, condition: "출동 중", callTime: "10:30", patientInfo: { name: '' } },
    { id: 4, number: "998버4203", status: "transporting", location: "서울성모병원 이송중", latitude: 37.501, longitude: 127.005, condition: "환자 이송 중", callTime: "10:45", patientInfo: { name: '' } },
    { id: 5, number: "998버4204", status: "maintenance", location: "정비소", latitude: 37.515, longitude: 127.070, condition: "정비 중", callTime: "-", patientInfo: { name: '' } },
    { id: 6, number: "998버4205", status: "completed", location: "강남소방서", latitude: 37.5102929, longitude: 127.06684, condition: "임무 완료", callTime: "11:00", patientInfo: { name: '' } }
];
const initialReports = []; // 신고는 API를 통해 관리되므로 비워둡니다.

const initialNotifications = [
    { id: 1, type: "report", content: "새로운 신고가 접수되었습니다.", time: "13:45", status: "unread", link: "/reports" },
    { id: 2, type: "status", content: "구급차(998버4203) 이송 완료", time: "13:30", status: "unread", link: "/dispatch" },
    { id: 3, type: "dispatch", content: "배차 요청이 완료되었습니다.", time: "13:15", status: "unread", link: "/dispatch" },
];

export const AppProvider = ({ children }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [ambulances, setAmbulances] = useState(initialAmbulances);
    const [reports, setReports] = useState(initialReports);
    const [notifications, setNotifications] = useState(initialNotifications);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const refreshAmbulances = async () => {
        setIsRefreshing(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error("Failed to refresh ambulances:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const updateAmbulanceStatusInContext = (ambulanceId, newStatus) => {
        setAmbulances(prevAmbulances =>
            prevAmbulances.map(ambulance =>
                ambulance.id === ambulanceId
                    ? { ...ambulance, status: newStatus }
                    : ambulance
            )
        );
    };

    const value = {
        currentTime,
        ambulances,
        setAmbulances,
        reports,
        notifications,
        setNotifications,
        isRefreshing,
        refreshAmbulances,
        showToast,
        setShowToast,
        addReport: (report) => setReports(prev => [report, ...prev]),
        updateReport: (updatedReport) => setReports(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r)),
        updateAmbulanceStatusInContext
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};