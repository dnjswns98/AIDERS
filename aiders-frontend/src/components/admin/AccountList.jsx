import { useState, useEffect } from "react";
import { useAccountStore } from "../../store/useAccountStore";
import DeleteModal from "./DeleteModal";

import './accountList.css';

export default function AccountList() {
  const { accounts, loading, error, fetchAccounts, deleteAccount } = useAccountStore();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  // 컴포넌트 마운트 시 사용자 목록 조회
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleDeleteClick = (account) => {
    setAccountToDelete(account);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (accountToDelete) {
      try {
        await deleteAccount(accountToDelete.id);
        setDeleteModalOpen(false);
        setAccountToDelete(null);
      } catch (error) {
        alert('사용자 삭제에 실패했습니다.');
      }
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
        {loading ? (
          <div className="no-accounts-message">
            <div className="no-accounts-icon">⏳</div>
            <h3 className="no-accounts-title">로딩 중...</h3>
            <p className="no-accounts-text">사용자 목록을 불러오고 있습니다.</p>
          </div>
        ) : error ? (
          <div className="no-accounts-message">
            <div className="no-accounts-icon">❌</div>
            <h3 className="no-accounts-title">오류 발생</h3>
            <p className="no-accounts-text">{error}</p>
            <button 
              onClick={() => fetchAccounts()}
              style={{ 
                marginTop: '10px', 
                padding: '8px 16px', 
                backgroundColor: '#3b82f6', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              다시 시도
            </button>
          </div>
        ) : accounts.length === 0 ? (
          <div className="no-accounts-message">
            <div className="no-accounts-icon">📋</div>
            <h3 className="no-accounts-title">등록된 계정이 없습니다</h3>
            <p className="no-accounts-text">새로운 계정을 생성해보세요.</p>
          </div>
        ) : (
          <div className="account-table-container">
            <table className="account-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>역할</th>
                  <th>사용자 키</th>
                  <th>생성일</th>
                  <th>수정일</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td>{account.id}</td>
                    <td className="account-type-cell">
                      <span className="account-type-icon-spacing">
                        {account.type === "관리자" && "👨‍💼"}
                        {account.type === "병원" && "🏥"}
                        {account.type === "구급대원" && "🚑"}
                        {account.type === "소방서" && "🚒"}
                      </span>
                      <span className="account-type-text">{account.type}</span>
                    </td>
                    <td className="account-id-cell">
                      {account.accountId}
                    </td>
                    <td>
                      {account.createdAt ? new Date(account.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td>
                      {account.updatedAt ? new Date(account.updatedAt).toLocaleDateString() : '-'}
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