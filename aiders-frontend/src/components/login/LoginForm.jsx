import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { usePasswordStore } from "../../store/usePasswordStore";
import axios from "axios";
import "./login.css";

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { authenticateForPasswordReset, changePassword, loading: passwordLoading } = usePasswordStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // 비밀번호 재설정 관련 상태
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: 인증, 2: 새 비밀번호 입력
  const [resetUserKey, setResetUserKey] = useState("");
  const [resetKey, setResetKey] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("로그인 버튼 클릭됨");

    if (!username || !password) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    // console.log("로그인 시도:", { userKey: username.trim(), password: password });
    setLoading(true);

    try {
      // console.log("API 요청 시작");
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/login`,
        {
          userKey: username.trim(),
          password: password,
        }
      );

      // console.log("API 응답:", response.data);
      const { accessToken, refreshToken } = response.data;

      // JWT 토큰에서 사용자 정보 추출
      const tokenPayload = JSON.parse(atob(accessToken.split(".")[1]));
      // console.log("토큰 페이로드:", tokenPayload);

      // 사용자 정보 구성
      const userInfo = {
        userKey: tokenPayload.userKey || username.trim(),
        userId: tokenPayload.sub,
        role: tokenPayload.role,
      };

      // accessToken의 payload에서 role 값 추출
      const userType = tokenPayload.role.toLowerCase();

      login({
        user: userInfo,
        accessToken: accessToken,
        refreshToken: refreshToken,
        userType: userType,
      });

      // 역할에 따른 자동 라우팅
      const routeMap = {
        admin: "/admin",
        hospital: "/hospital",
        ambulance: "/emergency/patient-input",
        firestation: "/firestation",
      };
      // console.log("사용자 타입:", userType, "라우팅:", routeMap[userType]);
      navigate(routeMap[userType] || "/");
    } catch (error) {
      // console.error("로그인 실패:", error);
      // console.error("에러 상세:", error.response?.data);
      alert("아이디 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 비밀번호 재설정 인증
  const handlePasswordResetAuth = async (e) => {
    e.preventDefault();
    
    if (!resetUserKey || !resetKey) {
      alert("사용자 키와 패스키를 모두 입력해주세요.");
      return;
    }

    const result = await authenticateForPasswordReset(resetUserKey, resetKey);
    
    if (result.success) {
      setResetToken(result.resetToken);
      setResetStep(2);
      alert("인증되었습니다. 새 비밀번호를 입력해주세요.");
    } else {
      alert("인증에 실패했습니다: " + result.error);
    }
  };

  // 비밀번호 변경
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      alert("새 비밀번호를 모두 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (newPassword.length < 4) {
      alert("비밀번호는 4자리 이상이어야 합니다.");
      return;
    }

    const result = await changePassword(resetToken, newPassword);
    
    if (result.success) {
      alert("비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해주세요.");
      // 초기화
      setShowPasswordReset(false);
      setResetStep(1);
      setResetUserKey("");
      setResetKey("");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      alert("비밀번호 변경에 실패했습니다: " + result.error);
    }
  };

  // 비밀번호 재설정 취소
  const handleResetCancel = () => {
    setShowPasswordReset(false);
    setResetStep(1);
    setResetUserKey("");
    setResetKey("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* 로고 영역 */}
        <div className="login-logo-area">
          <div className="login-logo-icon">🚑</div>
          <h1 className="login-title">AIDERS 로그인</h1>
          <p className="login-subtitle">응급의료 통합 관리 시스템</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 아이디 입력 */}
          <div className="login-input-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디"
              required
              className="login-input"
            />
          </div>

          {/* 비밀번호 입력 */}
          <div className="login-input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              required
              className="login-input"
            />
          </div>

          {/* 로그인 버튼 */}
          <div className="login-button-group">
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </div>
        </form>

        {/* 테스트 계정 정보 */}
        <div className="login-test-account-info">
          <div className="login-test-account-title">테스트 계정</div>
          <div className="login-test-account-details">
            <div>👮 관리자: admin / admin</div>
            <div>🚒 소방서: 6110582 / f63f9527-a468-4fcb-bf4c-836a3313ecd6</div>
            <div>🏥 병원: A1200028 / 3e9cf29d-93de-46b6-bbb1-a97ac1fac65f</div>
            <div>
              🚑 구급차: 998버4200 / 8dedb374-c0d8-4525-85ad-e48d4372bc0d
            </div>
          </div>
        </div>

        {/* 비밀번호 재설정 링크 */}
        <div className="login-signup-link-container">
          <button 
            type="button"
            className="login-signup-link"
            onClick={() => setShowPasswordReset(true)}
          >
            비밀번호를 잊으셨나요?
          </button>
        </div>

        {/* 비밀번호 재설정 모달 */}
        {showPasswordReset && (
          <div className="password-reset-modal">
            <div className="password-reset-content">
              <h2 className="password-reset-title">
                {resetStep === 1 ? "비밀번호 재설정 인증" : "새 비밀번호 설정"}
              </h2>
              
              {resetStep === 1 ? (
                <form onSubmit={handlePasswordResetAuth}>
                  <div className="login-input-group">
                    <input
                      type="text"
                      value={resetUserKey}
                      onChange={(e) => setResetUserKey(e.target.value)}
                      placeholder="사용자 키 (User Key)"
                      required
                      className="login-input"
                    />
                  </div>
                  <div className="login-input-group">
                    <input
                      type="text"
                      value={resetKey}
                      onChange={(e) => setResetKey(e.target.value)}
                      placeholder="패스키 (Password Reset Key)"
                      required
                      className="login-input"
                    />
                  </div>
                  <div className="password-reset-buttons">
                    <button 
                      type="submit" 
                      className="login-button"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? "인증 중..." : "인증하기"}
                    </button>
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={handleResetCancel}
                    >
                      취소
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handlePasswordChange}>
                  <div className="login-input-group">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="새 비밀번호"
                      required
                      className="login-input"
                    />
                  </div>
                  <div className="login-input-group">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="새 비밀번호 확인"
                      required
                      className="login-input"
                    />
                  </div>
                  <div className="password-reset-buttons">
                    <button 
                      type="submit" 
                      className="login-button"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? "변경 중..." : "비밀번호 변경"}
                    </button>
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={handleResetCancel}
                    >
                      취소
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
