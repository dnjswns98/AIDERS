import { useState } from "react";
import { useAccountStore } from "../../store/useAccountStore";
import './accountCreate.css';


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
      <div className="account-create-card">
        <div className="account-create-header">
          <h2 className="account-create-title">
            계정 생성
          </h2>
          <p className="account-create-subtitle">
            새로운 계정을 생성합니다.
          </p>
        </div>

        <div className="account-create-body">
          <h3 className="account-create-section-title">
            소속을 선택해주세요
          </h3>
          <div className="account-type-grid">
            {accountTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => handleTypeSelect(type.value)}
                className="account-type-button"
              >
                <div className="account-type-icon">
                  {type.value === "병원" && "🏥"}
                  {type.value === "구급대원" && "🚑"}
                  {type.value === "소방서" && "🚒"}
                </div>
                <span className="account-type-label">
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
      <div className="account-create-card">
        <div className="account-create-header">
          <div className="flex items-center justify-between mb-2">
            <h2 className="account-create-title">
              {selectedType} 계정 생성
            </h2>
            <button 
              onClick={() => setStep(1)}
              className="account-create-back-button"
            >
              ← 뒤로
            </button>
          </div>
          <p className="account-create-subtitle">
            계정 정보를 입력해주세요.
          </p>
        </div>

        <div className="account-create-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                아이디
              </label>
              <input
                type="text"
                value={formData.accountId}
                onChange={(e) => handleInputChange("accountId", e.target.value)}
                placeholder="아이디를 입력하세요"
                required
                className="form-input"
              />
            </div>

            {selectedType === "구급대원" ? (
              <div className="form-group">
                <label className="form-label">
                  차량번호
                </label>
                <input
                  type="text"
                  value={formData.vehicleNumber}
                  onChange={(e) => handleInputChange("vehicleNumber", e.target.value)}
                  placeholder="차량번호를 입력하세요"
                  required
                  className="form-input"
                />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">
                  주소
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="주소를 입력하세요"
                  required
                  className="form-input"
                />
              </div>
            )}

            <button
              type="submit"
              className="submit-button"
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
      <div className="account-created-success-card">
        <div className="account-created-header">
          <div className="account-created-icon-container">
            <div className="account-created-icon">
              ✅
            </div>
            <h2 className="account-created-title">
              계정 생성 완료
            </h2>
            <p className="account-created-subtitle">
              계정이 성공적으로 생성되었습니다.
            </p>
          </div>
        </div>

        <div className="account-info-section">
          <div className="account-info-box">
            <h3 className="account-info-title">
              생성된 계정 정보
            </h3>
            <div className="account-info-details">
              <div className="account-info-row">
                <span className="account-info-label">소속:</span>
                <span className="account-info-value">{createdAccount.type}</span>
              </div>
              <div className="account-info-row">
                <span className="account-info-label">아이디:</span>
                <span className="account-info-value">{createdAccount.accountId}</span>
              </div>
              {createdAccount.address && (
                <div className="account-info-row">
                  <span className="account-info-label">주소:</span>
                  <span className="account-info-value">{createdAccount.address}</span>
                </div>
              )}
              {createdAccount.vehicleNumber && (
                <div className="account-info-row">
                  <span className="account-info-label">차량번호:</span>
                  <span className="account-info-value">{createdAccount.vehicleNumber}</span>
                </div>
              )}
              <hr className="account-info-hr" />
              <div className="account-info-row">
                <span className="account-info-label">임시 비밀번호:</span>
                <span className="account-info-password-passkey account-info-temp-password">
                  {createdAccount.tempPassword}
                </span>
              </div>
              <div className="account-info-row">
                <span className="account-info-label">패스키:</span>
                <span className="account-info-password-passkey account-info-passkey">
                  {createdAccount.passkey}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={resetForm}
            className="submit-button"
          >
            새 계정 생성
          </button>
        </div>
      </div>
    );
  }

  return null;
}