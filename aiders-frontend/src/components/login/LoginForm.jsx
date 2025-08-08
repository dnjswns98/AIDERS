import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { usePasswordStore } from "../../store/usePasswordStore";
import globalModelManager from "../../services/globalModelManager";
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
  const [resetStep, setResetStep] = useState(1);
  const [resetUserKey, setResetUserKey] = useState("");
  const [resetKey, setResetKey] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // AI 모델 로딩 관련 상태
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiLoadProgress, setAILoadProgress] = useState(0);
  const [aiLoadStep, setAILoadStep] = useState('');
  const [aiLoadError, setAILoadError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    setAILoadError(null);

    try {
      console.log('🚑 [로그인] 인증 시작:', { userKey: username.trim() });
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/login`,
        {
          userKey: username.trim(),
          password: password,
        }
      );

      const { accessToken, refreshToken } = response.data;

      const tokenPayload = JSON.parse(atob(accessToken.split(".")[1]));
      console.log('✅ [로그인] 인증 성공:', { role: tokenPayload.role, userKey: tokenPayload.userKey });

      const userInfo = {
        userKey: tokenPayload.userKey || username.trim(),
        userId: tokenPayload.sub,
        role: tokenPayload.role,
      };

      const userType = tokenPayload.role.toLowerCase();

      // 구급차 로그인 시 AI 모델 사전 로드
      if (userType === 'ambulance') {
        console.log('🤖 [로그인] 구급차 로그인 감지 - AI 모델 사전 로드 시작');
        setIsAILoading(true);
        setAILoadProgress(0);
        setAILoadStep('AI 모델 초기화 중...');

        try {
          let currentProgress = 0;
          const progressInterval = setInterval(() => {
            if (currentProgress < 95) {
              currentProgress += Math.random() * 10;
              setAILoadProgress(Math.min(95, Math.round(currentProgress)));
            }
          }, 300);

          await globalModelManager.initialize();
          
          clearInterval(progressInterval);
          setAILoadProgress(100);
          setAILoadStep('AI 모델 로드 완료!');
          
          console.log('🎉 [로그인] AI 모델 사전 로드 성공');
          
          await new Promise(resolve => setTimeout(resolve, 800));
          
        } catch (aiError) {
          console.error('❌ [로그인] AI 모델 로드 실패:', aiError);
          setAILoadError(aiError.toString());
          setAILoadStep('AI 모델 로드 실패');
          
          const shouldContinue = confirm(
            `AI 모델 로드에 실패했습니다: ${aiError}\n\n계속해서 로그인하시겠습니까? (필기 인식 기능은 나중에 자동으로 다운로드됩니다)`
          );
          
          if (!shouldContinue) {
            setLoading(false);
            setIsAILoading(false);
            return;
          }
          
          console.log('⚠️ [로그인] AI 모델 로드 실패했지만 로그인 계속 진행');
        }
      }

      login({
        user: userInfo,
        accessToken: accessToken,
        refreshToken: refreshToken,
        userType: userType,
      });

      const routeMap = {
        admin: "/admin",
        hospital: "/hospital", 
        ambulance: "/emergency/patient-input",
        firestation: "/firestation",
      };

      console.log(`🚀 [로그인] ${userType} 사용자 → ${routeMap[userType]} 라우팅`);
      
      if (userType === 'ambulance') {
        setAILoadStep('응급환자 입력 페이지로 이동 중...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      navigate(routeMap[userType] || "/");
      
    } catch (error) {
      console.error("❌ [로그인] 인증 실패:", error);
      
      let errorMessage = "아이디 또는 비밀번호가 올바르지 않습니다.";
      if (error.response) {
        console.error("에러 상세:", error.response.data);
        if (error.response.status === 401) errorMessage = "아이디 또는 비밀번호가 올바르지 않습니다.";
        else if (error.response.status === 403) errorMessage = "접근 권한이 없습니다.";
        else if (error.response.status >= 500) errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = "네트워크 연결을 확인해주세요.";
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
      setIsAILoading(false);
      setAILoadProgress(0);
      setAILoadStep('');
    }
  };

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
      handleResetCancel();
    } else {
      alert("비밀번호 변경에 실패했습니다: " + result.error);
    }
  };

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
        <div className="login-logo-area">
          <div className="login-logo-icon">🚑</div>
          <h1 className="login-title">AIDERS 로그인</h1>
          <p className="login-subtitle">응급의료 통합 관리 시스템</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="login-input-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디"
              required
              className="login-input"
              disabled={loading || isAILoading}
            />
          </div>
          <div className="login-input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              required
              className="login-input"
              disabled={loading || isAILoading}
            />
          </div>
          <div className="login-button-group">
            <button 
              type="submit" 
              className="login-button" 
              disabled={loading || isAILoading}
            >
              {isAILoading ? "AI 모델 로딩 중..." : loading ? "로그인 중..." : "로그인"}
            </button>
          </div>
        </form>
        {isAILoading && (
          <div className="ai-loading-container">
            <div className="ai-loading-content">
              <div className="ai-loading-header">
                <div className="ai-loading-icon">🤖</div>
                <h3 className="ai-loading-title">AI 모델 준비 중</h3>
              </div>
              <p className="ai-loading-description">
                필기 인식 AI 모델을 다운로드하고 있습니다...
              </p>
              <div className="ai-progress-container">
                <div className="ai-progress-bar">
                  <div 
                    className="ai-progress-fill"
                    style={{ 
                      width: `${aiLoadProgress}%`,
                      transition: 'width 0.3s ease-in-out'
                    }}
                  ></div>
                </div>
                <div className="ai-progress-text">
                  <span className="ai-progress-percentage">{aiLoadProgress}%</span>
                </div>
              </div>
              <p className="ai-loading-step">
                {aiLoadStep}
              </p>
              {aiLoadError && (
                <div className="ai-loading-error">
                  <span className="ai-error-icon">⚠️</span>
                  <span className="ai-error-text">{aiLoadError}</span>
                </div>
              )}
              <p className="ai-loading-notice">
                ✨ 이 작업은 최초 1회만 수행되며, 다음부터는 즉시 사용할 수 있습니다
              </p>
            </div>
          </div>
        )}
        <div className="login-test-account-info">
          <div className="login-test-account-title">테스트 계정</div>
          <div className="login-test-account-details">
            <div>👮 관리자: admin / admin</div>
            <div>🚒 소방서: 6110582 / f63f9527-a468-4fcb-bf4c-836a3313ecd6</div>
            <div>🏥 병원: A1200028 / 3e9cf29d-93de-46b6-bbb1-a97ac1fac65f</div>
            <div>
              🚑 구급차: 998버4200 / 8dedb374-c0d8-4525-85ad-e48d4372bc0d
              <span className="ambulance-ai-notice"> ← AI 모델 자동 다운로드</span>
            </div>
          </div>
        </div>
        <div className="login-signup-link-container">
          <button 
            type="button"
            className="login-signup-link"
            onClick={() => setShowPasswordReset(true)}
            disabled={loading || isAILoading}
          >
            비밀번호를 잊으셨나요?
          </button>
        </div>
        {showPasswordReset && !isAILoading && (
          <div className="password-reset-modal">
            <div className="password-reset-content">
              <h2 className="password-reset-title">
                {resetStep === 1 ? "비밀번호 재설정 인증" : "새 비밀번호 설정"}
              </h2>
              {resetStep === 1 ? (
                <form onSubmit={handlePasswordResetAuth}>
                  <div className="login-input-group">
                    <input type="text" value={resetUserKey} onChange={(e) => setResetUserKey(e.target.value)} placeholder="사용자 키 (User Key)" required className="login-input" />
                  </div>
                  <div className="login-input-group">
                    <input type="text" value={resetKey} onChange={(e) => setResetKey(e.target.value)} placeholder="패스키 (Password Reset Key)" required className="login-input" />
                  </div>
                  <div className="password-reset-buttons">
                    <button type="submit" className="login-button" disabled={passwordLoading}>
                      {passwordLoading ? "인증 중..." : "인증하기"}
                    </button>
                    <button type="button" className="cancel-button" onClick={handleResetCancel}>
                      취소
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handlePasswordChange}>
                  <div className="login-input-group">
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="새 비밀번호" required className="login-input" />
                  </div>
                  <div className="login-input-group">
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="새 비밀번호 확인" required className="login-input" />
                  </div>
                  <div className="password-reset-buttons">
                    <button type="submit" className="login-button" disabled={passwordLoading}>
                      {passwordLoading ? "변경 중..." : "비밀번호 변경"}
                    </button>
                    <button type="button" className="cancel-button" onClick={handleResetCancel}>
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