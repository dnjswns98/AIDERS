import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { useUserStore } from "../../store/useUserStore";

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
        ambulance: "/hospital", 
        firestation: "/hospital" 
      };
      navigate(routeMap[authenticatedUser.userType] || "/");
    } else {
      alert("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #dadce0',
        boxShadow: '0 2px 10px 0 rgba(0,0,0,0.2)',
        padding: '48px 40px 36px',
        width: '100%',
        maxWidth: '450px'
      }}>
        {/* 로고 영역 */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '75px',
            height: '75px',
            margin: '0 auto 16px',
            backgroundColor: '#1a73e8',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            color: 'white'
          }}>
            🚑
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '400',
            color: '#202124',
            margin: '0 0 8px 0'
          }}>
            AIDERS 로그인
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#5f6368',
            margin: 0
          }}>
            응급의료 통합 관리 시스템
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 아이디 입력 */}
          <div style={{ marginBottom: '24px' }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디"
              required
              style={{
                width: '100%',
                height: '56px',
                padding: '16px',
                border: '1px solid #dadce0',
                borderRadius: '4px',
                fontSize: '16px',
                backgroundColor: 'transparent',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1a73e8';
                e.target.style.borderWidth = '2px';
                e.target.style.padding = '15px';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#dadce0';
                e.target.style.borderWidth = '1px';
                e.target.style.padding = '16px';
              }}
            />
          </div>

          {/* 비밀번호 입력 */}
          <div style={{ marginBottom: '24px' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              required
              style={{
                width: '100%',
                height: '56px',
                padding: '16px',
                border: '1px solid #dadce0',
                borderRadius: '4px',
                fontSize: '16px',
                backgroundColor: 'transparent',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1a73e8';
                e.target.style.borderWidth = '2px';
                e.target.style.padding = '15px';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#dadce0';
                e.target.style.borderWidth = '1px';
                e.target.style.padding = '16px';
              }}
            />
          </div>

          {/* 로그인 버튼 */}
          <div style={{ marginBottom: '32px' }}>
            <button
              type="submit"
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: '#1a73e8',
                color: 'white',
                border: 'none',
                borderRadius: '24px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s, box-shadow 0.2s',
                outline: 'none'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#1557b0';
                e.target.style.boxShadow = '0 1px 2px 0 rgba(26,115,232,0.45), 0 1px 3px 1px rgba(66,133,244,0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#1a73e8';
                e.target.style.boxShadow = 'none';
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 0 4px rgba(26,115,232,0.3)';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
              }}
            >
              로그인
            </button>
          </div>
        </form>

        {/* 테스트 계정 정보 */}
        <div style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #e8eaed',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#3c4043',
            marginBottom: '8px'
          }}>
            테스트 계정
          </div>
          <div style={{ fontSize: '13px', color: '#5f6368', lineHeight: '20px' }}>
            <div>👮 관리자: admin / admin123</div>
            <div>🏥 병원: hospital001 / hospital123</div>
            <div>🚒 소방서: fire001 / fire123</div>
            <div>🚑 구급대원: amb001 / amb123</div>
          </div>
        </div>

        {/* 회원가입 링크 */}
        <div style={{ textAlign: 'center' }}>
          <a 
            href="#" 
            style={{
              color: '#1a73e8',
              fontSize: '14px',
              textDecoration: 'none',
              fontWeight: '500'
            }}
            onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.target.style.textDecoration = 'none'}
          >
            계정 만들기
          </a>
        </div>
      </div>
    </div>
  );
}