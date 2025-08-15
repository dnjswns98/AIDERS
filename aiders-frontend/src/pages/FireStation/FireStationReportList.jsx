import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useFireStationStore from '../../store/useFireStationStore';

const FireStationReportList = () => {
    // 🔽 검색 조건 상태 추가
    const { 
        reports, 
        reportPage, 
        reportTotalPages, 
        isReportLoading, 
        error, 
        fetchReports 
    } = useFireStationStore();

    const [searchOptions, setSearchOptions] = useState({
        from: '',
        to: '',
        keyword: ''
    });

    // 🔽 컴포넌트가 처음 로드될 때 보고서 목록을 불러옵니다.
    useEffect(() => {
        fetchReports(0, 10, {}); // 초기 로드
    }, [fetchReports]);

    // 🔽 검색 옵션 변경 핸들러
    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchOptions(prev => ({ ...prev, [name]: value }));
    };

    // 🔽 검색 실행 핸들러
    const handleSearch = () => {
        const optionsToSubmit = {
            keyword: searchOptions.keyword || null,
            from: searchOptions.from || null,
            to: searchOptions.to || null,
        };
        fetchReports(0, 10, optionsToSubmit);
    };
    
    // 🔽 페이지 변경 핸들러
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < reportTotalPages) {
            fetchReports(newPage, 10, searchOptions);
        }
    };
    
    // 날짜 포맷팅 함수
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('ko-KR');
    };

    return (
        <div className="p-8 bg-gray-50 min-h-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">소방서 보고서 목록</h2>
            
            {/* 🔽 검색 및 필터 UI 추가 */}
            <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    {/* 날짜 필터 (시작일) */}
                    <div>
                        <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                        <input
                            type="date"
                            id="from"
                            name="from"
                            value={searchOptions.from}
                            onChange={handleSearchChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {/* 날짜 필터 (종료일) */}
                    <div>
                        <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                        <input
                            type="date"
                            id="to"
                            name="to"
                            value={searchOptions.to}
                            onChange={handleSearchChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {/* 키워드 검색 */}
                    <div className="md:col-span-1">
                         <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">검색어</label>
                        <div className="flex">
                            <input
                                type="text"
                                id="keyword"
                                name="keyword"
                                value={searchOptions.keyword}
                                onChange={handleSearchChange}
                                placeholder="내용, 요약, 차량번호 등"
                                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleSearch}
                                className="px-4 py-2 bg-orange-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                disabled={isReportLoading}
                            >
                                {isReportLoading ? '검색중' : '검색'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">보고서 ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목 (구급차번호_날짜)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이송 병원</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KTAS</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생성일</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">요약</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isReportLoading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-10">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="mt-2 text-gray-500">보고서를 불러오는 중입니다...</p>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-10 text-red-600">
                                        오류가 발생했습니다: {error}
                                    </td>
                                </tr>
                            ) : reports.length > 0 ? (
                                reports.map(report => (
                                    <tr key={report.reportId} className="hover:bg-blue-50 cursor-pointer" onClick={() => window.location.href=`/firestation/reports/${report.reportId}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.reportId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 font-semibold">{report.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.hospitalName || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.ktas || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(report.createdAt)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={report.summary}>{report.summary || '-'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 whitespace-nowrap text-sm text-gray-500 text-center">검색 결과가 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {reportTotalPages > 1 && (
                    <div className="px-6 py-3 bg-gray-50 border-t flex justify-between items-center">
                        <button
                            onClick={() => handlePageChange(reportPage - 1)}
                            disabled={reportPage === 0}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                        >
                            이전
                        </button>
                        <span className="text-sm text-gray-700">
                            페이지 {reportPage + 1} / {reportTotalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(reportPage + 1)}
                            disabled={reportPage >= reportTotalPages - 1}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                        >
                            다음
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FireStationReportList;