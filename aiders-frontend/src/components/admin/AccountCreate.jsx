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
    name: "",
    firestationName: "",
  });
  const [createdAccount, setCreatedAccount] = useState(null);

  const { registerAmbulance, registerOrganization } = useAccountStore();

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    let result;
    if (selectedType === "구급대원") {
      result = await registerAmbulance({
        userKey: formData.accountId,
        name: formData.firestationName
      });
    } else {
      const role = selectedType === "병원" ? "hospital" : "firestation";
      result = await registerOrganization({
        userKey: formData.accountId,
        role: role,
        address: formData.address,
        name: formData.name
      });
    }

    if (result.success) {
      setCreatedAccount({
        type: selectedType,
        accountId: formData.accountId,
        name: selectedType !== "구급대원" ? formData.name : null,
        address: selectedType !== "구급대원" ? formData.address : null,
        firestationName: selectedType === "구급대원" ? formData.firestationName : null,
        tempPassword: result.password,
        passkey: result.passwordResetKey
      });
      setStep(3);
    } else {
      alert(`계정 생성 실패: ${result.error}`);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedType("");
    setFormData({
      accountId: "",
      address: "",
      name: "",
      firestationName: "",
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
                onChange={(e) => {
                  const value = e.target.value;
                  // 영문, 숫자만 허용
                  if (/^[a-zA-Z0-9]*$/.test(value)) {
                    handleInputChange("accountId", value);
                  }
                }}
                placeholder="아이디를 입력하세요 (영문, 숫자만)"
                required
                className="form-input"
              />
            </div>

            {selectedType === "구급대원" ? (
              <div className="form-group">
                <label className="form-label">
                  소속 소방서명
                </label>
                <input
                  type="text"
                  value={formData.firestationName}
                  onChange={(e) => handleInputChange("firestationName", e.target.value)}
                  placeholder="소속 소방서명을 입력하세요 (기존 소방서)"
                  required
                  className="form-input"
                />
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">
                    {selectedType} 이름
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder={`${selectedType} 이름을 입력하세요`}
                    required
                    className="form-input"
                  />
                </div>
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
              </>
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
              {createdAccount.name && (
                <div className="account-info-row">
                  <span className="account-info-label">{createdAccount.type} 이름:</span>
                  <span className="account-info-value">{createdAccount.name}</span>
                </div>
              )}
              {createdAccount.address && (
                <div className="account-info-row">
                  <span className="account-info-label">주소:</span>
                  <span className="account-info-value">{createdAccount.address}</span>
                </div>
              )}
              {createdAccount.firestationName && (
                <div className="account-info-row">
                  <span className="account-info-label">소속 소방서:</span>
                  <span className="account-info-value">{createdAccount.firestationName}</span>
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