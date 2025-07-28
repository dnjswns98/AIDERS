import { useState } from "react";

export default function DeleteModal({ isOpen, onClose, onConfirm, account }) {
  const [confirmText, setConfirmText] = useState("");

  if (!isOpen || !account) return null;

  const handleConfirm = () => {
    if (confirmText === "삭제") {
      onConfirm();
      setConfirmText("");
    } else {
      alert("삭제를 정확히 입력해주세요.");
    }
  };

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">계정 삭제 확인</h3>
          <p className="text-gray-600 text-sm">다음 계정을 삭제하시겠습니까?</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <span className="mr-2">
              {account.type === "병원" && "🏥"}
              {account.type === "구급대원" && "🚑"}
              {account.type === "소방서" && "🚒"}
            </span>
            <span className="font-medium">{account.type}</span>
          </div>
          <div className="text-sm text-gray-600">
            <div>아이디: {account.accountId}</div>
            {account.address && <div>주소: {account.address}</div>}
            {account.vehicleNumber && <div>차량번호: {account.vehicleNumber}</div>}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            삭제를 진행하려면 <span className="text-red-600 font-bold">"삭제"</span>를 입력하세요
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="삭제"
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}