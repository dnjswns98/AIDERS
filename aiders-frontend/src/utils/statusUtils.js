
export const getStatusColor = (status) => {
  switch (status) {
    case "standby":
      return "bg-green-500";
    case "dispatched":
      return "bg-yellow-500";
    case "transporting":
      return "bg-orange-500";
    case "completed":
      return "bg-gray-500";
    case "maintenance":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
};

export const getStatusText = (status) => {
  switch (status) {
    case "standby":
      return "대기중";
    case "dispatched":
      return "출동중";
    case "transporting":
      return "이송중";
    case "completed":
      return "이송완료";
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
