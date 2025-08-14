# 🚑 [AIDERS](https://i13d107.p.ssafy.io/) – AI 지원 응급환자 이송·병원 매칭 시스템

> **A**I-assisted **I**ntegrated **D**ispatch & **E**mergency **R**esponse **S**ystem  
> 응급환자 이송 중 AI와 실시간 통신을 활용하여 **병원 자동 매칭**, **환자 상태 모니터링**, **위치 추적**을 지원하는 시스템

## 📚 목차
1. [팀원 소개](#팀원-소개)
2. [프로젝트 소개](#프로젝트-소개)
3. [주요 기능](#주요-기능)
4. [스크린샷](#스크린샷)
5. [시스템 아키텍처](#시스템-아키텍처)
6. [기술 스택](#기술-스택)
7. [설치 및 실행 방법](#설치-및-실행-방법)
8. [폴더 구조](#폴더-구조)
9. [API 명세서](#api-명세서)
10. [기여 방법](#기여-방법)
11. [라이선스](#라이선스)

---

<a id="팀원-소개"></a>
## 👥 팀원 소개

| 이름   | 역할(Role)             | 담당 분야 |
|--------|------------------------|-----------|
| 박상준 | PM / Infra             | 프로젝트 총괄, 인프라 설계 및 관리 |
| 김정수 | Frontend               | 사용자 UI/UX 구현 |
| 박재연 | Frontend               | 사용자 UI/UX 구현 |
| 이창환 | Backend                | 서버 개발, 병원 추천 알고리즘 |
| 박원준 | Backend                | 서버 개발, 병원 추천 알고리즘 |
| 김채일 | AI/OCR                 | 온디바이스 OCR AI 모델 개발 |

---

<a id="프로젝트-소개"></a>
## 📖 프로젝트 소개
현장 구급대원이 응급환자를 이송할 때,  
병원의 수용 가능 여부를 실시간으로 확인하고, 자동으로 매칭하며,  
WebRTC를 통해 환자의 상태를 **영상·음성**으로 공유할 수 있는 시스템입니다.

또한, OCR 지원 입력 기능과 실시간 위치 추적을 통해 의료진이  
환자 도착 전 필요한 인력과 장비를 사전에 준비할 수 있도록 돕습니다.

---

<a id="주요-기능"></a>
## 🚀 주요 기능
- **병원 자동 매칭** – 환자 상태와 병상 현황을 기반으로 최적 병원 자동 추천
- **실시간 영상 통화(WebRTC)** – 구급차 ↔ 병원 간 영상/음성 공유
- **OCR 지원 환자 정보 입력** – 필기/이미지를 AI로 인식하여 자동 입력
- **실시간 위치 추적** – 구급차 GPS 데이터 병원 및 소방서 상황판에 표시
- **실시간 환자 상태 확인** - 구급차에서 입력한 이송 중인 환자의 상태를 실시간으로 확인

---

<a id="스크린샷"></a>
## 📸 스크린샷 (TODO: 이미지 삽입)
![상황판](docs/images/dashboard.png)
![OCR 입력](docs/images/ocr_input.png)

---

<a id="시스템-아키텍처"></a>
## 🏗 시스템 아키텍처 (TODO: 수정)
![시스템 아키텍처](docs/images/architecture.png)

**구성 요소**
- **클라이언트(구급차 / 병원 / 소방서 상황판)**  
  React 기반 UI, WebRTC로 미디어 스트림 송수신
- **시그널링 서버**  
  OpenVidu(또는 WebRTC 시그널링 서버)로 통화 세션 관리
- **백엔드 API 서버**  
  Spring Boot 기반, 환자·병원 데이터 관리, 매칭 알고리즘 실행
- **AI/OCR 서버**  
  ONNX Runtime/CRNN 모델로 필기·이미지 인식
- **데이터베이스**  
  MySQL(영속 데이터 저장), Redis(세션/캐시 관리)
- **모니터링**  
  Prometheus, Grafana(선택)
- **배포/네트워크**  
  Docker, Nginx 리버스 프록시

---

<a id="기술-스택"></a>
## 🛠 기술 스택
- **Backend**: Java 17, Spring Boot, Spring Data JPA, Redis, MySQL
- **Frontend**: React, TailwindCSS, WebRTC
- **AI/OCR**: CRNN (PyTorch), ONNX Runtime, OpenCV
- **Infra**: Docker, Nginx
- **실시간 통신**: WebSocket, OpenVidu

---

<a id="설치-및-실행-방법"></a>
## ⚙ 설치 및 실행 방법 (TODO: 수정)

### 1. 환경 변수 설정
```bash
# .env 예시
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/aiders
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=1234
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 2. 실행
```bash
# 백엔드
cd aiders-backend
./mvnw spring-boot:run

# 프론트엔드
cd aiders-frontend
npm install
npm start
```

---

<a id="폴더-구조"></a>
## 📂 폴더 구조
```
S13P11D107/
├── aiders-backend/       # Spring Boot 서버
├── aiders-frontend/      # React 프론트엔드
├── prometheus/           # 서버 모니터링을 위한 prometheus
├── docker-compose.yml    # 통합 실행 환경
└── README.md
```

---

<a id="api-명세서"></a>
## 📡 API 명세서
[API 명세서 스프레드시트](https://docs.google.com/spreadsheets/d/1WErw4M62GW4aixA-B3f0KgKT3A2Z2fqr9bHdZhL9GoI/edit?gid=90587241#gid=90587241)

---

<a id="기여-방법"></a>
## 🤝 기여 방법
1. 이 저장소를 포크(Fork)
2. 새로운 브랜치 생성 (`git checkout -b feature/새기능`)
3. 변경 사항 커밋 (`git commit -m 'Add new feature'`)
4. 푸시 (`git push origin feature/새기능`)
5. Pull Request 생성

---

<a id="라이선스"></a>
## 📜 라이선스
이 프로젝트는 MIT 라이선스를 따릅니다.
