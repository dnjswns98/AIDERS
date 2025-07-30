import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { useUserStore } from "../../store/useUserStore";
import './login.css';



export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { authenticateUser } = useUserStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    // 사용자 인증
    const authenticatedUser = authenticateUser(username, password);
    
    if (authenticatedUser) {
      const loginResponse = {
        accessToken: "mockToken",
        user: authenticatedUser,
        userType: authenticatedUser.userType,
      };
      login(loginResponse);
      
      // 역할에 따른 자동 라우팅
      const routeMap = { 
        admin: "/admin", 
        hospital: "/hospital", 
        ambulance: "/emergency/patient-input", 
        firestation: "/firestation" 
      };
      navigate(routeMap[authenticatedUser.userType] || "/");
    } else {
      alert("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };


  return (
    <div className="login-container">
      <div className="login-card">
        {/* 로고 영역 */}
        <div className="login-logo-area">
          <div className="login-logo-icon">
            🚑
          </div>
          <h1 className="login-title">
            AIDERS 로그인
          </h1>
          <p className="login-subtitle">
            응급의료 통합 관리 시스템
          </p>
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
            <button
              type="submit"
              className="login-button"
            >
              로그인
            </button>
          </div>
        </form>

        {/* 테스트 계정 정보 */}
        <div className="login-test-account-info">
          <div className="login-test-account-title">
            테스트 계정
          </div>
          <div className="login-test-account-details">
            <div>👮 관리자: admin / admin123</div>
            <div>🏥 병원: hospital001 / hospital123</div>
            <div>🚒 소방서: fire001 / fire123</div>
            <div>🚑 구급대원: amb001 / amb123</div>
          </div>
        </div>

        {/* 회원가입 링크 */}
        <div className="login-signup-link-container">
          <a 
            href="#" 
            className="login-signup-link"
          >
            계정 만들기
          </a>
        </div>
      </div>
    </div>
  );
}