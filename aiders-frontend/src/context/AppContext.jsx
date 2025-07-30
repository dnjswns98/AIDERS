import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const initialAmbulances = [
    { id: 1, number: "99891234", status: "standby", location: "구미소방서" },
    { id: 2, number: "99821234", status: "dispatched", location: "진평동 일대" },
    { id: 3, number: "998모1234", status: "transporting", location: "경대병원 이송중" },
    { id: 4, number: "999무1234", status: "completed", location: "곽병원" },
    { id: 5, number: "99831234", status: "standby", location: "구미소방서" },
    { id: 6, number: "99841234", status: "maintenance", location: "정비소" },
];

const initialReports = [
    {
        id: 1,
        reportNumber: "202507281208",
        date: "2025.07.28-13:16",
        location: "경상북도 구미시 진평동 빌라",
        content: "환자가 갑작스럽게 호흡 곤란, 가슴 답답함, 어지럼증 호소",
        priority: "emergency",
    },
    {
        id: 2,
        reportNumber: "202507281209",
        date: "2025.07.28-13:22",
        location: "경상북도 구미시 원평동 아파트",
        content: "고령 환자 낙상 사고, 의식 있음",
        priority: "urgent",
    },
    {
        id: 3,
        reportNumber: "202507281210",
        date: "2025.07.28-13:28",
        location: "경상북도 구미시 형곡동 상가",
        content: "복통 및 구토 증상 호소",
        priority: "semi-urgent",
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
            setAmbulances(newAmbulances);
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