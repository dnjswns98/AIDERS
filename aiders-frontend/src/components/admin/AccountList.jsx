import { useState, useEffect, useCallback } from "react";
import { useAccountStore } from "../../store/useAccountStore";
import DeleteModal from "./DeleteModal";
import Pagination from "./Pagination";

import './accountList.css';

export default function AccountList() {
  const { 
    accounts, 
    loading, 
    error, 
    currentPage, 
    totalPages, 
    totalElements,
    fetchAccounts, 
    deleteAccount 
  } = useAccountStore();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // 컴포넌트 마운트 시 사용자 목록 조회
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // 검색 핸들러 (디바운스 효과)
  const debouncedSearch = useCallback(() => {
    if (searchTerm.length >= 2 || searchTerm.length === 0) {
      fetchAccounts(0, 15, searchTerm, roleFilter);
    }
  }, [searchTerm, roleFilter, fetchAccounts]);

  // 검색어 변경 시 자동 검색 (2글자 이상일 때)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      debouncedSearch();
    }, 300); // 300ms 디바운스

    return () => clearTimeout(timeoutId);
  }, [debouncedSearch]);

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    fetchAccounts(newPage, 15, searchTerm, roleFilter);
  };

  // 검색 핸들러
  const handleSearch = () => {
    fetchAccounts(0, 15, searchTerm, roleFilter);
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div className="account-list-card">
      <div className="account-list-header">
        <div>
          <h2 className="account-list-title">
            계정 조회
          </h2>
          <p className="account-list-subtitle">
            등록된 모든 계정을 조회하고 관리할 수 있습니다. (총 {totalElements}개)
          </p>
        </div>
        
        {/* 검색 및 필터 */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '16px' }}>
          <input
            type="text"
            placeholder="사용자 키 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="">모든 역할</option>
            <option value="hospital">병원</option>
            <option value="ambulance">구급대원</option>
            <option value="firestation">소방서</option>
          </select>
          <button
            onClick={handleSearch}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            검색
          </button>
        </div>
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
                  <th>역할</th>
                  <th>사용자 키</th>
                  <th>생성일</th>
                  <th>수정일</th>
                  <th>삭제</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td className="account-type-cell">
                      <span className="account-type-icon-spacing">
                        {account.type === "관리자" && "👨‍💼"}
                        {account.type === "병원" && "🏥"}
                        {account.type === "구급대원" && "🚑"}
                        {account.type === "소방서" && "🚒"}
                        {!["관리자", "병원", "구급대원", "소방서"].includes(account.type) && "👤"}
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
      
      {/* 새로운 페이지네이션 컴포넌트 */}
      {!loading && !error && totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          showPages={5}
        />
      )}

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        account={accountToDelete}
      />
    </div>
    </div>
  );
}