<template>
  <div class="max-w-4xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-4">릴리즈 갱신이력</h1>
      <p class="text-gray-600">프로젝트의 버전별 업데이트 내용을 확인할 수 있습니다.</p>
    </div>

    <div class="space-y-8">
      <!-- 최신 버전 -->
      <div class="card bg-base-100 shadow-lg border-l-4 border-primary">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title text-2xl">v1.2 - 텍스트 추출 도구 대폭 개선</h2>
            <div class="badge badge-primary">최신</div>
          </div>
          <div class="text-sm text-gray-500 mb-4">2025년 6월</div>
          
          <div class="space-y-4">
            <div>
              <h3 class="font-semibold text-lg mb-2">🎯 주요 개선사항</h3>
              <ul class="list-disc list-inside space-y-1 text-gray-700">
                <li>정규식 추출기와 구분자 추출기를 별도 페이지로 분리</li>
                <li>구분자 추출기에 5가지 결과 포맷 지원 (JSON, 텍스트, 엑셀, CSV, HTML)</li>
                <li>지정한 열만 선택적으로 추출하는 기능 추가</li>
                <li>결과값 복사 기능 추가</li>
              </ul>
            </div>

            <div>
              <h3 class="font-semibold text-lg mb-2">🔧 정규식 추출기 개선</h3>
              <ul class="list-disc list-inside space-y-1 text-gray-700">
                <li>flags 객체 통합으로 옵션 관리 개선</li>
                <li>온전한 단어 검색 결과의 앞뒤 공백 자동 제거</li>
                <li>결과값 복사 기능 추가</li>
                <li>UI 텍스트 한글화 및 개선</li>
              </ul>
            </div>

            <div>
              <h3 class="font-semibold text-lg mb-2">📊 구분자 추출기 개선</h3>
              <ul class="list-disc list-inside space-y-1 text-gray-700">
                <li>여러 행을 한 번에 입력할 수 있는 textarea로 변경</li>
                <li>5가지 결과 포맷 지원</li>
                <li>지정한 열만 선택적으로 추출 (예: 1,3,5)</li>
                <li>각 포맷별 결과 복사 기능</li>
                <li>실시간 결과 업데이트</li>
              </ul>
            </div>

            <div>
              <h3 class="font-semibold text-lg mb-2">🎨 UI/UX 개선</h3>
              <ul class="list-disc list-inside space-y-1 text-gray-700">
                <li>사이드바 네비게이션에 구분자 추출기 메뉴 추가</li>
                <li>일관된 디자인 시스템 적용</li>
                <li>사용자 친화적인 인터페이스 개선</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 이전 버전들 -->
      <div class="card bg-base-100 shadow-lg border-l-4 border-secondary">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title text-2xl">v1.1 - 텍스트 추출 기능 추가</h2>
            <div class="badge badge-secondary">이전</div>
          </div>
          <div class="text-sm text-gray-500 mb-4">2025년 6월</div>
          
          <div class="space-y-4">
            <div>
              <h3 class="font-semibold text-lg mb-2">🆕 새로운 기능</h3>
              <ul class="list-disc list-inside space-y-1 text-gray-700">
                <li>정규식 기반 텍스트 추출기 추가</li>
                <li>@단어 추출기 추가</li>
                <li>테이블명 추출기 추가</li>
                <li>구분자 기반 텍스트 분리 기능 추가</li>
              </ul>
            </div>

            <div>
              <h3 class="font-semibold text-lg mb-2">🔧 기본 기능</h3>
              <ul class="list-disc list-inside space-y-1 text-gray-700">
                <li>프리셋 패턴 지원 (이메일, URL, 전화번호, IP 등)</li>
                <li>정규식 플래그 옵션 (전체 적용, 대소문자 무시, 여러 줄 매치)</li>
                <li>중복 제거 기능</li>
                <li>온전한 단어 검색 옵션</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 shadow-lg border-l-4 border-accent">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title text-2xl">v1.0 - 초기 릴리즈</h2>
            <div class="badge badge-accent">초기</div>
          </div>
          <div class="text-sm text-gray-500 mb-4">2025년 5월</div>
          
          <div class="space-y-4">
            <div>
              <h3 class="font-semibold text-lg mb-2">🚀 기본 시스템</h3>
              <ul class="list-disc list-inside space-y-1 text-gray-700">
                <li>Vue 3 + Vite 기반 프론트엔드</li>
                <li>Node.js + Express 백엔드</li>
                <li>MariaDB 데이터베이스 연동</li>
                <li>Tailwind CSS + DaisyUI UI 프레임워크</li>
              </ul>
            </div>

            <div>
              <h3 class="font-semibold text-lg mb-2">👥 사용자 관리</h3>
              <ul class="list-disc list-inside space-y-1 text-gray-700">
                <li>회원가입 및 로그인 시스템</li>
                <li>회원 정보 관리</li>
                <li>CSV 파일을 통한 회원 정보 일괄 등록</li>
                <li>관리자 권한 시스템</li>
              </ul>
            </div>

            <div>
              <h3 class="font-semibold text-lg mb-2">🖥️ 서버 관리</h3>
              <ul class="list-disc list-inside space-y-1 text-gray-700">
                <li>서버 정보 등록 및 관리</li>
                <li>데이터베이스 정보 관리</li>
                <li>CSV 파일을 통한 서버 정보 일괄 등록</li>
                <li>서버 연결 테스트 기능</li>
              </ul>
            </div>

            <div>
              <h3 class="font-semibold text-lg mb-2">💬 게시판</h3>
              <ul class="list-disc list-inside space-y-1 text-gray-700">
                <li>게시글 작성, 수정, 삭제</li>
                <li>댓글 시스템</li>
                <li>게시글 목록 및 상세 보기</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 p-4 bg-base-200 rounded-lg">
      <h3 class="font-semibold text-lg mb-2">📝 버전 관리 규칙</h3>
      <div class="text-sm text-gray-700 space-y-1">
        <p><strong>주 버전 (Major):</strong> 호환되지 않는 API 변경</p>
        <p><strong>부 버전 (Minor):</strong> 이전 버전과 호환되는 새로운 기능 추가</p>
        <p><strong>패치 버전 (Patch):</strong> 이전 버전과 호환되는 버그 수정</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// 릴리즈 히스토리 페이지는 단순한 정적 콘텐츠이므로 별도의 로직이 필요하지 않습니다.
</script>

<style scoped>
.card {
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
}
</style> 