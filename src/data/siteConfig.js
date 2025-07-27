// 사이트 설정 및 홈화면 내용 정의
export const SITE_CONFIG = {
  // 사이트 기본 정보
  site: {
    name: '사하라 홈',
    description: '개발자의 업무 효율 향상을 위한 플랫폼',
    status: '시험 운영 중 ...',
    copyright: '© 2024 사하라 홈. All rights reserved.'
  },

  // 홈화면 메인 메시지
  home: {
    title: '🚀 사하라 홈',
    subtitle: '본 사이트는 개발자의 업무 효율 향상을 위한 플랫폼입니다. (시험 운영 중 ...)',
    description: '서버/DB 정보 조회, 텍스트 추출 도구 등의 기능을 제공하며, 향후 더 많은 기능이 추가될 예정 입니다.',
    
    // 주요 기능 카드
    features: {
      serverManagement: {
        icon: '🖥️',
        title: '서버 관리',
        description: '서버 및 데이터베이트 정보 조회 및 엑셀/CSV 파일 다운로드 기능을 제공합니다.',
        links: [
          { text: '서버 목록', route: '/servers/list' },
          { text: 'DB 목록', route: '/servers/dblist' },
          { text: 'Telnet Check', route: '/servers/telnet-check-history' },
          { text: 'DB접속 Check', route: '/servers/db-check-history' }
        ]
      },
      textExtraction: {
        icon: '🔍',
        title: '텍스트 추출 도구',
        description: '정규식 기반 추출기와 구분자 기반 추출기를 통해 다양한 형태의 데이터 추출 기능을 제공합니다.',
        links: [
          { text: '테이블명 추출기', route: '/extract-tables' },
          { text: '정규식 추출기', route: '/extract-regex' },
          { text: '구분자 적용기', route: '/extract-separator' }
        ]
      },
      board: {
        icon: '💬',
        title: '게시판',
        description: '정보 교환을 위한 게시판을 기능을 제공합니다. 현재 시험운영중인 관계로 등록한 게시글은 삭제 될 수 있습니다.',
        links: [
          { text: '게시판', route: '/board' }
        ]
      }
    },

    // 기술 스택 섹션
    techStack: {
      icon: '🛠️',
      title: '기술 스택',
      description: 'Vite, Vue 3, Tailwind CSS, DaisyUI 등 최신 프론트엔드 기술을 사용합니다.',
      technologies: [
        {
          icon: '⚡',
          name: 'Vue 3 + Vite',
          category: '프론트엔드'
        },
        {
          icon: '🎨',
          name: 'Tailwind CSS',
          category: '스타일링'
        },
        {
          icon: '🚀',
          name: 'Node.js',
          category: '백엔드'
        },
        {
          icon: '🗄️',
          name: 'MariaDB',
          category: '데이터베이스'
        }
      ],
      detailLink: {
        text: '상세 보기',
        route: '/tech-stack-detail'
      }
    }
  }
}

// 개별 내보내기 (편의성을 위해)
export const { site, home } = SITE_CONFIG 