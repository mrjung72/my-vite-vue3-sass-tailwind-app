<template>
  <div class="prose max-w-3xl mx-auto px-4 pt-6 pb-8">
    <h1>Template: Vite + Vue 3 + Sass + Tailwind 4 + DaisyUI 5</h1>
    <img src="/template-image.png" alt="Starter template" class="mb-4 rounded shadow" style="max-width:320px;">
    <p>이 템플릿은 Vite + Vue 3 기반의 개발을 빠르게 시작할 수 있도록 도와줍니다. 아래와 같은 주요 기술이 포함되어 있습니다.</p>

    <ul>
      <li><b>Vite</b> - 빌드 툴</li>
      <li><b>Vue 3</b> - 프론트엔드 프레임워크</li>
      <li><b>Vue Router 4</b> - 라우팅</li>
      <li><b>Sass</b> - CSS 전처리기</li>
      <li><b>Tailwind CSS 4</b> - 유틸리티 CSS</li>
      <li><b>DaisyUI 5</b> - Tailwind 기반 UI 컴포넌트</li>
      <li><b>PostCSS</b> - CSS 변환</li>
      <li><b>Theme configuration</b> (다크/라이트 등)</li>
      <li><b>UI blocks (components)</b> - DaisyUI 기반 미리 구성된 컴포넌트</li>
    </ul>

    <h2>Demo</h2>
    <p>
      <a href="https://tpl-vue3-tailwind4-daisyui5.brown.sk/" target="_blank" rel="noopener">🌐 https://tpl-vue3-tailwind4-daisyui5.brown.sk/</a>
    </p>

    <h2>Template initialization by forking (recommended) 🍴</h2>
    <p>GitHub의 템플릿 기능을 사용해 새 저장소를 만들 수 있습니다:</p>
    <a href="https://github.com/new?template_name=starter-template-vite-vue3-sass-tailwind4-daisyui5&template_owner=martinille" target="_blank" rel="noopener">
      → Create a repository from this template
    </a>

    <h2>Template initialization by cloning</h2>
    <ol>
      <li>저장소 클론:
        <pre><code>git clone https://github.com/martinille/starter-template-vite-vue3-sass-tailwind4-daisyui5.git &lt;project-name&gt;</code></pre>
      </li>
      <li>디렉토리 이동:
        <pre><code>cd &lt;project-name&gt;</code></pre>
      </li>
      <li>.git 디렉토리 삭제:
        <pre><code>rm -rf .git</code></pre>
      </li>
      <li>의존성 설치:
        <pre><code>npm install</code></pre>
      </li>
    </ol>

    <h2>Development</h2>
    <ul>
      <li>Vite 개발 서버 실행(HMR): <code>npm run dev</code></li>
    </ul>

    <h2>Production</h2>
    <ul>
      <li>프로덕션 빌드: <code>npm run build</code></li>
    </ul>

    <h2>Folder structure</h2>
    <pre><code>public/           # Static files
src/              # Source files
  assets/
    images/       # Images
    styles/
      vendor/     # Vendor styles (Tailwind CSS, DaisyUI)
  components/     # Vue components
  router/         # Vue Router configuration
  views/          # Vue views
  App.vue         # Root component
  main.js         # Entry point
</code></pre>

    <h2>GitHub Pages</h2>
    <ol>
      <li>저장소 Settings → Pages로 이동</li>
      <li>"Build and deployment"에서 "GitHub Actions" 선택</li>
    </ol>
    <p>GitHub Actions 워크플로우가 포함되어 있습니다.</p>

    <h2>TODO</h2>
    <ul>
      <li>🕘 Add unit tests</li>
      <li>🕘 Minimal template (no additional features)</li>
    </ul>

    <div class="text-right mt-8">
      <router-link to="/" class="btn btn-sm btn-outline">메인으로</router-link>
    </div>
  </div>
</template>

<script setup>
// 별도 로직 없음
</script>

<style scoped>
.prose pre {
  background: #f8fafc;
  border-radius: 0.5rem;
  padding: 1em;
  font-size: 0.95em;
}
</style> 