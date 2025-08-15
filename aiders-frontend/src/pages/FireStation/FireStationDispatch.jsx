import React, { useEffect, useState, useCallback, useMemo } from 'react';
import useFireStationStore from '../../store/useFireStationStore';
import { useAuthStore } from '../../store/useAuthStore';
import Pagination from "../../components/admin/Pagination";

const ROW_HEIGHT = "h-11"; // 행 높이

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

  // 날짜 문자열(로컬) -> YYYY-MM-DD
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

  // 1) 날짜 필터 적용
  const filteredHistory = useMemo(() => {
    if (!selectedDate) return dispatchHistory;
    return dispatchHistory.filter((item) => toLocalYMD(item.createdAt) === selectedDate);
  }, [dispatchHistory, selectedDate]);

  // 2) 정렬
  const sortedHistory = useMemo(() => {
    return [...filteredHistory].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [filteredHistory]);

  // 3) 페이지네이션
  const paginatedHistory = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return sortedHistory.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedHistory, currentPage]);

  const totalPages = Math.ceil(sortedHistory.length / itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page - 1);

  // 날짜 변경 시 페이지를 처음으로
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
      <div className="p-8 bg-gray-50 h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>배차 데이터를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0 bg-gray-50 p-8">
      <div className="shrink-0 flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">배차 관리</h2>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* 헤더 + 필터 */}
        <div className="px-6 py-3 bg-gray-50 border-b shrink-0 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">최근 배차 현황</h3>
            <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              총 {sortedHistory.length}건
            </span>
          </div>

          {/* 날짜 필터 */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedDate}
              onChange={onChangeDate}
              aria-label="날짜 선택"
            />
            {selectedDate && (
              <button
                type="button"
                onClick={clearDate}
                className="text-xs px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-100"
              >
                전체 보기
              </button>
            )}
          </div>
        </div>

        {/* 목록 */}
        <div className="flex-1 min-h-0 overflow-auto">
          {paginatedHistory && paginatedHistory.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 text-gray-600 border-b">
                  <th className={`px-5 ${ROW_HEIGHT} text-left font-medium tracking-wider text-[11px] uppercase`}>구급차</th>
                  <th className={`px-5 ${ROW_HEIGHT} text-left font-medium tracking-wider text-[11px] uppercase`}>출동 주소</th>
                  <th className={`px-5 ${ROW_HEIGHT} text-right font-medium tracking-wider text-[11px] uppercase`}>배차 시간</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedHistory.map((dispatch, index) => {
                  const nums = (dispatch.ambulanceIds || [])
                    .map((id) => ambulances?.find((a) => a.ambulanceId === id)?.userKey)
                    .filter(Boolean);

                  return (
                    <tr
                      key={dispatch.id || index}
                      className="odd:bg-white even:bg-gray-50/60 hover:bg-blue-50/40 transition-colors"
                    >
                      <td className={`px-5 ${ROW_HEIGHT} align-middle`}>
                        {nums.length ? (
                          <div className="flex flex-wrap items-center gap-1">
                            {nums.map((no) => (
                              <span
                                key={no}
                                className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[12px] text-gray-800"
                                title={`구급차 ${no}`}
                              >
                                🚑 {no}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">정보 없음</span>
                        )}
                      </td>

                      <td className={`px-5 ${ROW_HEIGHT} align-middle`}>
                        <div
                          className="max-w-[1200px] truncate text-gray-900"
                          title={dispatch.address || '주소 정보 없음'}
                        >
                          {dispatch.address || '주소 정보 없음'}
                        </div>
                      </td>

                      <td className={`px-5 ${ROW_HEIGHT} align-middle text-right`}>
                        <span className="tabular-nums text-gray-800" title={dispatch.createdAt}>
                          {formatDateTime(dispatch.createdAt)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            // 빈 상태
            <div className="p-10 text-center">
              <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">🗂️</div>
              <p className="text-gray-600 font-medium">
                {selectedDate ? `${selectedDate} 배차 내역이 없습니다.` : '배차 내역이 없습니다.'}
              </p>
              <p className="text-gray-400 text-xs mt-1">다른 날짜를 선택하거나 전체 보기를 눌러보세요.</p>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="border-t bg-white px-4 py-3 shrink-0">
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
