import React, { useEffect, useState, useCallback } from 'react';
import useFireStationStore from '../../store/useFireStationStore';

const FireStationReportList = () => {
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

  useEffect(() => {
    fetchReports(0, 10, {}); // 초기 로드
  }, [fetchReports]);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchOptions((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    const optionsToSubmit = {
      keyword: searchOptions.keyword || null,
      from: searchOptions.from || null,
      to: searchOptions.to || null
    };
    fetchReports(0, 10, optionsToSubmit);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < reportTotalPages) {
      fetchReports(newPage, 10, searchOptions);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ko-KR');
  };

  return (
    <div className="h-full flex flex-col min-h-0 bg-gray-50 p-8 text-lg">
      {/* 상단 제목 */}
      <div className="shrink-0 mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">소방서 보고서 목록</h2>
      </div>

      {/* 검색 영역 */}
      <div className="shrink-0 mb-6 p-5 bg-white rounded-xl shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
          {/* 시작일 */}
          <div>
            <label
              htmlFor="from"
              className="block text-base font-semibold text-gray-700 mb-2"
            >
              시작일
            </label>
            <input
              type="date"
              id="from"
              name="from"
              value={searchOptions.from}
              onChange={handleSearchChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            />
          </div>
          {/* 종료일 */}
          <div>
            <label
              htmlFor="to"
              className="block text-base font-semibold text-gray-700 mb-2"
            >
              종료일
            </label>
            <input
              type="date"
              id="to"
              name="to"
              value={searchOptions.to}
              onChange={handleSearchChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            />
          </div>
          {/* 키워드 */}
          <div className="md:col-span-1">
            <label
              htmlFor="keyword"
              className="block text-base font-semibold text-gray-700 mb-2"
            >
              검색어
            </label>
            <div className="flex">
              <input
                type="text"
                id="keyword"
                name="keyword"
                value={searchOptions.keyword}
                onChange={handleSearchChange}
                placeholder="내용, 요약, 차량번호 등"
                className="flex-grow px-4 py-2.5 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
              <button
                onClick={handleSearch}
                className="px-5 py-2.5 bg-orange-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 text-base font-semibold"
                disabled={isReportLoading}
              >
                {isReportLoading ? '검색중' : '검색'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 보고서 목록 */}
      <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200 text-lg">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-base font-semibold text-gray-700 uppercase tracking-wider">
                  보고서 ID
                </th>
                <th className="px-6 py-4 text-left text-base font-semibold text-gray-700 uppercase tracking-wider">
                  제목 (구급차번호_날짜)
                </th>
                <th className="px-6 py-4 text-left text-base font-semibold text-gray-700 uppercase tracking-wider">
                  이송 병원
                </th>
                <th className="px-6 py-4 text-left text-base font-semibold text-gray-700 uppercase tracking-wider">
                  KTAS
                </th>
                <th className="px-6 py-4 text-left text-base font-semibold text-gray-700 uppercase tracking-wider">
                  생성일
                </th>
                <th className="px-6 py-4 text-left text-base font-semibold text-gray-700 uppercase tracking-wider">
                  요약
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isReportLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-lg">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-3 text-gray-500">보고서를 불러오는 중입니다...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-red-600 text-lg">
                    오류가 발생했습니다: {error}
                  </td>
                </tr>
              ) : reports.length > 0 ? (
                reports.map((report) => (
                  <tr
                    key={report.reportId}
                    className="hover:bg-blue-50 cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/firestation/reports/${report.reportId}`)
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {report.reportId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-blue-700 font-semibold">
                      {report.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {report.hospitalName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {report.ktas || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {formatDate(report.createdAt)}
                    </td>
                    <td
                      className="px-6 py-4 text-gray-700 max-w-xs truncate"
                      title={report.summary}
                    >
                      {report.summary || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 whitespace-nowrap text-gray-500 text-center text-lg"
                  >
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {reportTotalPages > 1 && (
          <div className="shrink-0 px-6 py-4 bg-gray-50 border-t flex justify-between items-center text-base">
            <button
              onClick={() => handlePageChange(reportPage - 1)}
              disabled={reportPage === 0}
              className="px-5 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              이전
            </button>
            <span className="text-base text-gray-700">
              페이지 {reportPage + 1} / {reportTotalPages}
            </span>
            <button
              onClick={() => handlePageChange(reportPage + 1)}
              disabled={reportPage >= reportTotalPages - 1}
              className="px-5 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
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
