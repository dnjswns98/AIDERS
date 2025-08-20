// src/utils/statusUtils.js

export const getStatusColor = (status) => {
  // ✅ status 값을 소문자로 변환하여 비교합니다.
  switch (status?.toLowerCase()) {
    case "wait":
    case "standby":
    case "completed": // 완료 후 대기 상태로 변경
      return "bg-green-500";
    case "dispatch":
    case "dispatched":
      return "bg-yellow-500";
    case "transfer":
    case "transporting":
      return "bg-orange-500";
    case "maintenance":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
};

export const getStatusText = (status) => {
  // ✅ status 값을 소문자로 변환하여 비교합니다.
  switch (status?.toLowerCase()) {
    case "wait":
    case "standby":
    case "completed": // 완료 후 대기 상태로 변경
      return "대기중";
    case "dispatch":
    case "dispatched":
      return "출동중";
    case "transfer":
    case "transporting":
      return "이송중";
    case "maintenance":
      return "정비중";
    default:
      return "알 수 없음";
  }
};

export const getPriorityColor = (priority) => {
  switch (priority) {
    case "emergency":
      return "bg-red-100 text-red-800 border-red-200";
    case "urgent":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "semi-urgent":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "non-urgent":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getPriorityText = (priority) => {
  switch (priority) {
    case "emergency":
      return "응급";
    case "urgent":
      return "준응급";
    case "semi-urgent":
      return "준급성";
    case "non-urgent":
      return "비응급";
    default:
      return "미분류";
  }
};