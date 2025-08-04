import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import axios from "axios";
import "./login.css";

export default function LoginForm() {
  const navigate = useNavigate();
  const { login, loginAdmin } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("로그인 버튼 클릭됨");

    if (!username || !password) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    console.log("로그인 시도:", { userKey: username, password: password });
    setLoading(true);

    // admin 계정 먼저 확인 (임시)
    if (loginAdmin(username, password)) {
      console.log("Admin 로그인 성공");
      navigate("/admin");
      setLoading(false);
      return;
    }

    // 일반 사용자 API 로그인
    try {
      console.log("API 요청 시작");
      const response = await axios.post(
        "http://localhost:8080/api/v1/auth/login",
        {
          userKey: username,
          password: password,
        }
      );

      console.log("API 응답:", response.data);
      const { accessToken, refreshToken } = response.data;

      // JWT 토큰에서 사용자 정보 추출 (임시 방편)
      const tokenPayload = JSON.parse(atob(accessToken.split(".")[1]));
      console.log("토큰 페이로드:", tokenPayload);

      // 사용자 정보 구성
      const userInfo = {
        userKey: tokenPayload.userKey || username,
        userId: tokenPayload.sub,
      };

      // userKey 패턴으로 역할 판단
      let userType = 'user';
      if (username.startsWith('A')) {
        userType = 'hospital';
      } else if (/[가-힣]/.test(username)) {
        userType = 'ambulance';
      } else if (/^\d{7}$/.test(username)) {
        userType = 'firestation';
      }

      login({
        user: userInfo,
        accessToken: accessToken,
        userType: userType,
      });

      // 역할에 따른 자동 라우팅
      const routeMap = {
        admin: "/admin",
        hospital: "/hospital",
        ambulance: "/emergency/patient-input",
        firestation: "/firestation",
      };
      console.log("사용자 타입:", userType, "라우팅:", routeMap[userType]);
      navigate(routeMap[userType] || "/");
    } catch (error) {
      console.error("로그인 실패:", error);
      console.error("에러 상세:", error.response?.data);
      alert("아이디 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
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
            <div>🏥 병원: A1700023 / ad567afe-ce4c-445e-8538-4bddcdca2bff</div>
            <div>🚑 구급차: 998버4200 / 8dedb374-c0d8-4525-85ad-e48d4372bc0d</div>
          </div>
        </div>

        {/* 회원가입 링크 */}
        <div className="login-signup-link-container">
          <a href="#" className="login-signup-link">
            계정 만들기
          </a>
        </div>
      </div>
    </div>
  );
}