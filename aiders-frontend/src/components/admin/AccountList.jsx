import { useState } from "react";
import { useAccountStore } from "../../store/useAccountStore";
import DeleteModal from "./DeleteModal";

import './accountList.css';

export default function AccountList() {
  const { accounts } = useAccountStore();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  const handleDeleteClick = (account) => {
    setAccountToDelete(account);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (accountToDelete) {
      useAccountStore.getState().deleteAccount(accountToDelete.id);
      setDeleteModalOpen(false);
      setAccountToDelete(null);
    }
  };

  return (
    <div className="account-list-card">
      <div className="account-list-header">
        <h2 className="account-list-title">
          계정 조회
        </h2>
        <p className="account-list-subtitle">
          등록된 모든 계정을 조회하고 관리할 수 있습니다.
        </p>
      </div>

      <div className="account-list-body">
        {accounts.length === 0 ? (
          <div className="no-accounts-message">
            <div className="no-accounts-icon">
              📋
            </div>
            <h3 className="no-accounts-title">
              등록된 계정이 없습니다
            </h3>
            <p className="no-accounts-text">새로운 계정을 생성해보세요.</p>
          </div>
        ) : (
          <div className="account-table-container">
            <table className="account-table">
              <thead>
                <tr>
                  <th>소속</th>
                  <th>아이디</th>
                  <th>상세정보</th>
                  <th>임시 비밀번호</th>
                  <th>패스키</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr 
                    key={account.id} 
                  >
                    <td className="account-type-cell">
                      <span className="account-type-icon-spacing">
                        {account.type === "병원" && "🏥"}
                        {account.type === "구급대원" && "🚑"}
                        {account.type === "소방서" && "🚒"}
                      </span>
                      <span className="account-type-text">{account.type}</span>
                    </td>
                    <td className="account-id-cell">
                      {account.accountId}
                    </td>
                    <td className="account-detail-cell">
                      {account.address && (
                        <div className="account-detail-item">
                          <span className="account-detail-label">주소: </span>
                          {account.address}
                        </div>
                      )}
                      {account.vehicleNumber && (
                        <div className="account-detail-item">
                          <span className="account-detail-label">차량번호: </span>
                          {account.vehicleNumber}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="account-password-passkey account-temp-password">
                        {account.tempPassword}
                      </span>
                    </td>
                    <td>
                      <span className="account-password-passkey account-passkey">
                        {account.passkey}
                      </span>
                    </td>
                    <td className="account-actions-cell">
                      <button
                        onClick={() => handleDeleteClick(account)}
                        className="delete-button"
                        title="계정 삭제"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        account={accountToDelete}
      />
    </div>
  );
}