
import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { getStatusColor, getStatusText } from "../../utils/statusUtils";

const Dashboard = () => {
    const { ambulances, isRefreshing, refreshAmbulances } = useAppContext();

    const statusCounts = ambulances.reduce((acc, ambulance) => {
        acc[ambulance.status] = (acc[ambulance.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">구급차 실시간 현황</h2>
                    <button onClick={refreshAmbulances} disabled={isRefreshing} className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors !rounded-button whitespace-nowrap ${isRefreshing ? 'opacity-75' : ''}`}>
                        {isRefreshing ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-sync-alt mr-2"></i>}
                        {isRefreshing ? '새로고침 중...' : '새로고침'}
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ambulances.map((ambulance) => (
                        <div key={ambulance.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <i className="fas fa-ambulance text-red-500 text-2xl"></i>
                                    <span className="text-lg font-semibold text-gray-900">{ambulance.number}</span>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(ambulance.status)}`}>
                                    {getStatusText(ambulance.status)}
                                </div>
                            </div>
                            <div className="text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                    <i className="fas fa-map-marker-alt text-gray-400"></i>
                                    <span>{ambulance.location}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                    <div className="text-2xl font-bold text-green-600">{statusCounts.standby || 0}</div>
                    <div className="text-sm text-gray-600">대기중</div>
                </div>
                <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                    <div className="text-2xl font-bold text-yellow-600">{statusCounts.dispatched || 0}</div>
                    <div className="text-sm text-gray-600">출동중</div>
                </div>
                <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                    <div className="text-2xl font-bold text-orange-600">{statusCounts.transporting || 0}</div>
                    <div className="text-sm text-gray-600">이송중</div>
                </div>
                <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                    <div className="text-2xl font-bold text-gray-600">{statusCounts.completed || 0}</div>
                    <div className="text-sm text-gray-600">이송완료</div>
                </div>
                <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                    <div className="text-2xl font-bold text-red-600">{statusCounts.maintenance || 0}</div>
                    <div className="text-sm text-gray-600">정비중</div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
