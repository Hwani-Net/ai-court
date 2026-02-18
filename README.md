# ⚖️ AI Court — AI 가상 법정 시뮬레이션

> AI 판사·검사·변호사가 실제 법정처럼 당신의 사건을 심리합니다.

## 🚀 빠른 시작

```bash
# 의존성 설치
npm install

# .env.local 파일 생성 후 API 키 입력
cp .env.example .env.local
# VITE_OPENAI_API_KEY=your_key_here

# 개발 서버 실행
npx vite --port 5200

# 빌드
npm run build
```

## 🎯 핵심 기능

| 기능 | 설명 |
|------|------|
| ⚡ **빠른 법률 상담** | 법률 질문 → AI 판사가 핵심 요점 즉시 정리 |
| ⚔️ **가상 재판 시뮬레이션** | 양측 주장 입력 → AI 3인 재판 진행 + 판결 |
| 📄 **소송장 분석** | PDF/텍스트 업로드 → 내 입장 유불리 분석 |

## 🛠️ 기술 스택

- **Frontend**: Vite + React + TypeScript
- **UI**: Tailwind CSS v4 + Framer Motion
- **AI**: OpenAI GPT-4o (Streaming SSE)
- **PDF**: pdfjs-dist (클라이언트 사이드)
- **배포**: Cloudflare Pages + Functions

## 📁 프로젝트 구조

```
src/
├── types/index.ts          # 타입 정의
├── services/openai.ts      # OpenAI API 서비스
├── lib/utils.ts            # 유틸리티
├── components/
│   ├── MessageBubble.tsx   # 메시지 버블 컴포넌트
│   └── ModeSelector.tsx    # 모드 선택 카드
├── pages/
│   ├── QuickConsultPage.tsx # 빠른 상담
│   ├── TrialPage.tsx       # 가상 재판
│   └── DocumentPage.tsx    # 소송장 분석
└── App.tsx                 # 메인 앱
```

## ⚠️ 법적 고지

이 서비스는 법률 정보 제공 목적이며 실제 법률 자문이 아닙니다.
중요한 법적 문제는 반드시 전문 변호사와 상담하세요.
