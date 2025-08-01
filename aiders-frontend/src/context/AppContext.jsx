import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const initialAmbulances = [
    { id: 1, number: "998모1234", status: "standby", location: "구미소방서", latitude: 36.1058, longitude: 128.3385, condition: "정상", callTime: "-", patientInfo: { name: '' } },
    { id: 2, number: "998모5678", status: "dispatched", location: "진평동 일대", latitude: 36.1000, longitude: 128.3800, condition: "환자 이송 중", callTime: "14:30", patientInfo: { name: '' } },
    { id: 3, number: "998모9012", status: "transporting", location: "경대병원 이송중", latitude: 35.8660, longitude: 128.5930, condition: "환자 이송 중", callTime: "14:45", patientInfo: { name: '' } },
    { id: 4, number: "999모3456", status: "completed", location: "곽병원", latitude: 35.8680, longitude: 128.5880, condition: "임무 완료", callTime: "15:00", patientInfo: { name: '' } },
    { id: 5, number: "998모7890", status: "standby", location: "구미소방서", latitude: 36.1065, longitude: 128.3390, condition: "정상", callTime: "-", patientInfo: { name: '' } },
    { id: 6, number: "998모1122", status: "maintenance", location: "정비소", latitude: 36.1070, longitude: 128.3400, condition: "정비 중", callTime: "-", patientInfo: { name: '' } },
    { id: 7, number: "998모3344", status: "standby", location: "구미소방서", latitude: 36.1075, longitude: 128.3405, condition: "정상", callTime: "-", patientInfo: { name: '' } },
    { id: 8, number: "998모5566", status: "standby", location: "구미소방서", latitude: 36.1080, longitude: 128.3410, condition: "정상", callTime: "-", patientInfo: { name: '' } },
    { id: 9, number: "998모7788", status: "standby", location: "구미소방서", latitude: 36.1085, longitude: 128.3415, condition: "정상", callTime: "-", patientInfo: { name: '' } },
    { id: 10, number: "998모9900", status: "standby", location: "구미소방서", latitude: 36.1090, longitude: 128.3420, condition: "정상", callTime: "-", patientInfo: { name: '' } },
]
const initialReports = [
    {
        id: 1,
        reportNumber: "202507281208",
        date: "2025.07.28-13:16",
        location: "경상북도 구미시 진평동 빌라",
        latitude: 36.1078,
        longitude: 128.3855,
        content: "환자가 갑작스럽게 호흡 곤란, 가슴 답답함, 어지럼증 호소",
        priority: "emergency",
        isDispatched: false,
    },
    {
        id: 2,
        reportNumber: "202507281209",
        date: "2025.07.28-13:22",
        location: "경상북도 구미시 원평동 아파트",
        latitude: 36.1282,
        longitude: 128.3301,
        content: "고령 환자 낙상 사고, 의식 있음",
        priority: "urgent",
        isDispatched: false,
    },
    {
        id: 3,
        reportNumber: "202507281210",
        date: "2025.07.28-13:28",
        location: "경상북도 구미시 형곡동 상가",
        latitude: 36.1119,
        longitude: 128.3251,
        content: "복통 및 구토 증상 호소",
        priority: "semi-urgent",
        isDispatched: false,
    },
];

const initialNotifications = [
    { id: 1, type: "report", content: "새로운 신고가 접수되었습니다.", time: "13:45", status: "unread", link: "/reports" },
    { id: 2, type: "status", content: "구급차(99821234) 이송 완료", time: "13:30", status: "unread", link: "/dispatch" },
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
            const newAmbulances = [
                { id: 1, number: "99891234", status: "dispatched", location: "진평동 출동중" },
                { id: 2, number: "99821234", status: "completed", location: "구미소방서" },
                { id: 3, number: "998모1234", status: "transporting", location: "경대병원 이송중" },
                { id: 4, number: "999무1234", status: "standby", location: "구미소방서" },
                { id: 5, number: "99831234", status: "standby", location: "구미소방서" },
                { id: 6, number: "99841234", status: "maintenance", location: "정비소" },
            ];
            // setAmbulances(newAmbulances); // 하드코딩된 리셋 방지를 위해 주석 처리
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error("Failed to refresh ambulances:", error);
        } finally {
            setIsRefreshing(false);
        }
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
        updateReport: (updatedReport) => setReports(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r))
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};