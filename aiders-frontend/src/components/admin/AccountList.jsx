import { useState } from "react";
import { useAccountStore } from "../../store/useAccountStore";
import DeleteModal from "./DeleteModal";

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
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        padding: '24px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1f2937'
        }}>
          계정 조회
        </h2>
        <p style={{
          color: '#6b7280',
          marginTop: '4px'
        }}>
          등록된 모든 계정을 조회하고 관리할 수 있습니다.
        </p>
      </div>

      <div style={{ padding: '24px' }}>
        {accounts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 0'
          }}>
            <div style={{
              color: '#9ca3af',
              fontSize: '64px',
              marginBottom: '16px'
            }}>
              📋
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '500',
              color: '#6b7280',
              marginBottom: '8px'
            }}>
              등록된 계정이 없습니다
            </h3>
            <p style={{ color: '#9ca3af' }}>새로운 계정을 생성해보세요.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>소속</th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>아이디</th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>상세정보</th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>임시 비밀번호</th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>패스키</th>
                  <th style={{
                    textAlign: 'center',
                    padding: '12px 16px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>작업</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr 
                    key={account.id} 
                    style={{
                      borderBottom: '1px solid #f3f4f6',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.parentElement.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.target.parentElement.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '8px' }}>
                          {account.type === "병원" && "🏥"}
                          {account.type === "구급대원" && "🚑"}
                          {account.type === "소방서" && "🚒"}
                        </span>
                        <span style={{ fontWeight: '500' }}>{account.type}</span>
                      </div>
                    </td>
                    <td style={{
                      padding: '16px',
                      fontFamily: 'monospace',
                      fontSize: '14px'
                    }}>
                      {account.accountId}
                    </td>
                    <td style={{
                      padding: '16px',
                      fontSize: '14px'
                    }}>
                      {account.address && (
                        <div style={{ color: '#6b7280' }}>
                          <span style={{
                            fontSize: '12px',
                            color: '#9ca3af'
                          }}>주소: </span>
                          {account.address}
                        </div>
                      )}
                      {account.vehicleNumber && (
                        <div style={{ color: '#6b7280' }}>
                          <span style={{
                            fontSize: '12px',
                            color: '#9ca3af'
                          }}>차량번호: </span>
                          {account.vehicleNumber}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        backgroundColor: '#fef3c7',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}>
                        {account.tempPassword}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        backgroundColor: '#dbeafe',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}>
                        {account.passkey}
                      </span>
                    </td>
                    <td style={{
                      padding: '16px',
                      textAlign: 'center'
                    }}>
                      <button
                        onClick={() => handleDeleteClick(account)}
                        style={{
                          color: '#ef4444',
                          padding: '8px',
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.color = '#dc2626';
                          e.target.style.backgroundColor = '#fef2f2';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.color = '#ef4444';
                          e.target.style.backgroundColor = 'transparent';
                        }}
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