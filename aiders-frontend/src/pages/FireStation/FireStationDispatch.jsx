import React, { useEffect, useState, useCallback, useMemo } from 'react';
import useFireStationStore from '../../store/useFireStationStore';
import { useAuthStore } from '../../store/useAuthStore';
import Pagination from "../../components/admin/Pagination";

const ROW_HEIGHT = "h-14"; // 행 높이 ↑ (글씨 커진만큼 padding 늘림)

const FireStationDispatch = () => {
  const { user } = useAuthStore();

  const {
    dispatchHistory,
    fetchDispatchHistory,
    ambulances,
    fetchFirestationAmbulances,
    firestationInfo,
    fetchFirestationInfo,
    isLoading
  } = useFireStationStore();

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedDate, setSelectedDate] = useState(''); // YYYY-MM-DD
  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    if (user?.userId) {
      await fetchFirestationInfo();
      await fetchFirestationAmbulances(user.userId);
      await fetchDispatchHistory();
    }
  }, [user?.userId, fetchFirestationInfo, fetchFirestationAmbulances, fetchDispatchHistory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 날짜 YYYY-MM-DD 변환
  const toLocalYMD = (dateLike) => {
    if (!dateLike) return null;
    const d = new Date(dateLike);
    if (isNaN(d)) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '시간 정보 없음';
    try {
      const date = new Date(dateString);
      if (date instanceof Date && !isNaN(date)) {
        return date.toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
      }
    } catch (e) {
      console.error("날짜 파싱 오류:", e);
    }
    return '시간 정보 없음';
  };

  // 날짜 필터 적용
  const filteredHistory = useMemo(() => {
    if (!selectedDate) return dispatchHistory;
    return dispatchHistory.filter((item) => toLocalYMD(item.createdAt) === selectedDate);
  }, [dispatchHistory, selectedDate]);

  const sortedHistory = useMemo(() => {
    return [...filteredHistory].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [filteredHistory]);

  const paginatedHistory = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return sortedHistory.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedHistory, currentPage]);

  const totalPages = Math.ceil(sortedHistory.length / itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page - 1);

  const onChangeDate = (e) => {
    setSelectedDate(e.target.value);
    setCurrentPage(0);
  };

  const clearDate = () => {
    setSelectedDate('');
    setCurrentPage(0);
  };

  if (isLoading && !dispatchHistory.length) {
    return (
      <div className="p-8 bg-gray-50 h-full flex items-center justify-center text-xl">
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>배차 데이터를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0 bg-gray-50 p-8 text-lg">
      <div className="shrink-0 flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">배차 관리</h2>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* 헤더 + 필터 */}
        <div className="px-6 py-4 bg-gray-50 border-b shrink-0 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-semibold text-gray-900">최근 배차 현황</h3>
            <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
              총 {sortedHistory.length}건
            </span>
          </div>

          {/* 날짜 필터 */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="border border-gray-300 rounded-md px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedDate}
              onChange={onChangeDate}
            />
            {selectedDate && (
              <button
                type="button"
                onClick={clearDate}
                className="text-base px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
              >
                전체 보기
              </button>
            )}
          </div>
        </div>

        {/* 목록 */}
        <div className="flex-1 min-h-0 overflow-auto">
          {paginatedHistory && paginatedHistory.length > 0 ? (
            <table className="w-full text-lg">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-100 text-gray-700 border-b">
                  <th className={`px-6 ${ROW_HEIGHT} text-left font-semibold text-base uppercase tracking-wider`}>구급차</th>
                  <th className={`px-6 ${ROW_HEIGHT} text-left font-semibold text-base uppercase tracking-wider`}>출동 주소</th>
                  <th className={`px-6 ${ROW_HEIGHT} text-left font-semibold text-base uppercase tracking-wider`}>배차 시간</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedHistory.map((dispatch, index) => {
                  const nums = (dispatch.ambulanceIds || [])
                    .map((id) => ambulances?.find((a) => a.ambulanceId === id)?.userKey)
                    .filter(Boolean);

                  return (
                    <tr
                      key={dispatch.id || index}
                      className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition-colors"
                    >
                      <td className={`px-6 ${ROW_HEIGHT} align-middle`}>
                        {nums.length ? (
                          <div className="flex flex-wrap items-center gap-2">
                            {nums.map((no) => (
                              <span
                                key={no}
                                className="inline-flex items-center rounded-full border border-gray-300 bg-white px-3 py-1 text-base text-gray-900"
                              >
                                🚑 {no}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">정보 없음</span>
                        )}
                      </td>

                      <td className={`px-6 ${ROW_HEIGHT} align-middle`}>
                        <div
                          className="max-w-[1000px] truncate text-gray-900"
                          title={dispatch.address || '주소 정보 없음'}
                        >
                          {dispatch.address || '주소 정보 없음'}
                        </div>
                      </td>

                      <td className={`px-6 ${ROW_HEIGHT} align-middle`}>
                        <span className="tabular-nums text-gray-900">
                          {formatDateTime(dispatch.createdAt)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-xl">
              <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">🗂️</div>
              <p className="text-gray-700 font-semibold">
                {selectedDate ? `${selectedDate} 배차 내역이 없습니다.` : '배차 내역이 없습니다.'}
              </p>
              <p className="text-gray-500 text-lg mt-2">다른 날짜를 선택하거나 전체 보기를 눌러보세요.</p>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="border-t bg-white px-6 py-4 shrink-0 text-lg">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FireStationDispatch;
