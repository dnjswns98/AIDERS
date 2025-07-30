
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';

const Header = () => {
    const { currentTime, notifications, setNotifications } = useAppContext();
    const [showNotifications, setShowNotifications] = useState(false);

    const unreadCount = notifications.filter(n => n.status === 'unread').length;

    const handleMarkAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, status: 'read' })));
    };

    return (
        <header className="bg-blue-800 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <i className="fas fa-fire text-red-400 text-2xl"></i>
                        <h1 className="text-base sm:text-lg md:text-xl font-bold">구미소방센터 구급차 관리 시스템</h1>
                    </div>
                    <nav className="flex items-center space-x-2 sm:space-x-4 md:space-x-8">
                        <NavLink to="/" className={({ isActive }) => `px-4 py-2 rounded-md transition-colors duration-200 !rounded-button whitespace-nowrap ${isActive ? 'bg-blue-600' : 'hover:bg-blue-700'}`}>
                            상황판
                        </NavLink>
                        <NavLink to="/reports" className={({ isActive }) => `px-4 py-2 rounded-md transition-colors duration-200 !rounded-button whitespace-nowrap ${isActive ? 'bg-blue-600' : 'hover:bg-blue-700'}`}>
                            신고 관리
                        </NavLink>
                        <NavLink to="/dispatch" className={({ isActive }) => `px-4 py-2 rounded-md transition-colors duration-200 !rounded-button whitespace-nowrap ${isActive ? 'bg-blue-600' : 'hover:bg-blue-700'}`}>
                            <i className="fas fa-ambulance mr-2"></i>
                            배차 관리
                        </NavLink>
                    </nav>
                    <div className="flex items-center space-x-4">
                        <div className="text-sm">{currentTime.toLocaleString('ko-KR')}</div>
                        <div className="relative">
                            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 hover:bg-blue-700 rounded-full">
                                <i className="fas fa-bell text-lg"></i>
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
                                    <div className="p-4 border-b flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">알림</h3>
                                        <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.map((notification) => (
                                            <NavLink key={notification.id} to={notification.link} onClick={() => setShowNotifications(false)} className="p-4 border-b hover:bg-gray-50 cursor-pointer flex items-start space-x-3">
                                                <div className="flex-shrink-0">
                                                    {notification.type === 'report' && <i className="fas fa-file-medical text-blue-500"></i>}
                                                    {notification.type === 'status' && <i className="fas fa-ambulance text-green-500"></i>}
                                                    {notification.type === 'dispatch' && <i className="fas fa-route text-purple-500"></i>}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-900">{notification.content}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                                </div>
                                                {notification.status === 'unread' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                            </NavLink>
                                        ))}
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-b-lg">
                                        <button onClick={handleMarkAllAsRead} className="text-sm text-blue-600 hover:text-blue-800 w-full text-center">
                                            모든 알림 읽음 표시
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
