# 🚀 Aiders Project

SSAFY 13기 웹모바일 1분반 특화프로젝트

## 📋 프로젝트 개요

**Aiders**는 Spring Boot + React + OpenVidu를 활용한 실시간 화상 협업 플랫폼입니다.

### 🛠 기술 스택

#### Backend
- **Framework**: Spring Boot 3.5.3
- **Language**: Java 24
- **Build Tool**: Gradle 8.14.3
- **Database**: MySQL 8.0, Redis 7
- **WebRTC**: OpenVidu 2.31.0

#### Frontend  
- **Framework**: React 19.1.0
- **Build Tool**: Vite 7.0.4
- **Styling**: TailwindCSS 4.1.11
- **State Management**: Zustand 5.0.6

#### Infrastructure
- **Containerization**: Docker + Docker Compose
- **CI/CD**: Jenkins
- **Deployment**: EC2

### 🏗 아키텍처

```
Frontend (React:3000) ←→ Backend (Spring Boot:8080)
                              ↓
                         MySQL (3306) + Redis (6379)
                              ↓
                         OpenVidu (4443) - WebRTC
```

### 🔄 CI/CD Pipeline

Jenkins를 통한 자동화된 배포 파이프라인:

1. **코드 체크아웃** - develop 브랜치에서 소스코드 가져오기
2. **빌드 & 테스트** - 백엔드(Gradle) + 프론트엔드(npm) 병렬 빌드
3. **Docker 이미지 생성** - 각 서비스별 컨테이너 이미지 빌드
4. **배포** - Docker Compose를 통한 무중단 배포
5. **헬스 체크** - 애플리케이션 상태 검증

### 🌐 서비스 URL

- **Frontend**: http://i13d107.p.ssafy.io:3000
- **Backend API**: http://i13d107.p.ssafy.io:8080  
- **API Documentation**: http://i13d107.p.ssafy.io:8080/swagger-ui/index.html
- **Jenkins**: http://i13d107.p.ssafy.io:8090

### 🚀 Quick Start

#### 개발 환경 실행
```bash
# 전체 스택 실행
docker-compose up -d

# 개별 서비스 실행
cd aiders-backend && ./gradlew bootRun
cd aiders-frontend && npm run dev
```

#### 프로덕션 배포
```bash
# Jenkins 파이프라인을 통한 자동 배포
git push origin develop
```

### 🧪 테스트

- **Backend**: `./gradlew test`
- **Frontend**: `npm test`
- **E2E**: `npm run test:e2e`

---

**Last updated**: 2025-01-01  
**Pipeline Status**: 🚀 Jenkins CI/CD 구축 중  
**Team**: SSAFY 13기 D107팀




안녕하세요 Jenkins test입니다. (오후 10: 56)
안녕하세요 Jenkins test입니다. (오후 11:21)
안녕하세요 Jenkins test입니다 (오후 11:34)
