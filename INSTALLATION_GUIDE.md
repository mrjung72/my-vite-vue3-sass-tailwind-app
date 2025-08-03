# 설치 및 설정 가이드

## 📋 사전 요구사항

### 필수 소프트웨어
- **Node.js** v16.0.0 이상
- **MySQL** 8.0 이상
- **npm** 또는 **yarn**

### 권장 사항
- **PM2** (프로덕션 배포용)
- **Nginx** (리버스 프록시용)

## 🗄️ 데이터베이스 설정

### 1. MySQL 데이터베이스 생성
```sql
CREATE DATABASE server_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'server_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON server_management.* TO 'server_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. 테이블 생성
백엔드 폴더의 SQL 스크립트를 실행하세요:
```bash
mysql -u server_user -p server_management < my-node-express-server/resources/create_tables_mariadb.sql
```

## ⚙️ 환경 변수 설정

### 백엔드 환경 변수 (.env)
`my-node-express-server/.env` 파일을 생성하고 다음 내용을 설정하세요:

```env
# ===========================================
# 데이터베이스 설정
# ===========================================
DB_HOST=localhost
DB_USER=server_user
DB_PASSWORD=your_database_password
DB_NAME=server_management

# ===========================================
# JWT 인증 설정
# ===========================================
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here

# ===========================================
# 서버 설정
# ===========================================
PORT=4000
NODE_ENV=development

# ===========================================
# 사용자 관리
# ===========================================
USER_INIT_PASSWORD=temp123!

# ===========================================
# 이메일 설정 (선택사항)
# ===========================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# ===========================================
# 파일 업로드 설정
# ===========================================
MAX_FILE_SIZE=50mb
UPLOAD_PATH=./uploads

# ===========================================
# 보안 설정
# ===========================================
BCRYPT_SALT_ROUNDS=10
SESSION_SECRET=your_session_secret
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# ===========================================
# 성능 설정
# ===========================================
DB_CONNECTION_LIMIT=10
DB_ACQUIRE_TIMEOUT=60000
DB_TIMEOUT=60000
CACHE_TTL=3600

# ===========================================
# 관리자 계정 (초기 설정용)
# ===========================================
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123!
ADMIN_EMAIL=admin@example.com
```

## 🚀 설치 및 실행

### 1. 프론트엔드 설정
```bash
# 프로젝트 루트 디렉토리에서
npm install

# 개발 서버 실행
npm run dev

# 빌드 (프로덕션용)
npm run build
```

### 2. 백엔드 설정
```bash
# 백엔드 디렉토리로 이동
cd my-node-express-server

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 또는 일반 실행
npm start
```

## 🏗️ 프로덕션 배포

### 1. 프론트엔드 빌드 및 배포
```bash
# 프로젝트 루트에서 빌드
npm run build

# dist 폴더를 웹 서버 루트로 복사
cp -r dist/* /var/www/html/
```

### 2. 백엔드 PM2 배포
```bash
# PM2 글로벌 설치
npm install -g pm2

# 백엔드 디렉토리에서
cd my-node-express-server

# 프로덕션 환경 변수 설정
NODE_ENV=production

# PM2로 서버 실행
pm2 start server.js --name "server-management-api"

# PM2 프로세스 저장 (재부팅 시 자동 시작)
pm2 save
pm2 startup
```

### 3. Nginx 설정 (권장)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 프론트엔드
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # 백엔드 API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 업로드된 파일
    location /uploads {
        proxy_pass http://localhost:4000;
    }
}
```

## 🔧 개발 환경 설정

### VS Code 추천 확장
```json
{
  "recommendations": [
    "Vue.volar",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-eslint"
  ]
}
```

### 개발 도구 설정
```bash
# ESLint 및 Prettier 설정
npm install -D eslint prettier @vue/eslint-config-prettier

# Vue DevTools 설치 (브라우저 확장)
# https://devtools.vuejs.org/
```

## 📊 모니터링 설정

### PM2 모니터링
```bash
# 프로세스 상태 확인
pm2 status

# 로그 확인
pm2 logs server-management-api

# 리스타트
pm2 restart server-management-api

# 모니터링 대시보드
pm2 monit
```

### 로그 관리
```bash
# 로그 로테이션 설정
pm2 install pm2-logrotate

# 로그 설정
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## 🔒 보안 설정

### 1. JWT Secret 생성
```bash
# 안전한 JWT Secret 생성
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. 데이터베이스 보안
- 별도 사용자 계정 생성
- 최소 권한 원칙 적용
- 정기적인 비밀번호 변경

### 3. 서버 보안
- 방화벽 설정 (필요한 포트만 오픈)
- SSL 인증서 설치
- 정기적인 보안 업데이트

## 🐛 문제 해결

### 자주 발생하는 문제

#### 1. 데이터베이스 연결 실패
```bash
# MySQL 서비스 상태 확인
sudo systemctl status mysql

# 연결 테스트
mysql -u server_user -p -h localhost
```

#### 2. 포트 충돌
```bash
# 포트 사용 확인
lsof -i :4000
netstat -tulpn | grep :4000

# 프로세스 종료
kill -9 <PID>
```

#### 3. 권한 문제
```bash
# 파일 권한 확인
ls -la uploads/

# 권한 수정
chmod 755 uploads/
chown -R $USER:$USER uploads/
```

## 📞 지원 및 문의

### 개발 관련
- GitHub Issues 활용
- 코드 리뷰 요청

### 배포 관련
- 시스템 관리자 문의
- 인프라 팀 연락

---

## 📋 체크리스트

배포 전 다음 항목들을 확인하세요:

### 개발 환경
- [ ] Node.js 버전 확인
- [ ] MySQL 설치 및 설정
- [ ] 환경 변수 설정
- [ ] 의존성 설치 완료
- [ ] 데이터베이스 테이블 생성

### 프로덕션 환경
- [ ] 보안 설정 완료
- [ ] SSL 인증서 설치
- [ ] 백업 시스템 구축
- [ ] 모니터링 도구 설정
- [ ] 로그 관리 시스템 구축

---

*설치 가이드 최종 업데이트: 2024년 1월*