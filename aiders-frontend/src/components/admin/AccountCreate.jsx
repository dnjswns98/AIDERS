import { useState } from "react";
import { useAccountStore } from "../../store/useAccountStore";

const accountTypes = [
  { value: "병원", label: "병원" },
  { value: "구급대원", label: "구급대원" },
  { value: "소방서", label: "소방서" },
];

export default function AccountCreate() {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState({
    accountId: "",
    address: "",
    vehicleNumber: "",
  });
  const [createdAccount, setCreatedAccount] = useState(null);

  const addAccount = useAccountStore((state) => state.addAccount);

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setStep(2);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newAccount = {
      type: selectedType,
      accountId: formData.accountId,
      ...(selectedType === "구급대원" ? { vehicleNumber: formData.vehicleNumber } : { address: formData.address }),
    };

    addAccount(newAccount);
    const accounts = useAccountStore.getState().accounts;
    const latestAccount = accounts[accounts.length - 1];

    setCreatedAccount(latestAccount);
    setStep(3);
  };

  const resetForm = () => {
    setStep(1);
    setSelectedType("");
    setFormData({
      accountId: "",
      address: "",
      vehicleNumber: "",
    });
    setCreatedAccount(null);
  };

  if (step === 1) {
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
            계정 생성
          </h2>
          <p style={{
            color: '#6b7280',
            marginTop: '4px'
          }}>
            새로운 계정을 생성합니다.
          </p>
        </div>

        <div style={{ padding: '24px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '16px'
          }}>
            소속을 선택해주세요
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {accountTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => handleTypeSelect(type.value)}
                style={{
                  padding: '24px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  textAlign: 'center',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onMouseOver={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.backgroundColor = '#eff6ff';
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = 'white';
                }}
              >
                <div style={{
                  fontSize: '32px',
                  marginBottom: '8px'
                }}>
                  {type.value === "병원" && "🏥"}
                  {type.value === "구급대원" && "🚑"}
                  {type.value === "소방서" && "🚒"}
                </div>
                <span style={{
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  {type.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937'
            }}>
              {selectedType} 계정 생성
            </h2>
            <button 
              onClick={() => setStep(1)}
              style={{
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: '1px solid #d1d5db',
                color: '#6b7280',
                cursor: 'pointer',
                fontSize: '14px',
                borderRadius: '6px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.color = '#374151';
                e.target.style.borderColor = '#9ca3af';
                e.target.style.backgroundColor = '#f9fafb';
              }}
              onMouseOut={(e) => {
                e.target.style.color = '#6b7280';
                e.target.style.borderColor = '#d1d5db';
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              ← 뒤로
            </button>
          </div>
          <p style={{
            color: '#6b7280',
            marginTop: '4px'
          }}>
            계정 정보를 입력해주세요.
          </p>
        </div>

        <div style={{ padding: '24px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                아이디
              </label>
              <input
                type="text"
                value={formData.accountId}
                onChange={(e) => handleInputChange("accountId", e.target.value)}
                placeholder="아이디를 입력하세요"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {selectedType === "구급대원" ? (
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  차량번호
                </label>
                <input
                  type="text"
                  value={formData.vehicleNumber}
                  onChange={(e) => handleInputChange("vehicleNumber", e.target.value)}
                  placeholder="차량번호를 입력하세요"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            ) : (
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  주소
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="주소를 입력하세요"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '12px 16px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                outline: 'none'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              계정 생성
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 3 && createdAccount) {
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
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#dcfce7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '24px'
            }}>
              ✅
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              계정 생성 완료
            </h2>
            <p style={{
              color: '#6b7280'
            }}>
              계정이 성공적으로 생성되었습니다.
            </p>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontWeight: '500',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              생성된 계정 정보
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span style={{ color: '#6b7280' }}>소속:</span>
                <span style={{ fontWeight: '500' }}>{createdAccount.type}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span style={{ color: '#6b7280' }}>아이디:</span>
                <span style={{ fontWeight: '500' }}>{createdAccount.accountId}</span>
              </div>
              {createdAccount.address && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ color: '#6b7280' }}>주소:</span>
                  <span style={{ fontWeight: '500' }}>{createdAccount.address}</span>
                </div>
              )}
              {createdAccount.vehicleNumber && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ color: '#6b7280' }}>차량번호:</span>
                  <span style={{ fontWeight: '500' }}>{createdAccount.vehicleNumber}</span>
                </div>
              )}
              <hr style={{
                margin: '16px 0',
                border: 'none',
                height: '1px',
                backgroundColor: '#e5e7eb'
              }} />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span style={{ color: '#6b7280' }}>임시 비밀번호:</span>
                <span style={{
                  fontFamily: 'monospace',
                  backgroundColor: '#fef3c7',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}>
                  {createdAccount.tempPassword}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span style={{ color: '#6b7280' }}>패스키:</span>
                <span style={{
                  fontFamily: 'monospace',
                  backgroundColor: '#dbeafe',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}>
                  {createdAccount.passkey}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={resetForm}
            style={{
              width: '100%',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 16px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              outline: 'none'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            새 계정 생성
          </button>
        </div>
      </div>
    );
  }

  return null;
}