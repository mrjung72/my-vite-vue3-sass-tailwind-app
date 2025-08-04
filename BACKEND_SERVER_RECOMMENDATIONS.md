# 웹서버 재기동 시 토큰 초기화 - 백엔드 구현 가이드

## 개요
프론트엔드에서 서버 재시작을 감지하고 자동으로 토큰을 초기화하는 기능이 구현되었습니다. 
이를 위해 백엔드에서 다음 API와 로직을 구현해주세요.

## 1. 서버 시작 시간 API 엔드포인트

### API 스펙
- **경로**: `GET /api/system/server-info`
- **응답**: 서버 시작 시간을 포함한 시스템 정보
- **목적**: 프론트엔드에서 서버 재시작 여부를 감지

### Node.js/Express 구현 예시

```javascript
// routes/systemRoutes.js
const express = require('express');
const router = express.Router();

// 서버 시작 시간 저장 (서버 시작 시 한 번만 설정)
const SERVER_START_TIME = new Date().toISOString();

router.get('/server-info', (req, res) => {
  res.json({
    startTime: SERVER_START_TIME,
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;
```

### 서버 메인 파일에 라우트 등록

```javascript
// server.js (또는 app.js)
const systemRoutes = require('./routes/systemRoutes');

// 라우트 등록
app.use('/api/system', systemRoutes);
```

## 2. 토큰 무효화 로직 (권장사항)

### 방법 1: 서버 재시작 시 모든 토큰 무효화
서버 시작 시 기존에 발급된 모든 JWT 토큰을 무효화하는 방법입니다.

```javascript
// JWT Secret 키를 재시작마다 변경
const crypto = require('crypto');

// 서버 시작 시 새로운 JWT Secret 생성
const JWT_SECRET = process.env.JWT_SECRET + '_' + Date.now();
// 또는 완전히 새로운 키 생성
// const JWT_SECRET = crypto.randomBytes(64).toString('hex');

// JWT 토큰 검증 시 자동으로 기존 토큰들이 무효화됨
```

### 방법 2: 토큰 발급 시간 기반 검증

```javascript
// middlewares/auth.js
const jwt = require('jsonwebtoken');

const SERVER_START_TIME = Date.now(); // 서버 시작 시간

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: '토큰이 유효하지 않습니다.' });
      }
      
      // 토큰 발급 시간이 서버 시작 시간보다 이전이면 무효화
      if (user.iat * 1000 < SERVER_START_TIME) {
        return res.status(443).json({ 
          message: '서버 재시작으로 인해 토큰이 만료되었습니다.',
          code: 'SERVER_RESTARTED'
        });
      }
      
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: '인증 토큰이 필요합니다.' });
  }
};

module.exports = { authenticateJWT };
```

### 방법 3: Redis를 사용한 토큰 관리 (고급)

```javascript
// Redis를 사용하여 활성 토큰 관리
const redis = require('redis');
const client = redis.createClient();

// 서버 시작 시 Redis의 모든 토큰 삭제
client.flushdb((err, response) => {
  console.log('모든 활성 토큰이 삭제되었습니다:', response);
});

// 토큰 발급 시 Redis에 저장
const issueToken = (user) => {
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '8h' });
  const tokenId = crypto.createHash('sha256').update(token).digest('hex');
  
  // Redis에 토큰 저장 (8시간 TTL)
  client.setex(tokenId, 8 * 60 * 60, JSON.stringify(user));
  
  return token;
};

// 토큰 검증 시 Redis에서 확인
const verifyToken = (token) => {
  const tokenId = crypto.createHash('sha256').update(token).digest('hex');
  
  return new Promise((resolve, reject) => {
    client.get(tokenId, (err, result) => {
      if (err || !result) {
        reject(new Error('토큰이 유효하지 않습니다.'));
      } else {
        resolve(JSON.parse(result));
      }
    });
  });
};
```

## 3. 구현 우선순위

1. **필수**: 서버 시작 시간 API 엔드포인트 구현
2. **권장**: 방법 1 (JWT Secret 변경) - 구현이 간단하고 효과적
3. **선택**: 방법 2 (토큰 시간 검증) - 더 세밀한 제어 가능
4. **고급**: 방법 3 (Redis 활용) - 대규모 서비스에 적합

## 4. 테스트 방법

1. 서버 시작 후 `/api/system/server-info` 호출하여 시작 시간 확인
2. 프론트엔드에서 로그인 후 서버 재시작
3. 프론트엔드에서 자동으로 토큰 초기화 및 로그인 페이지 이동 확인

## 5. 주의사항

- 서버 재시작 감지는 1분 간격으로 체크되므로 즉시 반영되지 않을 수 있습니다
- 개발 환경에서는 hot reload로 인한 false positive 가능성이 있습니다
- 프로덕션 환경에서만 활성화하는 것을 권장합니다