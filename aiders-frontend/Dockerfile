# Node.js 베이스 이미지
FROM node:20-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사 (캐싱 최적화)
COPY package*.json ./

# 의존성 설치
RUN npm ci

# 소스코드 복사
COPY . .

# Vite 빌드 (dist 폴더에 정적 파일 생성)
RUN npm run build

# 빌드된 파일들이 있는 디렉토리를 expose
# (실제로는 EC2 nginx가 이 컨테이너의 /app/dist를 바라볼 예정)
WORKDIR /app/dist

# 포트는 딱히 expose 안해도 됨 (정적 파일만 생성)
# 하지만 혹시 개발용으로 preview 서버 띄울 경우를 대비
EXPOSE 4173

# 기본 명령어 (선택사항)
CMD ["echo", "Frontend build completed. Static files are in /app/dist"]