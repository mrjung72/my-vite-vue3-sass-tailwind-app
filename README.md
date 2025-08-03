# 서버 인프라 관리 시스템

Vue 3 + Node.js 기반의 서버 인프라 모니터링 및 관리 웹 애플리케이션입니다.

## 🚀 주요 기능

### 🔐 인증 및 보안
- JWT 기반 인증 시스템
- **자동 토큰 갱신**: 활동 중 무중단 사용 (8시간 세션)
- **PC IP 추적**: 보안 강화를 위한 접속 IP 관리
- 역할 기반 접근 제어 (일반 사용자/관리자)

### 👥 회원 관리
- 회원 가입/수정/삭제
- 승인 기반 회원 관리
- **등록 PC IP 표시**: 회원가입 시 사용한 IP 추적
- 비밀번호 초기화 및 변경

### 🖥️ 서버 관리
- 서버 정보 등록 및 관리
- 법인/공정/환경별 분류
- 데이터베이스 인스턴스 관리
- CSV 파일 업로드를 통한 대량 데이터 처리

### 🔌 접속 상태 모니터링
- **DB 접속 체크**: 데이터베이스 연결 상태 확인
- **Telnet 접속 체크**: 서버 포트 접근성 확인
- **날짜/시분초 필터링**: 상세한 이력 조회
- 실시간 접속 상태 대시보드

### 📝 게시판 시스템
- 공지사항 및 이슈 관리
- 파일 첨부 기능
- 댓글 시스템

### 📊 데이터 관리
- 엑셀 다운로드
- 정규식 기반 데이터 추출
- 테이블명 추출 도구

## 🛠️ 기술 스택

### Frontend
- ✅ [Vue 3](https://vuejs.org/) - 프론트엔드 프레임워크
- ✅ [Vite](https://vite.dev/) - 빌드 도구
- ✅ [Vue Router 4](https://router.vuejs.org/) - 라우팅
- ✅ [Pinia](https://pinia.vuejs.org/) - 상태 관리
- ✅ [Tailwind CSS 4](https://tailwindcss.com/) - 스타일링
- ✅ [DaisyUI 5](https://daisyui.com/) - UI 컴포넌트
- ✅ [Sass](https://sass-lang.com/) - CSS 전처리기

### Backend
- ✅ [Node.js](https://nodejs.org/) - 런타임
- ✅ [Express.js](https://expressjs.com/) - 웹 프레임워크
- ✅ [MySQL](https://www.mysql.com/) - 데이터베이스
- ✅ [JWT](https://jwt.io/) - 인증
- ✅ [bcrypt](https://www.npmjs.com/package/bcrypt) - 비밀번호 암호화
- ✅ [multer](https://www.npmjs.com/package/multer) - 파일 업로드

## 🚀 설치 및 실행

### 사전 요구사항
- Node.js (v16 이상)
- MySQL 8.0 이상
- npm 또는 yarn

### 프론트엔드 설정
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

### 백엔드 설정
```bash
cd my-node-express-server

# 의존성 설치
npm install

# 환경 변수 설정 (.env 파일 생성)
cp .env.example .env

# 서버 실행
npm start
```

### 환경 변수 설정
```env
# 데이터베이스 설정
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database

# JWT 설정
JWT_SECRET=your_jwt_secret

# 기타 설정
PORT=4000
USER_INIT_PASSWORD=초기비밀번호
```

## 📁 프로젝트 구조

```
my-vite-vue3-sass-tailwind-app/     # 프론트엔드
├── public/                         # 정적 파일
├── src/
│   ├── assets/                     # 정적 리소스
│   │   ├── icons/                  # 아이콘
│   │   ├── images/                 # 이미지
│   │   └── styles/                 # 스타일
│   ├── components/                 # Vue 컴포넌트
│   │   ├── Home/                   # 홈 관련 컴포넌트
│   │   └── ComponentsPreview/      # 미리보기 컴포넌트
│   ├── router/                     # Vue Router 설정
│   ├── stores/                     # Pinia 스토어
│   ├── utils/                      # 유틸리티
│   ├── views/                      # 페이지 컴포넌트
│   │   ├── auth/                   # 인증 관련
│   │   ├── members/                # 회원 관리
│   │   ├── servers/                # 서버 관리
│   │   ├── board/                  # 게시판
│   │   └── extract/                # 데이터 추출
│   └── data/                       # 정적 데이터
└── my-node-express-server/         # 백엔드
    ├── routes/                     # API 라우트
    ├── middlewares/                # 미들웨어
    ├── utils/                      # 유틸리티
    ├── uploads/                    # 업로드된 파일
    └── resources/                  # 리소스 파일
```

## 🔧 주요 API 엔드포인트

### 인증
- `POST /api/login` - 로그인
- `POST /api/login/refresh-token` - 토큰 갱신 ✨

### 회원 관리
- `GET /api/members` - 회원 목록 조회
- `POST /api/members` - 회원 등록
- `PUT /api/members/:userid` - 회원 정보 수정
- `DELETE /api/members/:userid` - 회원 삭제

### 서버 관리
- `GET /api/servers` - 서버 목록 조회
- `GET /api/check-server-log/db` - DB 접속 체크 결과
- `GET /api/check-server-log/dates` - 체크 날짜 목록 ✨
- `GET /api/check-server-log/times` - 체크 시간 목록 ✨

### 내 정보
- `GET /api/me` - 내 정보 조회 (PC IP 포함) ✨
- `PUT /api/me` - 내 정보 수정
- `PUT /api/me/change-password` - 비밀번호 변경

## 🚀 배포

### 개발 환경
```bash
# 프론트엔드
npm run dev

# 백엔드
cd my-node-express-server
npm run dev
```

### 프로덕션 배포
```bash
# 프론트엔드 빌드
npm run build

# 백엔드 PM2 배포
cd my-node-express-server
pm2 start server.js --name "server-management"
```

## 📖 사용자 매뉴얼

자세한 사용법은 [사용자 매뉴얼](USER_MANUAL.md)을 참고하세요.

### 주요 업데이트 (2024.01)
- ✨ **JWT 토큰 자동 갱신**: 활동 중 무중단 사용
- ✨ **PC IP 추적 시스템**: 보안 강화를 위한 IP 관리
- ✨ **DB 체크 필터링 개선**: 날짜/시분초 단위 필터링
- 🔧 **UI/UX 개선**: 회원 정보 화면 레이아웃 개선

## 🔒 보안 기능

- **JWT 토큰 인증**: 무상태 인증 시스템
- **자동 토큰 갱신**: 세션 만료 방지
- **PC IP 추적**: 접속 이력 관리
- **권한 기반 접근 제어**: 역할별 기능 제한
- **비밀번호 암호화**: bcrypt 해싱

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

This project is licensed under the MIT License.

## 📞 지원

- 기술 문의: 시스템 관리자
- 버그 리포트: Issues 탭 이용
- 기능 요청: Pull Request 환영

---

*최종 업데이트: 2024년 1월*
