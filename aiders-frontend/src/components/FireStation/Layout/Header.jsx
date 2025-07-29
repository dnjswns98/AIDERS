// src/components/Layout/Header.jsx
import React from "react";
import { useAppContext } from "../../context/AppContext";
import { useNotifications } from "../../hooks/useNotifications";
import { Button } from "../UI/Button";

/**
 * Header 컴포넌트
 * - 상단 로고, 탭 네비게이션, 시계, 알림 UI 포함
 */
function Header() {
  const { state, dispatch } = useAppContext();
  const {
    notifications,
    showNotifications,
    unreadCount,
    toggleNotifications,
    markAllAsRead,
  } = useNotifications();

  return (
    <header className="bg-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 & 타이틀 */}
          <div className="flex items-center space-x-4">
            <i className="fas fa-fire text-red-400 text-2xl" />
            <h1 className="text-xl font-bold">
              구미소방센터 구급차 관리 시스템
            </h1>
          </div>

          {/* 탭 네비게이션 */}
          <nav className="flex items-center space-x-8">
            <Button
              variant={
                state.selectedTab === "dashboard" ? "primary" : "secondary"
              }
              onClick={() =>
                dispatch({ type: "SET_SELECTED_TAB", payload: "dashboard" })
              }
            >
              상황판
            </Button>
            <Button
              variant={
                state.selectedTab === "reports" ? "primary" : "secondary"
              }
              onClick={() =>
                dispatch({ type: "SET_SELECTED_TAB", payload: "reports" })
              }
            >
              신고 관리
            </Button>
            <Button
              variant={
                state.selectedTab === "dispatch" ? "primary" : "secondary"
              }
              icon="fas fa-ambulance"
              onClick={() =>
                dispatch({ type: "SET_SELECTED_TAB", payload: "dispatch" })
              }
            >
              배차 관리
            </Button>
          </nav>

          {/* 현재 시간 & 알림 */}
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              {state.currentTime.toLocaleString("ko-KR")} {/* 실시간 시계 */}
            </div>
            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="relative p-2 hover:bg-blue-700 rounded-full"
              >
                <i className="fas fa-bell text-lg" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount} {/* 안 읽은 알림 개수 */}
                  </span>
                )}
              </button>

              {/* 알림 리스트 드롭다운 */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
                  {/* 헤더 */}
                  <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      알림
                    </h3>
                    <button
                      onClick={toggleNotifications}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <i className="fas fa-times" />
                    </button>
                  </div>

                  {/* 알림 항목들 */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          dispatch({
                            type: "SET_SELECTED_TAB",
                            payload: n.link,
                          });
                          toggleNotifications();
                        }}
                        className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {/* 아이콘 분기 처리 */}
                            {n.type === "report" && (
                              <i className="fas fa-file-medical text-blue-500" />
                            )}
                            {n.type === "status" && (
                              <i className="fas fa-ambulance text-green-500" />
                            )}
                            {n.type === "dispatch" && (
                              <i className="fas fa-route text-purple-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{n.content}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {n.time}
                            </p>
                          </div>
                          {n.status === "unread" && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" /> /* 읽지 않은 표시 */
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 모두 읽음 버튼 */}
                  <div className="p-3 bg-gray-50 rounded-b-lg">
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800 w-full text-center"
                    >
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
}
export default Header;
